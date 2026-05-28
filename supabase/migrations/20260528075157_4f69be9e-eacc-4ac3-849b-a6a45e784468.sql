CREATE POLICY "Approved providers are public" ON public.accounting_providers FOR SELECT TO anon, authenticated USING (status = 'approved');
GRANT SELECT ON public.accounting_providers TO anon;