'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Plus,
  ThumbsUp,
  User,
  Store,
  Scale,
  Smartphone,
  Download,
  X,
  Check,
  LayoutGrid,
  ShoppingCart,
  Beef,
  Apple,
  Milk,
  Sparkles,
  Wine,
  Layers,
  ListFilter,
  Clock,
  Award,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Trash2,
  Calculator,
  ListChecks,
  ShieldCheck,
  AlertTriangle,
  Share2,
  ZoomIn,
  MapPin,
  Navigation,
  Fish,
  Snowflake,
  Leaf,
  Wheat,
  Smile,
  CheckSquare,
  Square,
  Zap,
  TrendingDown
} from 'lucide-react';

const CANTIDAD_POR_PAGINA = 12;

const TERMINOS_POPULARES = [
  { label: 'Carnes', query: 'carne', Icono: Beef },
  { label: 'Lácteos', query: 'leche', Icono: Milk },
  { label: 'Aceites', query: 'aceite', Icono: Sparkles },
  { label: 'Yerba', query: 'yerba', Icono: Leaf },
  { label: 'Sin TACC', query: 'gluten', Icono: Wheat },
  { label: 'Verdulería', query: 'papa', Icono: Apple }
];

const CADENAS_FILTRO = ['Todos', 'La Anónima', 'Todo', 'ChangoMás', 'Carrefour', 'Diarco'];

const CONFIG_CATEGORIAS = {
  Todos: {
    icono: LayoutGrid,
    pillActiva: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border-amber-400',
    acento: 'text-amber-600 dark:text-amber-400',
    cajaIcono: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    bordeBuscador: 'focus:border-amber-500/60'
  },
  Almacén: {
    icono: ShoppingCart,
    pillActiva: 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 border-emerald-400',
    acento: 'text-emerald-600 dark:text-emerald-400',
    cajaIcono: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
    bordeBuscador: 'focus:border-emerald-500/60'
  },
  Carnicería: {
    icono: Beef,
    pillActiva: 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 border-rose-400',
    acento: 'text-rose-600 dark:text-rose-400',
    cajaIcono: 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400',
    bordeBuscador: 'focus:border-rose-500/60'
  },
  'Pescados y Mariscos': {
    icono: Fish,
    pillActiva: 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 border-cyan-400',
    acento: 'text-cyan-600 dark:text-cyan-400',
    cajaIcono: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400',
    bordeBuscador: 'focus:border-cyan-500/60'
  },
  Congelados: {
    icono: Snowflake,
    pillActiva: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-indigo-400',
    acento: 'text-indigo-600 dark:text-indigo-400',
    cajaIcono: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-400',
    bordeBuscador: 'focus:border-indigo-500/60'
  },
  Verdulería: {
    icono: Apple,
    pillActiva: 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20 border-lime-300',
    acento: 'text-lime-600 dark:text-lime-400',
    cajaIcono: 'bg-lime-500/10 border-lime-500/25 text-lime-600 dark:text-lime-400',
    bordeBuscador: 'focus:border-lime-400/60'
  },
  Lácteos: {
    icono: Milk,
    pillActiva: 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/20 border-sky-300',
    acento: 'text-sky-600 dark:text-sky-400',
    cajaIcono: 'bg-sky-500/10 border-sky-500/25 text-sky-600 dark:text-sky-400',
    bordeBuscador: 'focus:border-sky-400/60'
  },
  Veggie: {
    icono: Leaf,
    pillActiva: 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 border-teal-400',
    acento: 'text-teal-600 dark:text-teal-400',
    cajaIcono: 'bg-teal-500/10 border-teal-500/25 text-teal-600 dark:text-teal-400',
    bordeBuscador: 'focus:border-teal-500/60'
  },
  'Sin TACC': {
    icono: Wheat,
    pillActiva: 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 border-yellow-400',
    acento: 'text-yellow-600 dark:text-yellow-400',
    cajaIcono: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600 dark:text-yellow-400',
    bordeBuscador: 'focus:border-yellow-500/60'
  },
  'Higiene Personal': {
    icono: Smile,
    pillActiva: 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 border-fuchsia-400',
    acento: 'text-fuchsia-600 dark:text-fuchsia-400',
    cajaIcono: 'bg-fuchsia-500/10 border-fuchsia-500/25 text-fuchsia-600 dark:text-fuchsia-400',
    bordeBuscador: 'focus:border-fuchsia-500/60'
  },
  Limpieza: {
    icono: Sparkles,
    pillActiva: 'bg-violet-500 text-white shadow-lg shadow-violet-500/25 border-violet-400',
    acento: 'text-violet-600 dark:text-violet-400',
    cajaIcono: 'bg-violet-500/10 border-violet-500/25 text-violet-600 dark:text-violet-400',
    bordeBuscador: 'focus:border-violet-500/60'
  },
  Bebidas: {
    icono: Wine,
    pillActiva: 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20 border-orange-400',
    acento: 'text-orange-600 dark:text-orange-400',
    cajaIcono: 'bg-orange-500/10 border-orange-500/25 text-orange-600 dark:text-orange-400',
    bordeBuscador: 'focus:border-orange-500/60'
  }
};

const CATEGORIAS = Object.keys(CONFIG_CATEGORIAS);

const DICCIONARIO_RUBROS = {
  Carnicería: ['lomo', 'bola de lomo', 'asado', 'vacio', 'picada', 'carne', 'pollo', 'milanesa', 'nalga', 'peceto', 'bife', 'matambre', 'costilla', 'pechuga', 'cerdo', 'bondiola'],
  'Pescados y Mariscos': ['salmón', 'salmon', 'atún', 'atun', 'pescado', 'merluza', 'marisco', 'calamar'],
  Congelados: ['congelado', 'supercongelado', 'espinaca', 'brócoli', 'brocoli', 'nuggets', 'bocaditos'],
  Veggie: ['notco', 'notchicken', 'notmila', 'burganas', 'tofu', 'vegano', 'vegetariano', 'plant-based'],
  'Sin TACC': ['sin gluten', 'gluten', 'celiaco', 'schär', 'schar', 'tacc', 'blancaflor sin', 'premezcla pizza'],
  'Higiene Personal': ['dental', 'colgate', 'shampoo', 'desodorante', 'rexona', 'palmolive', 'toalla femenina', 'lina', 'jabón de tocador', 'jabon de tocador'],
  Limpieza: ['jabon liquido', 'detergente', 'lavandina', 'papel higienico', 'rollo', 'suavizante', 'desinfectante', 'cif', 'skip', 'ayudín', 'ayudin', 'odex', 'vileda', 'poett'],
  Lácteos: ['leche', 'yogur', 'queso', 'manteca', 'crema', 'dulce de leche', 'sachet', 'untable', 'ricota', 'danbo', 'fiambre', 'jamon'],
  Verdulería: ['papa', 'tomate', 'cebolla', 'zanahoria', 'manzana', 'banana', 'lechuga', 'palta', 'naranja', 'limon', 'zapallo', 'morron', 'acelga', 'sandia', 'kale', 'alcaucil'],
  Bebidas: ['agua', 'gaseosa', 'coca', 'pepsi', 'cerveza', 'vino', 'jugo', 'soda', 'fernet', 'aperitivo', 'levité', 'levite', 'schneider', 'andes', 'dr. lemon', 'clight'],
  Almacén: ['arroz', 'fideos', 'harina', 'yerba', 'aceite', 'galletitas', 'azucar', 'pure de tomate', 'arvejas', 'lentejas', 'pan', 'tapas']
};

function limpiarTexto(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizarCadena(nombre = '') {
  const n = limpiarTexto(nombre);
  if (n.includes('anonima')) return 'La Anónima';
  if (n.includes('todo')) return 'Todo';
  if (n.includes('chango')) return 'ChangoMás';
  if (n.includes('carrefour')) return 'Carrefour';
  if (n.includes('diarco')) return 'Diarco';
  return nombre;
}

function obtenerEstiloComercio(nombre = '') {
  const n = limpiarTexto(nombre);
  if (n.includes('anonima')) return 'badge-com-anonima';
  if (n.includes('todo')) return 'badge-com-todo';
  if (n.includes('chango')) return 'badge-com-chango';
  if (n.includes('diarco')) return 'badge-com-diarco';
  if (n.includes('cooperativa')) return 'badge-com-coop';
  if (n.includes('carrefour')) return 'badge-com-carrefour';
  return 'badge-com-default';
}

function tiempoRelativo(fechaStr) {
  if (!fechaStr) return 'Reciente';
  const fecha = new Date(fechaStr).getTime();
  if (isNaN(fecha)) return 'Reciente';
  const diffMin = Math.floor((Date.now() - fecha) / 60000);
  if (diffMin < 5) return 'Recién';
  if (diffMin < 60) return `Hace ${diffMin}m`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `Hace ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias}d`;
  return new Date(fechaStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

function calcularEstadoVencimiento(fechaVencStr) {
  if (!fechaVencStr) return null;
  const venc = new Date(fechaVencStr).getTime();
  if (isNaN(venc)) return null;
  const ahora = Date.now();
  const diffHoras = (venc - ahora) / (1000 * 60 * 60);

  if (diffHoras < 0) {
    return { tipo: 'vencido', texto: 'Precio de referencia' };
  }
  if (diffHoras <= 24) {
    return { tipo: 'urgente', texto: 'Vence hoy' };
  }
  if (diffHoras <= 48) {
    return { tipo: 'proximo', texto: 'Últimos 2 días' };
  }
  return null;
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatearDistancia(km) {
  if (km == null || isNaN(km)) return null;
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)} km`;
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
    return { valor: `$${Math.round(porKilo).toLocaleString('es-AR')}`, num: porKilo, unidad: 'Kg' };
  }
  if (['kg', 'kilo', 'kilos', 'kgs'].includes(u)) {
    const porKilo = precioNum / cantNum;
    return { valor: `$${Math.round(porKilo).toLocaleString('es-AR')}`, num: porKilo, unidad: 'Kg' };
  }
  if (['ml', 'cc', 'cm3'].includes(u)) {
    const porLitro = (precioNum / cantNum) * 1000;
    return { valor: `$${Math.round(porLitro).toLocaleString('es-AR')}`, num: porLitro, unidad: 'Litro' };
  }
  if (['l', 'lt', 'litro', 'litros', 'lts'].includes(u)) {
    const porLitro = precioNum / cantNum;
    return { valor: `$${Math.round(porLitro).toLocaleString('es-AR')}`, num: porLitro, unidad: 'Litro' };
  }
  if (['u', 'un', 'unidad', 'unidades'].includes(u) && cantNum > 1) {
    const porUnidad = precioNum / cantNum;
    return { valor: `$${Math.round(porUnidad).toLocaleString('es-AR')}`, num: porUnidad, unidad: 'Unidad' };
  }

  return null;
}

function obtenerClaveVoto(ofertaId, precioActual) {
  return `${ofertaId}_${Math.round(Number(precioActual || 0))}`;
}

function WhatsAppIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28" />
    </svg>
  );
}

function compartirOfertaWhatsApp(item) {
  const precioFormateado = Number(item._precio || 0).toLocaleString('es-AR');
  const unitario = item._refUnitario ? ` ($${item._refUnitario.valor} x ${item._refUnitario.unidad})` : '';

  const mensaje =
    `🛒 *¡Mirá este precio en Bariloche!*

*${item._producto}* (${item._marca})
🏪 *${item._comercio}*
💵 *$${precioFormateado}*${unitario}

Encontrá más precios y compará en 👇
https://bariahorra.vercel.app`;

  window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function compartirListaWhatsApp(simulacion, totalItems) {
  if (!simulacion || !simulacion.productosElegidos) return;

  const lineasProds = simulacion.productosElegidos
    .map((p) => `• *${p.nombre}*: $${p.minPrecio.toLocaleString('es-AR')} (${p.mejorComercio})`)
    .join('\n');

  const ganadorTxt = simulacion.ganador
    ? `\n🏆 *El súper más económico*: ${simulacion.ganador.comercio} (Total aprox: $${simulacion.ganador.totalEstimado.toLocaleString('es-AR')})`
    : '';

  const mensaje =
    `📋 *Mi Lista de Compras en BariAhorra* (${totalItems} productos):

${lineasProds}
${ganadorTxt}

Calculá tu lista de supermercado en 👇
https://bariahorra.vercel.app`;

  window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
}

export default function HomePage() {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [cadenaActiva, setCadenaActiva] = useState('Todos');
  const [orden, setOrden] = useState('recientes');
  const [modoVista, setModoVista] = useState('gondola');
  const [limiteVisibles, setLimiteVisibles] = useState(CANTIDAD_POR_PAGINA);

  // Modales
  const [fotoModal, setFotoModal] = useState(null);
  const [comercioModal, setComercioModal] = useState(null);
  const [buscadorFoco, setBuscadorFoco] = useState(false);

  // Modo Góndola (Checklist)
  const [modoCompraActivo, setModoCompraActivo] = useState(false);
  const [itemsTachados, setItemsTachados] = useState([]);

  // GPS
  const [userCoords, setUserCoords] = useState(null);
  const [pidiendoGps, setPidiendoGps] = useState(false);

  const [usuario, setUsuario] = useState(null);
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [votosRealizados, setVotosRealizados] = useState({});

  const [editandoPrecioId, setEditandoPrecioId] = useState(null);
  const [nuevoPrecioInput, setNuevoPrecioInput] = useState('');
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [avisoFeedback, setAvisoFeedback] = useState(null);

  const [changuito, setChanguito] = useState([]);

  // Referencias para carruseles con soporte de arrastre en PC
  const categoriasRef = useRef(null);
  const bombaRef = useRef(null);
  const popularesRef = useRef(null);
  const cadenasRef = useRef(null);

  // Estado unificado para drag con mouse
  const dragInfoRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
    activeRef: null
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mostrarBannerInstalar, setMostrarBannerInstalar] = useState(false);

  useEffect(() => {
    obtenerSesionYOfertas();
    cargarVotosDesdeStorage();

    try {
      const coordsGuardadas = sessionStorage.getItem('bariahorra_gps');
      if (coordsGuardadas) setUserCoords(JSON.parse(coordsGuardadas));
    } catch (e) { }

    const esStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || window.navigator?.standalone);

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Error al registrar Service Worker:', err);
      });
    }

    try {
      const changuitoGuardado = localStorage.getItem('bariahorra_changuito');
      if (changuitoGuardado) setChanguito(JSON.parse(changuitoGuardado));
      const tachadosGuardados = localStorage.getItem('bariahorra_tachados');
      if (tachadosGuardados) setItemsTachados(JSON.parse(tachadosGuardados));
    } catch (e) { }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });

    const capturarPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!esStandalone) setMostrarBannerInstalar(true);
    };

    window.addEventListener('beforeinstallprompt', capturarPrompt);

    const descartado = localStorage.getItem('bariahorra_banner_instalado');
    if (!descartado && !esStandalone) {
      setMostrarBannerInstalar(true);
    }

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('beforeinstallprompt', capturarPrompt);
    };
  }, []);

  useEffect(() => {
    setLimiteVisibles(CANTIDAD_POR_PAGINA);
  }, [busqueda, categoriaActiva, cadenaActiva, orden, modoVista]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFotoModal(null);
        setComercioModal(null);
        setBuscadorFoco(false);
      }
    };
    if (fotoModal || comercioModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [fotoModal, comercioModal]);

  const mostrarToast = (texto) => {
    setAvisoFeedback(texto);
    setTimeout(() => setAvisoFeedback(null), 3500);
  };

  const abrirUbicacionComercio = (comercioNombre, direccion = null, lat = null, lng = null, distancia = null) => {
    setComercioModal({
      nombre: comercioNombre,
      direccion: direccion,
      lat: lat,
      lng: lng,
      distancia: distancia
    });
  };

  // CONTROLADORES DE ARRASTRE Y RUEDA
  const iniciarArrastre = (e, contenedorRef) => {
    if (!contenedorRef?.current) return;
    dragInfoRef.current = {
      isDown: true,
      startX: e.pageX - contenedorRef.current.offsetLeft,
      scrollLeft: contenedorRef.current.scrollLeft,
      hasMoved: false,
      activeRef: contenedorRef
    };
  };

  const moverArrastre = (e) => {
    const d = dragInfoRef.current;
    if (!d.isDown || !d.activeRef?.current) return;
    const x = e.pageX - d.activeRef.current.offsetLeft;
    const walk = (x - d.startX) * 1.5;
    if (Math.abs(walk) > 4) {
      d.hasMoved = true;
    }
    d.activeRef.current.scrollLeft = d.scrollLeft - walk;
  };

  const detenerArrastre = () => {
    dragInfoRef.current.isDown = false;
  };

  const manejarRuedaHorizontal = (e, contenedorRef) => {
    if (e.deltaY !== 0 && contenedorRef?.current) {
      contenedorRef.current.scrollLeft += e.deltaY;
    }
  };

  const desplazarBomba = (direccion) => {
    if (!bombaRef.current) return;
    const monto = direccion === 'izq' ? -260 : 260;
    bombaRef.current.scrollBy({ left: monto, behavior: 'smooth' });
  };

  const desplazarCategorias = (direccion) => {
    if (!categoriasRef.current) return;
    const monto = direccion === 'izq' ? -180 : 180;
    categoriasRef.current.scrollBy({ left: monto, behavior: 'smooth' });
  };

  const handleActivarUbicacion = () => {
    if (userCoords) {
      mostrarToast('Ubicación activa. Calculando distancias.');
      return;
    }

    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    setPidiendoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserCoords(coords);
        setPidiendoGps(false);
        try {
          sessionStorage.setItem('bariahorra_gps', JSON.stringify(coords));
        } catch (e) { }
        mostrarToast('Ubicación activada. Ahora podés ver las distancias.');
      },
      (err) => {
        setPidiendoGps(false);
        alert('Para ver qué súper te queda más cerca, permití el acceso a tu ubicación.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const toggleProductoChanguito = (nombreProducto) => {
    const clave = limpiarTexto(nombreProducto);
    setChanguito((prev) => {
      const existe = prev.includes(clave);
      const nuevo = existe ? prev.filter((item) => item !== clave) : [...prev, clave];
      try {
        localStorage.setItem('bariahorra_changuito', JSON.stringify(nuevo));
      } catch (e) { }
      return nuevo;
    });
  };

  const toggleItemTachado = (clave) => {
    setItemsTachados((prev) => {
      const existe = prev.includes(clave);
      const nuevo = existe ? prev.filter((k) => k !== clave) : [...prev, clave];
      try {
        localStorage.setItem('bariahorra_tachados', JSON.stringify(nuevo));
      } catch (e) { }
      return nuevo;
    });
  };

  const limpiarChanguito = () => {
    setChanguito([]);
    setItemsTachados([]);
    setModoCompraActivo(false);
    try {
      localStorage.removeItem('bariahorra_changuito');
      localStorage.removeItem('bariahorra_tachados');
    } catch (e) { }
  };

  const cargarVotosDesdeStorage = () => {
    try {
      const guardados = {};
      for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith('bariahorra_voto_')) {
          const idCompuesto = clave.replace('bariahorra_voto_', '');
          guardados[idCompuesto] = localStorage.getItem(clave);
        }
      }
      setVotosRealizados(guardados);
    } catch (e) { }
  };

  const handleInstalarApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setMostrarBannerInstalar(false);
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error al solicitar instalación:', err);
      }
    } else {
      alert('Para instalar BariAhorra:\n• En Android: Tocá los 3 puntos y seleccioná "Instalar aplicación".\n• En iPhone (Safari): Tocá Compartir y elegí "Agregar a inicio".');
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
      });

      const listaProcesada = rawOfertas.map((item) => {
        const prodId = String(item.producto_id || '').toLowerCase();
        const prodRel = mapProd.get(prodId);

        const comId = String(item.comercio_id || '').toLowerCase();
        const comRel = mapCom.get(comId);

        const userId = String(item.usuario_id || '').toLowerCase();
        const perfRel = mapPerf.get(userId);

        const productoNombre = prodRel?.nombre || 'Producto en góndola';
        const marca = prodRel?.marca || 'Genérica';
        const tamano = prodRel?.cantidad || prodRel?.tamano || '';
        const unidad = prodRel?.unidad_medida || prodRel?.unidad || '';

        let rubro = prodRel?.categoria || prodRel?.rubro || '';

        if (!rubro || limpiarTexto(rubro) === 'super' || limpiarTexto(rubro) === 'almacen') {
          const textoBusqueda = `${productoNombre} ${marca}`.toLowerCase();
          for (const [catNombre, keywords] of Object.entries(DICCIONARIO_RUBROS)) {
            if (keywords.some((kw) => textoBusqueda.includes(kw))) {
              rubro = catNombre;
              break;
            }
          }
          if (!rubro) rubro = 'Almacén';
        }

        const comercioNombre = comRel?.nombre || 'Comercio Bariloche';
        const comercioDireccion = comRel?.direccion || null;
        const comercioLat = comRel?.latitud ? parseFloat(comRel.latitud) : null;
        const comercioLng = comRel?.longitud ? parseFloat(comRel.longitud) : null;

        let apodoAutor = perfRel?.username || perfRel?.apodo || perfRel?.nombre || '';

        if (!apodoAutor && userActual && String(userActual.id).toLowerCase() === userId) {
          apodoAutor =
            userActual.user_metadata?.username ||
            userActual.user_metadata?.apodo ||
            userActual.user_metadata?.full_name ||
            userActual.email?.split('@')[0] ||
            '';
        }

        if (!apodoAutor) apodoAutor = 'Vecino anónimo';

        const precioFinal = Number(item.precio || 0);
        const votosPos = Number(item.votos_positivos || 0);
        const votosNeg = Number(item.votos_negativos || 0);

        const esCatalogoOficial = Boolean(item.es_catalogo) || item.estado === 'catalogo' || votosPos >= 100;
        const estadoVenc = calcularEstadoVencimiento(item.vencimiento);

        const refUnitario = calcularPrecioPorUnidad(precioFinal, tamano, unidad, productoNombre);
        const presentacionFormateada = formatearPresentacion(tamano, unidad);

        return {
          ...item,
          _producto: productoNombre,
          _claveProducto: limpiarTexto(productoNombre),
          _marca: marca,
          _tamanoRaw: tamano,
          _unidadRaw: unidad,
          _presentacion: presentacionFormateada,
          _rubro: rubro,
          _comercio: comercioNombre,
          _cadena: normalizarCadena(comercioNombre),
          _comercioDireccion: comercioDireccion,
          _comercioLat: comercioLat,
          _comercioLng: comercioLng,
          _usuario: apodoAutor,
          _foto: item.foto_url || prodRel?.foto_url || null,
          _precio: precioFinal,
          _refUnitario: refUnitario,
          _esCatalogo: esCatalogoOficial,
          _estadoVenc: estadoVenc,
          _votosPositivos: votosPos,
          _votosNegativos: votosNeg,
        };
      });

      setOfertas(listaProcesada);
    } catch (err) {
      console.error('Error cargando ofertas:', err.message || err);
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmar = async (oferta, tipo) => {
    const claveVoto = obtenerClaveVoto(oferta.id, oferta._precio);
    if (votosRealizados[claveVoto]) return;

    setConfirmandoId(oferta.id);
    try {
      const nuevoPositivo = tipo === 'sigue' ? (oferta._votosPositivos || 0) + 1 : (oferta._votosPositivos || 0);
      const nuevoNegativo = tipo === 'subio' ? (oferta._votosNegativos || 0) + 1 : (oferta._votosNegativos || 0);

      const pasaARevision = tipo === 'subio' && (oferta._esCatalogo || nuevoNegativo >= 3);
      const payloadUpdate = {
        votos_positivos: nuevoPositivo,
        votos_negativos: nuevoNegativo,
      };
      if (pasaARevision) {
        payloadUpdate.estado = 'en_revision';
        payloadUpdate.motivo_revision = 'Reportado como aumentado por varios vecinos';
      }

      const { error } = await supabase
        .from('ofertas')
        .update(payloadUpdate)
        .eq('id', oferta.id);

      if (!error) {
        if (tipo === 'sigue' && oferta.usuario_id) {
          try {
            const { data: autor } = await supabase
              .from('perfiles')
              .select('puntos')
              .eq('id', oferta.usuario_id)
              .maybeSingle();

            if (autor) {
              await supabase
                .from('perfiles')
                .update({ puntos: (Number(autor.puntos) || 0) + 2 })
                .eq('id', oferta.usuario_id);
            }
          } catch (e) {
            console.error('Error actualizando puntos:', e);
          }
        }

        try {
          localStorage.setItem(`bariahorra_voto_${claveVoto}`, tipo);
          setVotosRealizados((prev) => ({ ...prev, [claveVoto]: tipo }));
        } catch (e) { }

        setOfertas((prev) =>
          prev.map((o) =>
            o.id === oferta.id
              ? {
                ...o,
                _votosPositivos: nuevoPositivo,
                _votosNegativos: nuevoNegativo,
                estado: pasaARevision ? 'en_revision' : o.estado
              }
              : o
          )
        );

        if (tipo === 'sigue') {
          mostrarToast('Confirmaste que el precio sigue vigente (+2 pts al autor).');
        } else {
          mostrarToast('Aviso registrado. Gracias por colaborar.');
        }
      }
    } catch (err) {
      console.error('Error al procesar voto:', err);
    } finally {
      setConfirmandoId(null);
    }
  };

  const handleProponerNuevoPrecio = async (oferta) => {
    const valorNum = Number(nuevoPrecioInput);
    if (!valorNum || isNaN(valorNum) || valorNum <= 0) return;

    if (Math.round(valorNum) === Math.round(oferta._precio)) {
      setEditandoPrecioId(null);
      return;
    }

    setGuardandoPrecio(true);
    try {
      const diferenciaPorcentual = Math.abs(valorNum - oferta._precio) / oferta._precio;

      if (diferenciaPorcentual > 0.50) {
        await supabase
          .from('ofertas')
          .update({
            precio_propuesto: valorNum,
            estado: 'en_revision',
            motivo_revision: `Variación inusual (${Math.round(diferenciaPorcentual * 100)}% de diferencia vs $${oferta._precio})`
          })
          .eq('id', oferta.id);

        mostrarToast(`Precio en revisión por variación inusual ($${valorNum.toLocaleString('es-AR')}).`);
        setEditandoPrecioId(null);
        setNuevoPrecioInput('');
        return;
      }

      const ahoraISO = new Date().toISOString();
      const { error } = await supabase
        .from('ofertas')
        .update({
          precio: valorNum,
          votos_positivos: 1,
          votos_negativos: 0,
          precio_propuesto: null,
          motivo_revision: null,
          creado_en: ahoraISO
        })
        .eq('id', oferta.id);

      if (!error) {
        const nuevaClaveVoto = obtenerClaveVoto(oferta.id, valorNum);
        localStorage.setItem(`bariahorra_voto_${nuevaClaveVoto}`, 'sigue');
        setVotosRealizados((prev) => ({ ...prev, [nuevaClaveVoto]: 'sigue' }));

        setOfertas((prev) =>
          prev.map((o) => {
            if (o.id !== oferta.id) return o;
            const nuevaRef = calcularPrecioPorUnidad(valorNum, o._tamanoRaw, o._unidadRaw, o._producto);
            return {
              ...o,
              precio: valorNum,
              _precio: valorNum,
              _refUnitario: nuevaRef,
              _votosPositivos: 1,
              _votosNegativos: 0,
              creado_en: ahoraISO
            };
          })
        );
        mostrarToast('Precio actualizado por la comunidad.');
      }

      setEditandoPrecioId(null);
      setNuevoPrecioInput('');
    } catch (err) {
      console.error('Error actualizando precio:', err);
    } finally {
      setGuardandoPrecio(false);
    }
  };

  // Filtrado reactivo (Categoría + Cadena + Buscador)
  const ofertasFiltradas = useMemo(() => {
    const catNorm = limpiarTexto(categoriaActiva);
    const cadenaNorm = limpiarTexto(cadenaActiva);
    const busqNorm = limpiarTexto(busqueda);

    return ofertas
      .filter((o) => {
        const rubroNorm = limpiarTexto(o._rubro);
        const coincideCat = catNorm === 'todos' || rubroNorm === catNorm;

        const comCadenaNorm = limpiarTexto(o._cadena);
        const coincideCadena = cadenaNorm === 'todos' || comCadenaNorm.includes(cadenaNorm);

        const textoBusq = limpiarTexto(`${o._producto} ${o._marca} ${o._comercio} ${o._rubro}`);
        const coincideBusq = busqNorm === '' || textoBusq.includes(busqNorm);

        return coincideCat && coincideCadena && coincideBusq;
      })
      .map((o) => {
        let distanciaKm = null;
        if (userCoords && o._comercioLat && o._comercioLng) {
          distanciaKm = calcularDistanciaKm(userCoords.lat, userCoords.lng, o._comercioLat, o._comercioLng);
        }
        return {
          ...o,
          _distanciaKm: distanciaKm,
          _distanciaTxt: formatearDistancia(distanciaKm)
        };
      })
      .sort((a, b) => {
        if (orden === 'distancia_asc') {
          if (a._distanciaKm != null && b._distanciaKm != null) return a._distanciaKm - b._distanciaKm;
          if (a._distanciaKm != null) return -1;
          if (b._distanciaKm != null) return 1;
        }
        if (orden === 'precio_asc') return (a._precio || 0) - (b._precio || 0);
        if (orden === 'precio_desc') return (b._precio || 0) - (a._precio || 0);

        const fechaA = new Date(a.creado_en || 0).getTime();
        const fechaB = new Date(b.creado_en || 0).getTime();
        if (fechaA && fechaB && fechaA !== fechaB) {
          return fechaB - fechaA;
        }
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
  }, [ofertas, categoriaActiva, cadenaActiva, busqueda, orden, userCoords]);

  const ofertasGondolaDesduplicadas = useMemo(() => {
    const mapa = new Map();
    ofertasFiltradas.forEach((o) => {
      const claveAgrupada = `${o._claveProducto}_${limpiarTexto(o._marca)}_${limpiarTexto(o._cadena)}`;
      const existente = mapa.get(claveAgrupada);
      if (!existente) {
        mapa.set(claveAgrupada, o);
      } else if (o._distanciaKm != null && (existente._distanciaKm == null || o._distanciaKm < existente._distanciaKm)) {
        mapa.set(claveAgrupada, o);
      }
    });
    return Array.from(mapa.values());
  }, [ofertasFiltradas]);

  const ofertasVisibles = useMemo(() => {
    return ofertasGondolaDesduplicadas.slice(0, limiteVisibles);
  }, [ofertasGondolaDesduplicadas, limiteVisibles]);

  const ofertasBomba = useMemo(() => {
    return [...ofertasGondolaDesduplicadas]
      .filter((o) => o._precio > 0)
      .sort((a, b) => {
        const pesoA = (a._esCatalogo ? 2 : 1) * (a._votosPositivos + 1);
        const pesoB = (b._esCatalogo ? 2 : 1) * (b._votosPositivos + 1);
        return pesoB - pesoA;
      })
      .slice(0, 6);
  }, [ofertasGondolaDesduplicadas]);

  const mejoresPreciosIds = useMemo(() => {
    const grupos = {};
    ofertas.forEach((o) => {
      const clave = o._claveProducto;
      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(o);
    });

    const ganadores = new Set();
    Object.values(grupos).forEach((lista) => {
      if (lista.length > 1) {
        const ordenados = [...lista].sort((a, b) => a._precio - b._precio);
        if (ordenados[0]._precio < ordenados[ordenados.length - 1]._precio) {
          ganadores.add(ordenados[0].id);
        }
      }
    });
    return ganadores;
  }, [ofertas]);

  const productosComparados = useMemo(() => {
    const mapa = new Map();

    ofertasFiltradas.forEach((o) => {
      const clave = `${o._claveProducto}_${limpiarTexto(o._marca)}`;
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          clave,
          claveProd: o._claveProducto,
          producto: o._producto,
          marca: o._marca,
          rubro: o._rubro,
          foto: o._foto,
          itemsPorCadena: new Map()
        });
      }
      const grupo = mapa.get(clave);
      if (!grupo.foto && o._foto) grupo.foto = o._foto;

      const cadenaKey = limpiarTexto(o._cadena);
      const existente = grupo.itemsPorCadena.get(cadenaKey);

      if (!existente) {
        grupo.itemsPorCadena.set(cadenaKey, o);
      } else if (o._distanciaKm != null && (existente._distanciaKm == null || o._distanciaKm < existente._distanciaKm)) {
        grupo.itemsPorCadena.set(cadenaKey, o);
      }
    });

    return Array.from(mapa.values())
      .map((g) => {
        const items = Array.from(g.itemsPorCadena.values());
        items.sort((a, b) => a._precio - b._precio);
        const min = items[0]?._precio || 0;
        const max = items[items.length - 1]?._precio || 0;
        const ahorro = max > min ? max - min : 0;

        let masCercanoId = null;
        let menorDist = Infinity;
        items.forEach((item) => {
          if (item._distanciaKm != null && item._distanciaKm < menorDist) {
            menorDist = item._distanciaKm;
            masCercanoId = item.id;
          }
        });

        const masBaratoId = items[0]?.id;
        const esOpcionIdeal = masBaratoId === masCercanoId && items.length > 1;

        return {
          ...g,
          items,
          minPrecio: min,
          maxPrecio: max,
          ahorro,
          masBaratoId,
          masCercanoId,
          esOpcionIdeal
        };
      })
      .sort((a, b) => b.items.length - a.items.length || a.minPrecio - b.minPrecio);
  }, [ofertasFiltradas]);

  const simulacionChanguito = useMemo(() => {
    if (changuito.length === 0) return null;

    const productosElegidos = changuito.map((clave) => {
      const coincidencias = ofertas.filter((o) => o._claveProducto === clave);
      coincidencias.sort((a, b) => a._precio - b._precio);
      const mejor = coincidencias[0];
      return {
        clave,
        nombre: mejor?._producto || clave,
        minPrecio: mejor?._precio || 0,
        mejorComercio: mejor?._comercio || '',
        mejorCadena: mejor?._cadena || mejor?._comercio || '',
        ofertasPorComercio: coincidencias
      };
    });

    const totalCompraCombinada = productosElegidos.reduce((acc, p) => acc + p.minPrecio, 0);

    const mapaComercios = {};
    ofertas.forEach((o) => {
      if (!changuito.includes(o._claveProducto)) return;
      const com = o._cadena || o._comercio;
      if (!mapaComercios[com]) {
        mapaComercios[com] = {
          comercio: com,
          preciosPorProd: {}
        };
      }
      const actual = mapaComercios[com].preciosPorProd[o._claveProducto];
      if (!actual || o._precio < actual) {
        mapaComercios[com].preciosPorProd[o._claveProducto] = o._precio;
      }
    });

    const rankingSupermercados = Object.values(mapaComercios)
      .map((entry) => {
        const encontrados = Object.keys(entry.preciosPorProd).length;
        const subtotalReal = Object.values(entry.preciosPorProd).reduce((a, b) => a + b, 0);

        let totalEstimado = subtotalReal;
        productosElegidos.forEach((p) => {
          if (!entry.preciosPorProd[p.clave]) {
            totalEstimado += p.minPrecio;
          }
        });

        return {
          comercio: entry.comercio,
          encontrados,
          totalProductos: changuito.length,
          subtotalReal,
          totalEstimado
        };
      })
      .sort((a, b) => b.encontrados - a.encontrados || a.totalEstimado - b.totalEstimado);

    const mejorUnicoSuper = rankingSupermercados[0] || null;
    const ahorroCombinado = mejorUnicoSuper ? mejorUnicoSuper.totalEstimado - totalCompraCombinada : 0;

    const totalItems = changuito.length;
    const itemsCompradosCount = changuito.filter((k) => itemsTachados.includes(k)).length;
    const gastoAcumulado = productosElegidos
      .filter((p) => itemsTachados.includes(p.clave))
      .reduce((acc, p) => acc + p.minPrecio, 0);

    return {
      productosElegidos,
      totalCompraCombinada,
      rankingSupermercados,
      ganador: mejorUnicoSuper,
      ahorroCombinado: ahorroCombinado > 500 ? ahorroCombinado : 0,
      totalItems,
      itemsCompradosCount,
      gastoAcumulado
    };
  }, [changuito, ofertas, itemsTachados]);

  const estiloCatActiva = CONFIG_CATEGORIAS[categoriaActiva] || CONFIG_CATEGORIAS.Todos;

  return (
    <div
      onMouseMove={moverArrastre}
      onMouseUp={detenerArrastre}
      className="w-full max-w-4xl mx-auto p-3.5 sm:p-6 space-y-3.5 pb-24"
    >

      {/* TOAST FLOTANTE */}
      {avisoFeedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 theme-card border border-sky-500/40 theme-title px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{avisoFeedback}</span>
        </div>
      )}

      {/* BANNER PWA */}
      {mostrarBannerInstalar && (
        <div className="bg-gradient-to-r from-sky-500/15 via-sky-500/5 to-transparent border border-sky-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-sky-500 shrink-0" />
            <p className="text-[11px] sm:text-xs font-bold theme-subtitle truncate">
              Instalá <span className="text-sky-600 font-black">BariAhorra</span> en tu pantalla de inicio
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstalarApp}
              className="flex items-center gap-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg transition cursor-pointer active:scale-95 shadow"
            >
              <Download className="w-3 h-3 stroke-[3]" />
              <span>Instalar</span>
            </button>
            <button
              type="button"
              onClick={cerrarBanner}
              className="p-1 rounded-lg theme-muted hover:theme-title transition cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* BUSCADOR CON NUBE DE TÉRMINOS POPULARES */}
      <div className="space-y-1.5 relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${estiloCatActiva.acento}`} />
            <input
              type="text"
              value={busqueda}
              onFocus={() => setBuscadorFoco(true)}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto, marca o súper..."
              className={`w-full theme-input border rounded-2xl pl-10 pr-8 py-2.5 text-xs sm:text-sm placeholder-slate-400 focus:outline-none ${estiloCatActiva.bordeBuscador} transition shadow-sm font-medium`}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg theme-muted hover:theme-title cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Link
            href="/cargar"
            className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 border-t border-white/30 font-black px-4 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-sky-500/20 shrink-0 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cargar precio</span>
          </Link>
        </div>

        {/* NUBE POPULARES (DESPLAZABLE CON MOUSE Y RUEDA) */}
        {(buscadorFoco || busqueda.length > 0) && (
          <div
            ref={popularesRef}
            onMouseDown={(e) => iniciarArrastre(e, popularesRef)}
            onWheel={(e) => manejarRuedaHorizontal(e, popularesRef)}
            className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none select-none cursor-grab active:cursor-grabbing animate-in fade-in duration-150"
          >
            <span className="text-[10px] theme-muted font-bold whitespace-nowrap pl-1 shrink-0">
              Populares:
            </span>
            {TERMINOS_POPULARES.map((tp) => {
              const IconoItem = tp.Icono;
              return (
                <button
                  key={tp.label}
                  type="button"
                  onClick={() => {
                    if (dragInfoRef.current.hasMoved) return;
                    setBusqueda(tp.query);
                    setBuscadorFoco(false);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg theme-card border border-[var(--border-card)] theme-subtitle hover:border-amber-500 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
                >
                  <IconoItem className="w-3 h-3 text-amber-500" />
                  <span>{tp.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTRO POR CADENA (DESPLAZABLE CON MOUSE Y RUEDA) */}
      <div
        ref={cadenasRef}
        onMouseDown={(e) => iniciarArrastre(e, cadenasRef)}
        onWheel={(e) => manejarRuedaHorizontal(e, cadenasRef)}
        className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none select-none cursor-grab active:cursor-grabbing"
      >
        <span className="text-[10px] theme-muted font-bold pl-1 shrink-0">
          Supermercado:
        </span>
        {CADENAS_FILTRO.map((cad) => {
          const activa = cadenaActiva === cad;
          return (
            <button
              key={cad}
              type="button"
              onClick={() => {
                if (dragInfoRef.current.hasMoved) return;
                setCadenaActiva(cad);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 border ${
                activa
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm'
                  : 'theme-btn-sec border-[var(--border-card)] hover:border-sky-500'
              }`}
            >
              {cad}
            </button>
          );
        })}
      </div>

      {/* CARRUSEL DE CATEGORÍAS */}
      <div className="relative flex items-center group">
        <button
          type="button"
          onClick={() => desplazarCategorias('izq')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full theme-btn-sec border shadow-md mr-1.5 shrink-0 cursor-pointer transition hover:border-slate-400"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={categoriasRef}
          onMouseDown={(e) => iniciarArrastre(e, categoriasRef)}
          onWheel={(e) => manejarRuedaHorizontal(e, categoriasRef)}
          className="flex gap-2 overflow-x-auto py-1 scrollbar-none select-none cursor-grab active:cursor-grabbing"
        >
          {CATEGORIAS.map((cat) => {
            const conf = CONFIG_CATEGORIAS[cat] || CONFIG_CATEGORIAS.Todos;
            const IconoCat = conf.icono;
            const activa = categoriaActiva === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  if (dragInfoRef.current.hasMoved) return;
                  setCategoriaActiva(cat);
                }}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-bold transition text-xs cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                  activa
                    ? conf.pillActiva
                    : 'theme-btn-sec hover:border-slate-400'
                }`}
              >
                <IconoCat className={`w-3.5 h-3.5 ${activa ? 'stroke-[2.5]' : conf.acento}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => desplazarCategorias('der')}
          className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full theme-btn-sec border shadow-md ml-1.5 shrink-0 cursor-pointer transition hover:border-slate-400"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* CARRUSEL HERO: PRECIOS DESTACADOS BOMBA CON RESPALDO VECTORIAL */}
      {busqueda === '' && categoriaActiva === 'Todos' && cadenaActiva === 'Todos' && modoVista === 'gondola' && ofertasBomba.length > 0 && (
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

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (dragInfoRef.current.hasMoved) return;
                    abrirUbicacionComercio(item._comercio, item._comercioDireccion, item._comercioLat, item._comercioLng, item._distanciaTxt);
                  }}
                  className="shrink-0 w-64 theme-card border border-amber-500/30 rounded-2xl p-3 shadow-md bg-gradient-to-br from-amber-500/5 via-transparent to-transparent flex flex-col justify-between space-y-2 cursor-pointer hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-slate-950" />
                      Destacado
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${obtenerEstiloComercio(item._comercio)}`}>
                      <Store className="w-2.5 h-2.5" />
                      <span>{item._comercio}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Caja de imagen con ícono de fondo por si la foto falla */}
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
      )}

      {/* BARRA DE CONTROLES */}
      <div className="theme-card border rounded-2xl p-1.5 sm:p-2.5 shadow-sm space-y-1.5 sm:space-y-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setModoVista('gondola')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer select-none ${
              modoVista === 'gondola'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'theme-muted hover:theme-title'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Góndola</span>
          </button>

          <button
            type="button"
            onClick={() => setModoVista('comparar')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer select-none ${
              modoVista === 'comparar'
                ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                : 'theme-muted hover:theme-title'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Comparar</span>
          </button>

          <button
            type="button"
            onClick={() => setModoVista('milista')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer select-none ${
              modoVista === 'milista'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'theme-muted hover:theme-title'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Mi Lista ({changuito.length})</span>
          </button>
        </div>

        {modoVista === 'gondola' && (
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1 border-t border-[var(--border-card)]">
            <span className="text-[11px] theme-muted font-medium hidden md:inline pl-1">
              Filtros activos:
            </span>

            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={handleActivarUbicacion}
                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer active:scale-95 shrink-0 ${
                  userCoords
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                    : 'theme-btn-sec text-sky-400 border-sky-500/30 hover:border-sky-500'
                }`}
                title={userCoords ? 'Ubicación activa' : 'Activar GPS para calcular distancias'}
              >
                <Navigation className={`w-3 h-3 ${userCoords ? 'text-emerald-500' : 'text-sky-400'}`} />
                <span>{pidiendoGps ? 'Buscando...' : userCoords ? 'GPS Activo' : 'Cerca mío'}</span>
              </button>

              <select
                value={orden}
                onChange={(e) => {
                  if (e.target.value === 'distancia_asc' && !userCoords) {
                    handleActivarUbicacion();
                  }
                  setOrden(e.target.value);
                }}
                className="flex-1 md:flex-initial theme-btn-sec font-bold px-2 sm:px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer text-[11px] sm:text-xs truncate"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Menor precio</option>
                <option value="precio_desc">Mayor precio</option>
                <option value="distancia_asc">Más cercanos</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {cargando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="theme-card border rounded-2xl p-4 h-36 animate-pulse flex flex-col justify-between">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-300 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="w-28 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <div className="w-40 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <div className="w-24 h-3 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t theme-card-sub">
                <div className="w-20 h-6 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                <div className="w-28 h-7 bg-slate-300 dark:bg-slate-700 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : ofertasFiltradas.length === 0 ? (
        <div className="text-center py-16 theme-muted text-xs theme-card rounded-3xl border space-y-3 shadow-sm">
          <p>No encontramos precios con esos filtros.</p>
          <button
            type="button"
            onClick={() => {
              setCategoriaActiva('Todos');
              setCadenaActiva('Todos');
              setBusqueda('');
            }}
            className="inline-flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      ) : modoVista === 'milista' ? (
        /* --- VISTA MI LISTA (CON MODO COMPRA CHECKLIST Y AHORRO COMBINADO) --- */
        <div className="space-y-4">
          {changuito.length === 0 ? (
            <div className="text-center py-16 theme-card rounded-3xl border p-6 space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-sky-500/10 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black theme-title">Tu lista de compras está vacía</h3>
              <p className="text-xs theme-muted max-w-sm mx-auto">
                Tocá <strong className="text-sky-600">+ Mi lista</strong> en los productos que necesitás y te calculamos dónde te conviene comprar.
              </p>
              <button
                type="button"
                onClick={() => setModoVista('gondola')}
                className="mt-2 bg-sky-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
              >
                Ver góndola de productos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* TARJETA COMPARATIVA */}
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
                      <p className="text-[10px] text-emerald-600 font-bold">Opción Inteligente (Comprar lo más barato):</p>
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

              {/* BARRA DE ACCIÓN: MODO COMPRA */}
              <div className="theme-card border rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider theme-subtitle flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-emerald-600" />
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

                {/* LISTA CON CASILLAS */}
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
                              <button
                                type="button"
                                className="shrink-0 text-sky-400"
                              >
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
                                Mejor precio en <strong className="text-emerald-600">{prod.mejorComercio}</strong>
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
                  <Calculator className="w-4 h-4 text-sky-600" />
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
                            <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                              esGanador ? 'bg-emerald-500 text-slate-950' : 'theme-btn-sec border'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${estiloCom}`}>
                              <Store className="w-3 h-3" />
                              {sup.comercio}
                            </span>
                            {esGanador && (
                              <span className="text-[10px] font-black text-emerald-600">¡Más económico!</span>
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
          )}
        </div>
      ) : modoVista === 'comparar' ? (
        /* --- VISTA COMPARADOR INTELIGENTE --- */
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
                        <span className="theme-subtitle font-bold">{grupo.marca}</span> • <span className={`font-bold ${confRubro.acento}`}>{grupo.rubro}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {grupo.ahorro > 0 && (
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
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
                          <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                            esOpcionIdeal || esElMasBarato
                              ? 'bg-emerald-500 text-slate-950'
                              : esElMasCercano
                                ? 'bg-sky-500 text-slate-950'
                                : 'theme-btn-sec border'
                          }`}>
                            {idx + 1}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => abrirUbicacionComercio(item._comercio, item._comercioDireccion, item._comercioLat, item._comercioLng, item._distanciaTxt)}
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer hover:opacity-80 active:scale-95 transition ${estiloCom}`}
                                title="Ver cómo llegar en Google Maps"
                              >
                                <Store className="w-2.5 h-2.5" />
                                <span>{item._comercio}</span>
                                <MapPin className="w-2.5 h-2.5 text-sky-400 ml-0.5" />
                              </button>

                              {esOpcionIdeal ? (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  ¡Opción Ideal! (Más barato y cerca)
                                </span>
                              ) : esElMasBarato ? (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">
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
                                <span>• <strong className="precio-ref-unitario">{item._refUnitario.valor} x {item._refUnitario.unidad}</strong></span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`text-sm sm:text-base font-black font-mono ${
                            esElMasBarato ? 'text-emerald-600' : 'theme-title'
                          }`}>
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
                onClick={() => setLimiteVisibles((prev) => prev + CANTIDAD_POR_PAGINA)}
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
        </div>
      ) : (
        /* --- VISTA GÓNDOLA: CON RESPALDO VECTORIAL SI LA IMAGEN NO CARGA --- */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ofertasVisibles.map((item) => {
              const tieneFoto = Boolean(item._foto);
              const esAnonimo = limpiarTexto(item._usuario).includes('anonimo');
              const formatoUsuario = esAnonimo
                ? 'Vecino anónimo'
                : item._usuario.startsWith('@')
                  ? item._usuario
                  : `@${item._usuario}`;

              const claveVoto = obtenerClaveVoto(item.id, item._precio);
              const votoActual = votosRealizados[claveVoto];
              const yaVoto = Boolean(votoActual);

              const confRubro = CONFIG_CATEGORIAS[item._rubro] || CONFIG_CATEGORIAS.Almacén;
              const IconoRubro = confRubro.icono;
              const estiloComercio = obtenerEstiloComercio(item._comercio);
              const esMejorPrecio = mejoresPreciosIds.has(item.id);
              const enChanguito = changuito.includes(item._claveProducto);

              const verificadoComunidad = !item._esCatalogo && item._votosPositivos >= 3 && item._votosNegativos === 0;

              return (
                <article
                  key={item.id}
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
                        onClick={() => abrirUbicacionComercio(item._comercio, item._comercioDireccion, item._comercioLat, item._comercioLng, item._distanciaTxt)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 min-w-0 shrink transition cursor-pointer hover:opacity-80 active:scale-95 ${estiloComercio}`}
                        title="Ver ubicación en Google Maps"
                      >
                        <Store className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[110px] xs:max-w-[140px] md:max-w-[170px]">{item._comercio}</span>
                        <MapPin className="w-2.5 h-2.5 text-sky-400 shrink-0 ml-0.5" />
                      </button>

                      {item._distanciaTxt && (
                        <span className="text-[9px] font-bold text-sky-500 bg-sky-500/10 border border-sky-500/25 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{item._distanciaTxt}</span>
                        </span>
                      )}

                      {item._estadoVenc && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 border flex items-center gap-1 ${
                          item._estadoVenc.tipo === 'vencido'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                            : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                        }`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item._estadoVenc.texto}</span>
                        </span>
                      )}

                      {verificadoComunidad ? (
                        <span className="text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Destacado</span>
                        </span>
                      ) : esMejorPrecio ? (
                        <span className="text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                          <Award className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Mejor</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => compartirOfertaWhatsApp(item)}
                        className="flex items-center justify-center p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
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

                  {/* PISO 2: CUERPO (SIEMPRE MUESTRA EL ÍCONO ABAJO POR SI LA FOTO FALLA) */}
                  <div className="flex gap-3 items-start flex-1 py-0.5">
                    <div
                      onClick={() => {
                        if (tieneFoto) {
                          setFotoModal({
                            foto: item._foto,
                            producto: item._producto,
                            marca: item._marca,
                            comercio: item._comercio,
                            precio: item._precio
                          });
                        }
                      }}
                      className={`w-16 h-16 rounded-2xl border overflow-hidden shrink-0 flex items-center justify-center relative group ${confRubro.cajaIcono} ${
                        tieneFoto ? 'cursor-zoom-in' : ''
                      }`}
                      title={tieneFoto ? 'Tocar para ampliar foto' : undefined}
                    >
                      {/* Ícono de respaldo garantizado */}
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
                          <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Catálogo Oficial</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 theme-muted shrink-0" />
                            <span className={!esAnonimo ? 'text-sky-600 font-bold truncate' : 'truncate'}>
                              {formatoUsuario}
                            </span>
                          </span>
                        )}

                        {verificadoComunidad && (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-md">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
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

                  {/* PISO 3: PRECIOS */}
                  <div className="pt-2.5 border-t border-[var(--border-card)] space-y-2.5">
                    <div className="flex items-end justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-lg sm:text-xl font-black theme-title font-mono tracking-tight leading-none block">
                          ${Number(item._precio || 0).toLocaleString('es-AR')}
                        </span>

                        {item._refUnitario && (
                          <p className="text-[10px] theme-muted flex items-center gap-1 leading-tight">
                            <Scale className="w-3 h-3 text-emerald-600 shrink-0" />
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
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3 text-amber-500" />
                              <span>Referencia oficial</span>
                            </span>
                          ) : (
                            <>
                              {item._votosPositivos > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                  <ThumbsUp className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>
                                    {item._votosPositivos} {item._votosPositivos === 1 ? 'confirmó' : 'confirmaron'}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[10px] theme-muted">Sin confirmar aún</span>
                              )}

                              {item._votosNegativos > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
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
                                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-600'
                                : yaVoto
                                  ? 'btn-voto-accion opacity-60 cursor-not-allowed'
                                  : 'btn-voto-accion cursor-pointer hover:border-emerald-500/60'
                            }`}
                          >
                            {votoActual === 'sigue' ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ThumbsUp className="w-3 h-3 text-emerald-600" />
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
                              ? 'bg-amber-500/20 border border-amber-500 text-amber-600'
                              : 'btn-voto-accion hover:border-amber-500/60'
                          }`}
                        >
                          <RefreshCw className="w-3 h-3 text-amber-500" />
                          <span>
                            {item._esCatalogo ? '¿Cambió? Avisar' : 'Cambió'}
                          </span>
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
                            <span className="text-[11px] font-bold text-amber-600">$</span>
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
            })}
          </div>

          {ofertasGondolaDesduplicadas.length > limiteVisibles && (
            <div className="flex justify-center pt-3 pb-1">
              <button
                type="button"
                onClick={() => setLimiteVisibles((prev) => prev + CANTIDAD_POR_PAGINA)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl theme-btn-sec border border-[var(--border-sub)] font-bold text-xs hover:border-sky-500/60 transition shadow-sm cursor-pointer active:scale-95"
              >
                <span>Mostrar más ofertas</span>
                <span className="theme-muted font-mono font-medium text-[11px]">
                  ({ofertasVisibles.length} de {ofertasGondolaDesduplicadas.length})
                </span>
                <ChevronDown className="w-4 h-4 text-sky-500" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL / VISOR DE FOTO MEJORADO */}
      {fotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setFotoModal(null)}
        >
          <div
            className="relative max-w-lg w-full theme-card border border-[var(--border-card)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[var(--border-card)]">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {fotoModal.comercio && (
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${obtenerEstiloComercio(fotoModal.comercio)}`}>
                      <Store className="w-3 h-3" />
                      <span>{fotoModal.comercio}</span>
                    </span>
                  )}
                  {fotoModal.precio > 0 && (
                    <span className="font-mono font-black text-xs text-emerald-600">
                      ${Number(fotoModal.precio).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-black theme-title truncate">
                  {fotoModal.producto}
                </h3>
                {fotoModal.marca && (
                  <p className="text-[11px] theme-muted font-bold">{fotoModal.marca}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFotoModal(null)}
                className="w-8 h-8 rounded-full theme-btn-sec border flex items-center justify-center theme-muted hover:theme-title transition shrink-0 cursor-pointer"
                title="Cerrar visor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 sm:p-3 bg-black/20 flex items-center justify-center overflow-auto flex-1">
              <img
                src={fotoModal.foto}
                alt={fotoModal.producto}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="p-2.5 sm:p-3 text-center border-t border-[var(--border-card)] theme-card-sub text-[11px] theme-muted flex items-center justify-between px-4">
              <span className="flex items-center gap-1.5 text-[11px] theme-muted font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Imagen de referencia del producto</span>
              </span>
              <button
                type="button"
                onClick={() => setFotoModal(null)}
                className="text-sky-600 font-bold hover:underline cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / FICHA DE UBICACIÓN Y GOOGLE MAPS */}
      {comercioModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setComercioModal(null)}
        >
          <div
            className="relative max-w-sm w-full theme-card border border-[var(--border-card)] rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 border-b border-[var(--border-card)] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0 border border-sky-500/30">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${obtenerEstiloComercio(comercioModal.nombre)}`}>
                    Comercio
                  </span>
                  <h3 className="text-sm font-black theme-title truncate mt-0.5">
                    {comercioModal.nombre}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setComercioModal(null)}
                className="w-7 h-7 rounded-full theme-btn-sec border flex items-center justify-center theme-muted hover:theme-title cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 theme-subtitle">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold">
                  {comercioModal.direccion || 'San Carlos de Bariloche'}
                </span>
              </div>

              {comercioModal.distancia && (
                <p className="text-[11px] text-sky-400 font-bold pl-6">
                  A solo {comercioModal.distancia} de tu ubicación actual
                </p>
              )}
            </div>

            <div className="pt-2">
              <a
                href={
                  comercioModal.lat && comercioModal.lng
                    ? `https://www.google.com/maps/search/?api=1&query=${comercioModal.lat},${comercioModal.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comercioModal.nombre + ' San Carlos de Bariloche')}`
                }
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
      )}

      {/* BARRA FLOTANTE INFERIOR */}
      {changuito.length > 0 && modoVista !== 'milista' && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-40">
          <div className="theme-card backdrop-blur-md border border-sky-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-500 shrink-0 relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {changuito.length}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black theme-title truncate">
                  Tu Lista de Compras ({changuito.length} ítems)
                </p>
                {simulacionChanguito?.ganador && (
                  <p className="text-[11px] text-emerald-600 font-bold truncate">
                    Conviene en {simulacionChanguito.ganador.comercio} (${simulacionChanguito.ganador.totalEstimado.toLocaleString('es-AR')})
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setModoVista('milista')}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Ver Lista</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}