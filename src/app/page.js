'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Plus,
  ThumbsUp,
  TrendingUp,
  Image as ImageIcon,
  User,
  Store,
  Scale,
  Smartphone,
  Download,
  X,
  Check
} from 'lucide-react';

const CATEGORIAS = ['Todos', 'Súper', 'Carnicería', 'Verdulería', 'Lácteos', 'Limpieza', 'Bebidas'];

const DICCIONARIO_RUBROS = {
  Carnicería: ['lomo', 'bola de lomo', 'asado', 'vacio', 'picada', 'carne', 'pollo', 'milanesa', 'nalga', 'peceto', 'bife', 'matambre', 'costilla', 'pechuga'],
  Lácteos: ['leche', 'yogur', 'queso', 'manteca', 'crema', 'dulce de leche', 'sachet', 'untable', 'ricota'],
  Verdulería: ['papa', 'tomate', 'cebolla', 'zanahoria', 'manzana', 'banana', 'lechuga', 'palta', 'naranja', 'limon', 'zapallo', 'morron', 'acelga'],
  Bebidas: ['agua', 'gaseosa', 'coca', 'pepsi', 'cerveza', 'vino', 'jugo', 'soda', 'fernet', 'aperitivo'],
  Limpieza: ['jabon', 'detergente', 'lavandina', 'papel higienico', 'rollo', 'suavizante', 'desinfectante', 'shampoo', 'dentifrico', 'cif']
};

function limpiarTexto(str = '') {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatearPresentacion(tamanoRaw, unidadRaw) {
  let cantStr = String(tamanoRaw || '').trim();
  let uniStr = String(unidadRaw || '').trim();

  if (cantStr && !uniStr) {
    const match = cantStr.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)$/);
    if (match) {
      cantStr = match[1];
      uniStr = match[2];
    }
  }

  const num = parseFloat(cantStr.replace(',', '.'));
  const u = limpiarTexto(uniStr);

  if (!isNaN(num) && num > 0) {
    if (['g', 'gr', 'gramos', 'grs'].includes(u) && num >= 1000) {
      const kilos = num / 1000;
      return `${kilos % 1 === 0 ? kilos : kilos.toFixed(1)}kg`;
    }
    if (['ml', 'cc', 'cm3'].includes(u) && num >= 1000) {
      const litros = num / 1000;
      return `${litros % 1 === 0 ? litros : litros.toFixed(1)}L`;
    }
    return `${cantStr}${uniStr ? ` ${uniStr}` : ''}`;
  }

  return cantStr || '';
}

function calcularPrecioPorUnidad(precioNum, tamanoRaw, unidadRaw, nombreProd = '') {
  if (!precioNum || precioNum <= 0) return null;

  let cantStr = String(tamanoRaw || '').trim();
  let uniStr = String(unidadRaw || '').trim();

  if (!cantStr && !uniStr && nombreProd) {
    const regexNombre = /(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilos|gr|g|gramos|l|lt|litro|litros|ml|cc|u|un)\b/i;
    const matchNom = nombreProd.match(regexNombre);
    if (matchNom) {
      cantStr = matchNom[1];
      uniStr = matchNom[2];
    } else if (/(\bx\s*kg\b|\bpor\s*kg\b|\bpor\s*kilo\b|\bx\s*kilo\b)/i.test(nombreProd)) {
      cantStr = '1';
      uniStr = 'kg';
    } else if (/(\bx\s*l\b|\bpor\s*litro\b|\bx\s*litro\b)/i.test(nombreProd)) {
      cantStr = '1';
      uniStr = 'l';
    }
  }

  if (cantStr && !uniStr) {
    const match = cantStr.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)$/);
    if (match) {
      cantStr = match[1];
      uniStr = match[2];
    }
  }

  const cantNum = parseFloat(cantStr.replace(',', '.'));
  if (isNaN(cantNum) || cantNum <= 0) return null;

  const u = limpiarTexto(uniStr);

  if (['gr', 'g', 'gramos', 'grs'].includes(u)) {
    const porKilo = (precioNum / cantNum) * 1000;
    return { valor: `$${Math.round(porKilo).toLocaleString('es-AR')}`, unidad: 'Kg' };
  }
  if (['kg', 'kilo', 'kilos', 'kgs'].includes(u)) {
    const porKilo = precioNum / cantNum;
    return { valor: `$${Math.round(porKilo).toLocaleString('es-AR')}`, unidad: 'Kg' };
  }
  if (['ml', 'cc', 'cm3'].includes(u)) {
    const porLitro = (precioNum / cantNum) * 1000;
    return { valor: `$${Math.round(porLitro).toLocaleString('es-AR')}`, unidad: 'Litro' };
  }
  if (['l', 'lt', 'litro', 'litros', 'lts'].includes(u)) {
    const porLitro = precioNum / cantNum;
    return { valor: `$${Math.round(porLitro).toLocaleString('es-AR')}`, unidad: 'Litro' };
  }
  if (['u', 'un', 'unidad', 'unidades'].includes(u) && cantNum > 1) {
    const porUnidad = precioNum / cantNum;
    return { valor: `$${Math.round(porUnidad).toLocaleString('es-AR')}`, unidad: 'Unidad' };
  }

  return null;
}

export default function HomePage() {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [orden, setOrden] = useState('recientes');

  const [usuario, setUsuario] = useState(null);
  const [confirmandoId, setConfirmandoId] = useState(null);

  // Registro en memoria de votos hechos en este navegador
  const [votosRealizados, setVotosRealizados] = useState({});

  // PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mostrarBannerInstalar, setMostrarBannerInstalar] = useState(false);

  useEffect(() => {
    obtenerSesionYOfertas();
    cargarVotosDesdeStorage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });

    const capturarPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMostrarBannerInstalar(true);
    };

    window.addEventListener('beforeinstallprompt', capturarPrompt);

    const descartado = localStorage.getItem('bariahorra_banner_instalado');
    if (!descartado) {
      setMostrarBannerInstalar(true);
    }

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('beforeinstallprompt', capturarPrompt);
    };
  }, []);

  const cargarVotosDesdeStorage = () => {
    try {
      const guardados = {};
      for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith('bariahorra_voto_')) {
          const id = clave.replace('bariahorra_voto_', '');
          guardados[id] = localStorage.getItem(clave);
        }
      }
      setVotosRealizados(guardados);
    } catch (e) {
      console.warn('No se pudo acceder al localStorage:', e);
    }
  };

  const handleInstalarApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setMostrarBannerInstalar(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar BariAhorra:\n• En Android: Menú (⋮) -> Instalar app.\n• En iPhone: Compartir (⎋) -> Agregar a inicio.');
    }
  };

  const cerrarBanner = () => {
    setMostrarBannerInstalar(false);
    localStorage.setItem('bariahorra_banner_instalado', 'true');
  };

  const obtenerSesionYOfertas = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setUsuario(user);
      await cargarOfertas(user);
    } catch (err) {
      console.error('Error inicializando:', err);
    }
  };

  const cargarOfertas = async (userActual = usuario) => {
    setCargando(true);
    try {
      const { data: rawOfertas, error: errOfertas } = await supabase
        .from('ofertas')
        .select('*')
        .order('creado_en', { ascending: false });

      if (errOfertas) throw errOfertas;
      if (!rawOfertas || rawOfertas.length === 0) {
        setOfertas([]);
        setCargando(false);
        return;
      }

      const [resProd, resCom, resPerf] = await Promise.allSettled([
        supabase.from('productos').select('*'),
        supabase.from('comercios').select('*'),
        supabase.from('perfiles').select('*')
      ]);

      const productosList = resProd.status === 'fulfilled' && resProd.value.data ? resProd.value.data : [];
      const comerciosList = resCom.status === 'fulfilled' && resCom.value.data ? resCom.value.data : [];
      const perfilesList = resPerf.status === 'fulfilled' && resPerf.value.data ? resPerf.value.data : [];

      const mapProd = new Map();
      productosList.forEach((p) => {
        if (p.id) mapProd.set(String(p.id).toLowerCase(), p);
      });

      const mapCom = new Map();
      comerciosList.forEach((c) => {
        if (c.id) mapCom.set(String(c.id).toLowerCase(), c);
      });

      const mapPerf = new Map();
      perfilesList.forEach((u) => {
        if (u.id) mapPerf.set(String(u.id).toLowerCase(), u);
        if (u.user_id) mapPerf.set(String(u.user_id).toLowerCase(), u);
      });

      const listaProcesada = rawOfertas.map((item) => {
        const prodId = String(item.producto_id || '').toLowerCase();
        const prodRel = mapProd.get(prodId);

        const comId = String(item.comercio_id || '').toLowerCase();
        const comRel = mapCom.get(comId);

        const userId = String(item.usuario_id || '').toLowerCase();
        const perfRel = mapPerf.get(userId);

        const productoNombre =
          prodRel?.nombre ||
          'Producto en góndola';

        const marca =
          prodRel?.marca ||
          'Genérica';

        const tamano =
          prodRel?.cantidad ||
          prodRel?.tamano ||
          '';

        const unidad =
          prodRel?.unidad ||
          '';

        let rubro =
          prodRel?.categoria ||
          prodRel?.rubro ||
          '';

        if (!rubro || limpiarTexto(rubro) === 'super') {
          const textoBusqueda = `${productoNombre} ${marca}`.toLowerCase();
          for (const [catNombre, keywords] of Object.entries(DICCIONARIO_RUBROS)) {
            if (keywords.some((kw) => textoBusqueda.includes(kw))) {
              rubro = catNombre;
              break;
            }
          }
          if (!rubro) rubro = 'Súper';
        }

        const comercioNombre =
          comRel?.nombre ||
          'Comercio Bariloche';

        let apodoAutor = perfRel?.apodo || perfRel?.nombre || perfRel?.username || '';

        if (!apodoAutor && userActual && String(userActual.id).toLowerCase() === userId) {
          apodoAutor =
            userActual.user_metadata?.apodo ||
            userActual.user_metadata?.full_name ||
            userActual.user_metadata?.name ||
            userActual.email?.split('@')[0] ||
            '';
        }

        if (!apodoAutor) {
          apodoAutor = 'Vecino anónimo';
        }

        const precioFinal = Number(item.precio || 0);
        const refUnitario = calcularPrecioPorUnidad(precioFinal, tamano, unidad, productoNombre);
        const presentacionFormateada = formatearPresentacion(tamano, unidad);

        return {
          ...item,
          _producto: productoNombre,
          _marca: marca,
          _presentacion: presentacionFormateada,
          _rubro: rubro,
          _comercio: comercioNombre,
          _usuario: apodoAutor,
          _foto: item.foto_url || prodRel?.foto_url || null,
          _precio: precioFinal,
          _refUnitario: refUnitario,
          _votosPositivos: Number(item.votos_positivos || 0),
          _votosNegativos: Number(item.votos_negativos || 0),
        };
      });

      setOfertas(listaProcesada);
    } catch (err) {
      console.error('Error cargando ofertas:', err.message || err);
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmar = async (ofertaId, tipo) => {
    if (votosRealizados[ofertaId]) return;

    setConfirmandoId(ofertaId);
    try {
      const oferta = ofertas.find((o) => o.id === ofertaId);
      if (!oferta) return;

      const nuevoPositivo = tipo === 'sigue' ? (oferta._votosPositivos || 0) + 1 : (oferta._votosPositivos || 0);
      const nuevoNegativo = tipo === 'subio' ? (oferta._votosNegativos || 0) + 1 : (oferta._votosNegativos || 0);

      const { error } = await supabase
        .from('ofertas')
        .update({
          votos_positivos: nuevoPositivo,
          votos_negativos: nuevoNegativo,
        })
        .eq('id', ofertaId);

      if (!error) {
        try {
          localStorage.setItem(`bariahorra_voto_${ofertaId}`, tipo);
          setVotosRealizados((prev) => ({ ...prev, [ofertaId]: tipo }));
        } catch (e) {
          console.warn('Error al guardar en storage:', e);
        }

        setOfertas((prev) =>
          prev.map((o) =>
            o.id === ofertaId
              ? { ...o, _votosPositivos: nuevoPositivo, _votosNegativos: nuevoNegativo }
              : o
          )
        );
      } else {
        console.error('Error al actualizar voto en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error al procesar voto:', err);
    } finally {
      setConfirmandoId(null);
    }
  };

  const ofertasFiltradas = useMemo(() => {
    const catNorm = limpiarTexto(categoriaActiva);
    const busqNorm = limpiarTexto(busqueda);

    return ofertas
      .filter((o) => {
        const rubroNorm = limpiarTexto(o._rubro);
        const coincideCat = catNorm === 'todos' || rubroNorm === catNorm;

        const textoBusq = limpiarTexto(`${o._producto} ${o._marca} ${o._comercio} ${o._rubro}`);
        const coincideBusq = busqNorm === '' || textoBusq.includes(busqNorm);

        return coincideCat && coincideBusq;
      })
      .sort((a, b) => {
        if (orden === 'precio_asc') return (a._precio || 0) - (b._precio || 0);
        if (orden === 'precio_desc') return (b._precio || 0) - (a._precio || 0);

        const fechaA = new Date(a.creado_en || 0).getTime();
        const fechaB = new Date(b.creado_en || 0).getTime();
        if (fechaA && fechaB && fechaA !== fechaB) {
          return fechaB - fechaA;
        }
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
  }, [ofertas, categoriaActiva, busqueda, orden]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4">

      {/* BANNER INSTALACIÓN PWA */}
      {mostrarBannerInstalar && (
        <div className="bg-gradient-to-r from-sky-500/15 via-[#182133] to-[#182133] border border-sky-500/30 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white leading-tight">
                Instalá BariAhorra en tu celular
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Acceso rápido desde la pantalla de inicio sin ocupar espacio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstalarApp}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[3]" />
              <span>Instalar</span>
            </button>
            <button
              type="button"
              onClick={cerrarBanner}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto, marca o comercio..."
          className="w-full bg-[#182133] border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition shadow-inner"
        />
      </div>

      {/* CATEGORÍAS */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition text-[11px] cursor-pointer ${
              categoriaActiva === cat
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-[#182133] text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ORDEN Y BOTÓN SUMAR OFERTA */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Ordenar:</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
          >
            <option value="recientes" className="bg-[#182133] text-white">Más recientes</option>
            <option value="precio_asc" className="bg-[#182133] text-white">Menor precio</option>
            <option value="precio_desc" className="bg-[#182133] text-white">Mayor precio</option>
          </select>
          <span className="font-mono text-[11px] bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50 ml-1">
            {ofertasFiltradas.length} {ofertasFiltradas.length === 1 ? 'oferta' : 'ofertas'}
          </span>
        </div>

        <Link
          href="/cargar"
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Sumar Oferta</span>
        </Link>
      </div>

      {/* GRILLA DE OFERTAS */}
      {cargando ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          Cargando góndolas de Bariloche...
        </div>
      ) : ofertasFiltradas.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs bg-[#182133] rounded-2xl border border-slate-800 space-y-3">
          <p>No se encontraron ofertas en "{categoriaActiva}".</p>
          <Link
            href="/cargar"
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Cargar la primera oferta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ofertasFiltradas.map((item) => {
            const tieneFoto = Boolean(item._foto);
            const esAnonimo = limpiarTexto(item._usuario).includes('anonimo');
            const formatoUsuario = esAnonimo
              ? 'Vecino anónimo'
              : item._usuario.startsWith('@')
              ? item._usuario
              : `@${item._usuario}`;

            const votoActual = votosRealizados[item.id];
            const yaVoto = Boolean(votoActual);

            return (
              <article
                key={item.id}
                className="bg-[#182133] border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition gap-3"
              >
                {/* PARTE SUPERIOR */}
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {tieneFoto ? (
                      <img
                        src={item._foto}
                        alt={item._producto}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-700" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 truncate flex items-center gap-1">
                        <Store className="w-3 h-3 text-amber-400" />
                        <span>{item._comercio}</span>
                      </span>
                    </div>

                    <h3 className="text-xs font-black text-white leading-snug truncate">
                      {item._producto}
                    </h3>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item._marca}
                      {item._presentacion ? ` • ${item._presentacion}` : ''}
                      {item._rubro ? ` • ${item._rubro}` : ''}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className={!esAnonimo ? 'text-sky-300 font-bold' : ''}>
                        {formatoUsuario}
                      </span>
                    </p>
                  </div>
                </div>

                {/* PARTE INFERIOR: PRECIOS Y CONFIRMACIONES */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-end justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-lg font-black text-white font-mono tracking-tight leading-none">
                      ${Number(item._precio || 0).toLocaleString('es-AR')}
                    </span>

                    {item._refUnitario && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight">
                        <Scale className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>
                          Precio x {item._refUnitario.unidad}:{' '}
                          <strong className="text-emerald-400 font-mono font-bold">
                            {item._refUnitario.valor}
                          </strong>
                        </span>
                      </p>
                    )}

                    <p className="text-[10px] text-slate-400 pt-0.5">
                      {item._votosPositivos} confirmaciones
                      {item._votosNegativos > 0 && (
                        <span className="text-amber-400 ml-1">({item._votosNegativos} subió)</span>
                      )}
                    </p>
                  </div>

                  {/* BOTONES DE VOTO CON BLOQUEO LOCALSTORAGE */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleConfirmar(item.id, 'sigue')}
                      disabled={confirmandoId === item.id || yaVoto}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition active:scale-95 ${
                        votoActual === 'sigue'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : yaVoto
                          ? 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer'
                      }`}
                      title={yaVoto ? 'Ya votaste esta oferta' : 'Confirmar que sigue a este precio'}
                    >
                      {votoActual === 'sigue' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      )}
                      <span>{votoActual === 'sigue' ? 'Votado' : 'Sigue'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmar(item.id, 'subio')}
                      disabled={confirmandoId === item.id || yaVoto}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition active:scale-95 ${
                        votoActual === 'subio'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : yaVoto
                          ? 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 cursor-pointer'
                      }`}
                      title={yaVoto ? 'Ya votaste esta oferta' : 'Avisar que aumentó el precio'}
                    >
                      {votoActual === 'subio' ? (
                        <Check className="w-3 h-3 text-amber-400" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{votoActual === 'subio' ? 'Votado' : 'Subió'}</span>
                    </button>
                  </div>
                </div>

              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}