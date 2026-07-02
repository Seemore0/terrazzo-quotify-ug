ALTER TYPE quote_status ADD VALUE IF NOT EXISTS 'in_progress' BEFORE 'completed';
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_owner_status ON public.quotations(owner_id, status);