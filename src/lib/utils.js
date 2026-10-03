// src/lib/utils.js

/**
 * Calcula el precio por Kg, Litro, Metro o Unidad según la unidad de medida.
 */
export function calcularPrecioUnitario(precio, cantidad, unidad) {
  if (!precio || !cantidad || cantidad <= 0 || !unidad) return null;

  const u = unidad.toLowerCase().trim();

  // Gramos -> Precio por Kilogramo (1000 g)
  if (u === 'g' || u === 'gr' || u === 'gramos') {
    const precioKg = (precio / cantidad) * 1000;
    return `$${Math.round(precioKg).toLocaleString('es-AR')} x Kg`;
  }

  // Mililitros / cc -> Precio por Litro (1000 ml)
  if (u === 'ml' || u === 'cc') {
    const precioLitro = (precio / cantidad) * 1000;
    return `$${Math.round(precioLitro).toLocaleString('es-AR')} x Litro`;
  }

  // Si ya está expresado en Kg o Litros directos
  if (u === 'kg' || u === 'kilo' || u === 'kilos') {
    return `$${Math.round(precio / cantidad).toLocaleString('es-AR')} x Kg`;
  }
  if (u === 'l' || u === 'litro' || u === 'litros') {
    return `$${Math.round(precio / cantidad).toLocaleString('es-AR')} x Litro`;
  }

  // Metros (papel higiénico, rollos de cocina)
  if (u === 'm' || u === 'metro' || u === 'metros') {
    const precioMetro = (precio / cantidad).toFixed(2);
    return `$${precioMetro} x metro`;
  }

  // Unidades (huevos, pañales, servilletas)
  if (u === 'un' || u === 'u' || u === 'unidad' || u === 'unidades') {
    const precioUnidad = (precio / cantidad).toFixed(2);
    return `$${precioUnidad} x u.`;
  }

  return null;
}

/**
 * Sube una imagen directamente a ImageKit autenticándose con nuestra API interna
 */
export async function subirImagenImageKit(file) {
  if (!file) return null;

  // 1. Obtener parámetros de firma desde nuestro endpoint
  const authRes = await fetch('/api/imagekit-auth');
  if (!authRes.ok) {
    throw new Error('Error al autenticar con el servidor de imágenes.');
  }
  const authData = await authRes.json();

  // 2. Preparar los datos para ImageKit
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', `ticket_${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
  formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
  formData.append('signature', authData.signature);
  formData.append('expire', authData.expire);
  formData.append('token', authData.token);
  formData.append('folder', '/bariahorra');

  // 3. Subir la imagen al endpoint de ImageKit
  const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    throw new Error(errorData.message || 'Error al subir la imagen a ImageKit.');
  }

  const uploadData = await uploadRes.json();
  return uploadData.url;
}