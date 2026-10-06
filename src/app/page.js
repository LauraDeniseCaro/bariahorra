'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// --- UTILIDADES DE BÚSQUEDA INTELIGENTE ---

// 1. Quitar tildes, diacríticos y pasar a minúsculas
const limpiarTexto = (str = '') =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// 2. Distancia de Levenshtein para tolerar errores de tipeo
const calcularDistancia = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let anterior = i;
    for (let j = 1; j <= b.length; j++) {
      let valor;
      if (a[i - 1] === b[j - 1]) {
        valor = fila[j - 1];
      } else {
        valor = Math.min(fila[j - 1] + 1, anterior + 1, fila[j] + 1);
      }
      fila[j - 1] = anterior;
      anterior = valor;
    }
    fila[b.length] = anterior;
  }
  return fila[b.length];
};

// 3. Comprobar coincidencia tolerando errores y tildes
const coincideConTolerancia = (textoCompleto, query) => {
  const q = limpiarTexto(query);
  if (!q) return true;

  const target = limpiarTexto(textoCompleto);
  if (target.includes(q)) return true;

  const palabrasQuery = q.split(/\s+/).filter(Boolean);
  const palabrasTarget = target.split(/[\s,.-]+/).filter(Boolean);

  return palabrasQuery.every((pQ) => {
    if (palabrasTarget.some((pT) => pT.includes(pQ))) return true;

    const margenError = pQ.length >= 7 ? 2 : pQ.length >= 4 ? 1 : 0;
    if (margenError === 0) return false;

    return palabrasTarget.some((pT) => {
      if (Math.abs(pT.length - pQ.length) <= margenError) {
        return calcularDistancia(pQ, pT) <= margenError;
      }
      return false;
    });
  });
};

export default function Home() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [orden, setOrden] = useState('recientes');

  const [ofertas, setOfertas] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(true);
  const [votosRealizados, setVotosRealizados] = useState({});

  const cargarOfertas = async () => {
    setCargandoOfertas(true);
    try {
      const { data, error } = await supabase
        .from('ofertas')
        .select(`
          id, precio, estado, vencimiento, foto_url, votos_positivos, votos_negativos, creado_en,
          productos ( id, nombre, marca, cantidad, unidad_medida, categoria ),
          comercios ( id, nombre )
        `)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setOfertas(data || []);
    } catch (err) {
      console.error('Error al cargar ofertas:', err.message);
    } finally {
      setCargandoOfertas(false);
    }
  };

  useEffect(() => {
    cargarOfertas();
    const votosGuardados = localStorage.getItem('bariahorra_votos');
    if (votosGuardados) setVotosRealizados(JSON.parse(votosGuardados));
  }, []);

  const handleVotar = async (ofertaId, tipo) => {
    if (votosRealizados[ofertaId]) return alert('Ya votaste en esta oferta.');
    const oferta = ofertas.find((o) => o.id === ofertaId);
    if (!oferta) return;

    if (oferta.votos_positivos >= 100) {
      return alert('Esta es una oferta oficial de catálogo.');
    }

    const nuevosPositivos = tipo === 'up' ? (oferta.votos_positivos || 0) + 1 : (oferta.votos_positivos || 0);
    const nuevosNegativos = tipo === 'down' ? (oferta.votos_negativos || 0) + 1 : (oferta.votos_negativos || 0);
    let nuevoEstado = oferta.estado;
    if (nuevosNegativos >= 3) nuevoEstado = 'en_revision';

    try {
      const { error } = await supabase
        .from('ofertas')
        .update({
          votos_positivos: nuevosPositivos,
          votos_negativos: nuevosNegativos,
          estado: nuevoEstado,
        })
        .eq('id', ofertaId);

      if (error) throw error;

      setOfertas((prev) =>
        prev.map((o) =>
          o.id === ofertaId
            ? { ...o, votos_positivos: nuevosPositivos, votos_negativos: nuevosNegativos, estado: nuevoEstado }
            : o
        )
      );

      const actualizados = { ...votosRealizados, [ofertaId]: tipo };
      setVotosRealizados(actualizados);
      localStorage.setItem('bariahorra_votos', JSON.stringify(actualizados));
    } catch (err) {
      alert('Error al registrar voto: ' + err.message);
    }
  };

  // El buscador rastrea Producto + Marca + Comercio en un solo paso
  let resultadosFiltrados = ofertas.filter((item) => {
    const prod = item.productos;
    const com = item.comercios;
    const textoCompleto = `${prod?.nombre || ''} ${prod?.marca || ''} ${com?.nombre || ''}`;

    const coincideBusqueda = coincideConTolerancia(textoCompleto, busqueda);
    const coincideCategoria =
      categoria === 'Todos' || prod?.categoria?.toLowerCase() === categoria.toLowerCase();

    return coincideBusqueda && coincideCategoria;
  });

  resultadosFiltrados.sort((a, b) => {
    if (orden === 'precio_menor') return a.precio - b.precio;
    if (orden === 'mas_votadas') {
      const scoreA = (a.votos_positivos || 0) - (a.votos_negativos || 0);
      const scoreB = (b.votos_positivos || 0) - (b.votos_negativos || 0);
      return scoreB - scoreA;
    }
    return new Date(b.creado_en || 0) - new Date(a.creado_en || 0);
  });

  return (
    <main className="p-4 md:p-6 flex-1 max-w-4xl mx-auto w-full">
      {/* 1. Buscador único (Producto, Marca o Comercio) */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar producto, marca o comercio (ej. leche, La Anónima, Diarco)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-[#161d2b] text-white placeholder-slate-400 rounded-2xl pl-11 pr-10 py-3.5 border border-slate-700/70 focus:outline-none focus:border-orange-500 text-sm shadow-sm transition"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Categorías (Única fila de navegación) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
        {['Todos', 'Súper', 'Carnicería', 'Verdulería', 'Lácteos', 'Limpieza', 'Bebidas'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              categoria === cat
                ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                : 'bg-[#161d2b] text-slate-300 border-slate-700/60 hover:border-slate-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Orden y Total de ofertas */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 py-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span>Ordenar:</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-transparent text-orange-400 font-bold outline-none cursor-pointer"
          >
            <option value="recientes" className="bg-[#161d2b]">Más recientes</option>
            <option value="precio_menor" className="bg-[#161d2b]">Menor precio</option>
            <option value="mas_votadas" className="bg-[#161d2b]">Más confiables</option>
          </select>
        </div>
        <span className="text-[11px] text-slate-300 bg-[#161d2b] border border-slate-700/60 px-2.5 py-0.5 rounded-lg font-semibold">
          {resultadosFiltrados.length} ofertas
        </span>
      </div>

      {/* 4. Grilla de Ofertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {cargandoOfertas ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">Cargando precios...</div>
        ) : resultadosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">
            No encontramos ofertas para esa búsqueda.
          </div>
        ) : (
          resultadosFiltrados.map((item) => {
            const prod = item.productos;
            const com = item.comercios;
            const yaVoto = votosRealizados[item.id];
            const esCatalogo = item.votos_positivos >= 100;

            return (
              <article
                key={item.id}
                className="bg-[#161d2b] rounded-2xl p-4 border border-slate-700/70 hover:border-slate-500 shadow-md flex flex-col justify-between transition"
              >
                <div className="flex gap-3.5 items-start">
                  {/* Foto de Góndola */}
                  {item.foto_url ? (
                    <a
                      href={item.foto_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0"
                    >
                      <img
                        src={`${item.foto_url}?tr=w-160,h-160,fo-auto`}
                        alt={prod?.nombre}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white text-center py-0.5 font-bold">
                        AMPLIAR
                      </span>
                    </a>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#0f141f] border border-slate-800 flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                      <span className="text-xl">🛒</span>
                      <span className="text-[9px] mt-1 text-slate-400 font-semibold">Sin foto</span>
                    </div>
                  )}

                  {/* Datos del Producto */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md inline-block">
                      📍 {com?.nombre}
                    </span>
                    <h3 className="font-bold text-base text-white leading-tight mt-1 truncate">
                      {prod?.nombre}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      <span className="text-slate-200 font-semibold">{prod?.marca || 'Genérico'}</span>
                      {prod?.cantidad ? ` • ${prod.cantidad}${prod.unidad_medida || ''}` : ''}
                      {prod?.categoria ? ` • ${prod.categoria}` : ''}
                    </p>

                    <div className="mt-2 text-2xl font-black text-white font-mono tracking-tight">
                      ${item.precio?.toLocaleString('es-AR')}
                    </div>
                  </div>
                </div>

                {/* Pie: Votación comunitaria o Catálogo oficial */}
                <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  {esCatalogo ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-bold text-[11px]">
                      <span>⭐</span> PRECIO OFICIAL DE CATÁLOGO
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-200">{item.votos_positivos || 0}</span> confirmaron
                        {item.votos_negativos > 0 && (
                          <span className="text-rose-400 ml-1 font-semibold">({item.votos_negativos} subió)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVotar(item.id, 'up')}
                          disabled={!!yaVoto}
                          className={`px-3 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition ${
                            yaVoto === 'up'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-[#0f141f] text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          👍 Sigue
                        </button>
                        <button
                          onClick={() => handleVotar(item.id, 'down')}
                          disabled={!!yaVoto}
                          className={`px-3 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition ${
                            yaVoto === 'down'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-[#0f141f] text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          👎 Subió
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}