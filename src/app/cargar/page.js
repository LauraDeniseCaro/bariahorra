'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { subirImagenImageKit } from '@/lib/imagekit';
import {
  ArrowLeft,
  X,
  Store,
  Camera,
  Image as ImageIcon,
  Plus,
  AlertCircle,
  Loader2,
  Trash2,
  ShoppingCart,
  Beef,
  Apple,
  Milk,
  Sparkles,
  Wine,
  ShieldCheck,
  Check
} from 'lucide-react';

const CONFIG_RUBROS = {
  Súper: { icono: ShoppingCart, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', acento: 'text-emerald-400' },
  Carnicería: { icono: Beef, color: 'bg-rose-500/15 text-rose-400 border-rose-500/40', acento: 'text-rose-400' },
  Verdulería: { icono: Apple, color: 'bg-lime-500/15 text-lime-400 border-lime-500/40', acento: 'text-lime-400' },
  Lácteos: { icono: Milk, color: 'bg-sky-500/15 text-sky-400 border-sky-500/40', acento: 'text-sky-400' },
  Limpieza: { icono: Sparkles, color: 'bg-violet-500/15 text-violet-400 border-violet-500/40', acento: 'text-violet-400' },
  Bebidas: { icono: Wine, color: 'bg-orange-500/15 text-orange-400 border-orange-500/40', acento: 'text-orange-400' }
};

const DICCIONARIO_RUBROS = {
  Carnicería: ['lomo', 'bola de lomo', 'asado', 'vacio', 'picada', 'carne', 'pollo', 'milanesa', 'nalga', 'peceto', 'bife', 'matambre', 'costilla', 'pechuga'],
  Lácteos: ['leche', 'yogur', 'queso', 'manteca', 'crema', 'dulce de leche', 'sachet', 'untable', 'ricota', 'postrecito'],
  Verdulería: ['papa', 'tomate', 'cebolla', 'zanahoria', 'manzana', 'banana', 'lechuga', 'palta', 'naranja', 'limon', 'zapallo', 'morron', 'acelga'],
  Bebidas: ['agua', 'gaseosa', 'coca', 'pepsi', 'cerveza', 'vino', 'jugo', 'soda', 'fernet', 'aperitivo'],
  Limpieza: ['jabon', 'detergente', 'lavandina', 'papel higienico', 'rollo', 'suavizante', 'desinfectante', 'shampoo', 'dentifrico', 'cif']
};

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

const UNIDADES = ['ml', 'l', 'gr', 'kg', 'u'];

export default function CargarPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [esCatalogo, setEsCatalogo] = useState(false);

  const [productosData, setProductosData] = useState([]);
  const [productosLista, setProductosLista] = useState([]);
  const [comerciosLista, setComerciosLista] = useState([]);

  const [producto, setProducto] = useState('');
  const [marca, setMarca] = useState('');
  const [rubro, setRubro] = useState('Súper');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('kg');
  const [comercio, setComercio] = useState('');
  const [precio, setPrecio] = useState('');

  const [sugerenciasProducto, setSugerenciasProducto] = useState([]);
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false);

  const [sugerenciasMarca, setSugerenciasMarca] = useState([]);
  const [mostrarDropdownMarca, setMostrarDropdownMarca] = useState(false);

  const [sugerenciasComercio, setSugerenciasComercio] = useState([]);
  const [mostrarDropdownComercio, setMostrarDropdownComercio] = useState(false);

  const [archivoFoto, setArchivoFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [analizandoIA, setAnalizandoIA] = useState(false);
  const [avisoIA, setAvisoIA] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const inputCamaraRef = useRef(null);
  const inputGaleriaRef = useRef(null);

  useEffect(() => {
    comprobarUsuarioYDatos();
    if (typeof window !== 'undefined' && window.location.search.includes('catalogo=1')) {
      setEsCatalogo(true);
    }
  }, []);

  const comprobarUsuarioYDatos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUsuario(session.user);
      }

      const [resComercios, resProductos] = await Promise.all([
        supabase.from('comercios').select('nombre'),
        supabase.from('productos').select('nombre, marca, categoria, cantidad, unidad_medida')
      ]);

      if (resComercios.data) {
        const nombresComercios = [...new Set(resComercios.data.map((c) => c.nombre).filter(Boolean))];
        setComerciosLista(nombresComercios);
      }
      if (resProductos.data) {
        setProductosData(resProductos.data);
        const nombresProductos = [...new Set(resProductos.data.map((p) => p.nombre).filter(Boolean))];
        setProductosLista(nombresProductos);
      }
    } catch (err) {
      console.error('Error inicializando datos:', err);
    }
  };

  const aplicarInferenciaProducto = (textoProd) => {
    const texto = textoProd.toLowerCase();
    let detectado = 'Súper';
    for (const [cat, palabras] of Object.entries(DICCIONARIO_RUBROS)) {
      if (palabras.some((p) => texto.includes(p))) {
        detectado = cat;
        break;
      }
    }
    setRubro(detectado);

    for (const regla of REGLAS_UNIDAD_CANTIDAD) {
      if (regla.palabras.some((p) => texto.includes(p))) {
        setCantidad(regla.cantidad);
        setUnidad(regla.unidad);
        break;
      }
    }
  };

  const handleCambioProducto = (e) => {
    const valor = e.target.value;
    setProducto(valor);
    aplicarInferenciaProducto(valor);

    if (valor.trim().length > 0) {
      const filtrados = productosLista.filter((p) => p.toLowerCase().includes(valor.toLowerCase()));
      setSugerenciasProducto(filtrados);
      setMostrarDropdownProducto(true);
    } else {
      setMostrarDropdownProducto(false);
    }
  };

  const seleccionarProducto = (nombre) => {
    setProducto(nombre);
    aplicarInferenciaProducto(nombre);
    const existente = productosData.find((p) => p.nombre?.toLowerCase() === nombre.toLowerCase());
    if (existente) {
      if (existente.marca) setMarca(existente.marca);
      if (existente.categoria) setRubro(existente.categoria);
      if (existente.cantidad) setCantidad(String(existente.cantidad));
      if (existente.unidad_medida) setUnidad(existente.unidad_medida);
    }
    setMostrarDropdownProducto(false);
  };

  const handleCambioMarca = (e) => {
    const valor = e.target.value;
    setMarca(valor);

    const marcasDelRubro = productosData
      .filter((p) => (rubro === 'Súper' || p.categoria === rubro) && p.marca)
      .map((p) => p.marca);

    const marcasUnicas = [...new Set(marcasDelRubro)];

    if (valor.trim().length > 0) {
      const filtrados = marcasUnicas.filter((m) => m.toLowerCase().includes(valor.toLowerCase()));
      setSugerenciasMarca(filtrados);
      setMostrarDropdownMarca(true);
    } else {
      setSugerenciasMarca(marcasUnicas.slice(0, 10));
      setMostrarDropdownMarca(marcasUnicas.length > 0);
    }
  };

  const seleccionarMarca = (nombre) => {
    setMarca(nombre);
    setMostrarDropdownMarca(false);
  };

  const handleCambioComercio = (e) => {
    const valor = e.target.value;
    setComercio(valor);
    if (valor.trim().length > 0) {
      const filtrados = comerciosLista.filter((c) => c.toLowerCase().includes(valor.toLowerCase()));
      setSugerenciasComercio(filtrados);
      setMostrarDropdownComercio(true);
    } else {
      setMostrarDropdownComercio(false);
    }
  };

  const seleccionarComercio = (nombre) => {
    setComercio(nombre);
    setMostrarDropdownComercio(false);
  };

  const analizarFotoConIA = async (file) => {
    setAnalizandoIA(true);
    setAvisoIA('');
    try {
      const form = new FormData();
      form.append('foto', file);

      const res = await fetch('/api/analizar-foto', {
        method: 'POST',
        body: form
      });

      const json = await res.json();

      if (json.ok && json.datos) {
        const d = json.datos;
        if (d.producto) setProducto(d.producto);
        if (d.marca) setMarca(d.marca);
        if (d.precio && !isNaN(d.precio)) setPrecio(String(d.precio));
        if (d.cantidad) setCantidad(String(d.cantidad));
        if (d.unidad_medida && UNIDADES.includes(d.unidad_medida.toLowerCase())) {
          setUnidad(d.unidad_medida.toLowerCase());
        }
        if (d.rubro && CONFIG_RUBROS[d.rubro]) {
          setRubro(d.rubro);
        } else if (d.producto) {
          aplicarInferenciaProducto(d.producto);
        }
        if (d.comercio) setComercio(d.comercio);

        setAvisoIA('¡Cartel leído con IA! Revisá los datos y confirmá.');
      } else {
        setAvisoIA('No pudimos leer todos los datos del cartel, pero podés completarlos a mano.');
      }
    } catch (err) {
      console.error('Error al analizar cartel con IA:', err);
      setAvisoIA('No se pudo analizar la foto automáticamente.');
    } finally {
      setAnalizandoIA(false);
    }
  };

  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoFoto(file);
      setFotoPreview(URL.createObjectURL(file));
      analizarFotoConIA(file);
    }
  };

  const eliminarFoto = () => {
    setArchivoFoto(null);
    setFotoPreview(null);
    setAvisoIA('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje('');

    if (!producto.trim() || !comercio.trim() || !precio || isNaN(precio) || Number(precio) <= 0) {
      setErrorMensaje('Completá el producto, el supermercado y un precio válido.');
      return;
    }

    setEnviando(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || usuario?.id || null;

      let urlFotoSubida = null;
      if (archivoFoto) {
        setSubiendoFoto(true);
        urlFotoSubida = await subirImagenImageKit(archivoFoto);
        setSubiendoFoto(false);
      }

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
        const { data: nuevoCom } = await supabase
          .from('comercios')
          .insert([{ nombre: nombreComercio }])
          .select('id')
          .single();
        comId = nuevoCom?.id;
      }

      let nombreProd = producto.trim();
      const cantLimpia = cantidad.trim().replace(',', '.');
      const cantNum = parseFloat(cantLimpia);

      if (cantLimpia && !nombreProd.toLowerCase().includes(cantLimpia.toLowerCase())) {
        nombreProd = `${nombreProd} ${cantLimpia}${unidad || ''}`;
      }

      let prodId = null;
      let queryProd = supabase.from('productos').select('id').ilike('nombre', nombreProd);
      if (marca.trim()) {
        queryProd = queryProd.ilike('marca', marca.trim());
      }

      const { data: prodExistente } = await queryProd.maybeSingle();

      if (prodExistente?.id) {
        prodId = prodExistente.id;
      } else {
        const payloadProd = {
          nombre: nombreProd,
          categoria: rubro,
          marca: marca.trim() || null,
          cantidad: !isNaN(cantNum) && cantNum > 0 ? cantNum : null,
          unidad_medida: unidad || null
        };
        const { data: nuevoProd } = await supabase
          .from('productos')
          .insert([payloadProd])
          .select('id')
          .single();
        prodId = nuevoProd?.id;
      }

      const payloadOferta = {
        producto_id: prodId,
        comercio_id: comId,
        precio: Number(precio),
        foto_url: urlFotoSubida,
        usuario_id: userId,
        es_catalogo: esCatalogo,
        estado: esCatalogo ? 'catalogo' : 'activa',
        votos_positivos: esCatalogo ? 100 : 1,
        votos_negativos: 0
      };

      const { error: errOferta } = await supabase.from('ofertas').insert([payloadOferta]);
      if (errOferta) throw errOferta;

      if (userId && !esCatalogo) {
        try {
          const { data: perf } = await supabase
            .from('perfiles')
            .select('puntos')
            .eq('id', userId)
            .maybeSingle();
          if (perf) {
            await supabase
              .from('perfiles')
              .update({ puntos: (perf.puntos || 0) + 10 })
              .eq('id', userId);
          }
        } catch (e) { }
      }

      router.push('/');
    } catch (err) {
      console.error(err);
      setErrorMensaje('No se pudo guardar el precio. ' + (err.message || ''));
    } finally {
      setEnviando(false);
      setSubiendoFoto(false);
    }
  };

  const confRubroActivo = CONFIG_RUBROS[rubro] || CONFIG_RUBROS.Súper;
  const IconoRubroActivo = confRubroActivo.icono;

  return (
    <div className="min-h-screen flex justify-center p-4 sm:py-8">
      <div className="w-full max-w-lg flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs theme-muted hover:text-sky-400 transition font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a los precios</span>
          </Link>
        </div>

        <div className="theme-card border rounded-3xl p-5 sm:p-6 shadow-2xl relative">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-colors ${confRubroActivo.color}`}>
                <IconoRubroActivo className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black theme-title leading-tight">
                  Cargar precio
                </h1>
                <p className="text-xs theme-muted mt-0.5">
                  Subí una foto o cargá el valor a mano (+10 pts)
                </p>
              </div>
            </div>
            <Link href="/" className="p-1.5 rounded-xl theme-btn-sec border transition">
              <X className="w-4 h-4" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OPCIÓN CATÁLOGO OFICIAL */}
            {usuario && (
              <label className={`flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer transition ${esCatalogo
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                  : 'theme-card-sub border theme-subtitle hover:border-amber-500/30'
                }`}>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${esCatalogo ? 'text-amber-400' : 'theme-muted'}`} />
                  <div>
                    <p className="text-xs font-bold leading-tight theme-title">Marcar como Precio Oficial de Catálogo</p>
                    <p className="text-[10px] theme-muted">Queda verificado de una. Los vecinos solo podrán avisar si cambia.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={esCatalogo}
                  onChange={(e) => setEsCatalogo(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>
            )}

            {/* SECCIÓN DE FOTO CON LECTOR DE IA */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold theme-subtitle flex items-center gap-1.5">
                  <span>Foto del cartel de góndola</span>
                  <span className="text-[10px] bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Autocompleta con IA
                  </span>
                </label>
              </div>

              <input type="file" ref={inputCamaraRef} accept="image/*" capture="environment" onChange={handleArchivoSeleccionado} className="hidden" />
              <input type="file" ref={inputGaleriaRef} accept="image/*" onChange={handleArchivoSeleccionado} className="hidden" />

              {fotoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border theme-card-sub h-36 flex items-center justify-center">
                  <img src={fotoPreview} alt="Vista previa" className="h-full w-full object-cover" />

                  {analizandoIA && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                      <p className="text-xs font-black text-sky-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        Escaneando cartel con IA...
                      </p>
                      <p className="text-[10px] text-slate-400">Detectando producto, marca y precio en góndola</p>
                    </div>
                  )}

                  {!analizandoIA && (
                    <button
                      type="button"
                      onClick={eliminarFoto}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white transition shadow-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => inputCamaraRef.current?.click()}
                    className="p-3 rounded-2xl theme-card-sub border hover:border-amber-500/40 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold theme-title">Sacar foto al cartel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => inputGaleriaRef.current?.click()}
                    className="p-3 rounded-2xl theme-card-sub border hover:border-sky-500/40 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold theme-title">Subir de galería</span>
                  </button>
                </div>
              )}

              {avisoIA && (
                <div className="mt-2 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[11px] font-bold flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{avisoIA}</span>
                </div>
              )}
            </div>

            {/* PRODUCTO */}
            <div className="relative">
              <label className="block text-xs font-bold theme-subtitle mb-1.5">
                Producto
              </label>
              <input
                type="text"
                value={producto}
                onChange={handleCambioProducto}
                placeholder="Ej: Leche descremada, Bola de lomo, Aceite..."
                className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 transition shadow-sm"
              />
              {mostrarDropdownProducto && (
                <div className="absolute top-full left-0 right-0 mt-1 theme-card border rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {sugerenciasProducto.map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => seleccionarProducto(sug)}
                      className="w-full text-left px-3.5 py-2 text-xs theme-subtitle hover:theme-card-sub flex items-center justify-between"
                    >
                      <span>{sug}</span>
                    </button>
                  ))}
                  {producto.trim() && !productosLista.some((p) => p.toLowerCase() === producto.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => seleccionarProducto(producto.trim())}
                      className="w-full text-left px-3.5 py-2 text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-t border-slate-700/40 flex items-center gap-1.5 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar "{producto.trim()}" como nuevo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* PÍLDORAS DE RUBRO */}
            <div>
              <label className="block text-[11px] font-bold theme-muted mb-1.5">
                Rubro
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {Object.entries(CONFIG_RUBROS).map(([nombreRubro, conf]) => {
                  const Icono = conf.icono;
                  const activo = rubro === nombreRubro;
                  return (
                    <button
                      type="button"
                      key={nombreRubro}
                      onClick={() => setRubro(nombreRubro)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${activo
                          ? conf.color
                          : 'theme-btn-sec border theme-muted hover:theme-title'
                        }`}
                    >
                      <Icono className={`w-3.5 h-3.5 ${activo ? '' : conf.acento}`} />
                      <span>{nombreRubro}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MARCA */}
            <div className="relative">
              <label className="block text-xs font-bold theme-subtitle mb-1">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={handleCambioMarca}
                onFocus={(e) => handleCambioMarca(e)}
                onBlur={() => setTimeout(() => setMostrarDropdownMarca(false), 180)}
                placeholder="Ej: La Serenísima, Natura, Genérica..."
                className="w-full theme-input border rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 transition shadow-sm"
              />
              {mostrarDropdownMarca && (
                <div className="absolute top-full left-0 right-0 mt-1 theme-card border rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {sugerenciasMarca.map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => seleccionarMarca(sug)}
                      className="w-full text-left px-3.5 py-2 text-xs theme-subtitle hover:theme-card-sub flex items-center justify-between"
                    >
                      <span>{sug}</span>
                    </button>
                  ))}
                  {marca.trim() && !sugerenciasMarca.some((m) => m.toLowerCase() === marca.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => seleccionarMarca(marca.trim())}
                      className="w-full text-left px-3.5 py-2 text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-t border-slate-700/40 flex items-center gap-1.5 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Usar marca "{marca.trim()}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAMAÑO Y UNIDAD */}
            <div>
              <label className="block text-xs font-bold theme-subtitle mb-1.5">Tamaño / Presentación</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Cantidad (Ej: 1, 500, 900)"
                  className="flex-1 theme-input border rounded-xl px-3.5 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 transition font-bold shadow-sm"
                />
                <div className="grid grid-cols-5 gap-1 theme-card-sub p-1 rounded-xl border">
                  {UNIDADES.map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setUnidad(u)}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${unidad === u
                          ? 'bg-sky-500 text-slate-950 shadow'
                          : 'theme-muted hover:theme-title'
                        }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COMERCIO Y PRECIO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-bold theme-subtitle mb-1">Supermercado o comercio</label>
                <div className="relative">
                  <Store className="w-3.5 h-3.5 theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={comercio}
                    onChange={handleCambioComercio}
                    placeholder="La Anónima, Todo..."
                    className="w-full theme-input border rounded-xl pl-9 pr-3 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 transition shadow-sm"
                  />
                </div>
                {mostrarDropdownComercio && (
                  <div className="absolute top-full left-0 right-0 mt-1 theme-card border rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {sugerenciasComercio.map((sug) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => seleccionarComercio(sug)}
                        className="w-full text-left px-3.5 py-2 text-xs theme-subtitle hover:theme-card-sub"
                      >
                        <span>{sug}</span>
                      </button>
                    ))}
                    {comercio.trim() && !comerciosLista.some((c) => c.toLowerCase() === comercio.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => seleccionarComercio(comercio.trim())}
                        className="w-full text-left px-3.5 py-2 text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-t border-slate-700/40 flex items-center gap-1.5 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar "{comercio.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold theme-subtitle mb-1">Precio en góndola</label>
                <div className="relative">
                  <span className="text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="0.00"
                    className="w-full theme-input border rounded-xl pl-7 pr-3 py-2.5 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 transition font-mono font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>

            {errorMensaje && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMensaje}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <Link href="/" className="w-1/3 py-3 rounded-xl border theme-btn-sec font-bold text-xs text-center transition">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={enviando || subiendoFoto || analizandoIA}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 border-t border-white/30 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer active:scale-95"
              >
                {enviando || subiendoFoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando precio...</span>
                  </>
                ) : (
                  <span>Publicar Precio</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}