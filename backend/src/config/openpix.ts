import { request } from 'undici';

const OPENPIX_API_URL = 'https://api.sandbox.woovi.com';

interface ApiResponse {
  statusCode: number;
  body: any;
}

const makeRequest = async (method: string, path: string, data?: any): Promise<ApiResponse> => {
  const url = new URL(`/api/v1/${path}`, OPENPIX_API_URL);
  
  try {
    const { statusCode, body } = await request(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENPIX_API_KEY || ''}`,
        'User-Agent': 'ConectadosImpact/1.0'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const responseBody = await body.json().catch(() => null);
    
    return {
      statusCode,
      body: responseBody
    };
  } catch (error) {
    throw new Error(`Request failed: ${(error as Error).message}`);
  }
};

interface WooviPixQrCode {
  status?: string;
  value: number;
  comment: string;
  correlationID: string;
  identifier: string;
  paymentLinkID: string;
  paymentLinkUrl: string;
  qrCodeImage: string;
  createdAt: string;
  updatedAt: string;
  brCode: string;
}

interface WooviCharge {
  qrCodeImage: string;
  brCode: string;
  correlationID: string;
  status?: string;
}

interface WooviResponse {
  pixQrCode?: WooviPixQrCode;
  charge?: WooviCharge;
  error?: string;
}

interface PixChargeResponse {
  qrCodeImage: string;
  brCode: string;
  correlationID: string;
}

interface PixChargeStatusResponse {
  status?: string;
  qrCodeImage: string;
  brCode: string;
  correlationID: string;
}

export const createPixCharge = async (value: number, chargeId: string, destinationWallet: string): Promise<PixChargeResponse | null> => {
  console.log('Creating PIX charge with:', {
    value,
    correlationID: chargeId,
    destinationWallet,
    apiUrl: 'https://api.sandbox.woovi.com',
    apiKey: process.env.OPENPIX_API_KEY
  });
  try {
    console.log('Sending request to:', 'https://api.sandbox.woovi.com/api/v1/qrcode-static');
    const { body, statusCode } = await makeRequest('POST', 'qrcode-static', {
      name: 'ConectadosImpact',
      correlationID: chargeId,
      value: value,
      comment: 'Doação via PIX'
    });

    console.log('Response body:', body);
    const data: WooviResponse = body;
    if (!data || (!data.charge && !data.pixQrCode)) {
      console.error('Error creating PIX charge:', data);
      return null;
    }

    const pixData = data.pixQrCode || data.charge;
    if (!pixData) {
      console.error('No PIX data found in response');
      return null;
    }

    const { qrCodeImage, brCode, correlationID } = pixData;
    if (!qrCodeImage || !brCode || !correlationID) {
      console.error('Missing required fields in PIX data');
      return null;
    }

    return {
      qrCodeImage,
      brCode,
      correlationID
    };
  } catch (error) {
    console.error('Error creating PIX charge:', error);
    return null;
  }
};

export const getPixCharge = async (correlationID: string): Promise<PixChargeStatusResponse | null> => {
  try {
    const { body, statusCode } = await makeRequest('GET', `charge/${correlationID}`);

    console.log('Response body:', body);
    const data: WooviResponse = body;
    if (!data || (!data.charge && !data.pixQrCode)) {
      console.error('Error getting PIX charge:', data);
      return null;
    }

    const charge = data.charge || data.pixQrCode;
    if (!charge) {
      console.error('No charge or pixQrCode data found');
      return null;
    }

    if (!charge.qrCodeImage || !charge.brCode || !charge.correlationID) {
      console.error('Missing required fields in charge');
      return null;
    }

    return {
      status: charge.status,
      qrCodeImage: charge.qrCodeImage,
      brCode: charge.brCode,
      correlationID: charge.correlationID
    };
  } catch (error) {
    console.error('Error getting PIX charge:', error);
    return null;
  }
};

export type WebhookEventEnum =
  | 'OPENPIX:CHARGE_CREATED'
  | 'OPENPIX:CHARGE_COMPLETED'
  | 'OPENPIX:CHARGE_EXPIRED'
  | 'OPENPIX:TRANSACTION_RECEIVED'
  | 'OPENPIX:TRANSACTION_REFUND_RECEIVED'
  | 'OPENPIX:MOVEMENT_CONFIRMED'
  | 'OPENPIX:MOVEMENT_FAILED'
  | 'OPENPIX:MOVEMENT_REMOVED';

export interface WebhookPayload {
  name: string;
  event: WebhookEventEnum;
  url: string;
  authorization?: string;
  isActive?: boolean;
}

export const createWebhook = async (): Promise<WooviResponse | null> => {
  console.log('Creating webhook...');
  try {
    const { body, statusCode } = await makeRequest('POST', 'webhook', {
      webhook: {
        name: 'ConectadosImpact',
        event: 'OPENPIX:CHARGE_COMPLETED',
        url: `${process.env.APP_URL}/api/pix/webhook`,
        isActive: true
      }
    });

    if (statusCode === 401) {
      console.error('Error creating webhook: Unauthorized');
      return null;
    }

    if (statusCode === 404) {
      console.error('Error creating webhook: Endpoint not found');
      return null;
    }

    if (body.error) {
      console.error('Error creating webhook:', body.error);
      return null;
    }

    return body;
  } catch (error: any) {
    console.error('Error creating webhook:', error);
    throw error;
  }
};
