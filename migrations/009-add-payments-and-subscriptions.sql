-- Add payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE,
  pf_payment_id TEXT,
  amount NUMERIC NOT NULL,
  amount_gross NUMERIC,
  amount_fee NUMERIC,
  amount_net NUMERIC,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETE', 'CANCELLED')),
  item_name TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Teachers can view own payments
CREATE POLICY "Teachers can view own payments"
  ON payments FOR SELECT
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- Allow inserts from authenticated users (checkout creates pending record)
CREATE POLICY "Authenticated users can insert payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('lifetime', 'monthly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  payment_id UUID REFERENCES payments(id),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for lifetime (never expires)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Teachers can view own subscriptions
CREATE POLICY "Teachers can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- Schools can view teacher subscriptions (to see if teacher has access)
CREATE POLICY "Schools can view subscriptions"
  ON subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('school', 'admin')));

-- Allow inserts from authenticated users
CREATE POLICY "Authenticated users can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
