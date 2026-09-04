'use client';

import { useState } from 'react';

// Muestra de datos locales para ver el diseño en acción
const OFERTAS_MOCK = [
  {
    id: '1',
    producto: 'Yerba Playadito 1 Kg',
    comercio: 'Supermercado Todo',
    sucursal: 'Km 8.5 (Pioneros)',
    distanciaKm: 1.2,
    precio: 3890,
    precioAnterior: 4500,
    categoria: 'Súper',
    votosPositivos: 14,
    votosNegativos: 0,
    vigenciaDias: 4,
    foto: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&q=80',
    verificado: true
  },
  {
    id: '2',
    producto: 'Leche La Serenísima Clásica 1L',
    comercio: 'La Anónima',
    sucursal: 'Centro (Albarracín)',
    distanciaKm: 3.8,
    precio: 1250,
    categoria: 'Lácteos',
    votosPositivos: 3,
    votosNegativos: 1,
    vigenciaDias: 12,
    foto: null,
    verificado: false
  },
  {
    id: '3',
    producto: 'Bola de Lomo p/ Milanesas x Kg',
    comercio: 'Carnicería El Cholo',
    sucursal: 'Onelli y 25 de Mayo',
    distanciaKm: 2.1,
    precio: 7200,
    categoria: 'Carnicería',
    votosPositivos: 21,
    votosNegativos: 0,
    vigenciaDias: 2,
    foto: null,
    verificado: true
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-100 flex justify-center selection:bg-sky-500 selection:text-white">
      {/* Contenedor central móvil */}
      <div className="w-full max-w-md bg-[#121826] min-h-screen flex flex-col border-x border-slate-800/80 shadow-2xl relative pb-24">
        
        {/* Banner PWA inteligente */}
        <aside aria-label="Instalar app" className="bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-[11px] font-semibold text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span>Instalá BariAhorra en tu celular</span>
          </div>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition">
            Instalar
          </button>
        </aside>

        {/* Cabecera Principal */}
        <header className="px-5 pt-4 pb-3 border-b border-slate-800 bg-[#121826]/90 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h1 className="text-lg font-black tracking-tight text-white">
                  BARI<span className="text-sky-400">AHORRA</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Precios reales de Bariloche</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 text-[11px] text-slate-300">
              <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              <span>Bariloche</span>
            </div>
          </div>

          {/* Barra de Búsqueda */}
          <div className="mt-3 relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar yerba, súper, carne..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#1b2333] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-sky-400 transition"
            />
          </div>

          {/* Filtros horizontales */}
          <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
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
        </header>

        {/* Cuerpo Principal */}
        <main className="p-4 flex-1">
          {activeTab === 'inicio' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Ofertas verificadas cerca de vos</span>
                <span className="text-[11px] text-sky-400">Ordenar por: Cercanía</span>
              </div>

              {OFERTAS_MOCK.map((oferta) => (
                <article
                  key={oferta.id}
                  className={`bg-[#182133] rounded-2xl p-4 border transition hover:border-slate-600 relative overflow-hidden shadow-lg ${
                    oferta.verificado ? 'border-emerald-500/30' : 'border-slate-800'
                  }`}
                >
                  {/* Etiqueta de Verificación */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      oferta.verificado
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {oferta.verificado ? '✓ Posta Verificado' : '⚠️ En revisión'}
                    </span>

                    <span className="text-[10px] text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded-md">
                      ⏳ Vence en {oferta.vigenciaDias} días
                    </span>
                  </div>

                  {/* Detalle Producto */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-white leading-tight">
                        {oferta.producto}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-xs text-sky-400 mt-1 font-medium">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                        </svg>
                        <span>{oferta.comercio}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{oferta.sucursal}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          📍 a {oferta.distanciaKm} km
                        </span>
                        <span>{oferta.votosPositivos} vecinos confirmaron</span>
                      </div>
                    </div>

                    {/* Zona Precio */}
                    <div className="text-right flex flex-col items-end justify-between">
                      <div className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
                        ${oferta.precio.toLocaleString('es-AR')}
                      </div>
                      {oferta.precioAnterior && (
                        <div className="text-[11px] text-slate-500 line-through">
                          ${oferta.precioAnterior.toLocaleString('es-AR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones de Comunidad */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">¿Sigue este precio?</span>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 font-medium transition active:scale-95">
                        <span>👍</span> Sigue igual
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-medium transition active:scale-95">
                        <span>👎</span> Cambió
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'cargar' && (
            <div className="bg-[#182133] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Aportar una oferta</h2>
                <p className="text-xs text-slate-400">Ayudá a los vecinos de Bariloche a pagar menos.</p>
              </div>

              {/* Botón para foto rápida */}
              <div className="border-2 border-dashed border-slate-700 hover:border-sky-400 rounded-xl p-6 text-center cursor-pointer transition bg-slate-900/40">
                <svg className="w-8 h-8 text-sky-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p className="text-xs font-semibold text-slate-200">Sacar foto a la góndola / cartel</p>
                <p className="text-[10px] text-slate-500 mt-1">Se comprime en tu celular para no gastar datos</p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Producto (ej: Manteca La Serenísima 200g)"
                  className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                />
                <input
                  type="number"
                  placeholder="Precio ($ ARS)"
                  className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Comercio y sucursal (ej: Todo Moreno)"
                  className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                />
              </div>

              <button className="w-full bg-sky-500 hover:bg-sky-400 active:scale-98 text-slate-950 font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-sky-500/20">
                Publicar Precio
              </button>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="bg-[#182133] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Panel Moderación</h2>
                <p className="text-xs text-slate-400">Control de vigencia y reportes comunitarios.</p>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-300">Vigencia automática de ofertas</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button className="bg-slate-800 border border-slate-700 hover:border-sky-400 p-2 rounded-lg text-slate-300">
                    2 días
                  </button>
                  <button className="bg-sky-500/20 border border-sky-500/40 p-2 rounded-lg text-sky-400 font-bold">
                    15 días
                  </button>
                  <button className="bg-slate-800 border border-slate-700 hover:border-sky-400 p-2 rounded-lg text-slate-300">
                    Manual
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Barra de Navegación Inferior (Estilo App Nativa) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-[#121826]/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-6 z-40">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'inicio' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span className="text-[10px] font-semibold">Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('cargar')}
            className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-sky-500 to-indigo-500 text-white rounded-full h-12 w-12 shadow-lg shadow-sky-500/30 active:scale-95 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
            </svg>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'admin' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-[10px] font-semibold">Admin</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
