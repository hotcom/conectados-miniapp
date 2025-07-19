import crypto from 'crypto';
import config from '../config/env';

export function verifySignature(signature: string, payload: any): boolean {
  try {
    if (!signature || !payload || !config.OPENPIX_API_KEY) return false;

    const calculatedSignature = crypto
      .createHmac('sha256', config.OPENPIX_API_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
