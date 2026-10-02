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