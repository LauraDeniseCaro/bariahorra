'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calcularPrecioUnitario, subirImagenImageKit } from '../lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Control de instalación PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [estaInstalada, setEstaInstalada] = useState(false);

  // Datos de Supabase
  const [ofertas, setOfertas] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(true);
  const [comercios, setComercios] = useState([]);
  const [productos, setProductos] = useState([]);

  // Registro local de votos para evitar spam
  const [votosRealizados, setVotosRealizados] = useState({});

  // Formulario de carga
  const [productoId, setProductoId] = useState('');
  const [comercioId, setComercioId] = useState('');
  const [precio, setPrecio] = useState('');
  const [vigenciaDias, setVigenciaDias] = useState(7);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Autenticación de Administrador
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCargando, setAdminCargando] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Cargar ofertas reales con join a productos y comercios
  const cargarOfertas = async () => {
    setCargandoOfertas(true);
    try {
      const { data, error } = await supabase
        .from('ofertas')
        .select(`
          id,
          precio,
          estado,
          vencimiento,
          foto_url,
          votos_positivos,
          votos_negativos,
          creado_en,
          productos ( id, nombre, marca, cantidad, unidad_medida, categoria ),
          comercios ( id, nombre )
        `)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setOfertas(data || []);
    } catch (err) {
      console.error('Error al cargar ofertas:', err.message);
    } finally {
      setCargandoOfertas(false);
    }
  };

  const cargarDatosMaestros = async () => {
    try {
      const [resComercios, resProductos] = await Promise.all([
        supabase.from('comercios').select('*').order('nombre'),
        supabase.from('productos').select('*').order('nombre')
      ]);

      if (resComercios.data) setComercios(resComercios.data);
      if (resProductos.data) setProductos(resProductos.data);
    } catch (err) {
      console.error('Error al cargar datos:', err.message);
    }
  };

  useEffect(() => {
    cargarOfertas();
    cargarDatosMaestros();

    const votosGuardados = localStorage.getItem('bariahorra_votos');
    if (votosGuardados) {
      setVotosRealizados(JSON.parse(votosGuardados));
    }

    // Comprobar si ya está instalada o abierta en modo app independiente
    const esStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (esStandalone) {
      setEstaInstalada(true);
    }

    // Registrar Service Worker para habilitar el prompt directo de instalación
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Error al registrar Service Worker:', err);
      });
    }

    // Capturar el evento de instalación nativo
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setEstaInstalada(true);
      setDeferredPrompt(null);
    });

    // Comprobar sesión de administrador existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      subscription.unsubscribe();
    };
  }, []);

  // Manejo de la acción de instalación
  const handleInstalarApp = async () => {
    if (!deferredPrompt) {
      alert('Para instalar en PC: buscá el ícono de instalación en la barra del navegador. En celular: menú de tres puntos > "Instalar o Agregar a pantalla de inicio".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setEstaInstalada(true);
    }
    setDeferredPrompt(null);
  };

  // Manejo de fotos
  const handleSeleccionarFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoArchivo(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleQuitarFoto = () => {
    setFotoArchivo(null);
    setFotoPreview(null);
  };

  // Votación Comunitaria
  const handleVotar = async (ofertaId, tipo) => {
    if (votosRealizados[ofertaId]) {
      alert('Ya votaste en esta oferta.');
      return;
    }

    const oferta = ofertas.find((o) => o.id === ofertaId);
    if (!oferta) return;

    const nuevosPositivos = tipo === 'up' ? (oferta.votos_positivos || 0) + 1 : (oferta.votos_positivos || 0);
    const nuevosNegativos = tipo === 'down' ? (oferta.votos_negativos || 0) + 1 : (oferta.votos_negativos || 0);

    let nuevoEstado = oferta.estado;
    if (nuevosNegativos >= 3) {
      nuevoEstado = 'en_revision';
    }

    try {
      const { error } = await supabase
        .from('ofertas')
        .update({
          votos_positivos: nuevosPositivos,
          votos_negativos: nuevosNegativos,
          estado: nuevoEstado
        })
        .eq('id', ofertaId);

      if (error) throw error;

      setOfertas((prev) =>
        prev.map((o) =>
          o.id === ofertaId
            ? { ...o, votos_positivos: nuevosPositivos, votos_negativos: nuevosNegativos, estado: nuevoEstado }
            : o
        )
      );

      const actualizados = { ...votosRealizados, [ofertaId]: tipo };
      setVotosRealizados(actualizados);
      localStorage.setItem('bariahorra_votos', JSON.stringify(actualizados));
    } catch (err) {
      alert('Error al registrar voto: ' + err.message);
    }
  };

  // Publicar oferta con foto a ImageKit
  const handlePublicarOferta = async (e) => {
    e.preventDefault();

    if (!productoId || !comercioId || !precio) {
      alert('Por favor completá el producto, comercio y precio.');
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

      const { error } = await supabase.from('ofertas').insert([
        {
          producto_id: productoId,
          comercio_id: comercioId,
          precio: parseFloat(precio),
          foto_url: fotoUrl,
          estado: 'activa',
          vencimiento: fechaVencimiento.toISOString(),
          votos_positivos: 0,
          votos_negativos: 0
        }
      ]);

      if (error) throw error;

      alert('✅ ¡Oferta publicada con éxito en Bariahorra!');

      setProductoId('');
      setComercioId('');
      setPrecio('');
      setVigenciaDias(7);
      setFotoArchivo(null);
      setFotoPreview(null);
      setActiveTab('inicio');
      cargarOfertas();
    } catch (err) {
      alert('❌ Error al publicar oferta: ' + err.message);
    } finally {
      setEnviando(false);
    }
  };

  // Métodos de Administración / Moderación
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminCargando(true);
    setAdminError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });

      if (error) throw error;
      setAdminPassword('');
    } catch (err) {
      setAdminError(err.message || 'Error al iniciar sesión');
    } finally {
      setAdminCargando(false);
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCambiarEstadoOferta = async (ofertaId, nuevoEstado) => {
    try {
      const updateData = { estado: nuevoEstado };
      if (nuevoEstado === 'activa') {
        updateData.votos_negativos = 0;
      }

      const { error } = await supabase
        .from('ofertas')
        .update(updateData)
        .eq('id', ofertaId);

      if (error) throw error;

      setOfertas((prev) =>
        prev.map((o) => (o.id === ofertaId ? { ...o, ...updateData } : o))
      );
    } catch (err) {
      alert('Error al modificar oferta: ' + err.message);
    }
  };

  const handleEliminarOferta = async (ofertaId) => {
    if (!confirm('¿Estás segura de eliminar esta oferta permanentemente?')) return;

    try {
      const { error } = await supabase.from('ofertas').delete().eq('id', ofertaId);
      if (error) throw error;

      setOfertas((prev) => prev.filter((o) => o.id !== ofertaId));
    } catch (err) {
      alert('Error al eliminar oferta: ' + err.message);
    }
  };

  const ofertasFiltradas = ofertas.filter((item) => {
    const prod = item.productos;
    const com = item.comercios;

    const texto = `${prod?.nombre || ''} ${prod?.marca || ''} ${com?.nombre || ''}`.toLowerCase();
    const coincideTexto = texto.includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === 'Todos' ||
      prod?.categoria?.toLowerCase() === categoria.toLowerCase();

    return coincideTexto && coincideCategoria;
  });

  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-100 flex justify-center selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-md bg-[#121826] min-h-screen flex flex-col border-x border-slate-800/80 shadow-2xl relative pb-24">

        {/* Cabecera Principal */}
        <header className="px-5 pt-4 pb-3 border-b border-slate-800 bg-[#121826]/90 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h1 className="text-lg font-black tracking-tight text-white">
                  BARI<span className="text-sky-400">AHORRA</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Precios reales de Bariloche</p>
            </div>

            {/* Botón de Estado / Instalación de la App */}
            <div>
              {estaInstalada ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                  <span>✓</span>
                  <span>APP INSTALADA</span>
                </div>
              ) : (
                <button
                  onClick={handleInstalarApp}
                  className="flex items-center gap-1.5 bg-sky-500/15 hover:bg-sky-500/25 px-2.5 py-1 rounded-full border border-sky-500/30 text-[11px] font-semibold text-sky-400 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Instalar App</span>
                </button>
              )}
            </div>
          </div>

          {activeTab === 'inicio' && (
            <>
              <div className="mt-3 relative">
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar producto, marca o súper..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-[#1b2333] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-sky-400 transition"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
                {['Todos', 'Súper', 'Carnicería', 'Verdulería', 'Lácteos'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap border ${categoria === cat
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/40'
                        : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </header>

        {/* Cuerpo Principal */}
        <main className="p-4 flex-1">
          {activeTab === 'inicio' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Precios aportados por vecinos</span>
                <span className="text-[11px] text-sky-400">Total: {ofertasFiltradas.length}</span>
              </div>

              {cargandoOfertas ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Cargando precios en Bariloche...
                </div>
              ) : ofertasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No hay ofertas para mostrar con ese filtro.
                </div>
              ) : (
                ofertasFiltradas.map((item) => {
                  const prod = item.productos;
                  const com = item.comercios;
                  const yaVoto = votosRealizados[item.id];
                  const esActiva = item.estado === 'activa';

                  return (
                    <article
                      key={item.id}
                      className={`bg-[#182133] rounded-2xl p-4 border transition hover:border-slate-600 shadow-lg ${esActiva ? 'border-emerald-500/30' : 'border-amber-500/30'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${esActiva
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}>
                          {esActiva ? '✓ Activa' : '⚠ En revisión'}
                        </span>

                        <span className="text-[10px] text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded-md">
                          {prod?.categoria || 'General'}
                        </span>
                      </div>

                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-white leading-tight">
                            {prod?.nombre}
                          </h3>
                          {prod?.marca && (
                            <p className="text-xs text-slate-400 font-medium">{prod.marca}</p>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-sky-400 mt-1.5 font-medium">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                            </svg>
                            <span>{com?.nombre || 'Comercio'}</span>
                          </div>
                        </div>

                        {/* Bloque Precio y Foto */}
                        <div className="text-right flex flex-col items-end justify-start gap-2">
                          <div>
                            <div className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight leading-none">
                              ${item.precio?.toLocaleString('es-AR')}
                            </div>
                            {prod?.cantidad && prod?.unidad_medida && (
                              <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
                                {calcularPrecioUnitario(item.precio, prod.cantidad, prod.unidad_medida)}
                              </span>
                            )}
                          </div>

                          {item.foto_url && (
                            <a
                              href={`${item.foto_url}?tr=w-1200,q-80`}
                              target="_blank"
                              rel="noreferrer"
                              className="relative group block rounded-lg overflow-hidden border border-slate-700/80 hover:border-sky-400 transition"
                            >
                              <img
                                src={`${item.foto_url}?tr=w-100,h-100,fo-auto`}
                                alt="Foto comprobante góndola"
                                className="w-11 h-11 object-cover group-hover:scale-105 transition"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-sky-300 text-center py-0.5 font-bold">
                                FOTO
                              </span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Validación comunitaria */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex flex-col text-[11px] text-slate-400">
                          <span>{item.votos_positivos || 0} confirmaron</span>
                          {item.votos_negativos > 0 && (
                            <span className="text-amber-400 font-medium">
                              ⚠️ {item.votos_negativos} reportaron aumento
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleVotar(item.id, 'up')}
                            disabled={!!yaVoto}
                            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 ${yaVoto === 'up'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700'
                              } disabled:opacity-50`}
                          >
                            👍 Sigue igual
                          </button>
                          <button
                            onClick={() => handleVotar(item.id, 'down')}
                            disabled={!!yaVoto}
                            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition flex items-center gap-1 ${yaVoto === 'down'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700'
                              } disabled:opacity-50`}
                          >
                            👎 Subió
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'cargar' && (
            <form onSubmit={handlePublicarOferta} className="bg-[#182133] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Aportar una oferta</h2>
                <p className="text-xs text-slate-400">Ayudá a los vecinos de Bariloche a pagar menos.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Producto</label>
                  <select
                    value={productoId}
                    onChange={(e) => setProductoId(e.target.value)}
                    required
                    className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                  >
                    <option value="">Seleccioná el producto...</option>
                    {productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre} {prod.marca ? `- ${prod.marca}` : ''} ({prod.categoria})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Comercio</label>
                  <select
                    value={comercioId}
                    onChange={(e) => setComercioId(e.target.value)}
                    required
                    className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                  >
                    <option value="">Seleccioná el comercio...</option>
                    {comercios.map((comercio) => (
                      <option key={comercio.id} value={comercio.id}>
                        {comercio.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Precio en góndola ($ ARS)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 3890"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">
                    Foto de góndola o ticket <span className="text-slate-500">(Opcional)</span>
                  </label>

                  {!fotoPreview ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 hover:border-sky-500/60 rounded-xl p-4 cursor-pointer bg-[#1b2333]/50 transition">
                      <svg className="w-6 h-6 text-sky-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-slate-300 font-medium">Sacar foto o elegir de galería</span>
                      <span className="text-[10px] text-slate-500">JPG, PNG o WebP</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleSeleccionarFoto}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative flex items-center gap-3 bg-[#1b2333] p-2.5 rounded-xl border border-slate-700">
                      <img
                        src={fotoPreview}
                        alt="Previsualización"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 font-medium truncate">{fotoArchivo?.name}</p>
                        <p className="text-[10px] text-emerald-400">Listo para subir</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleQuitarFoto}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                        title="Quitar foto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Vigencia aproximada de la oferta</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Fin de sem (3d)', val: 3 },
                      { label: '1 Semana (7d)', val: 7 },
                      { label: '15 Días', val: 15 }
                    ].map((opc) => (
                      <button
                        type="button"
                        key={opc.val}
                        onClick={() => setVigenciaDias(opc.val)}
                        className={`py-2 px-1 text-xs rounded-xl border font-medium transition ${vigenciaDias === opc.val
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                            : 'bg-[#1b2333] text-slate-400 border-slate-700/70 hover:bg-slate-800'
                          }`}
                      >
                        {opc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full mt-2 bg-sky-500 hover:bg-sky-400 active:scale-98 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-sky-500/20"
              >
                {enviando ? 'Subiendo oferta y foto...' : 'Publicar Precio'}
              </button>
            </form>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4">
              {!adminUser ? (
                <form onSubmit={handleAdminLogin} className="bg-[#182133] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Acceso Moderación</h2>
                    <p className="text-xs text-slate-400">Ingresá con tu cuenta de administrador de Supabase.</p>
                  </div>

                  {adminError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                      {adminError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Email</label>
                      <input
                        type="email"
                        placeholder="admin@bariahorra.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Contraseña</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        className="w-full bg-[#1b2333] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700/80 focus:border-sky-400 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminCargando}
                    className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-sm disabled:opacity-50 shadow-lg shadow-sky-500/20"
                  >
                    {adminCargando ? 'Iniciando sesión...' : 'Ingresar'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#182133] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Admin conectado
                      </span>
                      <p className="text-xs text-slate-300 font-medium truncate max-w-[200px] mt-1">
                        {adminUser.email}
                      </p>
                    </div>
                    <button
                      onClick={handleAdminLogout}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition"
                    >
                      Cerrar sesión
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-white">Ofertas reportadas / a moderar</h3>
                    <span className="text-xs text-slate-400">Total: {ofertas.length}</span>
                  </div>

                  {ofertas.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs bg-[#182133] rounded-2xl border border-slate-800">
                      No hay ofertas cargadas en el sistema.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ofertas.map((item) => {
                        const prod = item.productos;
                        const com = item.comercios;
                        const esRevision = item.estado === 'en_revision';

                        return (
                          <div
                            key={item.id}
                            className={`bg-[#182133] p-4 rounded-2xl border transition ${esRevision ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${esRevision
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      }`}
                                  >
                                    {item.estado.toUpperCase()}
                                  </span>
                                  {item.votos_negativos > 0 && (
                                    <span className="text-[9px] text-rose-400 font-bold">
                                      ⚠️ {item.votos_negativos} reportes
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-white text-sm truncate">{prod?.nombre}</h4>
                                <p className="text-xs text-slate-400">{com?.nombre} • ${item.precio?.toLocaleString('es-AR')}</p>
                              </div>

                              {item.foto_url && (
                                <a
                                  href={item.foto_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0"
                                >
                                  <img
                                    src={`${item.foto_url}?tr=w-80,h-80,fo-auto`}
                                    alt="Comprobante"
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                                  />
                                </a>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
                              {esRevision ? (
                                <button
                                  onClick={() => handleCambiarEstadoOferta(item.id, 'activa')}
                                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-lg transition"
                                >
                                  ✓ Reactivar
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCambiarEstadoOferta(item.id, 'en_revision')}
                                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded-lg transition"
                                >
                                  ⏸ Pausar
                                </button>
                              )}
                              <button
                                onClick={() => handleEliminarOferta(item.id)}
                                className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 rounded-lg transition"
                              >
                                ✕ Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Navegación Inferior */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-[#121826]/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-6 z-40">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'inicio' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-semibold">Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('cargar')}
            className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-sky-500 to-indigo-500 text-white rounded-full h-12 w-12 shadow-lg shadow-sky-500/30 active:scale-95 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'admin' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-semibold">Admin</span>
          </button>
        </nav>

      </div>
    </div>
  );
}