'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { subirImagenImageKit } from '../../lib/utils';

// Función para inferir categoría automáticamente según el nombre escrito
const inferirCategoria = (texto) => {
  const t = texto.toLowerCase();

  // Lácteos
  if (/leche|queso|manteca|yogur|yogurt|crema|dulce de leche|ricota|flan/.test(t)) {
    return 'Lácteos';
  }
  // Carnicería
  if (/carne|asado|vacio|vacío|nalga|peceto|picada|pollo|pechuga|suprema|cerdo|bondiola|chorizo|morcilla|milanesa/.test(t)) {
    return 'Carnicería';
  }
  // Verdulería / Frutas
  if (/papa|tomate|cebolla|lechuga|zanahoria|manzana|banana|naranja|palta|limon|limón|mandarina|fruta|verdura/.test(t)) {
    return 'Verdulería';
  }
  // Limpieza y perfumería
  if (/lavandina|detergente|jabon|jabón|desinfectante|papel higienico|papel higiénico|rollo|suavizante|shampoo|acondicionador|dentifrico|crema dental/.test(t)) {
    return 'Limpieza';
  }
  // Bebidas
  if (/gaseosa|coca|pepsi|sprite|agua|cerveza|vino|fernet|jugo|aperitivo/.test(t)) {
    return 'Bebidas';
  }

  // Almacén general por defecto
  return 'Súper';
};

export default function CargarPage() {
  const router = useRouter();

  // Catálogos precargados
  const [comercios, setComercios] = useState([]);
  const [productosBase, setProductosBase] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Campos del formulario
  const [nombreGenerico, setNombreGenerico] = useState('');
  const [marca, setMarca] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('ml');
  const [categoria, setCategoria] = useState('Súper'); // Se define automáticamente
  const [comercioId, setComercioId] = useState('');
  const [precio, setPrecio] = useState('');
  const [vigenciaDias, setVigenciaDias] = useState(7);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [esOficial, setEsOficial] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Menús predictivos
  const [mostrarSugerenciasProd, setMostrarSugerenciasProd] = useState(false);
  const [mostrarSugerenciasMarca, setMostrarSugerenciasMarca] = useState(false);

  const [adminUser, setAdminUser] = useState(null);

  const marcasPopulares = [
    'La Serenísima', 'Sancor', 'Ilolay', 'Cocinero', 'Natura', 'Marolio',
    'Matarazzo', 'Lucchetti', 'Gallo', 'Cañuelas', 'Pureza', 'Ledesma',
    'Playadito', 'Taragüí', 'Cruz de Malta', 'Arcor', 'Hellmanns', 'Knorr',
    'Magistral', 'Ala', 'Ariel', 'Ayudín', 'Higienol', 'Elite'
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUser(session?.user ?? null);
    });

    const cargarCatalogos = async () => {
      try {
        const [resComercios, resProductos] = await Promise.all([
          supabase.from('comercios').select('*').order('nombre'),
          supabase.from('productos').select('*').order('nombre'),
        ]);

        if (resComercios.data) setComercios(resComercios.data);
        if (resProductos.data) setProductosBase(resProductos.data);
      } catch (err) {
        console.error('Error al cargar catálogos:', err.message);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarCatalogos();
  }, []);

  // Actualizar la categoría en tiempo real al escribir
  const handleCambioNombre = (texto) => {
    setNombreGenerico(texto);
    setMostrarSugerenciasProd(true);
    setCategoria(inferirCategoria(texto));
  };

  const sugerenciasProductos = Array.from(
    new Set(productosBase.map((p) => p.nombre))
  ).filter(
    (nom) =>
      nom.toLowerCase().includes(nombreGenerico.toLowerCase()) &&
      nom.toLowerCase() !== nombreGenerico.toLowerCase()
  );

  const todasLasMarcas = Array.from(
    new Set([
      ...productosBase.map((p) => p.marca).filter(Boolean),
      ...marcasPopulares,
    ])
  );

  const sugerenciasMarcas = todasLasMarcas.filter(
    (m) =>
      m.toLowerCase().includes(marca.toLowerCase()) &&
      m.toLowerCase() !== marca.toLowerCase()
  );

  const handleSeleccionarProductoSugerido = (nom) => {
    setNombreGenerico(nom);
    setMostrarSugerenciasProd(false);

    const coincidencia = productosBase.find((p) => p.nombre === nom);
    if (coincidencia) {
      setCategoria(coincidencia.categoria || inferirCategoria(nom));
      if (coincidencia.unidad_medida) setUnidadMedida(coincidencia.unidad_medida);
      if (coincidencia.cantidad && !cantidad) setCantidad(coincidencia.cantidad);
    } else {
      setCategoria(inferirCategoria(nom));
    }
  };

  const handleSeleccionarMarcaSugerida = (m) => {
    setMarca(m);
    setMostrarSugerenciasMarca(false);
  };

  const handleSeleccionarFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoArchivo(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePublicarOferta = async (e) => {
    e.preventDefault();
    if (!nombreGenerico.trim() || !marca.trim() || !comercioId || !precio) {
      alert('Completá producto, marca, comercio y precio.');
      return;
    }

    setEnviando(true);
    try {
      let fotoUrl = null;
      if (fotoArchivo) {
        fotoUrl = await subirImagenImageKit(fotoArchivo);
      }

      const cantNum = parseFloat(cantidad) || 1;

      // Buscar si el producto ya existe
      const { data: existente } = await supabase
        .from('productos')
        .select('id')
        .ilike('nombre', nombreGenerico.trim())
        .ilike('marca', marca.trim())
        .eq('cantidad', cantNum)
        .eq('unidad_medida', unidadMedida)
        .maybeSingle();

      let targetProductoId = existente?.id;

      // Si no existe, crearlo con la categoría inferida
      if (!targetProductoId) {
        const { data: nuevoProd, error: errorProd } = await supabase
          .from('productos')
          .insert([
            {
              nombre: nombreGenerico.trim(),
              marca: marca.trim(),
              cantidad: cantNum,
              unidad_medida: unidadMedida,
              categoria: categoria,
            },
          ])
          .select('id')
          .single();

        if (errorProd) throw errorProd;
        targetProductoId = nuevoProd.id;
      }

      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + parseInt(vigenciaDias, 10));
      const votosIniciales = adminUser && esOficial ? 100 : 0;

      const { error: errorOferta } = await supabase.from('ofertas').insert([
        {
          producto_id: targetProductoId,
          comercio_id: comercioId,
          precio: parseFloat(precio),
          foto_url: fotoUrl,
          estado: 'activa',
          vencimiento: fechaVencimiento.toISOString(),
          votos_positivos: votosIniciales,
          votos_negativos: 0,
        },
      ]);

      if (errorOferta) throw errorOferta;

      alert('✅ ¡Precio sumado con éxito!');
      router.push('/');
    } catch (err) {
      alert('❌ Error al publicar: ' + err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="p-4 md:p-6 flex-1 max-w-xl mx-auto w-full">
      <form
        onSubmit={handlePublicarOferta}
        className="bg-[#141b2b] p-5 md:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-white">Aportar precio</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresá el producto visto en góndola
          </p>

          {adminUser && (
            <label className="flex items-center gap-2.5 mt-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 cursor-pointer">
              <input
                type="checkbox"
                checked={esOficial}
                onChange={(e) => setEsOficial(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-xs text-amber-300 font-bold">
                ⭐ Marcar como precio oficial de catálogo
              </span>
            </label>
          )}
        </div>

        {/* 1. PRODUCTO GENÉRICO CON DETECCIÓN DE CATEGORÍA */}
        <div className="relative">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-300">
              Producto genérico
            </label>
            {/* Indicador automático de categoría */}
            <span className="text-[10px] bg-slate-800 text-sky-400 border border-slate-700 px-2 py-0.5 rounded-md font-semibold">
              🏷️ Rubro: {categoria}
            </span>
          </div>

          <input
            type="text"
            placeholder="Ej: Leche descremada, Aceite, Fideos..."
            value={nombreGenerico}
            onChange={(e) => handleCambioNombre(e.target.value)}
            onFocus={() => setMostrarSugerenciasProd(true)}
            required
            className="w-full bg-[#0d131f] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400"
          />

          {mostrarSugerenciasProd && nombreGenerico.length >= 2 && sugerenciasProductos.length > 0 && (
            <ul className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#1a2336] border border-slate-700 rounded-xl shadow-2xl py-1 text-xs divide-y divide-slate-800">
              {sugerenciasProductos.slice(0, 5).map((sug, i) => (
                <li
                  key={i}
                  onMouseDown={() => handleSeleccionarProductoSugerido(sug)}
                  className="px-3.5 py-2 hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 cursor-pointer flex items-center justify-between"
                >
                  <span>{sug}</span>
                  <span className="text-[10px] text-slate-500">Sugerencia</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 2. MARCA */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Marca
          </label>
          <input
            type="text"
            placeholder="Ej: Cocinero, La Serenísima, Gallo..."
            value={marca}
            onChange={(e) => {
              setMarca(e.target.value);
              setMostrarSugerenciasMarca(true);
            }}
            onFocus={() => setMostrarSugerenciasMarca(true)}
            required
            className="w-full bg-[#0d131f] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400"
          />

          {mostrarSugerenciasMarca && marca.length >= 2 && sugerenciasMarcas.length > 0 && (
            <ul className="absolute z-30 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-[#1a2336] border border-slate-700 rounded-xl shadow-2xl py-1 text-xs divide-y divide-slate-800">
              {sugerenciasMarcas.slice(0, 5).map((m, i) => (
                <li
                  key={i}
                  onMouseDown={() => handleSeleccionarMarcaSugerida(m)}
                  className="px-3 py-2 hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 cursor-pointer"
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. TAMAÑO / PRESENTACIÓN */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tamaño / Presentación
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder="Ej: 900, 1, 500"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              className="flex-1 bg-[#0d131f] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400 font-mono"
            />
            <select
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              className="w-28 bg-[#0d131f] text-sm text-white rounded-xl px-3 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400"
            >
              <option value="ml">ml</option>
              <option value="l">Litro (l)</option>
              <option value="gr">Gramos (gr)</option>
              <option value="kg">Kilo (kg)</option>
              <option value="u">Unidad (u)</option>
            </select>
          </div>
        </div>

        {/* 4. SUPERMERCADO Y PRECIO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Supermercado
            </label>
            <select
              value={comercioId}
              onChange={(e) => setComercioId(e.target.value)}
              required
              disabled={cargandoDatos}
              className="w-full bg-[#0d131f] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400"
            >
              <option value="">Seleccioná el local...</option>
              {comercios.map((com) => (
                <option key={com.id} value={com.id}>
                  {com.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Precio en góndola
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-bold">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
                className="w-full bg-[#0d131f] text-sm text-white rounded-xl pl-8 pr-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400 font-mono text-base font-bold"
              />
            </div>
          </div>
        </div>

        {/* 5. FOTO */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Foto del precio / góndola (Opcional)
          </label>
          {!fotoPreview ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 rounded-2xl p-4 cursor-pointer hover:border-slate-500 transition">
              <span className="text-xs text-slate-300">📸 Tocar para sacar o subir foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSeleccionarFoto}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between bg-[#0d131f] p-3 rounded-2xl border border-slate-700">
              <img
                src={fotoPreview}
                alt="Vista previa"
                className="w-14 h-14 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setFotoArchivo(null);
                  setFotoPreview(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 bg-slate-800 rounded-xl"
              >
                Quitar foto
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando || cargandoDatos}
          className={`w-full mt-3 font-bold py-3.5 rounded-2xl transition disabled:opacity-50 text-slate-950 ${
            esOficial
              ? 'bg-amber-400 hover:bg-amber-300'
              : 'bg-emerald-400 hover:bg-emerald-300'
          }`}
        >
          {enviando
            ? 'Publicando...'
            : esOficial
            ? 'Publicar Catálogo Oficial'
            : 'Publicar Oferta'}
        </button>
      </form>
    </main>
  );
}