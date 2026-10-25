'use client';

import {
  Store,
  MapPin,
  Clock,
  Sparkles,
  Award,
  ShoppingCart,
  User,
  ShieldCheck,
  Check,
  Scale,
  ThumbsUp,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ZoomIn
} from 'lucide-react';

function WhatsAppIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28" />
    </svg>
  );
}

export default function GondolaCard({
  item,
  confRubro,
  esMejorPrecio,
  enChanguito,
  votoActual,
  confirmandoId,
  editandoPrecioId,
  setEditandoPrecioId,
  nuevoPrecioInput,
  setNuevoPrecioInput,
  guardandoPrecio,
  handleProponerNuevoPrecio,
  handleConfirmar,
  toggleProductoChanguito,
  abrirUbicacionComercio,
  compartirOfertaWhatsApp,
  setFotoModal,
  tiempoRelativo,
  obtenerEstiloComercio
}) {
  const tieneFoto = Boolean(item._foto);
  const esAnonimo = String(item._usuario || '').toLowerCase().includes('anonimo');
  const formatoUsuario = esAnonimo
    ? 'Vecino anónimo'
    : item._usuario?.startsWith('@')
      ? item._usuario
      : `@${item._usuario}`;

  const yaVoto = Boolean(votoActual);
  const IconoRubro = confRubro.icono;
  const estiloComercio = obtenerEstiloComercio(item._comercio);
  const verificadoComunidad = !item._esCatalogo && item._votosPositivos >= 3 && item._votosNegativos === 0;

  return (
    <article
      className={`theme-card border rounded-2xl p-3.5 flex flex-col justify-between transition gap-3 relative shadow-sm hover:shadow-md ${
        verificadoComunidad
          ? 'border-emerald-500/60 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/20'
          : esMejorPrecio
            ? 'border-emerald-500/50 shadow-emerald-500/10'
            : 'hover:border-slate-400'
      }`}
    >
      {/* PISO 1: CABECERA */}
      <div className="flex items-center justify-between gap-1.5 border-b border-[var(--border-card)] pb-2.5">
        <div className="flex items-center gap-1 min-w-0 flex-1">
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
            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 min-w-0 shrink transition cursor-pointer hover:opacity-80 active:scale-95 ${estiloComercio}`}
            title="Ver ubicación en Google Maps"
          >
            <Store className="w-3 h-3 shrink-0" />
            <span className="truncate font-black">{item._cadena || item._comercio}</span>
            <MapPin className="w-2.5 h-2.5 text-sky-400 shrink-0 ml-0.5" />
          </button>

          {item._distanciaTxt && (
            <span className="text-[9px] font-bold text-sky-500 bg-sky-500/10 border border-sky-500/25 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
              <MapPin className="w-2.5 h-2.5" />
              <span>{item._distanciaTxt}</span>
            </span>
          )}

          {item._estadoVenc && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 border flex items-center gap-1 ${
                item._estadoVenc.tipo === 'vencido'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                  : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{item._estadoVenc.texto}</span>
            </span>
          )}

          {verificadoComunidad ? (
            <span className="text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
              <span>Destacado</span>
            </span>
          ) : esMejorPrecio ? (
            <span className="text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 whitespace-nowrap">
              <Award className="w-2.5 h-2.5 text-emerald-500" />
              <span>Mejor</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => compartirOfertaWhatsApp(item)}
            className="flex items-center justify-center p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
            title="Compartir oferta por WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => toggleProductoChanguito(item._producto)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0 ${
              enChanguito
                ? 'bg-sky-500 text-slate-950 border-sky-400'
                : 'btn-changuito-add hover:border-sky-500'
            }`}
            title="Sumar a mi lista"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>{enChanguito ? 'En lista' : '+ Lista'}</span>
          </button>
        </div>
      </div>

      {/* PISO 2: CUERPO CON RESPALDO VECTORIAL */}
      <div className="flex gap-3 items-start flex-1 py-0.5">
        <div
          onClick={() => {
            if (tieneFoto) {
              setFotoModal({
                foto: item._foto,
                producto: item._producto,
                marca: item._marca,
                comercio: item._comercio,
                precio: item._precio,
                esCatalogo: item._esCatalogo,
                usuario: item._usuario,
                esAnonimo: esAnonimo
              });
            }
          }}
          className={`w-16 h-16 rounded-2xl border overflow-hidden shrink-0 flex items-center justify-center relative group ${confRubro.cajaIcono} ${
            tieneFoto ? 'cursor-zoom-in' : ''
          }`}
          title={tieneFoto ? 'Tocar para ampliar foto' : undefined}
        >
          {/* Ícono de respaldo siempre presente en el fondo */}
          <IconoRubro className={`w-7 h-7 stroke-[1.75] absolute ${confRubro.acento}`} />

          {tieneFoto && (
            <>
              <img
                src={item._foto}
                alt={item._producto}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 relative z-10 bg-[var(--bg-card)]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
              </div>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-black theme-title leading-snug line-clamp-2">
            {item._producto}
          </h3>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[11px] font-bold theme-subtitle">
              {item._marca}
            </span>
            {item._presentacion && (
              <span className="text-[11px] theme-muted">• {item._presentacion}</span>
            )}
            <span className={`text-[10px] font-bold ${confRubro.acento}`}>
              • {item._rubro}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-[10px] theme-muted flex-wrap">
            {item._esCatalogo ? (
              <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Catálogo Oficial</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 truncate">
                {esAnonimo ? (
                  <User className="w-3.5 h-3.5 theme-muted shrink-0" />
                ) : (
                  <img
                    src={item._usuarioAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=bariloche'}
                    alt="Avatar"
                    className="w-3.5 h-3.5 rounded-full border border-slate-700/60 object-cover bg-slate-900 shrink-0"
                  />
                )}
                <span className={!esAnonimo ? 'text-sky-400 font-bold truncate' : 'truncate'}>
                  {formatoUsuario}
                </span>
              </span>
            )}

            {verificadoComunidad && (
              <span className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-md">
                <Check className="w-2.5 h-2.5 text-emerald-500" />
                <span>Verificado</span>
              </span>
            )}

            <span className="flex items-center gap-1 theme-muted shrink-0">
              <Clock className="w-2.5 h-2.5" />
              {tiempoRelativo(item.creado_en)}
            </span>
          </div>
        </div>
      </div>

      {/* PISO 3: PRECIOS Y VOTOS */}
      <div className="pt-2.5 border-t border-[var(--border-card)] space-y-2.5">
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black theme-title font-mono tracking-tight leading-none block">
                ${Number(item._tienePromo ? item._precioPromo : item._precio || 0).toLocaleString('es-AR')}
              </span>
              {item._tienePromo && (
                <span className="text-xs font-mono theme-muted line-through">
                  ${Number(item._precio || 0).toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {item._tienePromo && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <span>🟢 Hoy: {item._promoEtiqueta}</span>
              </span>
            )}

            {item._refUnitario && (
              <p className="text-[10px] theme-muted flex items-center gap-1 leading-tight">
                <Scale className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>
                  x {item._refUnitario.unidad}:{' '}
                  <strong className="precio-ref-unitario font-mono font-bold">
                    {item._refUnitario.valor}
                  </strong>
                </span>
              </p>
            )}

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {item._esCatalogo ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  <span>Referencia oficial</span>
                </span>
              ) : (
                <>
                  {item._votosPositivos > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      <ThumbsUp className="w-2.5 h-2.5 text-emerald-500" />
                      <span>
                        {item._votosPositivos} {item._votosPositivos === 1 ? 'confirmó' : 'confirmaron'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] theme-muted">Sin confirmar aún</span>
                  )}

                  {item._votosNegativos > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                      <span>
                        {item._votosNegativos} {item._votosNegativos === 1 ? 'aviso de cambio' : 'avisos de cambio'}
                      </span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!item._esCatalogo && (
              <button
                type="button"
                onClick={() => handleConfirmar(item, 'sigue')}
                disabled={confirmandoId === item.id || yaVoto}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition active:scale-95 ${
                  votoActual === 'sigue'
                    ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-500'
                    : yaVoto
                      ? 'btn-voto-accion opacity-60 cursor-not-allowed'
                      : 'btn-voto-accion cursor-pointer hover:border-emerald-500/60'
                }`}
              >
                {votoActual === 'sigue' ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <ThumbsUp className="w-3 h-3 text-emerald-500" />
                )}
                <span>{votoActual === 'sigue' ? 'Confirmado' : 'Sigue igual'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (editandoPrecioId === item.id) {
                  setEditandoPrecioId(null);
                } else {
                  setEditandoPrecioId(item.id);
                  setNuevoPrecioInput('');
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition active:scale-95 cursor-pointer ${
                editandoPrecioId === item.id || votoActual === 'reportado' || votoActual === 'subio'
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-500'
                  : 'btn-voto-accion hover:border-amber-500/60'
              }`}
            >
              <RefreshCw className="w-3 h-3 text-amber-500" />
              <span>{item._esCatalogo ? '¿Cambió? Avisar' : 'Cambió'}</span>
            </button>
          </div>
        </div>

        {editandoPrecioId === item.id && (
          <div className="theme-card-sub border border-amber-500/40 rounded-xl p-2.5 space-y-2">
            <p className="text-[10px] theme-muted leading-tight">
              {item._esCatalogo
                ? 'Avisanos si cambió el precio oficial:'
                : 'Ingresá el nuevo valor visto en góndola:'}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-[11px] font-bold text-amber-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoPrecioInput}
                  onChange={(e) => setNuevoPrecioInput(e.target.value)}
                  placeholder={`Actual: ${item._precio}`}
                  className="w-full theme-input border rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={guardandoPrecio || !nuevoPrecioInput}
                  onClick={() => handleProponerNuevoPrecio(item)}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{item._esCatalogo ? 'Enviar aviso' : 'Actualizar'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}