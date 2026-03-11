import { createHash } from 'crypto';

const SANDBOX_PROCESS_URL = 'https://sandbox.payfast.co.za/eng/process';
const LIVE_PROCESS_URL = 'https://www.payfast.co.za/eng/process';

const SANDBOX_VALIDATE_URL = 'https://sandbox.payfast.co.za/eng/query/validate';
const LIVE_VALIDATE_URL = 'https://www.payfast.co.za/eng/query/validate';

export function getPayfastConfig() {
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
    passphrase: process.env.PAYFAST_PASSPHRASE || '',
    processUrl: isSandbox ? SANDBOX_PROCESS_URL : LIVE_PROCESS_URL,
    validateUrl: isSandbox ? SANDBOX_VALIDATE_URL : LIVE_VALIDATE_URL,
    isSandbox,
  };
}

/**
 * Generate PayFast MD5 signature from payment data.
 * Parameters must be in the exact order PayFast expects.
 * Empty/blank values are excluded.
 */
export function generateSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  // Build parameter string from non-blank values (order preserved from caller)
  const pairs = Object.entries(data)
    .filter(([, val]) => val !== '' && val !== undefined && val !== null)
    .map(([key, val]) => `${key}=${encodeURIComponent(String(val).trim()).replace(/%20/g, '+')}`)
    .join('&');

  const withPassphrase = passphrase
    ? `${pairs}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : pairs;

  return createHash('md5').update(withPassphrase).digest('hex');
}

/**
 * Verify a PayFast ITN signature.
 * Rebuilds the param string from posted data (excluding 'signature') in received order.
 */
export function verifySignature(
  postedData: Record<string, string>,
  passphrase?: string
): boolean {
  const receivedSignature = postedData.signature;
  if (!receivedSignature) return false;

  // Build param string from all fields except 'signature', in the order received
  const pairs = Object.entries(postedData)
    .filter(([key]) => key !== 'signature')
    .map(([key, val]) => `${key}=${encodeURIComponent(String(val).trim()).replace(/%20/g, '+')}`)
    .join('&');

  const withPassphrase = passphrase
    ? `${pairs}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : pairs;

  const calculated = createHash('md5').update(withPassphrase).digest('hex');
  return calculated === receivedSignature;
}

/**
 * Validate transaction with PayFast server (server-to-server confirmation).
 */
export async function validateWithPayfast(
  paramString: string,
  validateUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: paramString,
    });
    const text = await response.text();
    return text.trim() === 'VALID';
  } catch {
    return false;
  }
}
