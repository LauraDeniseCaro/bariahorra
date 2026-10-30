'use client';

import { X, Store, MapPin, Navigation, Compass } from 'lucide-react';

export default function ComercioModal({ comercioModal, alCerrar, obtenerEstiloComercio }) {
  if (!comercioModal) return null;

  const { nombre, direccion, lat, lng, distancia } = comercioModal;
  const estiloCom = obtenerEstiloComercio ? obtenerEstiloComercio(nombre) : 'badge-com-default';

  // Si tiene coordenadas abre el pin exacto; si no, busca combinando nombre y calle
  const urlGoogleMaps =
    lat && lng
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${nombre} ${direccion || ''} San Carlos de Bariloche`
        )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={alCerrar}
    >
      <div
        className="relative max-w-sm w-full theme-card border border-[var(--border-card)] rounded-3xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA */}
        <div className="flex items-start justify-between gap-2 border-b border-[var(--border-card)] pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${estiloCom}`}>
                Sucursal
              </span>
              <h3 className="text-sm sm:text-base font-black theme-title truncate mt-0.5">
                {nombre}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="w-7 h-7 rounded-full theme-btn-sec border flex items-center justify-center theme-muted hover:theme-title cursor-pointer transition shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DETALLE DE DIRECCIÓN Y CERCANÍA */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 theme-subtitle">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-bold leading-snug">
                {direccion || 'Ubicación pendiente de verificación'}
              </p>
              <p className="text-[10px] theme-muted mt-0.5">
                San Carlos de Bariloche
              </p>
            </div>
          </div>

          {distancia && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-[11px]">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Sucursal más cercana: a solo {distancia} de vos</span>
            </div>
          )}
        </div>

        {/* BOTÓN CÓMO LLEGAR */}
        <div className="pt-1">
          <a
            href={urlGoogleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 text-xs"
          >
            <Navigation className="w-4 h-4" />
            <span>Cómo llegar en Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}