'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { subirImagenImageKit } from '@/lib/imagekit';
import {
  ArrowLeft,
  X,
  Tag,
  Store,
  Camera,
  Image as ImageIcon,
  Plus,
  Star,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Building2
} from 'lucide-react';

// DICCIONARIOS DE SUGERENCIAS Y RECONOCIMIENTO
const DICCIONARIO_RUBROS = {
  Carnicería: ['lomo', 'bola de lomo', 'asado', 'vacio', 'picada', 'carne', 'pollo', 'milanesa', 'nalga', 'peceto', 'bife', 'matambre', 'costilla', 'pechuga'],
  Lácteos: ['leche', 'yogur', 'queso', 'manteca', 'crema', 'dulce de leche', 'sachet', 'untable', 'ricota'],
  Verdulería: ['papa', 'tomate', 'cebolla', 'zanahoria', 'manzana', 'banana', 'lechuga', 'palta', 'naranja', 'limon', 'zapallo', 'morron', 'acelga'],
  Bebidas: ['agua', 'gaseosa', 'coca', 'pepsi', 'cerveza', 'vino', 'jugo', 'soda', 'fernet', 'aperitivo'],
  Limpieza: ['jabon', 'detergente', 'lavandina', 'papel higienico', 'rollo', 'suavizante', 'desinfectante', 'shampoo', 'dentifrico', 'cif']
};

// REGLAS INTELIGENTES DE AUTOCOMPLETADO DE UNIDAD Y TAMAÑO
const REGLAS_UNIDAD_CANTIDAD = [
  { palabras: ['leche', 'yogur', 'sachet'], cantidad: '1', unidad: 'l' },
  { palabras: ['aceite'], cantidad: '900', unidad: 'ml' },
  { palabras: ['crema'], cantidad: '200', unidad: 'ml' },
  { palabras: ['agua', 'gaseosa', 'coca', 'pepsi', 'soda', 'jugo'], cantidad: '1.5', unidad: 'l' },
  { palabras: ['cerveza', 'vino'], cantidad: '1', unidad: 'l' },
  { palabras: ['fideos', 'tallarines', 'guiseros'], cantidad: '500', unidad: 'gr' },
  { palabras: ['arroz', 'harina', 'azucar', 'azúcar', 'yerba'], cantidad: '1', unidad: 'kg' },
  { palabras: ['manteca', 'galletitas', 'galletita', 'bizcochitos'], cantidad: '200', unidad: 'gr' },
  { palabras: ['queso', 'dulce de leche'], cantidad: '500', unidad: 'gr' },
  { palabras: ['lomo', 'asado', 'vacio', 'picada', 'carne', 'pollo', 'milanesa', 'nalga', 'peceto', 'bife'], cantidad: '1', unidad: 'kg' },
  { palabras: ['papa', 'tomate', 'cebolla', 'zanahoria', 'manzana', 'banana', 'naranja', 'limon'], cantidad: '1', unidad: 'kg' },
  { palabras: ['huevos', 'huevo'], cantidad: '12', unidad: 'u' },
  { palabras: ['rollo', 'rollos', 'papel higienico', 'papel higiénico'], cantidad: '4', unidad: 'u' },
  { palabras: ['detergente'], cantidad: '500', unidad: 'ml' },
  { palabras: ['lavandina', 'suavizante', 'jabon liquido'], cantidad: '1', unidad: 'l' }
];

const PRODUCTOS_SUGERIDOS = [
  'Leche entera sachet',
  'Leche descremada sachet',
  'Aceite de girasol',
  'Harina de trigo 000',
  'Harina de trigo 0000',
  'Fideos guiseros',
  'Fideos tallarines',
  'Arroz largo fino',
  'Azúcar común tipo A',
  'Yerba mate tradicional',
  'Café molido torrado',
  'Manteca',
  'Queso cremoso',
  'Queso rallado',
  'Bola de lomo para milanesas',
  'Nalga para milanesas',
  'Asado de tira',
  'Carne picada especial',
  'Pechuga de pollo fresca',
  'Huevos blancos x 12',
  'Tomate redondo',
  'Papa negra',
  'Cebolla',
  'Zanahoria',
  'Manzana deliciosa',
  'Banana',
  'Agua mineral sin gas',
  'Gaseosa cola',
  'Cerveza rubia',
  'Jabón líquido para ropa',
  'Detergente lavavajillas',
  'Lavandina común',
  'Papel higiénico hoja simple',
  'Rollos de cocina'
];

const MARCAS_SUGERIDAS = [
  'La Serenísima',
  'Sancor',
  'Ilolay',
  'Tregar',
  'Marolio',
  'Molto',
  'Cocinero',
  'Natura',
  'Cañuelas',
  'Pureza',
  'Favorita',
  'Matarazzo',
  'Lucchetti',
  'Terrabusi',
  'Bagley',
  'Arcor',
  'Taragüí',
  'Playadito',
  'Amanda',
  'Cruz de Malta',
  'La Virginia',
  'Nescafé',
  'Quilmes',
  'Brahma',
  'Heineken',
  'Stella Artois',
  'Coca-Cola',
  'Pepsi',
  'Ala',
  'Ariel',
  'Skip',
  'Magistral',
  'Cif',
  'Ayudín',
  'Higienol',
  'Elite',
  'Campagnola'
];

const COMERCIOS_SUGERIDOS = [
  'La Anónima',
  'ChangoMás',
  'Diarco',
  'Todo',
  'Carrefour Express',
  'La Cooperativa Obrera',
  'Distribuidora Albarracín',
  'Carnicería Don Tito',
  'Verdulería Los Hermanos'
];

export default function CargarPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);

  const [esCatalogo, setEsCatalogo] = useState(false);
  const [producto, setProducto] = useState('');
  const [marca, setMarca] = useState('');
  const [rubro, setRubro] = useState('Súper');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('ml');
  const [comercio, setComercio] = useState('');
  const [precio, setPrecio] = useState('');

  const [sugerenciasProducto, setSugerenciasProducto] = useState([]);
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false);
  const [indiceProductoActivo, setIndiceProductoActivo] = useState(0);

  const [sugerenciasMarca, setSugerenciasMarca] = useState([]);
  const [mostrarDropdownMarca, setMostrarDropdownMarca] = useState(false);
  const [indiceMarcaActivo, setIndiceMarcaActivo] = useState(0);

  const [comerciosLista, setComerciosLista] = useState(COMERCIOS_SUGERIDOS);
  const [sugerenciasComercio, setSugerenciasComercio] = useState([]);
  const [mostrarDropdownComercio, setMostrarDropdownComercio] = useState(false);
  const [indiceComercioActivo, setIndiceComercioActivo] = useState(0);

  const [archivoFoto, setArchivoFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const inputCamaraRef = useRef(null);
  const inputGaleriaRef = useRef(null);

  useEffect(() => {
    comprobarAdmin();
  }, []);

  const comprobarAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUsuario(session.user);
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('es_admin, rol')
          .eq('id', session.user.id)
          .single();

        if (perfil?.es_admin === true || perfil?.rol === 'admin') {
          setEsAdmin(true);
        }
      }
    } catch (err) {
      console.error('Error comprobando permisos:', err);
    }
  };

  // Autocompletado inteligente de Rubro, Cantidad y Unidad al cambiar el Producto
  const aplicarInferenciaProducto = (textoProd) => {
    const texto = textoProd.toLowerCase();

    // 1. Detectar Rubro
    let detectado = 'Súper';
    for (const [cat, palabras] of Object.entries(DICCIONARIO_RUBROS)) {
      if (palabras.some((p) => texto.includes(p))) {
        detectado = cat;
        break;
      }
    }
    setRubro(detectado);

    // 2. Pre-llenar Cantidad y Unidad automáticamente
    for (const regla of REGLAS_UNIDAD_CANTIDAD) {
      if (regla.palabras.some((p) => texto.includes(p))) {
        setCantidad(regla.cantidad);
        setUnidad(regla.unidad);
        break;
      }
    }
  };

  // --- AUTOCOMPLETADO: PRODUCTO ---
  const handleCambioProducto = (e) => {
    const valor = e.target.value;
    setProducto(valor);
    aplicarInferenciaProducto(valor);

    if (valor.trim().length > 0) {
      const filtrados = PRODUCTOS_SUGERIDOS.filter((p) =>
        p.toLowerCase().includes(valor.toLowerCase())
      );
      setSugerenciasProducto(filtrados);
      setMostrarDropdownProducto(filtrados.length > 0);
      setIndiceProductoActivo(0);
    } else {
      setMostrarDropdownProducto(false);
    }
  };

  const seleccionarProducto = (nombre) => {
    setProducto(nombre);
    aplicarInferenciaProducto(nombre);
    setMostrarDropdownProducto(false);
  };

  const handleKeyDownProducto = (e) => {
    if (!mostrarDropdownProducto || sugerenciasProducto.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceProductoActivo((prev) => (prev + 1) % sugerenciasProducto.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceProductoActivo((prev) => (prev - 1 + sugerenciasProducto.length) % sugerenciasProducto.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      seleccionarProducto(sugerenciasProducto[indiceProductoActivo]);
    } else if (e.key === 'Escape') {
      setMostrarDropdownProducto(false);
    }
  };

  // --- AUTOCOMPLETADO: MARCA ---
  const handleCambioMarca = (e) => {
    const valor = e.target.value;
    setMarca(valor);
    if (valor.trim().length > 0) {
      const filtrados = MARCAS_SUGERIDAS.filter((m) =>
        m.toLowerCase().includes(valor.toLowerCase())
      );
      setSugerenciasMarca(filtrados);
      setMostrarDropdownMarca(filtrados.length > 0);
      setIndiceMarcaActivo(0);
    } else {
      setMostrarDropdownMarca(false);
    }
  };

  const seleccionarMarca = (nombre) => {
    setMarca(nombre);
    setMostrarDropdownMarca(false);
  };

  const handleKeyDownMarca = (e) => {
    if (!mostrarDropdownMarca || sugerenciasMarca.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceMarcaActivo((prev) => (prev + 1) % sugerenciasMarca.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceMarcaActivo((prev) => (prev - 1 + sugerenciasMarca.length) % sugerenciasMarca.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      seleccionarMarca(sugerenciasMarca[indiceMarcaActivo]);
    } else if (e.key === 'Escape') {
      setMostrarDropdownMarca(false);
    }
  };

  // --- AUTOCOMPLETADO: COMERCIO ---
  const handleCambioComercio = (e) => {
    const valor = e.target.value;
    setComercio(valor);
    if (valor.trim().length > 0) {
      const filtrados = comerciosLista.filter((c) =>
        c.toLowerCase().includes(valor.toLowerCase())
      );
      setSugerenciasComercio(filtrados);
      setMostrarDropdownComercio(true);
      setIndiceComercioActivo(0);
    } else {
      setMostrarDropdownComercio(false);
    }
  };

  const seleccionarComercio = (nombre) => {
    setComercio(nombre);
    if (!comerciosLista.includes(nombre)) {
      setComerciosLista((prev) => [...prev, nombre]);
    }
    setMostrarDropdownComercio(false);
  };

  const handleKeyDownComercio = (e) => {
    if (!mostrarDropdownComercio) return;
    const total = sugerenciasComercio.length + 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceComercioActivo((prev) => (prev + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceComercioActivo((prev) => (prev - 1 + total) % total);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceComercioActivo < sugerenciasComercio.length) {
        seleccionarComercio(sugerenciasComercio[indiceComercioActivo]);
      } else {
        seleccionarComercio(comercio.trim());
      }
    } else if (e.key === 'Escape') {
      setMostrarDropdownComercio(false);
    }
  };

  // --- FOTOS ---
  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const eliminarFoto = () => {
    setArchivoFoto(null);
    setFotoPreview(null);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje('');

    if (!producto.trim()) {
      setErrorMensaje('Completá el nombre del producto.');
      return;
    }
    if (!comercio.trim()) {
      setErrorMensaje('Seleccioná o escribí el supermercado o comercio.');
      return;
    }
    if (!precio || isNaN(precio) || Number(precio) <= 0) {
      setErrorMensaje('Ingresá un precio válido mayor a 0.');
      return;
    }

    setEnviando(true);
    try {
      // Obtener el usuario autenticado activo fresco de Supabase
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || usuario?.id || null;

      // 1. Subir foto optimizada a ImageKit (si seleccionó una)
      let urlFotoSubida = null;
      if (archivoFoto) {
        setSubiendoFoto(true);
        urlFotoSubida = await subirImagenImageKit(archivoFoto);
        setSubiendoFoto(false);
      }

      // 2. Obtener o crear el COMERCIO en la tabla 'comercios'
      const nombreComercio = comercio.trim();
      let comId = null;

      const { data: comExistente } = await supabase
        .from('comercios')
        .select('id')
        .ilike('nombre', nombreComercio)
        .maybeSingle();

      if (comExistente?.id) {
        comId = comExistente.id;
      } else {
        const { data: nuevoCom, error: errCom } = await supabase
          .from('comercios')
          .insert([{ nombre: nombreComercio }])
          .select('id')
          .single();

        if (errCom) throw new Error(`Error en comercio: ${errCom.message}`);
        comId = nuevoCom?.id;
      }

      // 3. Obtener o crear el PRODUCTO en la tabla 'productos'
      let nombreProd = producto.trim();
      const cantLimpia = cantidad.trim();
      if (cantLimpia && !nombreProd.toLowerCase().includes(cantLimpia.toLowerCase())) {
        nombreProd = `${nombreProd} ${cantLimpia}${unidad || ''}`;
      }

      let prodId = null;
      const { data: prodExistente } = await supabase
        .from('productos')
        .select('id')
        .ilike('nombre', nombreProd)
        .maybeSingle();

      if (prodExistente?.id) {
        prodId = prodExistente.id;
      } else {
        const payloadProd = {
          nombre: nombreProd
        };
        // Si tu tabla productos tiene marca o categoria, las mandamos sin romper
        if (marca.trim()) payloadProd.marca = marca.trim();

        const { data: nuevoProd, error: errProd } = await supabase
          .from('productos')
          .insert([payloadProd])
          .select('id')
          .single();

        if (errProd) throw new Error(`Error en producto: ${errProd.message}`);
        prodId = nuevoProd?.id;
      }

      // 4. Insertar en la tabla 'ofertas' EXACTAMENTE con sus columnas
      const payloadOferta = {
        producto_id: prodId,
        comercio_id: comId,
        precio: Number(precio),
        foto_url: urlFotoSubida,
        usuario_id: userId
      };

      const { error: errOferta } = await supabase
        .from('ofertas')
        .insert([payloadOferta]);

      if (errOferta) {
        throw new Error(errOferta.message || JSON.stringify(errOferta));
      }

      // 5. Sumar puntos al perfil si el usuario está logueado
      if (userId) {
        try {
          const { data: perf } = await supabase
            .from('perfiles')
            .select('puntos, precios_aportados')
            .eq('id', userId)
            .maybeSingle();

          if (perf) {
            await supabase
              .from('perfiles')
              .update({
                puntos: (perf.puntos || 0) + 10,
                precios_aportados: (perf.precios_aportados || 0) + 1
              })
              .eq('id', userId);
          }
        } catch (ePuntos) {
          console.warn('Aviso sumando puntos:', ePuntos);
        }
      }

      // Éxito: volver a la página principal
      router.push('/');
    } catch (err) {
      console.error('Error al guardar oferta:', err);
      setErrorMensaje(err.message || 'No se pudo guardar la oferta.');
    } finally {
      setEnviando(false);
      setSubiendoFoto(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-100 flex justify-center selection:bg-sky-500 selection:text-white p-4 sm:py-8">
      <div className="w-full max-w-lg flex flex-col space-y-3">

        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a las ofertas</span>
          </Link>
        </div>

        <div className="bg-[#121826] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative">

          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                Aportar precio
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingresá el producto visto en góndola en Bariloche
              </p>
            </div>

            <Link
              href="/"
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition"
              title="Cancelar y volver"
            >
              <X className="w-4 h-4" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {esAdmin && (
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#182133] border border-amber-500/30 cursor-pointer hover:border-amber-500/50 transition">
                <input
                  type="checkbox"
                  checked={esCatalogo}
                  onChange={(e) => setEsCatalogo(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Marcar como precio oficial de catálogo</span>
                </div>
              </label>
            )}

            {/* Producto con sugerencias y auto-llenado */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">Producto genérico</label>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  Rubro: {rubro}
                </span>
              </div>
              <input
                type="text"
                value={producto}
                onChange={handleCambioProducto}
                onKeyDown={handleKeyDownProducto}
                onFocus={() => producto.trim() && sugerenciasProducto.length > 0 && setMostrarDropdownProducto(true)}
                placeholder="Ej: Leche descremada, Aceite, Fideos..."
                className="w-full bg-[#182133] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />

              {mostrarDropdownProducto && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#182133] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {sugerenciasProducto.map((sug, idx) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => seleccionarProducto(sug)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${idx === indiceProductoActivo
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                      <span>{sug}</span>
                      {idx === indiceProductoActivo && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Marca */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-300 mb-1">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={handleCambioMarca}
                onKeyDown={handleKeyDownMarca}
                onFocus={() => marca.trim() && sugerenciasMarca.length > 0 && setMostrarDropdownMarca(true)}
                placeholder="Ej: Cocinero, La Serenísima, Gallo..."
                className="w-full bg-[#182133] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />

              {mostrarDropdownMarca && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#182133] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {sugerenciasMarca.map((sug, idx) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => seleccionarMarca(sug)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${idx === indiceMarcaActivo
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                      <span>{sug}</span>
                      {idx === indiceMarcaActivo && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tamaño y Unidad autocompletados */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tamaño / Presentación</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej: 500, 1, 900"
                  className="flex-1 bg-[#182133] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition font-bold"
                />
                <select
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  className="w-24 bg-[#182133] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer font-bold"
                >
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="gr">gr</option>
                  <option value="kg">kg</option>
                  <option value="u">u</option>
                </select>
              </div>
            </div>

            {/* Comercio y Precio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-bold text-slate-300 mb-1">Supermercado o comercio</label>
                <div className="relative">
                  <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={comercio}
                    onChange={handleCambioComercio}
                    onKeyDown={handleKeyDownComercio}
                    onFocus={() => comercio.trim() && setMostrarDropdownComercio(true)}
                    placeholder="Escribí: La Anónima, Diarco..."
                    className="w-full bg-[#182133] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {mostrarDropdownComercio && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#182133] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {sugerenciasComercio.map((sug, idx) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => seleccionarComercio(sug)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between ${idx === indiceComercioActivo
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'text-slate-200 hover:bg-slate-800'
                          }`}
                      >
                        <span>{sug}</span>
                        {idx === indiceComercioActivo && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                    {comercio.trim() && !sugerenciasComercio.includes(comercio.trim()) && (
                      <button
                        type="button"
                        onClick={() => seleccionarComercio(comercio.trim())}
                        className="w-full text-left px-3.5 py-2 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-t border-slate-700 flex items-center gap-1.5 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar "{comercio.trim()}" como nuevo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Precio en góndola</label>
                <div className="relative">
                  <span className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#182133] border border-slate-700 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Subida de Fotos */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Foto del precio / góndola <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>

              <input
                type="file"
                ref={inputCamaraRef}
                accept="image/*"
                capture="environment"
                onChange={handleArchivoSeleccionado}
                className="hidden"
              />
              <input
                type="file"
                ref={inputGaleriaRef}
                accept="image/*"
                onChange={handleArchivoSeleccionado}
                className="hidden"
              />

              {fotoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 h-32 flex items-center justify-center">
                  <img src={fotoPreview} alt="Vista previa" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={eliminarFoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white transition shadow-lg"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => inputCamaraRef.current?.click()}
                    className="p-3 rounded-2xl bg-[#182133] border border-slate-700/80 hover:border-slate-600 flex flex-col items-center justify-center gap-1 text-slate-300 transition"
                  >
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white">Sacar foto</span>
                    <span className="text-[10px] text-slate-400">Cámara del celular</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => inputGaleriaRef.current?.click()}
                    className="p-3 rounded-2xl bg-[#182133] border border-slate-700/80 hover:border-slate-600 flex flex-col items-center justify-center gap-1 text-slate-300 transition"
                  >
                    <ImageIcon className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold text-white">De galería</span>
                    <span className="text-[10px] text-slate-400">Elegir archivo</span>
                  </button>
                </div>
              )}
            </div>

            {errorMensaje && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMensaje}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <Link
                href="/"
                className="w-1/3 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs text-center transition"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={enviando || subiendoFoto}
                className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {enviando || subiendoFoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{subiendoFoto ? 'Comprimiendo y subiendo...' : 'Publicando...'}</span>
                  </>
                ) : (
                  <span>Publicar Oferta</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}