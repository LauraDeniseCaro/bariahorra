'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { subirImagenImageKit } from '../../lib/utils';

export default function CargarPage() {
  const router = useRouter();

  // Estados de datos maestros
  const [productos, setProductos] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Estados del formulario
  const [productoId, setProductoId] = useState('');
  const [comercioId, setComercioId] = useState('');
  const [precio, setPrecio] = useState('');
  const [vigenciaDias, setVigenciaDias] = useState(7);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [esOficial, setEsOficial] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Sesión de admin
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Comprobar si hay sesión iniciada como admin
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUser(session?.user ?? null);
    });

    const cargarMaestros = async () => {
      try {
        const [resComercios, resProductos] = await Promise.all([
          supabase.from('comercios').select('*').order('nombre'),
          supabase.from('productos').select('*').order('nombre'),
        ]);

        if (resComercios.data) setComercios(resComercios.data);
        if (resProductos.data) setProductos(resProductos.data);
      } catch (err) {
        console.error('Error al cargar datos:', err.message);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarMaestros();
  }, []);

  const handleSeleccionarFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoArchivo(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePublicarOferta = async (e) => {
    e.preventDefault();
    if (!productoId || !comercioId || !precio) {
      alert('Completá producto, comercio y precio.');
      return;
    }

    setEnviando(true);
    try {
      let fotoUrl = null;
      if (fotoArchivo) {
        fotoUrl = await subirImagenImageKit(fotoArchivo);
      }

      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + parseInt(vigenciaDias, 10));

      // Si es admin y marcó la casilla oficial, se inicializa con 100 votos
      const votosIniciales = adminUser && esOficial ? 100 : 0;

      const { error } = await supabase.from('ofertas').insert([
        {
          producto_id: productoId,
          comercio_id: comercioId,
          precio: parseFloat(precio),
          foto_url: fotoUrl,
          estado: 'activa',
          vencimiento: fechaVencimiento.toISOString(),
          votos_positivos: votosIniciales,
          votos_negativos: 0,
        },
      ]);

      if (error) throw error;

      alert('✅ ¡Precio publicado exitosamente!');
      router.push('/');
    } catch (err) {
      alert('❌ Error al publicar: ' + err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="p-4 flex-1">
      <form
        onSubmit={handlePublicarOferta}
        className="bg-[#182133] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-white">Aportar oferta</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sumá un precio visto en góndola para ayudar a otros vecinos
          </p>

          {adminUser && (
            <label className="flex items-center gap-2 mt-3 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={esOficial}
                onChange={(e) => setEsOficial(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-xs text-amber-400 font-bold">
                ⭐ Marcar como precio de Catálogo (Oficial)
              </span>
            </label>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Producto</label>
            <select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
              disabled={cargandoDatos}
              className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400 transition"
            >
              <option value="">
                {cargandoDatos ? 'Cargando lista...' : 'Seleccioná el producto...'}
              </option>
              {productos.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nombre} {prod.marca ? `- ${prod.marca}` : ''} ({prod.categoria})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Comercio / Súper</label>
            <select
              value={comercioId}
              onChange={(e) => setComercioId(e.target.value)}
              required
              disabled={cargandoDatos}
              className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400 transition"
            >
              <option value="">
                {cargandoDatos ? 'Cargando lista...' : 'Seleccioná el comercio...'}
              </option>
              {comercios.map((com) => (
                <option key={com.id} value={com.id}>
                  {com.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Precio</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-bold">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
                className="w-full bg-[#1b2333] text-sm text-white rounded-xl pl-8 pr-3.5 py-2.5 border border-slate-700/80 outline-none focus:border-sky-400 transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Foto del precio / góndola (Opcional)
            </label>
            {!fotoPreview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition">
                <span className="text-xs text-slate-300">📸 Tocar para subir o sacar foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSeleccionarFoto}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-[#1b2333] p-2.5 rounded-xl border border-slate-700">
                <img
                  src={fotoPreview}
                  alt="Vista previa"
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFotoArchivo(null);
                    setFotoPreview(null);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1 bg-slate-800 rounded-lg"
                >
                  Quitar foto
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando || cargandoDatos}
          className={`w-full mt-2 font-bold py-3 rounded-xl transition disabled:opacity-50 text-slate-950 ${
            esOficial
              ? 'bg-amber-400 hover:bg-amber-500'
              : 'bg-sky-500 hover:bg-sky-400'
          }`}
        >
          {enviando
            ? 'Subiendo oferta...'
            : esOficial
            ? 'Publicar Catálogo Oficial'
            : 'Publicar Precio'}
        </button>
      </form>
    </main>
  );
}