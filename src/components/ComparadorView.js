'use client';

import {
  ZoomIn,
  Award,
  ShoppingBag,
  Store,
  MapPin,
  Sparkles,
  Navigation,
  ChevronDown,
  Info
} from 'lucide-react';

export default function ComparadorView({
  productosComparados,
  limiteVisibles,
  setLimiteVisibles,
  cantidadPorPagina,
  changuito,
  toggleProductoChanguito,
  setFotoModal,
  abrirUbicacionComercio,
  tiempoRelativo,
  CONFIG_CATEGORIAS,
  obtenerEstiloComercio
}) {
  return (
    <div className="space-y-3.5">
      {productosComparados.slice(0, limiteVisibles).map((grupo) => {
        const confRubro = CONFIG_CATEGORIAS[grupo.rubro] || CONFIG_CATEGORIAS.Almacén;
        const IconoRubro = confRubro.icono;
        const enChanguito = changuito.includes(grupo.claveProd);

        return (
          <section
            key={grupo.clave}
            className="theme-card border rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={() => {
                    if (grupo.foto) {
                      setFotoModal({
                        foto: grupo.foto,
                        producto: grupo.producto,
                        marca: grupo.marca,
                        comercio: grupo.items[0]?._comercio,
                        precio: grupo.minPrecio
                      });
                    }
                  }}
                  className={`w-12 h-12 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center relative group ${
                    grupo.foto ? 'cursor-zoom-in' : ''
                  } ${confRubro.cajaIcono}`}
                  title={grupo.foto ? 'Tocar para ampliar foto' : undefined}
                >
                  <IconoRubro className={`w-6 h-6 absolute ${confRubro.acento}`} />
                  {grupo.foto && (
                    <>
                      <img
                        src={grupo.foto}
                        alt={grupo.producto}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 relative z-10 bg-[var(--bg-card)]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black theme-title truncate">{grupo.producto}</h3>
                  <p className="text-xs theme-muted truncate mt-0.5">
                    <span className="theme-subtitle font-bold">{grupo.marca}</span> •{' '}
                    <span className={`font-bold ${confRubro.acento}`}>{grupo.rubro}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {grupo.ahorro > 0 && (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    Ahorrás ${grupo.ahorro.toLocaleString('es-AR')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleProductoChanguito(grupo.producto)}
                  className={`px-2.5 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 transition cursor-pointer ${
                    enChanguito
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'btn-changuito-add hover:border-sky-500'
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>{enChanguito ? 'En mi lista' : '+ Mi lista'}</span>
                </button>
              </div>
            </div>

            <div className="divide-y theme-card-sub rounded-xl border overflow-hidden">
              {grupo.items.map((item, idx) => {
                const estiloCom = obtenerEstiloComercio(item._comercio);
                const esElMasBarato = item.id === grupo.masBaratoId && grupo.items.length > 1;
                const esElMasCercano = item.id === grupo.masCercanoId && grupo.items.length > 1;
                const esOpcionIdeal = grupo.esOpcionIdeal && esElMasBarato;

                return (
                  <div
                    key={item.id}
                    className={`p-3 flex items-center justify-between gap-3 ${
                      esOpcionIdeal
                        ? 'bg-emerald-500/15'
                        : esElMasBarato
                          ? 'bg-emerald-500/10'
                          : esElMasCercano
                            ? 'bg-sky-500/10'
                            : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                          esOpcionIdeal || esElMasBarato
                            ? 'bg-emerald-500 text-slate-950'
                            : esElMasCercano
                              ? 'bg-sky-500 text-slate-950'
                              : 'theme-btn-sec border'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() =>
                              abrirUbicacionComercio(
                                item._comercio,
                                item._comercioDireccion,
                                item._comercioLat,
                                item._comercioLng,
                                item._distanciaTxt
                              )
                            }
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer hover:opacity-80 active:scale-95 transition ${estiloCom}`}
                            title="Ver cómo llegar en Google Maps"
                          >
                            <Store className="w-2.5 h-2.5" />
                            <span>{item._cadena || item._comercio}</span>
                            <MapPin className="w-2.5 h-2.5 text-sky-400 ml-0.5" />
                          </button>

                          {esOpcionIdeal ? (
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              ¡Opción Ideal! (Más barato y cerca)
                            </span>
                          ) : esElMasBarato ? (
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">
                              Más barato
                            </span>
                          ) : esElMasCercano ? (
                            <span className="text-[10px] font-black text-sky-500 bg-sky-500/15 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <Navigation className="w-2.5 h-2.5" />
                              Más cerca tuyo
                            </span>
                          ) : null}
                        </div>

                        <p className="text-[10px] theme-muted mt-1 flex items-center gap-2 flex-wrap">
                          <span>{tiempoRelativo(item.creado_en)}</span>

                          {item._distanciaTxt && (
                            <span className="text-sky-500 font-bold flex items-center gap-0.5">
                              • <MapPin className="w-2.5 h-2.5" /> a {item._distanciaTxt}
                            </span>
                          )}

                          {item._refUnitario && (
                            <span>
                              •{' '}
                              <strong className="precio-ref-unitario">
                                {item._refUnitario.valor} x {item._refUnitario.unidad}
                              </strong>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm sm:text-base font-black font-mono ${
                          esElMasBarato ? 'text-emerald-500' : 'theme-title'
                        }`}
                      >
                        ${Number(item._precio || 0).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {productosComparados.length > limiteVisibles && (
        <div className="flex justify-center pt-3 pb-1">
          <button
            type="button"
            onClick={() => setLimiteVisibles((prev) => prev + cantidadPorPagina)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl theme-btn-sec border border-[var(--border-sub)] font-bold text-xs hover:border-sky-500/60 transition shadow-sm cursor-pointer active:scale-95"
          >
            <span>Mostrar más comparaciones</span>
            <span className="theme-muted font-mono font-medium text-[11px]">
              ({Math.min(limiteVisibles, productosComparados.length)} de {productosComparados.length})
            </span>
            <ChevronDown className="w-4 h-4 text-sky-500" />
          </button>
        </div>
      )}

      {/* ADVERTENCIA COMUNITARIA (DESCARGO) */}
      <div className="theme-card-sub border border-[var(--border-card)] rounded-2xl p-4 flex items-start gap-3 text-xs shadow-xs mt-4">
        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold theme-title text-xs flex items-center gap-1.5">
            <span>Precios de referencia comunitaria</span>
          </h4>
          <p className="theme-muted text-[11px] leading-relaxed">
            Los valores y cálculos mostrados son estimativos y surgen de los aportes solidarios de la comunidad de Bariloche. Los supermercados pueden modificar sus precios o promociones sin previo aviso. Si encontrás una diferencia en góndola o en caja, ¡avisá con el botón <strong className="theme-subtitle font-bold">&quot;Cambió&quot;</strong> o subí el precio nuevo para mantenernos actualizados entre todos!
          </p>
        </div>
      </div>
    </div>
  );
}