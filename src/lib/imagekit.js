/**
 * Comprime y reduce en el navegador cualquier foto (incluso 4K) antes de transmitirla
 */
async function comprimirImagenEnCliente(file, maxWidth = 1200, quality = 0.8) {
  if (!file || !file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar manteniendo proporción si supera maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG optimizado (calidad 80%)
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const archivoComprimido = new File(
              [blob],
              (file.name || 'foto').replace(/\.[^/.]+$/, '') + '.jpg',
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(archivoComprimido);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Subida optimizada a ImageKit a través del endpoint interno seguro
 */
export async function subirImagenImageKit(file) {
  if (!file) return null;

  // 1. Reducir resolución y peso de la imagen en el cliente
  const archivoOptimizado = await comprimirImagenEnCliente(file);

  // 2. Enviar la imagen liviana al endpoint interno
  const formData = new FormData();
  formData.append('file', archivoOptimizado);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let mensajeError = `Error en el servidor (${res.status})`;
    try {
      const errorData = await res.json();
      mensajeError = errorData.error || errorData.message || JSON.stringify(errorData);
    } catch {
      const errorText = await res.text().catch(() => '');
      mensajeError = `Error ${res.status}: ${errorText.slice(0, 120) || 'Ruta no encontrada o respuesta inválida'}`;
    }
    throw new Error(mensajeError);
  }

  const data = await res.json();
  return data.url;
}