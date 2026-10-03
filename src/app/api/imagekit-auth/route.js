import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json(
        { error: 'Falta configurar IMAGEKIT_PRIVATE_KEY en .env.local' },
        { status: 500 }
      );
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 1800; // Válido por 30 minutos

    // Firma HMAC-SHA1 oficial requerida por ImageKit
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return NextResponse.json({
      token,
      expire,
      signature,
    });
  } catch (error) {
    console.error('Error generando auth de ImageKit:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar autenticación' },
      { status: 500 }
    );
  }
}