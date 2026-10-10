import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo de imagen' }, { status: 400 });
    }

    const privateKey = (process.env.IMAGEKIT_PRIVATE_KEY || '').trim();
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Falta IMAGEKIT_PRIVATE_KEY en .env.local o tenés que reiniciar el servidor (Ctrl+C y npm run dev).' },
        { status: 500 }
      );
    }

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = buffer.toString('base64');

    const uploadPayload = new FormData();
    uploadPayload.append('file', base64File);
    uploadPayload.append('fileName', `bariahorra_${Date.now()}.jpg`);
    uploadPayload.append('folder', '/ofertas_bariahorra');

    const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

    const resImageKit = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: uploadPayload,
    });

    const responseText = await resImageKit.text();
    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    if (!resImageKit.ok) {
      console.error('ImageKit rechazó la subida:', resImageKit.status, data);
      const motivo =
        data.message ||
        data.error?.message ||
        data.help ||
        (typeof data.raw === 'string' ? data.raw.slice(0, 100) : 'Error rechazado por ImageKit');
      return NextResponse.json(
        { error: `ImageKit (${resImageKit.status}): ${motivo}` },
        { status: resImageKit.status || 400 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Error capturado en /api/upload:', error);
    return NextResponse.json(
      { error: `Fallo en el servidor /api/upload: ${error.message}` },
      { status: 500 }
    );
  }
}