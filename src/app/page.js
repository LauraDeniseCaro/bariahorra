'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Plus,
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Navigation,
  Fish,
  Snowflake,
  Leaf,
  Wheat,
  Smile,
  Calculator
} from 'lucide-react';

import FotoModal from '@/components/FotoModal';
import ComercioModal from '@/components/ComercioModal';
import GondolaCard from '@/components/GondolaCard';
import PreciosBomba from '@/components/PreciosBomba';
import ComparadorView from '@/components/ComparadorView';
import MiListaView from '@/components/MiListaView';

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
    acento: 'text-amber-500',
    cajaIcono: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    bordeBuscador: 'focus:border-amber-500/60'
  },
  Almacén: {
    icono: ShoppingCart,
    pillActiva: 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 border-emerald-400',
    acento: 'text-emerald-500',
    cajaIcono: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',
    bordeBuscador: 'focus:border-emerald-500/60'
  },
  Carnicería: {
    icono: Beef,
    pillActiva: 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 border-rose-400',
    acento: 'text-rose-500',
    cajaIcono: 'bg-rose-500/10 border-rose-500/25 text-rose-500',
    bordeBuscador: 'focus:border-rose-500/60'
  },
  'Pescados y Mariscos': {
    icono: Fish,
    pillActiva: 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 border-cyan-400',
    acento: 'text-cyan-500',
    cajaIcono: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-500',
    bordeBuscador: 'focus:border-cyan-500/60'
  },
  Congelados: {
    icono: Snowflake,
    pillActiva: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-indigo-400',
    acento: 'text-indigo-500',
    cajaIcono: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-500',
    bordeBuscador: 'focus:border-indigo-500/60'
  },
  Verdulería: {
    icono: Apple,
    pillActiva: 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/20 border-lime-300',
    acento: 'text-lime-500',
    cajaIcono: 'bg-lime-500/10 border-lime-500/25 text-lime-500',
    bordeBuscador: 'focus:border-lime-400/60'
  },
  Lácteos: {
    icono: Milk,
    pillActiva: 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/20 border-sky-300',
    acento: 'text-sky-500',
    cajaIcono: 'bg-sky-500/10 border-sky-500/25 text-sky-500',
    bordeBuscador: 'focus:border-sky-400/60'
  },
  Veggie: {
    icono: Leaf,
    pillActiva: 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 border-teal-400',
    acento: 'text-teal-500',
    cajaIcono: 'bg-teal-500/10 border-teal-500/25 text-teal-500',
    bordeBuscador: 'focus:border-teal-500/60'
  },
  'Sin TACC': {
    icono: Wheat,
    pillActiva: 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 border-yellow-400',
    acento: 'text-yellow-500',
    cajaIcono: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-500',
    bordeBuscador: 'focus:border-yellow-500/60'
  },
  'Higiene Personal': {
    icono: Smile,
    pillActiva: 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 border-fuchsia-400',
    acento: 'text-fuchsia-500',
    cajaIcono: 'bg-fuchsia-500/10 border-fuchsia-500/25 text-fuchsia-500',
    bordeBuscador: 'focus:border-fuchsia-500/60'
  },
  Limpieza: {
    icono: Sparkles,
    pillActiva: 'bg-violet-500 text-white shadow-lg shadow-violet-500/25 border-violet-400',
    acento: 'text-violet-500',
    cajaIcono: 'bg-violet-500/10 border-violet-500/25 text-violet-500',
    bordeBuscador: 'focus:border-violet-500/60'
  },
  Bebidas: {
    icono: Wine,
    pillActiva: 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20 border-orange-400',
    acento: 'text-orange-500',
    cajaIcono: 'bg-orange-500/10 border-orange-500/25 text-orange-500',
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

function compartirOfertaWhatsApp(item) {
  const precioFormateado = Number(item._precio || 0).toLocaleString('es-AR');
  const unitario = item._refUnitario ? ` ($${item._refUnitario.valor} x ${item._refUnitario.unidad})` : '';

  const mensaje =
    `🛒 *¡Mirá este precio en Bariloche!*

*${item._producto}* (${item._marca})
🏪 *${item._cadena || item._comercio}*
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

  // Referencias para carruseles con drag
  const categoriasRef = useRef(null);
  const bombaRef = useRef(null);
  const popularesRef = useRef(null);
  const cadenasRef = useRef(null);

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

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      nombre: normalizarCadena(comercioNombre),
      direccion: direccion,
      lat: lat,
      lng: lng,
      distancia: distancia
    });
  };

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
      () => {
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
      alert(
        'Para instalar BariAhorra:\n• En Android: Tocá los 3 puntos y seleccioná "Instalar aplicación".\n• En iPhone (Safari): Tocá Compartir y elegí "Agregar a inicio".'
      );
    }
  };

  const cerrarBanner = () => {
    setMostrarBannerInstalar(false);
    localStorage.setItem('bariahorra_banner_instalado', 'true');
  };

  const obtenerSesionYOfertas = async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
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

        // 1. Buscamos el apodo elegido por el usuario en la tabla perfiles (priorizando apodo y username)
        let apodoAutor =
          perfRel?.apodo ||
          perfRel?.username ||
          '';

        // 2. Si es el usuario actual conectado y en perfiles aún no figura, usamos su metadata
        if (!apodoAutor && userActual && String(userActual.id).toLowerCase() === userId) {
          apodoAutor =
            userActual.user_metadata?.apodo ||
            userActual.user_metadata?.username ||
            userActual.email?.split('@')[0] ||
            '';
        }

        // 3. Si sigue vacío, queda como anónimo
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
          _votosNegativos: votosNeg
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
        votos_negativos: nuevoNegativo
      };
      if (pasaARevision) {
        payloadUpdate.estado = 'en_revision';
        payloadUpdate.motivo_revision = 'Reportado como aumentado por varios vecinos';
      }

      const { error } = await supabase.from('ofertas').update(payloadUpdate).eq('id', oferta.id);

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
          mostrarToast('¡Precio confirmado! Gracias por colaborar.');
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

      if (diferenciaPorcentual > 0.5) {
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
        mejorComercio: normalizarCadena(mejor?._comercio || ''),
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
              Instalá <span className="text-sky-500 font-black">BariAhorra</span> en tu pantalla de inicio
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

      {/* BUSCADOR */}
      <div className="space-y-1.5 relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${estiloCatActiva.acento}`}
            />
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

        {/* NUBE DE TÉRMINOS POPULARES */}
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

      {/* FILTRO DE SUPERMERCADOS */}
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
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 border ${activa
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
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-bold transition text-xs cursor-pointer flex items-center gap-1.5 border shrink-0 ${activa ? conf.pillActiva : 'theme-btn-sec hover:border-slate-400'
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

      {/* COMPONENTE: PRECIOS BOMBA */}
      {busqueda === '' &&
        categoriaActiva === 'Todos' &&
        cadenaActiva === 'Todos' &&
        modoVista === 'gondola' && (
          <PreciosBomba
            ofertasBomba={ofertasBomba}
            bombaRef={bombaRef}
            iniciarArrastre={iniciarArrastre}
            manejarRuedaHorizontal={manejarRuedaHorizontal}
            desplazarBomba={desplazarBomba}
            abrirUbicacionComercio={abrirUbicacionComercio}
            dragInfoRef={dragInfoRef}
            CONFIG_CATEGORIAS={CONFIG_CATEGORIAS}
            obtenerEstiloComercio={obtenerEstiloComercio}
          />
        )}

      {/* BARRA DE NAVEGACIÓN Y TABS */}
      <div className="theme-card border rounded-2xl p-1.5 sm:p-2.5 shadow-sm space-y-1.5 sm:space-y-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setModoVista('gondola')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer select-none ${modoVista === 'gondola'
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
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer select-none ${modoVista === 'comparar'
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
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer select-none ${modoVista === 'milista'
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
                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition cursor-pointer active:scale-95 shrink-0 ${userCoords
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

      {/* FEED PRINCIPAL */}
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
        /* COMPONENTE: MI LISTA */
        <MiListaView
          changuito={changuito}
          simulacionChanguito={simulacionChanguito}
          modoCompraActivo={modoCompraActivo}
          setModoCompraActivo={setModoCompraActivo}
          itemsTachados={itemsTachados}
          toggleItemTachado={toggleItemTachado}
          toggleProductoChanguito={toggleProductoChanguito}
          limpiarChanguito={limpiarChanguito}
          compartirListaWhatsApp={compartirListaWhatsApp}
          setModoVista={setModoVista}
          obtenerEstiloComercio={obtenerEstiloComercio}
        />
      ) : modoVista === 'comparar' ? (
        /* COMPONENTE: COMPARADOR */
        <ComparadorView
          productosComparados={productosComparados}
          limiteVisibles={limiteVisibles}
          setLimiteVisibles={setLimiteVisibles}
          cantidadPorPagina={CANTIDAD_POR_PAGINA}
          changuito={changuito}
          toggleProductoChanguito={toggleProductoChanguito}
          setFotoModal={setFotoModal}
          abrirUbicacionComercio={abrirUbicacionComercio}
          tiempoRelativo={tiempoRelativo}
          CONFIG_CATEGORIAS={CONFIG_CATEGORIAS}
          obtenerEstiloComercio={obtenerEstiloComercio}
        />
      ) : (
        /* VISTA GÓNDOLA: TARJETAS MODULARIZADAS */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ofertasVisibles.map((item) => {
              const confRubro = CONFIG_CATEGORIAS[item._rubro] || CONFIG_CATEGORIAS.Almacén;
              const claveVoto = obtenerClaveVoto(item.id, item._precio);
              const votoActual = votosRealizados[claveVoto];
              const esMejorPrecio = mejoresPreciosIds.has(item.id);
              const enChanguito = changuito.includes(item._claveProducto);

              return (
                <GondolaCard
                  key={item.id}
                  item={item}
                  confRubro={confRubro}
                  esMejorPrecio={esMejorPrecio}
                  enChanguito={enChanguito}
                  votoActual={votoActual}
                  confirmandoId={confirmandoId}
                  editandoPrecioId={editandoPrecioId}
                  setEditandoPrecioId={setEditandoPrecioId}
                  nuevoPrecioInput={nuevoPrecioInput}
                  setNuevoPrecioInput={setNuevoPrecioInput}
                  guardandoPrecio={guardandoPrecio}
                  handleProponerNuevoPrecio={handleProponerNuevoPrecio}
                  handleConfirmar={handleConfirmar}
                  toggleProductoChanguito={toggleProductoChanguito}
                  abrirUbicacionComercio={abrirUbicacionComercio}
                  compartirOfertaWhatsApp={compartirOfertaWhatsApp}
                  setFotoModal={setFotoModal}
                  tiempoRelativo={tiempoRelativo}
                  obtenerEstiloComercio={obtenerEstiloComercio}
                />
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

      {/* COMPONENTES MODALES MODULARIZADOS */}
      <FotoModal
        modalData={fotoModal}
        alCerrar={() => setFotoModal(null)}
        obtenerEstiloComercio={obtenerEstiloComercio}
      />

      <ComercioModal
        comercioModal={comercioModal}
        alCerrar={() => setComercioModal(null)}
        obtenerEstiloComercio={obtenerEstiloComercio}
      />

      {/* BARRA FLOTANTE INFERIOR: CHANGUITO */}
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
                  <p className="text-[11px] text-emerald-500 font-bold truncate">
                    Conviene en {simulacionChanguito.ganador.comercio} ($
                    {simulacionChanguito.ganador.totalEstimado.toLocaleString('es-AR')})
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