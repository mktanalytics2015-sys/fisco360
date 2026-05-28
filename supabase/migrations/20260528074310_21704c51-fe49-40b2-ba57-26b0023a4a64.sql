
-- 1) Public-safe view for accounting_providers (excludes email & nif)
DROP VIEW IF EXISTS public.public_providers;
CREATE VIEW public.public_providers
WITH (security_invoker = false) AS
SELECT id, owner_id, type, name, phone, whatsapp, website, address, province,
       description, logo_url, cedula_number, years_experience, specialties,
       languages, services, price_range_min, price_range_max,
       is_featured, is_verified, is_premium, rating_avg, rating_count,
       status, created_at, updated_at
FROM public.accounting_providers
WHERE status = 'approved';

GRANT SELECT ON public.public_providers TO anon, authenticated;

-- 2) Remove the broad public SELECT on the underlying table; keep owner/admin policies
DROP POLICY IF EXISTS "Approved providers are public" ON public.accounting_providers;

-- 3) Tighten quote_requests INSERT to prevent impersonation
DROP POLICY IF EXISTS "Anyone can submit a quote request" ON public.quote_requests;
CREATE POLICY "Submit quote request"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND requester_id IS NULL)
  OR (auth.uid() IS NOT NULL AND auth.uid() = requester_id)
);

-- 4) Remove broad storage listing policy; public bucket URLs continue to work via CDN
DROP POLICY IF EXISTS "Provider logos are publicly accessible" ON storage.objects;
