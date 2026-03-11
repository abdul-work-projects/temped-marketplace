import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPayfastConfig, generateSignature } from '@/lib/payfast';

const LIFETIME_PRICE = '499.00';
const ITEM_NAME = 'TempEd Founding Teacher Lifetime Access';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // Verify user with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher record
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, first_name, surname, email')
      .eq('user_id', user.id)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Check if already has an active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('teacher_id', teacher.id)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      return NextResponse.json({ error: 'Already has an active subscription' }, { status: 400 });
    }

    // Generate a unique payment ID
    const paymentId = `temped-${teacher.id}-${Date.now()}`;

    const config = getPayfastConfig();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build payment data in the exact order PayFast expects
    const paymentData: Record<string, string> = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: `${baseUrl}/upgrade/success?payment_id=${paymentId}`,
      cancel_url: `${baseUrl}/upgrade/cancel`,
      notify_url: `${baseUrl}/api/payfast/notify`,
      name_first: teacher.first_name || '',
      name_last: teacher.surname || '',
      email_address: teacher.email || '',
      m_payment_id: paymentId,
      amount: LIFETIME_PRICE,
      item_name: ITEM_NAME,
      item_description: 'One-time payment for lifetime platform access',
      custom_str1: teacher.id,
    };

    // Generate signature
    const signature = generateSignature(paymentData, config.passphrase);
    paymentData.signature = signature;

    // Create a pending payment record
    await supabase.from('payments').insert({
      teacher_id: teacher.id,
      payment_id: paymentId,
      amount: parseFloat(LIFETIME_PRICE),
      status: 'PENDING',
      item_name: ITEM_NAME,
    });

    return NextResponse.json({
      paymentData,
      processUrl: config.processUrl,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
