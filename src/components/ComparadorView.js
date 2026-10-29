'use client';

import { useState, useMemo } from 'react';
import {
  ZoomIn,
  Award,
  ShoppingBag,
  Store,
  MapPin,
  Sparkles,
  Navigation,
  ChevronDown,
  Info,
  Scale,
  Layers,
  ArrowUpDown
} from 'lucide-react';

function detectarGramajeDeTexto(texto = '') {
  if (!texto) return null;
  const match = texto.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilos?|g|gr|gramos?|l|lt|litros?|ml|cc|cm3|u|unidades?)\b/i);
  if (match) {
    return `${match[1]} ${match[2].toLowerCase()}`;
  }
  if (/(\bx\s*kg\b|\bpor\s*kg\b|\bpor\s*kilo\b)/i.test(texto)) return '1 kg';
  if (/(\bx\s*l\b|\bpor\s*litro\b)/i.test(texto)) return '1 L';
  return null;
}

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
  const [modoComparacion, setModoComparacion] = useState('exacto'); // 'exacto' | 'generico'

  // Agrupador para la vista genérica (sin importar la marca, compara por tipo/rubro y calcula mejor $/kg o $/L)
  const productosPorRubro = useMemo(() => {
    if (modoComparacion !== 'generico') return [];

    const mapaRubros = new Map();

    productosComparados.forEach((grupo) => {
      let rubro = grupo.rubro || 'Almacén';
      const nombreLower = String(grupo.producto || '').toLowerCase();
      if (
        nombreLower.includes('pure de tomate') ||
        nombreLower.includes('tomate triturado') ||
        nombreLower.includes('pure de papa')
      ) {
        rubro = 'Almacén';
      }

      // Detectamos el tipo general de producto (ej: Yerba, Aceite, Leche, Fideos, etc.)
      let tipoProd = grupo.producto;
      if (nombreLower.includes('yerba')) tipoProd = 'Yerba Mate';
      else if (nombreLower.includes('aceite')) tipoProd = 'Aceite de Girasol';
      else if (nombreLower.includes('leche')) tipoProd = 'Leche';
      else if (nombreLower.includes('fideo')) tipoProd = 'Fideos Secos';
      else if (nombreLower.includes('arroz')) tipoProd = 'Arroz';
      else if (nombreLower.includes('harina')) tipoProd = 'Harina de Trigo';
      else if (nombreLower.includes('pure de tomate') || nombreLower.includes('tomate triturado')) tipoProd = 'Puré / Tomate Triturado';
      else if (nombreLower.includes('papel higienico')) tipoProd = 'Papel Higiénico';

      const claveRubro = `${rubro}_${tipoProd}`;

      if (!mapaRubros.has(claveRubro)) {
        mapaRubros.set(claveRubro, {
          clave: claveRubro,
          producto: tipoProd,
          rubro: rubro,
          items: []
        });
      }

      const contenedor = mapaRubros.get(claveRubro);
      grupo.items.forEach((it) => {
        contenedor.items.push({
          ...it,
          _marcaProd: `${it._producto} (${grupo.marca})`
        });
      });
    });

    return Array.from(mapaRubros.values())
      .map((g) => {
        // Ordenamos todos los productos de este tipo del precio unitario más bajo al más alto
        g.items.sort((a, b) => {
          const uA = a._refUnitario?.num || a._precio || 0;
          const uB = b._refUnitario?.num || b._precio || 0;
          return uA - uB;
        });

        const min = g.items[0]?._precio || 0;
        const max = g.items[g.items.length - 1]?._precio || 0;

        return {
          ...g,
          minPrecio: min,
          ahorro: max > min ? max - min : 0,
          masBaratoId: g.items[0]?.id
        };
      })
      .filter((g) => g.items.length > 1)
      .sort((a, b) => b.items.length - a.items.length);
  }, [productosComparados, modoComparacion]);

  const listaAMostrar = modoComparacion === 'exacto' ? productosComparados : productosPorRubro;

  return (
    <div className="space-y-3.5">
      {/* SELECTOR DE MODO DE COMPARACIÓN */}
      <div className="theme-card border rounded-2xl p-2 flex items-center justify-between gap-2 shadow-xs">
        <button
          type="button"
          onClick={() => setModoComparacion('exacto')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            modoComparacion === 'exacto'
              ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
              : 'theme-muted hover:theme-title'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Misma Marca y Producto</span>
        </button>

        <button
          type="button"
          onClick={() => setModoComparacion('generico')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            modoComparacion === 'generico'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
              : 'theme-muted hover:theme-title'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>El Más Barato por Rubro (Sin Marca)</span>
        </button>
      </div>

      {listaAMostrar.slice(0, limiteVisibles).map((grupo) => {
        const item0 = grupo.items?.[0] || {};

        let presentacion =
          grupo.presentacion ||
          grupo._presentacion ||
          item0._presentacion ||
          item0.presentacionFormateada ||
          (item0._tamanoRaw ? `${item0._tamanoRaw} ${item0._unidadRaw || ''}`.trim() : null) ||
          (item0._tamano ? `${item0._tamano} ${item0._unidad || ''}`.trim() : null) ||
          detectarGramajeDeTexto(grupo.producto);

        let rubroFinal = grupo.rubro;
        const nombreLower = String(grupo.producto || '').toLowerCase();
        if (
          nombreLower.includes('pure de tomate') ||
          nombreLower.includes('tomate triturado') ||
          nombreLower.includes('pure de papa')
        ) {
          rubroFinal = 'Almacén';
        }

        const confRubro = CONFIG_CATEGORIAS[rubroFinal] || CONFIG_CATEGORIAS.Almacén;
        const IconoRubro = confRubro.icono;
        const enChanguito = changuito.includes(grupo.claveProd || grupo.producto);

        const abrirDetalleAmpliado = () => {
          setFotoModal({
            foto: grupo.foto || null,
            producto: grupo.producto,
            marca: grupo.marca || 'Varias marcas',
            comercio: item0._comercio,
            precio: grupo.minPrecio,
            presentacion: presentacion,
            rubro: rubroFinal
          });
        };

        return (
          <section
            key={grupo.clave}
            className="theme-card border rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-sm hover:shadow-md transition"
          >
            {/* CABECERA SUPERIOR */}
            <div
              onClick={abrirDetalleAmpliado}
              className="group cursor-pointer flex items-start gap-3 rounded-xl p-1 -m-1 hover:bg-slate-500/5 transition select-none"
              title="Tocar para ampliar información"
            >
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center relative shadow-xs ${confRubro.cajaIcono}`}
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
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-black theme-title leading-snug line-clamp-2 group-hover:text-sky-500 transition-colors">
                  {grupo.producto}
                </h3>

                <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs theme-muted">
                  {grupo.marca && (
                    <>
                      <span className="theme-subtitle font-bold">{grupo.marca}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className={`font-bold ${confRubro.acento}`}>{rubroFinal}</span>

                  {presentacion && modoComparacion === 'exacto' && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-bold font-mono text-[11px] border border-sky-500/20">
                        <Scale className="w-3 h-3 text-sky-400" />
                        <span>{presentacion}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SEGUNDA FILA: AHORRO Y MI LISTA */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-card)]/60">
              <div>
                {grupo.ahorro > 0 ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[11px] font-black px-2.5 py-1 rounded-xl inline-flex items-center gap-1 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    Ahorrás hasta ${grupo.ahorro.toLocaleString('es-AR')}
                  </span>
                ) : (
                  <span className="text-[10px] theme-muted font-medium">
                    Precios relevados en Bariloche
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProductoChanguito(grupo.producto);
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black inline-flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs shrink-0 ${
                  enChanguito
                    ? 'bg-sky-500 text-slate-950 border-sky-400'
                    : 'btn-changuito-add hover:border-sky-500'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{enChanguito ? 'En mi lista' : '+ Mi lista'}</span>
              </button>
            </div>

            {/* LISTADO DE OPCIONES COMPARADAS */}
            <div className="divide-y theme-card-sub rounded-xl border overflow-hidden">
              {grupo.items.map((item, idx) => {
                const estiloCom = obtenerEstiloComercio(item._comercio);
                const esElMasBarato = item.id === grupo.masBaratoId && grupo.items.length > 1;
                const esElMasCercano = item.id === grupo.masCercanoId && grupo.items.length > 1;
                const esOpcionIdeal = grupo.esOpcionIdeal && esElMasBarato;

                return (
                  <div
                    key={`${item.id}_${idx}`}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirUbicacionComercio(
                                item._comercio,
                                item._comercioDireccion,
                                item._comercioLat,
                                item._comercioLng,
                                item._distanciaTxt
                              );
                            }}
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer hover:opacity-80 active:scale-95 transition ${estiloCom}`}
                            title="Ver cómo llegar en Google Maps"
                          >
                            <Store className="w-2.5 h-2.5" />
                            <span>{item._cadena || item._comercio}</span>
                            <MapPin className="w-2.5 h-2.5 text-sky-400 ml-0.5" />
                          </button>

                          {modoComparacion === 'generico' && (
                            <span className="text-[11px] font-bold theme-title truncate max-w-[170px] sm:max-w-xs">
                              {item._marcaProd || item._producto}
                            </span>
                          )}

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

      {listaAMostrar.length > limiteVisibles && (
        <div className="flex justify-center pt-3 pb-1">
          <button
            type="button"
            onClick={() => setLimiteVisibles((prev) => prev + cantidadPorPagina)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl theme-btn-sec border border-[var(--border-sub)] font-bold text-xs hover:border-sky-500/60 transition shadow-sm cursor-pointer active:scale-95"
          >
            <span>Mostrar más comparaciones</span>
            <span className="theme-muted font-mono font-medium text-[11px]">
              ({Math.min(limiteVisibles, listaAMostrar.length)} de {listaAMostrar.length})
            </span>
            <ChevronDown className="w-4 h-4 text-sky-500" />
          </button>
        </div>
      )}

      {/* ADVERTENCIA COMUNITARIA */}
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