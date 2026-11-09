// src/lib/promos.js

function normalizar(txt = '') {
  return String(txt)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calcula el mejor descuento bancario aplicable hoy a un producto y supermercado.
 * 100% dinámico: solo evalúa lo que exista en la tabla 'promociones' de Supabase.
 * 
 * @param {number} precioOriginal - Precio de góndola relevado.
 * @param {string} comercioNombre - Nombre o cadena del comercio.
 * @param {Array<string>} mediosUsuario - Billeteras/tarjetas activas en el perfil del vecino.
 * @param {Array<object>} promocionesDB - Array de promociones activas cargadas desde Supabase.
 */
export function calcularPrecioConPromo(
  precioOriginal,
  comercioNombre,
  mediosUsuario = [],
  promocionesDB = []
) {
  if (!precioOriginal || precioOriginal <= 0) {
    return { tienePromo: false, precioFinal: precioOriginal, etiqueta: null, ahorro: 0 };
  }

  // Si no hay promociones cargadas en Supabase, no aplica descuentos
  if (!Array.isArray(promocionesDB) || promocionesDB.length === 0) {
    return { tienePromo: false, precioFinal: precioOriginal, etiqueta: null, ahorro: 0 };
  }

  const hoyDia = new Date().getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  const comNorm = normalizar(comercioNombre);
  const mediosNorm = (mediosUsuario || []).map(normalizar);

  const promosAplicables = promocionesDB.filter((p) => {
    if (!p.activo) return false;

    // 1. Verificar día de la semana (si el array viene vacío, aplica todos los días)
    const dias = Array.isArray(p.dias_semana) ? p.dias_semana : [];
    if (dias.length > 0 && !dias.includes(hoyDia)) return false;

    // 2. Verificar cadena o comercio
    const cadPromo = normalizar(p.cadena);
    const cadenaValida =
      cadPromo === 'todos' ||
      comNorm.includes(cadPromo) ||
      cadPromo.includes(comNorm);
    if (!cadenaValida) return false;

    // 3. Verificar si el usuario tiene ese medio de pago
    if (mediosNorm.length > 0) {
      const medioRequerido = normalizar(p.medio_pago_requerido || p.banco_o_billetera);
      const coincide = mediosNorm.some(
        (m) => m.includes(medioRequerido) || medioRequerido.includes(m)
      );
      if (!coincide) return false;
    }

    return true;
  });

  if (promosAplicables.length === 0) {
    return { tienePromo: false, precioFinal: precioOriginal, etiqueta: null, ahorro: 0 };
  }

  // Ordenar para tomar la promoción con mayor porcentaje de descuento
  promosAplicables.sort((a, b) => Number(b.porcentaje_descuento || 0) - Number(a.porcentaje_descuento || 0));

  const mejor = promosAplicables[0];
  const tasa = Number(mejor.porcentaje_descuento || 0) / 100;
  const tope = Number(mejor.tope_reintegro || 0);

  const descuentoBruto = precioOriginal * tasa;
  const ahorroReal = tope > 0 ? Math.min(descuentoBruto, tope) : descuentoBruto;
  const precioFinal = Math.max(0, Math.round(precioOriginal - ahorroReal));

  const etiqueta =
    mejor.descripcion ||
    `${mejor.porcentaje_descuento}% ${mejor.banco_o_billetera}`;

  return {
    tienePromo: true,
    precioFinal,
    etiqueta,
    ahorro: Math.round(ahorroReal)
  };
}