import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPayfastConfig, verifySignature, validateWithPayfast } from '@/lib/payfast';

const EXPECTED_AMOUNT = 499.00;

// Valid PayFast IP ranges
const VALID_HOSTS = [
  'www.payfast.co.za',
  'sandbox.payfast.co.za',
  'w1w.payfast.co.za',
  'w2w.payfast.co.za',
];

async function isValidPayfastSource(request: NextRequest): Promise<boolean> {
  const config = getPayfastConfig();
  // In sandbox mode, skip IP validation (sandbox may come from different IPs)
  if (config.isSandbox) return true;

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || '';

  // Resolve valid IPs from PayFast hostnames
  try {
    const { resolve4 } = await import('dns/promises');
    const validIps: string[] = [];
    for (const host of VALID_HOSTS) {
      try {
        const ips = await resolve4(host);
        validIps.push(...ips);
      } catch {
        // skip unresolvable hosts
      }
    }
    return validIps.includes(ip);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Return 200 immediately to prevent retries
    const formData = await request.formData();
    const pfData: Record<string, string> = {};
    formData.forEach((value, key) => {
      pfData[key] = String(value);
    });

    const config = getPayfastConfig();

    // Use service role key for server-side operations (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Security Check 1: Verify signature
    if (!verifySignature(pfData, config.passphrase)) {
      console.error('PayFast ITN: Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Security Check 2: Verify source IP
    const validSource = await isValidPayfastSource(request);
    if (!validSource) {
      console.error('PayFast ITN: Invalid source IP');
      return NextResponse.json({ error: 'Invalid source' }, { status: 403 });
    }

    // Security Check 3: Compare payment amount
    const amountGross = parseFloat(pfData.amount_gross || '0');
    if (Math.abs(amountGross - EXPECTED_AMOUNT) > 0.01) {
      console.error(`PayFast ITN: Amount mismatch. Expected ${EXPECTED_AMOUNT}, got ${amountGross}`);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Security Check 4: Server confirmation with PayFast
    const paramString = Object.entries(pfData)
      .filter(([key]) => key !== 'signature')
      .map(([key, val]) => `${key}=${encodeURIComponent(String(val).trim()).replace(/%20/g, '+')}`)
      .join('&');

    const serverValid = await validateWithPayfast(paramString, config.validateUrl);
    if (!serverValid) {
      console.error('PayFast ITN: Server confirmation failed');
      return NextResponse.json({ error: 'Server validation failed' }, { status: 400 });
    }

    // All checks passed — process the payment
    const paymentId = pfData.m_payment_id;
    const paymentStatus = pfData.payment_status; // COMPLETE or CANCELLED
    const pfPaymentId = pfData.pf_payment_id;
    const teacherId = pfData.custom_str1;

    // Update payment record
    const { data: paymentRecord } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        pf_payment_id: pfPaymentId,
        amount_gross: amountGross,
        amount_fee: parseFloat(pfData.amount_fee || '0'),
        amount_net: parseFloat(pfData.amount_net || '0'),
        paid_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId)
      .select('id')
      .single();

    // If payment is complete, create an active subscription
    if (paymentStatus === 'COMPLETE' && teacherId) {
      await supabase.from('subscriptions').insert({
        teacher_id: teacherId,
        plan_type: 'lifetime',
        status: 'active',
        payment_id: paymentRecord?.id || null,
        starts_at: new Date().toISOString(),
        expires_at: null, // lifetime = never expires
      });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    console.error('PayFast ITN error:', err);
    return NextResponse.json({ status: 'ok' }, { status: 200 }); // Still return 200 to prevent retries
  }
}
