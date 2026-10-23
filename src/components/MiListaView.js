'use client';

import {
  ShoppingBag,
  TrendingDown,
  ListChecks,
  CheckSquare,
  Square,
  Trash2,
  X,
  Calculator,
  Store
} from 'lucide-react';

function WhatsAppIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28" />
    </svg>
  );
}

export default function MiListaView({
  changuito,
  simulacionChanguito,
  modoCompraActivo,
  setModoCompraActivo,
  itemsTachados,
  toggleItemTachado,
  toggleProductoChanguito,
  limpiarChanguito,
  compartirListaWhatsApp,
  setModoVista,
  obtenerEstiloComercio
}) {
  if (changuito.length === 0) {
    return (
      <div className="text-center py-16 theme-card rounded-3xl border p-6 space-y-3 shadow-sm">
        <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black theme-title">Tu lista de compras está vacía</h3>
        <p className="text-xs theme-muted max-w-sm mx-auto">
          Tocá <strong className="text-sky-400">+ Mi lista</strong> en los productos que necesitás y te calculamos dónde te conviene comprar.
        </p>
        <button
          type="button"
          onClick={() => setModoVista('gondola')}
          className="mt-2 bg-sky-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
        >
          Ver góndola de productos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TARJETA COMPARATIVA DE AHORRO */}
      {simulacionChanguito?.ahorroCombinado > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/40 rounded-2xl p-4 space-y-2 shadow-md">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500">
              Oportunidad de ahorro inteligente
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="theme-card-sub p-2.5 rounded-xl border border-[var(--border-card)]">
              <p className="text-[10px] theme-muted font-bold">Opción Cómoda (1 solo súper):</p>
              <p className="text-sm font-black theme-title">
                {simulacionChanguito.ganador?.comercio}: ${simulacionChanguito.ganador?.totalEstimado.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
              <p className="text-[10px] text-emerald-500 font-bold">Opción Inteligente (Comprar lo más barato):</p>
              <p className="text-sm font-black text-emerald-500">
                ${simulacionChanguito.totalCompraCombinada.toLocaleString('es-AR')}{' '}
                <span className="text-[11px] font-bold text-emerald-400">
                  (¡Ahorrás ${simulacionChanguito.ahorroCombinado.toLocaleString('es-AR')}!)
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST: MODO COMPRA */}
      <div className="theme-card border rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider theme-subtitle flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-500" />
              Tu Lista ({changuito.length} ítems)
            </h3>
            {modoCompraActivo && (
              <p className="text-[11px] font-bold text-sky-400 mt-0.5">
                Llevás {simulacionChanguito?.itemsCompradosCount} de {simulacionChanguito?.totalItems} • Gastado: ${simulacionChanguito?.gastoAcumulado.toLocaleString('es-AR')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModoCompraActivo(!modoCompraActivo)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                modoCompraActivo
                  ? 'bg-amber-500 text-slate-950 border border-amber-400'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{modoCompraActivo ? 'Salir de Modo Compra' : 'Iniciar compra en góndola'}</span>
            </button>

            <button
              type="button"
              onClick={() => compartirListaWhatsApp(simulacionChanguito, changuito.length)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] p-2 rounded-xl transition cursor-pointer"
              title="Compartir por WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={limpiarChanguito}
              className="text-[11px] text-rose-500 hover:text-rose-600 font-bold cursor-pointer p-1.5"
              title="Vaciar lista"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="divide-y theme-card-sub rounded-xl border overflow-hidden">
          {simulacionChanguito?.productosElegidos
            .sort((a, b) => {
              const tachadoA = itemsTachados.includes(a.clave);
              const tachadoB = itemsTachados.includes(b.clave);
              if (tachadoA && !tachadoB) return 1;
              if (!tachadoA && tachadoB) return -1;
              return 0;
            })
            .map((prod) => {
              const tachado = itemsTachados.includes(prod.clave);
              return (
                <div
                  key={prod.clave}
                  onClick={() => modoCompraActivo && toggleItemTachado(prod.clave)}
                  className={`p-3 flex items-center justify-between gap-3 text-xs transition select-none ${
                    modoCompraActivo ? 'cursor-pointer hover:bg-black/10' : ''
                  } ${tachado ? 'opacity-40 line-through bg-black/15' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {modoCompraActivo && (
                      <button type="button" className="shrink-0 text-sky-400">
                        {tachado ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold theme-title truncate">{prod.nombre}</p>
                      <p className="text-[10px] theme-muted">
                        Mejor precio en <strong className="text-emerald-500">{prod.mejorComercio}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-black theme-title">
                      ${prod.minPrecio.toLocaleString('es-AR')}
                    </span>
                    {!modoCompraActivo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductoChanguito(prod.nombre);
                        }}
                        className="p-1 theme-muted hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* COMPARATIVA POR CADENA */}
      <div className="theme-card border rounded-2xl p-4 space-y-3 shadow-lg">
        <h3 className="text-xs font-black uppercase tracking-wider theme-subtitle flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-500" />
          Comparativa por Cadena
        </h3>
        <div className="space-y-2.5">
          {simulacionChanguito?.rankingSupermercados.map((sup, idx) => {
            const esGanador = idx === 0;
            const estiloCom = obtenerEstiloComercio(sup.comercio);
            return (
              <div
                key={sup.comercio}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  esGanador ? 'bg-emerald-500/10 border-emerald-500/40' : 'theme-card-sub'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                        esGanador ? 'bg-emerald-500 text-slate-950' : 'theme-btn-sec border'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${estiloCom}`}>
                      <Store className="w-3 h-3" />
                      {sup.comercio}
                    </span>
                    {esGanador && (
                      <span className="text-[10px] font-black text-emerald-500">¡Más económico!</span>
                    )}
                  </div>
                  <p className="text-[10px] theme-muted pl-7">
                    Encontrados {sup.encontrados} de {sup.totalProductos} productos
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm sm:text-base font-black font-mono theme-title">
                    ${sup.totalEstimado.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}