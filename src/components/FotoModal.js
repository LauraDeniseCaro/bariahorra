'use client';

import { X, Store, ShieldCheck, Camera, Sparkles } from 'lucide-react';

export default function FotoModal({ modalData, alCerrar, obtenerEstiloComercio }) {
  if (!modalData) return null;

  const { foto, producto, marca, comercio, precio, esCatalogo, usuario, esAnonimo } = modalData;
  const estiloCom = obtenerEstiloComercio ? obtenerEstiloComercio(comercio) : 'badge-com-default';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={alCerrar}
    >
      <div
        className="relative max-w-lg w-full theme-card border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del visor */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[var(--border-card)]">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {comercio && (
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${estiloCom}`}>
                  <Store className="w-3 h-3" />
                  <span>{comercio}</span>
                </span>
              )}
              {precio > 0 && (
                <span className="font-mono font-black text-xs text-emerald-500">
                  ${Number(precio).toLocaleString('es-AR')}
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-black theme-title truncate">
              {producto}
            </h3>
            {marca && (
              <p className="text-[11px] theme-muted font-bold">{marca}</p>
            )}
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="w-8 h-8 rounded-full theme-btn-sec border flex items-center justify-center theme-muted hover:theme-title transition shrink-0 cursor-pointer"
            title="Cerrar visor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Imagen central */}
        <div className="p-2 sm:p-3 bg-black/20 flex items-center justify-center overflow-auto flex-1">
          <img
            src={foto}
            alt={producto}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Pie con autoría real diferenciada */}
        <div className="p-2.5 sm:p-3 text-center border-t border-[var(--border-card)] theme-card-sub text-[11px] flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5 font-medium">
            {esCatalogo ? (
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Foto oficial de catálogo</span>
              </span>
            ) : usuario && !esAnonimo ? (
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Foto en góndola aportada por <strong className="text-sky-300 font-black">{usuario}</strong>
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 theme-muted">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Imagen de referencia</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="text-sky-500 font-bold hover:underline cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}