import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. DICCIONARIOS CURADOS HD PARA FRESCOS
const FOTOS_CARNICERIA = {
  asado: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  vacio: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  matambre: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  falda: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  nalga: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  peceto: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  lomo: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  bife: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  picada: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80',
  pollo: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80',
  pechuga: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80',
  milanesa: 'https://images.unsplash.com/photo-1599921841143-819025a22b49?w=400&q=80',
  bondiola: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
  chorizo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80'
};

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
  acelga: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80'
};

function normalizar(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Búsqueda por palabra exacta (evita que repollo coincida con pollo o paño con pan)
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

  const m = marca && !['Genérica', 'S/M', 'Generica'].includes(marca) ? normalizar(marca) : '';
  return { n, m };
}

async function buscarEnOFF(query, tipoBase = 'food') {
  if (!query || query.length < 3) return null;
  const dominio = tipoBase === 'beauty' ? 'world.openbeautyfacts.org' : 'world.openfoodfacts.org';
  try {
    const url = `https://${dominio}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BariAhorra - AppPreciosBariloche - V3.0' },
      next: { revalidate: 0 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const prod = data.products?.find((p) => {
      const img = p.image_front_url || p.image_front_small_url || p.image_url;
      if (!img) return false;
      const lower = img.toLowerCase();
      return !lower.includes('barcode') && !lower.includes('packaging') && !lower.includes('nutrition');
    });
    return prod?.image_front_url || prod?.image_front_small_url || prod?.image_url || null;
  } catch {
    return null;
  }
}

// Rescate de artículos genéricos sin bloqueos de red
async function buscarEnWikipedia(termino) {
  if (!termino || termino.length < 3) return null;
  try {
    const url = `https://es.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=500&titles=${encodeURIComponent(termino)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'BariAhorra/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const primerId = Object.keys(pages)[0];
    return pages[primerId]?.thumbnail?.source || null;
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

      // 2. Diccionarios curados por palabra exacta según rubro
      if (!fotoUrl) {
        if (cat === 'Carnicería') {
          for (const [clave, urlGen] of Object.entries(FOTOS_CARNICERIA)) {
            if (contienePalabraExacta(nombreNorm, clave)) {
              fotoUrl = urlGen;
              origen = 'Catálogo Carnes HD';
              break;
            }
          }
        } else if (cat === 'Verdulería') {
          for (const [clave, urlGen] of Object.entries(FOTOS_VERDULERIA)) {
            if (contienePalabraExacta(nombreNorm, clave)) {
              fotoUrl = urlGen;
              origen = 'Catálogo Verdulería HD';
              break;
            }
          }
        } else if (contienePalabraExacta(nombreNorm, 'huevo') && !nombreNorm.includes('fideo') && !nombreNorm.includes('pasta')) {
          fotoUrl = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80';
          origen = 'Huevos Granja HD';
        }
      }

      // 3. Open Beauty Facts para Limpieza e Higiene
      if (!fotoUrl && ['Limpieza', 'Higiene Personal'].includes(cat)) {
        fotoUrl = await buscarEnOFF(`${nomLimpio} ${marcaLimpia}`.trim(), 'beauty');
        if (!fotoUrl && marcaLimpia) {
          fotoUrl = await buscarEnOFF(`${marcaLimpia} ${nomLimpio.split(' ')[0]}`.trim(), 'beauty');
        }
        if (fotoUrl) origen = 'Open Beauty Facts';
      }

      // 4. Open Food Facts con términos escalonados
      if (!fotoUrl && !['Carnicería', 'Verdulería'].includes(cat)) {
        fotoUrl = await buscarEnOFF(`${nomLimpio} ${marcaLimpia}`.trim(), 'food');

        if (!fotoUrl && marcaLimpia) {
          const nucleo = nomLimpio.split(' ')[0] || '';
          fotoUrl = await buscarEnOFF(`${marcaLimpia} ${nucleo}`.trim(), 'food');
        }

        if (!fotoUrl) {
          const dosPalabras = nomLimpio.split(' ').slice(0, 2).join(' ');
          fotoUrl = await buscarEnOFF(dosPalabras, 'food');
        }

        if (fotoUrl) origen = 'Open Food Facts';
      }

      // 5. Wikipedia para verduras y genéricos
      if (!fotoUrl) {
        const palabraClave = nomLimpio.split(' ')[0];
        if (palabraClave && palabraClave.length > 3) {
          fotoUrl = await buscarEnWikipedia(palabraClave);
          if (fotoUrl) origen = 'Wikipedia Oficial';
        }
      }

      // 6. Guardar en Supabase
      const updatePayload = { foto_buscada: true };
      if (fotoUrl) updatePayload.foto_url = fotoUrl;

      await supabase.from('productos').update(updatePayload).eq('id', prod.id);

      if (fotoUrl) {
        actualizados++;
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: `asignada ✅ (${origen})` });
      } else {
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: 'no encontrada (queda con ícono limpio)' });
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