// src/lib/promos.js

// Días en JS: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
export const PROMOS_BANCARIAS = [
  {
    id: 'bna_la_anonima',
    medioId: 'bna_modo',
    cadena: 'La Anónima',
    dias: [3], // Miércoles
    descuento: 0.20,
    tope: 10000,
    etiqueta: '20% BNA (MODO)'
  },
  {
    id: 'cuenta_dni_todo',
    medioId: 'cuenta_dni',
    cadena: 'Todo',
    dias: [4, 5], // Jueves y Viernes
    descuento: 0.20,
    tope: 6000,
    etiqueta: '20% Cuenta DNI'
  },
  {
    id: 'patagonia_chango',
    medioId: 'patagonia',
    cadena: 'ChangoMás',
    dias: [2, 4], // Martes y Jueves
    descuento: 0.20,
    tope: 8000,
    etiqueta: '20% Patagonia'
  },
  {
    id: 'personal_pay_todos',
    medioId: 'personal_pay',
    cadena: 'Todos',
    dias: [1, 2, 3, 4, 5, 6, 0], // Todos los días
    descuento: 0.15,
    tope: 4000,
    etiqueta: '15% Personal Pay'
  },
  {
    id: 'galicia_carrefour',
    medioId: 'galicia',
    cadena: 'Carrefour',
    dias: [3], // Miércoles
    descuento: 0.20,
    tope: 10000,
    etiqueta: '20% Galicia'
  }
];

export function calcularPrecioConPromo(precioOriginal, comercioNombre, mediosUsuario = []) {
  if (!precioOriginal || precioOriginal <= 0 || !mediosUsuario || mediosUsuario.length === 0) {
    return { tienePromo: false, precioFinal: precioOriginal, etiqueta: null, ahorro: 0 };
  }

  const hoyDia = new Date().getDay();
  const comNorm = String(comercioNombre || '').toLowerCase();

  const promosAplicables = PROMOS_BANCARIAS.filter((p) => {
    const tieneMedio = mediosUsuario.includes(p.medioId);
    const diaValido = p.dias.includes(hoyDia);
    const cadenaValida = p.cadena === 'Todos' || comNorm.includes(p.cadena.toLowerCase());
    return tieneMedio && diaValido && cadenaValida;
  });

  if (promosAplicables.length === 0) {
    return { tienePromo: false, precioFinal: precioOriginal, etiqueta: null, ahorro: 0 };
  }

  // Tomamos la promo que dé mayor descuento
  promosAplicables.sort((a, b) => b.descuento - a.descuento);
  const mejorPromo = promosAplicables[0];

  const descuentoCalculado = precioOriginal * mejorPromo.descuento;
  const ahorroReal = mejorPromo.tope ? Math.min(descuentoCalculado, mejorPromo.tope) : descuentoCalculado;
  const precioFinal = Math.max(0, Math.round(precioOriginal - ahorroReal));

  return {
    tienePromo: true,
    precioFinal,
    etiqueta: mejorPromo.etiqueta,
    ahorro: Math.round(ahorroReal)
  };
}