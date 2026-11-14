import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. FOTOS FIJAS CURADAS POR TIPO DE FRESCO
const FOTO_VACA = 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80';
const FOTO_POLLO = 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&q=80';
const FOTO_CERDO = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&q=80';
const FOTO_PESCADO = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80';
const FOTO_QUESO = 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80';
const FOTO_FIAMBRE = 'https://images.unsplash.com/photo-1524438418049-ab2acb7aa48f?w=500&q=80';

const FOTOS_VERDULERIA = {
  repollo: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&q=80',
  tomate: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
  papa: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  cebolla: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&q=80',
  lechuga: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&q=80',
  zanahoria: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
  manzana: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  naranja: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80',
  limon: 'https://images.unsplash.com/photo-1533082697818-472d829eb9e7?w=400&q=80',
  palta: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80',
  morron: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
  zapallo: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&q=80',
  espinaca: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  acelga: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
  sandia: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
  brocoli: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80'
};

function normalizar(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function contienePalabraExacta(texto, palabra) {
  const regex = new RegExp(`\\b${palabra}\\b`, 'i');
  return regex.test(texto);
}

function limpiarCadena(nombre = '', marca = '') {
  const n = normalizar(nombre)
    .replace(/[()\/,.-]/g, ' ')
    .replace(/\b(x\s*\d+|\d+g|\d+gr|\d+kg|\d+ml|\d+l|\d+lt|\d+cc|\d+u|paños|panos|sobres|granel|envasado|feteado|supercongelado|sin tacc|sin gluten|suave|clasica|clasico|comun|elegida|concentrado|activa|activo|doble hoja|triple accion|botella|tetra|doypack|pack|caja|sachet)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const m = marca && !['generica', 's/m', 'la anonima', 'carrefour', 'okey', 'best'].includes(normalizar(marca))
    ? normalizar(marca)
    : '';
  return { n, m };
}

function resolverFotoFija(nombreNorm, cat) {
  // 1. Carnicería y Congelados diferenciados en Cerdo, Pollo y Vaca
  if (cat === 'Carnicería' || cat === 'Congelados') {
    if (/\b(cerdo|bondiola|pechito|solomillo|carre)\b/.test(nombreNorm)) {
      return { url: FOTO_CERDO, origen: 'Fija Cerdo HD' };
    }
    if (/\b(pollo|suprema|pechuga|muslo|nuggets|patitas)\b/.test(nombreNorm)) {
      return { url: FOTO_POLLO, origen: 'Fija Pollo HD' };
    }
    if (cat === 'Carnicería' && !/\b(salchicha|chorizo|morcilla)\b/.test(nombreNorm)) {
      return { url: FOTO_VACA, origen: 'Fija Vaca HD' };
    }
  }

  // 2. Pescados y Mariscos
  if (cat === 'Pescados y Mariscos' || contienePalabraExacta(nombreNorm, 'merluza')) {
    return { url: FOTO_PESCADO, origen: 'Fija Pescadería HD' };
  }

  // 3. Fiambrería y Quesos al peso
  if (cat === 'Fiambrería') {
    return { url: FOTO_FIAMBRE, origen: 'Fija Fiambrería HD' };
  }
  if (cat === 'Lácteos' && /\b(queso cremoso|queso danbo|queso barra|port salut|reggianito|sardo|mozzarella)\b/.test(nombreNorm)) {
    return { url: FOTO_QUESO, origen: 'Fija Quesos HD' };
  }

  // 4. Verdulería y Huevos
  if (cat === 'Verdulería') {
    for (const [clave, urlGen] of Object.entries(FOTOS_VERDULERIA)) {
      if (contienePalabraExacta(nombreNorm, clave)) {
        return { url: urlGen, origen: 'Catálogo Verdulería HD' };
      }
    }
  }
  if (contienePalabraExacta(nombreNorm, 'huevo') && !nombreNorm.includes('fideo') && !nombreNorm.includes('pasta')) {
    return { url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80', origen: 'Huevos Granja HD' };
  }

  return null;
}

async function buscarEnOFFEstricto(query, marcaLimpia, tipoBase = 'food') {
  if (!query || query.length < 4 || !marcaLimpia) return null;
  const dominio = tipoBase === 'beauty' ? 'world.openbeautyfacts.org' : 'world.openfoodfacts.org';
  try {
    const url = `https://${dominio}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BariAhorra - AppPreciosBariloche - V3.1' },
      next: { revalidate: 0 }
    });
    if (!res.ok) return null;
    const data = await res.json();

    const prod = data.products?.find((p) => {
      const img = p.image_front_url || p.image_front_small_url;
      if (!img) return false;
      const lower = img.toLowerCase();
      if (lower.includes('barcode') || lower.includes('packaging') || lower.includes('nutrition')) return false;

      const brands = normalizar(p.brands || '');
      const primeraMarca = brands.split(',')[0]?.trim() || '___';
      return brands.includes(marcaLimpia) || marcaLimpia.includes(primeraMarca);
    });

    return prod?.image_front_url || prod?.image_front_small_url || null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    const { data: productosSinFoto, error: errProd } = await supabase
      .from('productos')
      .select('id, nombre, marca, categoria, codigo_barras, foto_url')
      .or('foto_url.is.null,foto_url.eq.""')
      .eq('foto_buscada', false)
      .limit(40);

    if (errProd) throw errProd;

    if (!productosSinFoto || productosSinFoto.length === 0) {
      return NextResponse.json({
        exito: true,
        mensaje: '¡No quedan productos pendientes de procesar!',
        actualizados: 0,
        detalles: []
      });
    }

    let actualizados = 0;
    const detalles = [];

    for (const prod of productosSinFoto) {
      const nombreNorm = normalizar(prod.nombre);
      const cat = prod.categoria || 'Almacén';
      const { n: nomLimpio, m: marcaLimpia } = limpiarCadena(prod.nombre, prod.marca);

      let fotoUrl = null;
      let origen = '';

      // 1. Código de barras oficial EAN
      if (prod.codigo_barras && prod.codigo_barras.length >= 8) {
        try {
          const resCod = await fetch(`https://world.openfoodfacts.org/api/v2/product/${prod.codigo_barras}.json`);
          if (resCod.ok) {
            const dataCod = await resCod.json();
            if (dataCod.status === 1 && dataCod.product) {
              const p = dataCod.product;
              fotoUrl = p.image_front_url || p.image_front_small_url || p.image_url || null;
              if (fotoUrl) origen = 'Código oficial EAN';
            }
          }
        } catch {}
      }

      // 2. Fotos fijas curadas (Cerdo, Pollo, Vaca, Pescado, Quesos, Fiambres, Verdulería)
      if (!fotoUrl) {
        const fija = resolverFotoFija(nombreNorm, cat);
        if (fija) {
          fotoUrl = fija.url;
          origen = fija.origen;
        }
      }

      // 3. Open Beauty Facts estricto para Limpieza e Higiene
      if (!fotoUrl && ['Limpieza', 'Higiene Personal'].includes(cat) && marcaLimpia) {
        fotoUrl = await buscarEnOFFEstricto(`${nomLimpio} ${marcaLimpia}`.trim(), marcaLimpia, 'beauty');
        if (fotoUrl) origen = 'Open Beauty Facts';
      }

      // 4. Open Food Facts estricto para empaquetados con marca
      if (!fotoUrl && !['Carnicería', 'Verdulería', 'Limpieza', 'Higiene Personal'].includes(cat) && marcaLimpia) {
        fotoUrl = await buscarEnOFFEstricto(`${nomLimpio} ${marcaLimpia}`.trim(), marcaLimpia, 'food');
        if (!fotoUrl) {
          const nucleo = nomLimpio.split(' ')[0] || '';
          fotoUrl = await buscarEnOFFEstricto(`${marcaLimpia} ${nucleo}`.trim(), marcaLimpia, 'food');
        }
        if (fotoUrl) origen = 'Open Food Facts Verificado';
      }

      // 5. Guardar en Supabase (si no hay foto, queda con logo de marca o ícono limpio)
      const updatePayload = { foto_buscada: true };
      if (fotoUrl) updatePayload.foto_url = fotoUrl;

      await supabase.from('productos').update(updatePayload).eq('id', prod.id);

      if (fotoUrl) {
        actualizados++;
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: `asignada ✅ (${origen})` });
      } else {
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: 'sin foto (usará logo de marca o ícono)' });
      }
    }

    return NextResponse.json({
      exito: true,
      mensaje: `¡Se procesaron ${productosSinFoto.length} productos (${actualizados} fotos asignadas)!`,
      actualizados,
      detalles
    });
  } catch (err) {
    return NextResponse.json({ exito: false, error: err.message }, { status: 500 });
  }
}