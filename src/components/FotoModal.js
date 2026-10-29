'use client';

import {
  X,
  Store,
  ShieldCheck,
  Camera,
  Sparkles,
  Scale,
  Tag,
  Package
} from 'lucide-react';

export default function FotoModal({ modalData, alCerrar, obtenerEstiloComercio }) {
  if (!modalData) return null;

  const {
    foto,
    producto,
    marca,
    comercio,
    precio,
    precioLista,
    esCatalogo,
    usuario,
    esAnonimo,
    presentacion,
    rubro,
    refUnitario
  } = modalData;

  const estiloCom = obtenerEstiloComercio ? obtenerEstiloComercio(comercio) : 'badge-com-default';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={alCerrar}
    >
      <div
        className="relative max-w-lg w-full theme-card border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA: COMERCIO, PRECIO Y CIERRE */}
        <div className="flex items-start justify-between p-3.5 sm:p-4 border-b border-[var(--border-card)] gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {comercio && (
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${estiloCom}`}>
                  <Store className="w-3 h-3 shrink-0" />
                  <span>{comercio}</span>
                </span>
              )}
              {rubro && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-300 border border-slate-500/20">
                  {rubro}
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-black theme-title leading-snug">
              {producto}
            </h3>

            {marca && (
              <p className="text-[11px] theme-subtitle font-bold mt-0.5">{marca}</p>
            )}
          </div>

          <div className="flex items-start gap-2.5 shrink-0">
            <div className="text-right">
              <span className="font-mono font-black text-sm sm:text-base text-emerald-500 block leading-tight">
                ${Number(precio || 0).toLocaleString('es-AR')}
              </span>
              {precioLista && (
                <span className="text-[11px] font-mono theme-muted line-through">
                  ${Number(precioLista).toLocaleString('es-AR')}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={alCerrar}
              className="w-8 h-8 rounded-full theme-btn-sec border flex items-center justify-center theme-muted hover:theme-title transition cursor-pointer"
              title="Cerrar visor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PASTILLAS TÉCNICAS: PESO / GRAMAJE Y PRECIO POR KILO/LITRO */}
        {(presentacion || refUnitario) && (
          <div className="px-4 py-2 bg-slate-500/5 border-b border-[var(--border-card)] flex items-center gap-2 flex-wrap text-xs">
            {presentacion && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-400 font-bold font-mono text-[11px] border border-sky-500/20 shadow-xs">
                <Scale className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Contenido: {presentacion}</span>
              </span>
            )}

            {refUnitario && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[11px] border border-emerald-500/25 shadow-xs">
                <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Referencia: {refUnitario.valor || refUnitario} x {refUnitario.unidad || 'Kg'}
                </span>
              </span>
            )}
          </div>
        )}

        {/* IMAGEN CENTRAL O FICHA TÉCNICA */}
        <div className="p-3 sm:p-4 bg-black/20 flex items-center justify-center overflow-auto flex-1 min-h-[220px]">
          {foto ? (
            <img
              src={foto}
              alt={producto}
              className="max-h-[58vh] w-auto max-w-full object-contain rounded-2xl shadow-lg border border-white/5"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-2.5 theme-muted">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 shadow-inner">
                <Package className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <p className="text-xs font-bold theme-subtitle">
                  Ficha oficial sin fotografía
                </p>
                <p className="text-[11px] theme-muted mt-0.5">
                  Precios y gramajes verificados para {comercio || 'Bariloche'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PIE CON AUTORÍA REAL DIFERENCIADA */}
        <div className="p-2.5 sm:p-3 text-center border-t border-[var(--border-card)] theme-card-sub text-[11px] flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5 font-medium">
            {esCatalogo ? (
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Foto oficial de catálogo</span>
              </span>
            ) : usuario && !esAnonimo ? (
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Camera className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  Foto en góndola aportada por <strong className="text-sky-300 font-black">{usuario}</strong>
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 theme-muted">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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