import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. DICCIONARIO CURADO DE PRODUCTOS FRESCOS Y CORTES TÍPICOS (Tu lista completa intacta)
const FOTOS_GENERICAS = {
  // Carnicería
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

  // Verdulería / Frutería
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

  // Básicos
  huevo: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
  pan: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  leche: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'
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
    .replace(/\b(x\s*\d+|\d+g|\d+kg|\d+ml|\d+l|\d+cc|\d+u|paños|panos|sobres|granel|envasado|feteado|supercongelado|sin tacc|sin gluten|suave|clasica|clasico|comun|elegida|concentrado|activa|activo|doble hoja|triple accion)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const m = marca && marca !== 'Genérica' ? normalizar(marca) : '';
  return { n, m };
}

// Búsqueda en Open Food Facts / Open Beauty Facts (con filtro estricto anti códigos de barra)
async function buscarEnOFF(query, tipoBase = 'food') {
  if (!query || query.length < 3) return null;
  const dominio = tipoBase === 'beauty' ? 'world.openbeautyfacts.org' : 'world.openfoodfacts.org';
  try {
    const url = `https://${dominio}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BariAhorra - PreciosBariloche - V1.0' },
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

// Búsqueda en DuckDuckGo con contextualización semántica argentina
async function buscarEnDuckDuckGo(nombre, marca, categoria) {
  try {
    let contexto = 'producto supermercado argentina fondo blanco';
    if (categoria === 'Carnicería') {
      contexto = 'corte de carne vacuna carniceria fondo blanco';
    } else if (categoria === 'Verdulería') {
      contexto = 'fruta verdura fresca verduleria';
    } else if (categoria === 'Limpieza') {
      contexto = 'producto de limpieza hogar envase supermercado';
    } else if (categoria === 'Higiene Personal') {
      contexto = 'higiene personal envase supermercado';
    }

    const q = `${nombre} ${marca && marca !== 'Genérica' ? marca : ''} ${contexto}`.trim();
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
    const tokenRes = await fetch(tokenUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=['"]?([^&'"]+)/);
    if (!vqdMatch) return null;

    const vqd = vqdMatch[1];
    const imgApiUrl = `https://duckduckgo.com/i.js?l=es-es&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&f=,,,&p=1`;
    const imgRes = await fetch(imgApiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
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
    // 1. Busca productos sin foto y que aún no hayan sido descartados (evita el bucle de los 30)
    let { data: productosSinFoto, error: errProd } = await supabase
      .from('productos')
      .select('id, nombre, marca, categoria, codigo_barras, foto_url')
      .or('foto_url.is.null,foto_url.eq.""')
      .eq('foto_buscada', false)
      .limit(30);

    // Fallback por si la columna foto_buscada aún no existe
    if (errProd) {
      const resFallback = await supabase
        .from('productos')
        .select('id, nombre, marca, categoria, codigo_barras, foto_url')
        .or('foto_url.is.null,foto_url.eq.""')
        .limit(30);
      productosSinFoto = resFallback.data;
    }

    if (!productosSinFoto || productosSinFoto.length === 0) {
      return NextResponse.json({
        exito: true,
        mensaje: '¡Todos los productos del catálogo ya fueron evaluados!',
        actualizados: 0,
        detalles: []
      });
    }

    let actualizados = 0;
    const detalles = [];

    for (const prod of productosSinFoto) {
      const nombreNorm = normalizar(prod.nombre);
      const { n: nomLimpio, m: marcaLimpia } = limpiarCadenaBusqueda(prod.nombre, prod.marca);

      let fotoUrl = null;
      let origen = '';

      // PASO 1: Si tiene código de barras, buscar directo por código
      if (prod.codigo_barras && prod.codigo_barras.length >= 8) {
        try {
          const resCod = await fetch(`https://world.openfoodfacts.org/api/v2/product/${prod.codigo_barras}.json`);
          if (resCod.ok) {
            const dataCod = await resCod.json();
            if (dataCod.status === 1 && dataCod.product) {
              const p = dataCod.product;
              fotoUrl = p.image_front_url || p.image_front_small_url || p.image_url || null;
              if (fotoUrl) origen = 'Código de barras oficial';
            }
          }
        } catch {}
      }

      // PASO 2: Diccionario curado HD para carnicería y verdulería
      if (!fotoUrl) {
        for (const [clave, urlGen] of Object.entries(FOTOS_GENERICAS)) {
          if (nombreNorm.includes(clave)) {
            fotoUrl = urlGen;
            origen = 'Catálogo Frescos HD';
            break;
          }
        }
      }

      // PASO 3: Open Food Facts / Open Beauty Facts
      if (!fotoUrl) {
        const esHigieneOLimpieza = ['Limpieza', 'Higiene Personal'].includes(prod.categoria);
        const tipoBase = esHigieneOLimpieza ? 'beauty' : 'food';

        fotoUrl = await buscarEnOFF(`${nomLimpio} ${marcaLimpia}`.trim(), tipoBase);
        if (!fotoUrl && marcaLimpia) {
          fotoUrl = await buscarEnOFF(`${nomLimpio.split(' ')[0]} ${marcaLimpia}`.trim(), tipoBase);
        }
        if (fotoUrl) origen = esHigieneOLimpieza ? 'Open Beauty Facts' : 'Open Food Facts';
      }

      // PASO 4: DuckDuckGo contextualizado (último recurso para marcas nacionales y súper locales)
      if (!fotoUrl) {
        fotoUrl = await buscarEnDuckDuckGo(prod.nombre, prod.marca, prod.categoria);
        if (fotoUrl) origen = 'Web Oficial Contextualizada';
      }

      // PASO 5: Guardar resultado y marcar como evaluado
      const updatePayload = { foto_buscada: true };
      if (fotoUrl) updatePayload.foto_url = fotoUrl;

      await supabase.from('productos').update(updatePayload).eq('id', prod.id);

      if (fotoUrl) {
        actualizados++;
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: `asignada ✅ (${origen})` });
      } else {
        detalles.push({ producto: `${prod.nombre} (${prod.marca || 'S/M'})`, estado: 'no encontrada (usará ícono vectorial)' });
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