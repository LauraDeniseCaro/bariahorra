'use client';

import { Sparkles, ChevronLeft, ChevronRight, Zap, Store } from 'lucide-react';

export default function PreciosBomba({
  ofertasBomba,
  bombaRef,
  iniciarArrastre,
  manejarRuedaHorizontal,
  desplazarBomba,
  abrirUbicacionComercio,
  dragInfoRef,
  CONFIG_CATEGORIAS,
  obtenerEstiloComercio
}) {
  if (!ofertasBomba || ofertasBomba.length === 0) return null;

  return (
    <section className="space-y-2 pt-1 animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider theme-subtitle flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Precios Destacados de Bariloche</span>
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => desplazarBomba('izq')}
            className="w-6 h-6 rounded-full theme-btn-sec border flex items-center justify-center cursor-pointer transition hover:border-amber-500"
            title="Ver anteriores"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => desplazarBomba('der')}
            className="w-6 h-6 rounded-full theme-btn-sec border flex items-center justify-center cursor-pointer transition hover:border-amber-500"
            title="Ver siguientes"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={bombaRef}
        onMouseDown={(e) => iniciarArrastre(e, bombaRef)}
        onWheel={(e) => manejarRuedaHorizontal(e, bombaRef)}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none select-none cursor-grab active:cursor-grabbing"
      >
        {ofertasBomba.map((item) => {
          const confRubroBomba = CONFIG_CATEGORIAS[item._rubro] || CONFIG_CATEGORIAS.Almacén;
          const IconoRubroBomba = confRubroBomba.icono;
          const estiloCom = obtenerEstiloComercio ? obtenerEstiloComercio(item._comercio) : 'badge-com-default';

          return (
            <div
              key={item.id}
              onClick={() => {
                if (dragInfoRef.current?.hasMoved) return;
                abrirUbicacionComercio(
                  item._comercio,
                  item._comercioDireccion,
                  item._comercioLat,
                  item._comercioLng,
                  item._distanciaTxt
                );
              }}
              className="shrink-0 w-64 theme-card border border-amber-500/30 rounded-2xl p-3 shadow-md bg-gradient-to-br from-amber-500/5 via-transparent to-transparent flex flex-col justify-between space-y-2 cursor-pointer hover:border-amber-400 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-slate-950" />
                  Destacado
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${estiloCom}`}>
                  <Store className="w-2.5 h-2.5" />
                  <span>{item._cadena || item._comercio}</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl border overflow-hidden shrink-0 theme-card-sub flex items-center justify-center relative">
                  <IconoRubroBomba className={`w-6 h-6 stroke-[1.75] absolute ${confRubroBomba.acento}`} />
                  {item._foto && (
                    <img
                      src={item._foto}
                      alt={item._producto}
                      className="w-full h-full object-cover relative z-10 bg-[var(--bg-card)]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black theme-title truncate">{item._producto}</h4>
                  <p className="text-[10px] theme-muted truncate">{item._marca} • {item._presentacion}</p>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-[var(--border-card)]">
                <span className="text-base font-black font-mono text-emerald-500">
                  ${Number(item._precio).toLocaleString('es-AR')}
                </span>
                {item._refUnitario && (
                  <span className="text-[9px] theme-muted font-bold">
                    x {item._refUnitario.unidad}: {item._refUnitario.valor}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}