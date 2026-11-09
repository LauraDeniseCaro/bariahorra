import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. DICCIONARIO EXCLUSIVO PARA FRESCOS (Carnicería, Verdulería y Huevos de granja)
const FOTOS_CARNICERIA = {
  falda: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  asado: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  vacio: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
  matambre: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  paleta: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  nalga: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  aguja: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  peceto: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  bola: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  lomo: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  bife: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&q=80',
  picada: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80',
  pollo: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80',
  pechuga: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80',
  milanesa: 'https://images.unsplash.com/photo-1599921841143-819025a22b49?w=400&q=80',
  costilla: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
  cerdo: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
  bondiola: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
  chorizo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
  morcilla: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80'
};

const FOTOS_VERDULERIA = {
  sandia: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
  manzana: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  tomate: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
  papa: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  cebolla: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&q=80',
  lechuga: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&q=80',
  zanahoria: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80',
  brocoli: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
  naranja: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80',
  limon: 'https://images.unsplash.com/photo-1533082697818-472d829eb9e7?w=400&q=80',
  palta: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80',
  morron: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
  zapallo: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&q=80'
};

function normalizar(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function limpiarCadenaBusqueda(nombre = '', marca = '') {
  const n = normalizar(nombre)
    .replace(/[()\/,.-]/g, ' ')
    .replace(/\b(x\s*\d+|\d+g|\d+gr|\d+kg|\d+ml|\d+l|\d+lt|\d+cc|\d+u|paños|panos|sobres|granel|envasado|feteado|supercongelado|sin tacc|sin gluten|suave|clasica|clasico|comun|elegida|concentrado|activa|activo|doble hoja|triple accion|botella|tetra|doypack|pack|caja|sachet)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const m = marca && marca !== 'Genérica' && marca !== 'S/M' ? normalizar(marca) : '';
  return { n, m };
}

async function buscarEnOFF(query, tipoBase = 'food') {
  if (!query || query.length < 3) return null;
  const dominio = tipoBase === 'beauty' ? 'world.openbeautyfacts.org' : 'world.openfoodfacts.org';
  try {
    const url = `https://${dominio}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BariAhorra - PreciosBariloche - V2.0' },
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

async function buscarEnDuckDuckGo(nombre, marca, categoria) {
  try {
    const q = `${nombre} ${marca || ''} producto supermercado argentina`.trim();
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
    const tokenRes = await fetch(tokenUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=['"]?([^&'"]+)/);
    if (!vqdMatch) return null;

    const vqd = vqdMatch[1];
    const imgApiUrl = `https://duckduckgo.com/i.js?l=es-es&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&f=,,,&p=1`;
    const imgRes = await fetch(imgApiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!imgRes.ok) return null;
    const imgData = await imgRes.json();
    return imgData.results?.[0]?.image || null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    // Tomamos hasta 40 productos sin foto
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
      const { n: nomLimpio, m: marcaLimpia } = limpiarCadenaBusqueda(prod.nombre, prod.marca);

      let fotoUrl = null;
      let origen = '';

      // PASO 1: Código de barras oficial (si lo tiene, 100% certero)
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

      // PASO 2: Frescos (SOLO si la categoría es Carnicería o Verdulería)
      // Esto evita que "Fideos al huevo" o "Pan rallado" reciban fotos de huevo o pan
      if (!fotoUrl) {
        if (cat === 'Carnicería') {
          for (const [clave, urlGen] of Object.entries(FOTOS_CARNICERIA)) {
            if (nombreNorm.includes(clave)) {
              fotoUrl = urlGen;
              origen = 'Catálogo Carnes HD';
              break;
            }
          }
        } else if (cat === 'Verdulería') {
          for (const [clave, urlGen] of Object.entries(FOTOS_VERDULERIA)) {
            if (nombreNorm.includes(clave)) {
              fotoUrl = urlGen;
              origen = 'Catálogo Frutas/Verduras HD';
              break;
            }
          }
        } else if (nombreNorm === 'maple de huevo' || nombreNorm === 'huevos' || nombreNorm === 'huevo blanco' || nombreNorm === 'huevo color') {
          fotoUrl = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80';
          origen = 'Huevos Granja HD';
        }
      }

      // PASO 3: Open Beauty Facts (Higiene y Limpieza)
      if (!fotoUrl && ['Limpieza', 'Higiene Personal'].includes(cat)) {
        fotoUrl = await buscarEnOFF(`${nomLimpio} ${marcaLimpia}`.trim(), 'beauty');
        if (!fotoUrl && marcaLimpia) {
          fotoUrl = await buscarEnOFF(`${marcaLimpia} ${nomLimpio.split(' ')[0]}`.trim(), 'beauty');
        }
        if (fotoUrl) origen = 'Open Beauty Facts';
      }

      // PASO 4: Open Food Facts (Alimentos, Bebidas, Lácteos, Sin TACC)
      if (!fotoUrl && !['Carnicería', 'Verdulería'].includes(cat)) {
        // Intento A: Nombre limpio + Marca
        fotoUrl = await buscarEnOFF(`${nomLimpio} ${marcaLimpia}`.trim(), 'food');

        // Intento B: Si falló, buscar solo Marca + Primera palabra (ej: "Matarazzo fideos", "Arcor pure")
        if (!fotoUrl && marcaLimpia) {
          const primerPalabra = nomLimpio.split(' ')[0] || '';
          fotoUrl = await buscarEnOFF(`${marcaLimpia} ${primerPalabra}`.trim(), 'food');
        }

        // Intento C: Solo las dos primeras palabras del producto
        if (!fotoUrl) {
          const dosPalabras = nomLimpio.split(' ').slice(0, 2).join(' ');
          fotoUrl = await buscarEnOFF(dosPalabras, 'food');
        }

        if (fotoUrl) origen = 'Open Food Facts';
      }

      // PASO 5: DuckDuckGo (Red de rescate argentina)
      if (!fotoUrl) {
        fotoUrl = await buscarEnDuckDuckGo(prod.nombre, prod.marca, cat);
        if (fotoUrl) origen = 'Buscador Web';
      }

      // PASO 6: Guardar en Supabase
      const updatePayload = { foto_buscada: true };
      if (fotoUrl) updatePayload.foto_url = fotoUrl;

      await supabase.from('productos').update(updatePayload).eq('id', prod.id);

      if (fotoUrl) {
        actualizados++;
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: `asignada ✅ (${origen})` });
      } else {
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: 'no encontrada (usará ícono limpio)' });
      }
    }

    return NextResponse.json({
      exito: true,
      mensaje: `¡Se asignaron ${actualizados} fotos nuevas!`,
      actualizados,
      detalles
    });
  } catch (err) {
    return NextResponse.json({ exito: false, error: err.message }, { status: 500 });
  }
}