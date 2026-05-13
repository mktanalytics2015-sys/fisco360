
-- Enums
CREATE TYPE public.provider_type AS ENUM ('company', 'individual');
CREATE TYPE public.provider_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.quote_status AS ENUM ('pending', 'responded', 'closed');

-- Providers (empresas / profissionais)
CREATE TABLE public.accounting_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  type public.provider_type NOT NULL DEFAULT 'company',
  name TEXT NOT NULL,
  nif TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  address TEXT,
  province TEXT,
  description TEXT,
  logo_url TEXT,
  cedula_number TEXT,
  years_experience INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  services JSONB DEFAULT '[]'::jsonb,
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  status public.provider_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  rating_avg NUMERIC NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_providers_status ON public.accounting_providers(status);
CREATE INDEX idx_providers_featured ON public.accounting_providers(is_featured);
CREATE INDEX idx_providers_owner ON public.accounting_providers(owner_id);

ALTER TABLE public.accounting_providers ENABLE ROW LEVEL SECURITY;

-- Anyone (even anon) can view approved providers
CREATE POLICY "Approved providers are public"
  ON public.accounting_providers FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Owners can view own providers"
  ON public.accounting_providers FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all providers"
  ON public.accounting_providers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create their provider"
  ON public.accounting_providers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own provider"
  ON public.accounting_providers FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any provider"
  ON public.accounting_providers FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete providers"
  ON public.accounting_providers FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Reviews
CREATE TABLE public.provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.accounting_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public"
  ON public.provider_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.provider_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.provider_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.provider_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews"
  ON public.provider_reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Quote requests (RFQ)
CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.accounting_providers(id) ON DELETE CASCADE,
  requester_id UUID,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  service_needed TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_estimate NUMERIC,
  status public.quote_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters can view own requests"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Provider owners can view their requests"
  ON public.quote_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.accounting_providers p WHERE p.id = quote_requests.provider_id AND p.owner_id = auth.uid()));

CREATE POLICY "Admins can view all requests"
  ON public.quote_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can submit a quote request"
  ON public.quote_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Provider owners can update status"
  ON public.quote_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.accounting_providers p WHERE p.id = quote_requests.provider_id AND p.owner_id = auth.uid()));

-- Triggers to keep rating aggregates up to date
CREATE OR REPLACE FUNCTION public.refresh_provider_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.provider_id, OLD.provider_id);
  UPDATE public.accounting_providers
  SET rating_avg = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM public.provider_reviews WHERE provider_id = pid), 0),
      rating_count = (SELECT COUNT(*) FROM public.provider_reviews WHERE provider_id = pid)
  WHERE id = pid;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_refresh
AFTER INSERT OR UPDATE OR DELETE ON public.provider_reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_provider_rating();

CREATE TRIGGER trg_providers_updated_at
BEFORE UPDATE ON public.accounting_providers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for provider logos
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-logos', 'provider-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Provider logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-logos');

CREATE POLICY "Authenticated users can upload provider logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'provider-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own provider logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'provider-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own provider logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'provider-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
