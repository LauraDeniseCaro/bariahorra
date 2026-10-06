'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [comercioSeleccionado, setComercioSeleccionado] = useState('Todos');
  const [orden, setOrden] = useState('recientes'); // 'recientes', 'precio_menor', 'mas_votadas'

  const [ofertas, setOfertas] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(true);

  // Registro local de votos para evitar spam
  const [votosRealizados, setVotosRealizados] = useState({});

  const cargarOfertas = async () => {
    setCargandoOfertas(true);
    try {
      const { data, error } = await supabase
        .from('ofertas')
        .select(`
          id, precio, estado, vencimiento, foto_url, votos_positivos, votos_negativos, creado_en,
          productos ( id, nombre, marca, categoria ),
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

  const cargarComercios = async () => {
    try {
      const { data, error } = await supabase
        .from('comercios')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setComercios(data || []);
    } catch (err) {
      console.error('Error al cargar comercios:', err.message);
    }
  };

  useEffect(() => {
    cargarOfertas();
    cargarComercios();

    const votosGuardados = localStorage.getItem('bariahorra_votos');
    if (votosGuardados) {
      setVotosRealizados(JSON.parse(votosGuardados));
    }
  }, []);

  const handleVotar = async (ofertaId, tipo) => {
    if (votosRealizados[ofertaId]) return alert('Ya votaste en esta oferta.');

    const oferta = ofertas.find((o) => o.id === ofertaId);
    if (!oferta) return;

    if (oferta.votos_positivos >= 100) {
      return alert('Esta es una oferta oficial de catálogo.');
    }

    const nuevosPositivos =
      tipo === 'up' ? (oferta.votos_positivos || 0) + 1 : (oferta.votos_positivos || 0);
    const nuevosNegativos =
      tipo === 'down' ? (oferta.votos_negativos || 0) + 1 : (oferta.votos_negativos || 0);

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

  // Filtrado
  let resultadosFiltrados = ofertas.filter((item) => {
    const prod = item.productos;
    const com = item.comercios;
    const texto = `${prod?.nombre || ''} ${prod?.marca || ''} ${com?.nombre || ''}`.toLowerCase();

    const coincideTexto = texto.includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoria === 'Todos' || prod?.categoria?.toLowerCase() === categoria.toLowerCase();
    const coincideComercio =
      comercioSeleccionado === 'Todos' || com?.id === comercioSeleccionado;

    return coincideTexto && coincideCategoria && coincideComercio;
  });

  // Ordenamiento
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
    <main className="p-4 flex-1">
      {/* Buscador */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar producto, marca o súper..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-[#1b2333] text-sm text-white placeholder-slate-500 rounded-xl pl-4 pr-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-sky-400 transition"
        />
      </div>

      {/* Categorías */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs">
        {['Todos', 'Súper', 'Carnicería', 'Verdulería', 'Lácteos'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap border ${
              categoria === cat
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/40'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Comercios */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 no-scrollbar text-[11px]">
        <button
          onClick={() => setComercioSeleccionado('Todos')}
          className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap border ${
            comercioSeleccionado === 'Todos'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
          }`}
        >
          Todos los súper
        </button>
        {comercios.map((com) => (
          <button
            key={com.id}
            onClick={() => setComercioSeleccionado(com.id)}
            className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap border ${
              comercioSeleccionado === com.id
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            {com.nombre}
          </button>
        ))}
      </div>

      {/* Barra de Orden y Conteo */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-3 py-1.5 mb-3 bg-[#182133] rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span>Ordenar por:</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-transparent text-sky-400 font-semibold outline-none cursor-pointer"
          >
            <option value="recientes" className="bg-[#182133]">Más recientes</option>
            <option value="precio_menor" className="bg-[#182133]">Menor precio</option>
            <option value="mas_votadas" className="bg-[#182133]">Más confiables</option>
          </select>
        </div>
        <span className="text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-medium">
          Total: {resultadosFiltrados.length}
        </span>
      </div>

      {/* Lista de Ofertas */}
      <div className="space-y-3">
        {cargandoOfertas ? (
          <div className="text-center py-12 text-slate-400 text-sm">Cargando precios...</div>
        ) : resultadosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No hay ofertas para estos filtros.</div>
        ) : (
          resultadosFiltrados.map((item) => {
            const prod = item.productos;
            const com = item.comercios;
            const yaVoto = votosRealizados[item.id];
            const esActiva = item.estado === 'activa';
            const esCatalogo = item.votos_positivos >= 100;

            return (
              <article
                key={item.id}
                className={`bg-[#182133] rounded-2xl p-4 border transition hover:border-slate-600 shadow-lg ${
                  esActiva
                    ? esCatalogo
                      ? 'border-amber-400/50'
                      : 'border-emerald-500/30'
                    : 'border-rose-500/30'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-white leading-tight">
                      {prod?.nombre}
                    </h3>
                    {prod?.marca && (
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{prod.marca}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 mt-1.5 font-medium">
                      <span>📍 {com?.nombre || 'Comercio'}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight leading-none">
                      ${item.precio?.toLocaleString('es-AR')}
                    </div>
                    {item.foto_url && (
                      <a
                        href={item.foto_url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative group block rounded-lg overflow-hidden border border-slate-700/80"
                      >
                        <img
                          src={`${item.foto_url}?tr=w-100,h-100,fo-auto`}
                          alt="Foto góndola"
                          className="w-11 h-11 object-cover group-hover:scale-105 transition"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-sky-300 text-center py-0.5 font-bold">
                          FOTO
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Votación o Sello Oficial */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {esCatalogo ? (
                    <div className="w-full flex justify-center py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 font-bold tracking-wide">
                      ⭐ PRECIO OFICIAL / CATÁLOGO
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col text-[11px] text-slate-400">
                        <span>{item.votos_positivos || 0} confirmaron</span>
                        {item.votos_negativos > 0 && (
                          <span className="text-amber-400">⚠️ {item.votos_negativos} reportaron</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVotar(item.id, 'up')}
                          disabled={!!yaVoto}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition ${
                            yaVoto === 'up'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          👍 Sigue
                        </button>
                        <button
                          onClick={() => handleVotar(item.id, 'down')}
                          disabled={!!yaVoto}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition ${
                            yaVoto === 'down'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
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