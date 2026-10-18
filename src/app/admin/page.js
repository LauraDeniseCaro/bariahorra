'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  ShieldAlert,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  Search,
  Check,
  X,
  Trash2,
  Store,
  ShoppingBag,
  Tag,
  Star,
  BellRing,
  ArrowUpDown,
  Image as ImageIcon,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

// =====================================================================
// LISTA BLANCA DE ADMINISTRADORES
// Poné acá ÚNICAMENTE tu correo de admin (en minúsculas)
// =====================================================================
const ADMIN_EMAILS = [
  'bariahorra@gmail.com', // 👈 Reemplazá por tu correo real de administración
];

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCargando, setAdminCargando] = useState(false);
  const [adminError, setAdminError] = useState('');

  const [vistaActual, setVistaActual] = useState('pendientes');
  const [busqueda, setBusqueda] = useState('');
  const [ordenAdmin, setOrdenAdmin] = useState('recientes');

  const [ofertas, setOfertas] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [precioEdit, setPrecioEdit] = useState('');

  const [nuevoNombreComercio, setNuevoNombreComercio] = useState('');
  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdMarca, setNuevoProdMarca] = useState('');
  const [nuevoProdCat, setNuevoProdCat] = useState('Súper');
  const [guardandoMaestro, setGuardandoMaestro] = useState(false);

  const esAdmin = useMemo(() => {
    if (!adminUser || !adminUser.email) return false;
    const emailNormalizado = adminUser.email.toLowerCase().trim();
    return ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === emailNormalizado);
  }, [adminUser]);

  useEffect(() => {
    const verificarSesionInicial = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setAdminUser(user);

        if (user && ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === user.email?.toLowerCase().trim())) {
          cargarTodo();
        }
      } catch (err) {
        console.error('Error al verificar sesión:', err);
      } finally {
        setCargandoAuth(false);
      }
    };

    verificarSesionInicial();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAdminUser(user);

      if (user && ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === user.email?.toLowerCase().trim())) {
        cargarTodo();
      }
      setCargandoAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cargarTodo = async () => {
    setCargandoDatos(true);
    try {
      const [resOfertas, resComercios, resProductos] = await Promise.all([
        supabase.from('ofertas').select(`
          id, precio, precio_propuesto, votos_propuesto, motivo_revision, es_catalogo, estado, foto_url, creado_en, usuario_id,
          productos ( id, nombre, marca, categoria, creado_en ),
          comercios ( id, nombre, creado_en )
        `).order('creado_en', { ascending: false }),
        supabase.from('comercios').select('*').order('nombre'),
        supabase.from('productos').select('*').order('nombre')
      ]);

      if (resOfertas.data) setOfertas(resOfertas.data);
      if (resComercios.data) setComercios(resComercios.data);
      if (resProductos.data) setProductos(resProductos.data);
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminCargando(true);
    setAdminError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (error) throw error;

      const emailLogueado = data.user?.email?.toLowerCase().trim();
      const autorizado = ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === emailLogueado);

      if (!autorizado) {
        await supabase.auth.signOut();
        throw new Error('Esta cuenta no pertenece a la lista de administradores autorizados.');
      }

      setAdminPassword('');
    } catch (err) {
      setAdminError(err.message || 'Error al iniciar sesión');
    } finally {
      setAdminCargando(false);
    }
  };

  const handleAprobarOferta = async (item) => {
    try {
      const updatePayload = { estado: 'activa', motivo_revision: null };
      const { error } = await supabase.from('ofertas').update(updatePayload).eq('id', item.id);
      if (error) throw error;
      setOfertas((prev) => prev.map((o) => (o.id === item.id ? { ...o, ...updatePayload } : o)));
    } catch (err) {
      alert('Error aprobando oferta: ' + err.message);
    }
  };

  const handleAceptarPrecioPropuesto = async (item) => {
    if (!item.precio_propuesto) return;
    try {
      const nuevoValor = Number(item.precio_propuesto);
      const updatePayload = {
        precio: nuevoValor,
        precio_propuesto: null,
        votos_propuesto: 0,
        motivo_revision: null,
        estado: 'activa',
        creado_en: new Date().toISOString()
      };
      const { error } = await supabase.from('ofertas').update(updatePayload).eq('id', item.id);
      if (error) throw error;
      setOfertas((prev) => prev.map((o) => (o.id === item.id ? { ...o, ...updatePayload } : o)));
    } catch (err) {
      alert('Error aceptando precio propuesto: ' + err.message);
    }
  };

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activa' ? 'en_revision' : 'activa';
    try {
      const updatePayload = {
        estado: nuevoEstado,
        motivo_revision: nuevoEstado === 'activa' ? null : 'Pausado manualmente por Admin'
      };
      const { error } = await supabase.from('ofertas').update(updatePayload).eq('id', id);
      if (error) throw error;
      setOfertas((prev) => prev.map((o) => (o.id === id ? { ...o, ...updatePayload } : o)));
    } catch (err) {
      alert('Error cambiando estado: ' + err.message);
    }
  };

  const guardarPrecioRapido = async (id) => {
    const pNum = Number(precioEdit);
    if (isNaN(pNum) || pNum <= 0) return;
    try {
      const updatePayload = {
        precio: pNum,
        precio_propuesto: null,
        motivo_revision: null,
        estado: 'activa'
      };
      const { error } = await supabase.from('ofertas').update(updatePayload).eq('id', id);
      if (error) throw error;
      setOfertas((prev) => prev.map((o) => (o.id === id ? { ...o, ...updatePayload } : o)));
      setEditandoId(null);
      setPrecioEdit('');
    } catch (err) {
      alert('No se pudo actualizar el precio: ' + err.message);
    }
  };

  const handleEliminarOferta = async (id) => {
    if (!confirm('¿Eliminar esta oferta permanentemente?')) return;
    try {
      const { error } = await supabase.from('ofertas').delete().eq('id', id);
      if (error) throw error;
      setOfertas((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleCrearComercio = async (e) => {
    e.preventDefault();
    if (!nuevoNombreComercio.trim()) return;
    setGuardandoMaestro(true);
    try {
      const { error } = await supabase.from('comercios').insert([{ nombre: nuevoNombreComercio.trim() }]);
      if (error) throw error;
      setNuevoNombreComercio('');
      cargarTodo();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardandoMaestro(false);
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProdNombre.trim()) return;
    setGuardandoMaestro(true);
    try {
      const { error } = await supabase.from('productos').insert([{
        nombre: nuevoProdNombre.trim(),
        marca: nuevoProdMarca.trim() || null,
        categoria: nuevoProdCat
      }]);
      if (error) throw error;
      setNuevoProdNombre('');
      setNuevoProdMarca('');
      cargarTodo();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardandoMaestro(false);
    }
  };

  const handleEliminarMaestro = async (tabla, id) => {
    if (!confirm(`¿Eliminar este registro de ${tabla}?`)) return;
    try {
      const { error } = await supabase.from(tabla).delete().eq('id', id);
      if (error) throw error;
      cargarTodo();
    } catch (err) {
      alert('No se puede borrar si tiene ofertas asociadas en la base de datos.');
    }
  };

  const ofertasPendientes = useMemo(() => {
    return ofertas.filter((o) => o.estado === 'en_revision' || Boolean(o.motivo_revision) || Boolean(o.precio_propuesto));
  }, [ofertas]);

  const ofertasFiltradas = useMemo(() => {
    const listaBase = vistaActual === 'pendientes' ? ofertasPendientes : ofertas;
    const q = busqueda.toLowerCase();

    return listaBase
      .filter((o) => {
        if (!q) return true;
        return (
          String(o.productos?.nombre || '').toLowerCase().includes(q) ||
          String(o.comercios?.nombre || '').toLowerCase().includes(q) ||
          String(o.productos?.marca || '').toLowerCase().includes(q) ||
          String(o.motivo_revision || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (ordenAdmin === 'precio_asc') return (a.precio || 0) - (b.precio || 0);
        if (ordenAdmin === 'precio_desc') return (b.precio || 0) - (a.precio || 0);
        if (ordenAdmin === 'producto_asc') {
          return String(a.productos?.nombre || '').localeCompare(String(b.productos?.nombre || ''));
        }
        const fechaA = new Date(a.creado_en || 0).getTime();
        const fechaB = new Date(b.creado_en || 0).getTime();
        if (ordenAdmin === 'antiguos') return fechaA - fechaB;
        return fechaB - fechaA;
      });
  }, [ofertas, ofertasPendientes, vistaActual, busqueda, ordenAdmin]);

  const comerciosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return comercios;
    return comercios.filter((c) => String(c.nombre || '').toLowerCase().includes(q));
  }, [comercios, busqueda]);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return productos;
    return productos.filter((p) =>
      String(p.nombre || '').toLowerCase().includes(q) ||
      String(p.marca || '').toLowerCase().includes(q) ||
      String(p.categoria || '').toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  // 1. PANTALLA DE CARGA (Evita parpadeos o accesos prematuros)
  if (cargandoAuth) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6 text-center theme-muted text-xs">
        Verificando credenciales de administración...
      </main>
    );
  }

  // 2. CASO: No hay usuario autenticado -> Formulario de Login
  if (!adminUser) {
    return (
      <main className="p-4 flex-1 max-w-sm mx-auto w-full flex flex-col justify-center min-h-[75vh]">
        <div className="theme-card p-6 rounded-3xl border shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black theme-title">Centro de Control Admin</h2>
            <p className="text-xs theme-muted mt-1">Acceso restringido para moderadores</p>
          </div>

          {adminError && (
            <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Admin Email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              className="w-full theme-input text-sm rounded-xl px-4 py-2.5 border outline-none focus:border-emerald-500 transition"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              className="w-full theme-input text-sm rounded-xl px-4 py-2.5 border outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={adminCargando}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {adminCargando ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold theme-muted hover:text-sky-500 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al sitio público
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. CASO: Usuario logueado pero NO autorizado -> Bloqueo total
  if (!esAdmin) {
    return (
      <main className="p-4 flex-1 max-w-md mx-auto w-full flex flex-col justify-center min-h-[75vh]">
        <div className="theme-card p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black theme-title">Acceso Denegado</h2>
          <p className="text-xs theme-muted leading-relaxed">
            Iniciaste sesión con <strong className="theme-title">{adminUser.email}</strong>, pero esta cuenta no figura en la lista de administradores autorizados.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2.5 theme-btn-sec border rounded-xl text-xs font-bold transition cursor-pointer hover:bg-rose-500/10 hover:text-rose-500"
            >
              Cerrar sesión
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-black transition shadow cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la góndola</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 4. CASO: Administrador confirmado -> Muestra el panel completo
  return (
    <main className="p-3 sm:p-6 flex-1 max-w-6xl mx-auto w-full selection:bg-emerald-500 selection:text-white pb-24">
      <div className="space-y-4">

        {/* HEADER ADMIN */}
        <div className="theme-card p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black theme-title">Panel de Moderación Automática</h2>
              <p className="text-[10px] theme-muted font-mono mt-0.5">{adminUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/cargar?catalogo=1"
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/40 font-black px-3.5 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Cargar Catálogo Oficial</span>
            </Link>
            <Link
              href="/"
              className="text-xs theme-btn-sec font-bold px-3.5 py-2 rounded-xl border transition"
            >
              Ver Góndola
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-2 theme-btn-sec hover:bg-rose-500/20 hover:text-rose-500 rounded-xl border transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setVistaActual('pendientes'); setBusqueda(''); }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border relative ${
              vistaActual === 'pendientes'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'theme-btn-sec border'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Por Revisar</span>
            {ofertasPendientes.length > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                vistaActual === 'pendientes' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
              }`}>
                {ofertasPendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setVistaActual('ofertas'); setBusqueda(''); }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border ${
              vistaActual === 'ofertas'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'theme-btn-sec border'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Todas las Ofertas ({ofertas.length})</span>
          </button>
          <button
            onClick={() => { setVistaActual('comercios'); setBusqueda(''); }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border ${
              vistaActual === 'comercios'
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                : 'theme-btn-sec border'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Comercios ({comercios.length})</span>
          </button>
          <button
            onClick={() => { setVistaActual('productos'); setBusqueda(''); }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border ${
              vistaActual === 'productos'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'theme-btn-sec border'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Productos ({productos.length})</span>
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 theme-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por producto, marca, súper o motivo de alerta..."
              className="w-full theme-input border rounded-2xl pl-10 pr-8 py-2.5 text-xs placeholder-slate-400 outline-none focus:border-emerald-500 transition shadow-sm"
            />
            {busqueda && (
              <button type="button" onClick={() => setBusqueda('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 theme-muted hover:theme-title">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(vistaActual === 'ofertas' || vistaActual === 'pendientes') && (
            <div className="flex items-center gap-1.5 theme-btn-sec border px-3.5 py-2 rounded-2xl text-xs shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <select
                value={ordenAdmin}
                onChange={(e) => setOrdenAdmin(e.target.value)}
                className="bg-transparent theme-title font-bold outline-none cursor-pointer text-xs"
              >
                <option value="recientes" className="theme-card">Más recientes primero</option>
                <option value="producto_asc" className="theme-card">Ordenar por Producto (A-Z)</option>
                <option value="antiguos" className="theme-card">Más antiguos primero</option>
                <option value="precio_asc" className="theme-card">Menor precio ($)</option>
                <option value="precio_desc" className="theme-card">Mayor precio ($)</option>
              </select>
            </div>
          )}
        </div>

        {/* LISTADOS */}
        <div className="min-h-[50vh]">
          {cargandoDatos ? (
            <div className="text-center py-16 theme-muted text-xs">Cargando registros...</div>
          ) : vistaActual === 'ofertas' || vistaActual === 'pendientes' ? (
            <div>
              {ofertasFiltradas.length === 0 ? (
                <div className="text-center py-16 theme-muted text-xs theme-card rounded-3xl border space-y-2">
                  <p>No hay ofertas en esta vista.</p>
                  {vistaActual === 'pendientes' && (
                    <p className="text-emerald-500 font-bold">¡Excelente! El piloto automático tiene todo bajo control.</p>
                  )}
                </div>
              ) : (
                <>
                  {/* VISTA MÓVIL: TARJETAS */}
                  <div className="block sm:hidden space-y-3">
                    {ofertasFiltradas.map((item) => {
                      const tieneFoto = Boolean(item.foto_url);
                      const tienePropuesto = Boolean(item.precio_propuesto);
                      const fechaFormateada = new Date(item.creado_en).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      });

                      return (
                        <div key={item.id} className="theme-card border rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-md">
                          {item.motivo_revision && (
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>{item.motivo_revision}</span>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-xl theme-card-sub border overflow-hidden shrink-0 flex items-center justify-center">
                              {tieneFoto ? (
                                <a href={item.foto_url} target="_blank" rel="noreferrer">
                                  <img src={item.foto_url} alt="Góndola" className="w-full h-full object-cover" />
                                </a>
                              ) : (
                                <ImageIcon className="w-6 h-6 theme-muted" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 truncate">
                                  {item.comercios?.nombre || 'Comercio'}
                                </span>
                                <span className="text-[10px] theme-muted">{fechaFormateada}</span>
                              </div>
                              <h3 className="text-xs font-black theme-title truncate">{item.productos?.nombre || 'Producto'}</h3>
                              <p className="text-[11px] theme-muted truncate mt-0.5">
                                <span className="theme-subtitle">{item.productos?.marca || 'Genérica'}</span> • <span className="text-amber-500">{item.productos?.categoria || 'Súper'}</span>
                              </p>
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-[var(--border-card)] space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                {editandoId === item.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={precioEdit}
                                      onChange={(e) => setPrecioEdit(e.target.value)}
                                      className="w-24 theme-input text-xs px-2 py-1 rounded-lg border border-emerald-500 outline-none font-mono font-bold"
                                      autoFocus
                                    />
                                    <button onClick={() => guardarPrecioRapido(item.id)} className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg">
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setEditandoId(null)} className="p-1.5 theme-btn-sec rounded-lg border">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span
                                      onClick={() => { setEditandoId(item.id); setPrecioEdit(item.precio); }}
                                      className="text-base font-black font-mono text-emerald-500 cursor-pointer hover:underline"
                                    >
                                      ${Number(item.precio || 0).toLocaleString('es-AR')}
                                    </span>
                                    {item.es_catalogo && (
                                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                                        Catálogo
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleAprobarOferta(item)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[11px] font-black cursor-pointer shadow"
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleEliminarOferta(item.id)}
                                  className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {tienePropuesto && (
                              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-2">
                                <div className="text-[11px]">
                                  <span className="theme-muted">Propuesto: </span>
                                  <strong className="text-sky-500 font-mono font-black">${Number(item.precio_propuesto).toLocaleString('es-AR')}</strong>
                                </div>
                                <button
                                  onClick={() => handleAceptarPrecioPropuesto(item)}
                                  className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-black flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Aceptar $</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* VISTA ESCRITORIO: TABLA */}
                  <div className="hidden sm:block theme-card rounded-3xl border overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="theme-card-sub border-b text-[10px] font-black uppercase tracking-wider theme-muted">
                          <th className="p-3 pl-4 w-12 text-center">Foto</th>
                          <th className="p-3">Producto y Marca</th>
                          <th className="p-3">Supermercado</th>
                          <th className="p-3 text-right">Precio Actual</th>
                          <th className="p-3">Alerta / Propuesta</th>
                          <th className="p-3 pr-4 text-right">Acciones de Auditoría</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y theme-card-sub/50 text-xs">
                        {ofertasFiltradas.map((item) => {
                          const tieneFoto = Boolean(item.foto_url);
                          const tienePropuesto = Boolean(item.precio_propuesto);

                          return (
                            <tr key={item.id} className="hover:bg-slate-500/5 transition">
                              <td className="p-3 pl-4 text-center">
                                {tieneFoto ? (
                                  <a href={item.foto_url} target="_blank" rel="noreferrer" className="inline-block w-9 h-9 rounded-lg theme-card-sub border overflow-hidden">
                                    <img src={item.foto_url} alt="Foto" className="w-full h-full object-cover hover:scale-110 transition" />
                                  </a>
                                ) : (
                                  <div className="w-9 h-9 rounded-lg theme-card-sub border flex items-center justify-center mx-auto theme-muted">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-black theme-title">{item.productos?.nombre || 'Producto'}</p>
                                  {item.es_catalogo && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[9px] font-black">OFICIAL</span>
                                  )}
                                </div>
                                <p className="text-[10px] theme-muted"><span className="theme-subtitle">{item.productos?.marca || 'Genérica'}</span> • <span className="text-amber-500">{item.productos?.categoria || 'Súper'}</span></p>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold text-[11px]">
                                  {item.comercios?.nombre || 'Comercio'}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-black text-emerald-500 text-sm">
                                {editandoId === item.id ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <input
                                      type="number"
                                      value={precioEdit}
                                      onChange={(e) => setPrecioEdit(e.target.value)}
                                      className="w-24 theme-input text-xs px-2 py-1 rounded-lg border border-emerald-500 outline-none text-right font-mono"
                                      autoFocus
                                    />
                                    <button onClick={() => guardarPrecioRapido(item.id)} className="p-1 bg-emerald-500 text-slate-950 rounded">
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setEditandoId(null)} className="p-1 theme-btn-sec rounded border">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    onClick={() => { setEditandoId(item.id); setPrecioEdit(item.precio); }}
                                    className="cursor-pointer hover:underline"
                                    title="Clic para editar precio"
                                  >
                                    ${Number(item.precio || 0).toLocaleString('es-AR')}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                {item.motivo_revision ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>{item.motivo_revision}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] theme-muted">Normal</span>
                                )}

                                {tienePropuesto && (
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <span className="text-[10px] theme-muted font-mono">Nuevo: <strong className="text-sky-500">${item.precio_propuesto}</strong></span>
                                    <button
                                      onClick={() => handleAceptarPrecioPropuesto(item)}
                                      className="px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-black cursor-pointer"
                                    >
                                      Aceptar $
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 pr-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => handleAprobarOferta(item)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[11px] font-black cursor-pointer shadow"
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => handleCambiarEstado(item.id, item.estado)}
                                  className="px-2.5 py-1 theme-btn-sec rounded-xl text-[11px] font-bold cursor-pointer border"
                                >
                                  {item.estado === 'activa' ? 'Pausar' : 'Activar'}
                                </button>
                                <button
                                  onClick={() => handleEliminarOferta(item.id)}
                                  className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : vistaActual === 'comercios' ? (
            <div className="space-y-3">
              <form onSubmit={handleCrearComercio} className="flex gap-2 theme-card p-3 rounded-2xl border shadow-sm">
                <input
                  type="text"
                  placeholder="Nuevo supermercado..."
                  value={nuevoNombreComercio}
                  onChange={(e) => setNuevoNombreComercio(e.target.value)}
                  required
                  className="flex-1 theme-input text-xs px-3 py-2 rounded-xl border outline-none"
                />
                <button type="submit" disabled={guardandoMaestro} className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow">
                  Agregar
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {comerciosFiltrados.map((com) => (
                  <div key={com.id} className="theme-card p-3 rounded-2xl border flex justify-between items-center shadow-sm">
                    <span className="text-xs font-bold theme-title">{com.nombre}</span>
                    <button onClick={() => handleEliminarMaestro('comercios', com.id)} className="p-1.5 theme-muted hover:text-rose-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <form onSubmit={handleCrearProducto} className="grid grid-cols-1 sm:grid-cols-4 gap-2 theme-card p-3 rounded-2xl border shadow-sm">
                <input
                  type="text"
                  placeholder="Producto..."
                  value={nuevoProdNombre}
                  onChange={(e) => setNuevoProdNombre(e.target.value)}
                  required
                  className="theme-input text-xs px-3 py-2 rounded-xl border outline-none"
                />
                <input
                  type="text"
                  placeholder="Marca..."
                  value={nuevoProdMarca}
                  onChange={(e) => setNuevoProdMarca(e.target.value)}
                  className="theme-input text-xs px-3 py-2 rounded-xl border outline-none"
                />
                <select
                  value={nuevoProdCat}
                  onChange={(e) => setNuevoProdCat(e.target.value)}
                  className="theme-input text-xs text-amber-500 font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer"
                >
                  <option value="Súper" className="theme-card">Súper</option>
                  <option value="Carnicería" className="theme-card">Carnicería</option>
                  <option value="Verdulería" className="theme-card">Verdulería</option>
                  <option value="Lácteos" className="theme-card">Lácteos</option>
                  <option value="Bebidas" className="theme-card">Bebidas</option>
                  <option value="Limpieza" className="theme-card">Limpieza</option>
                </select>
                <button type="submit" disabled={guardandoMaestro} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs transition cursor-pointer shadow">
                  + Producto
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {productosFiltrados.map((prod) => (
                  <div key={prod.id} className="theme-card p-3 rounded-2xl border flex justify-between items-center shadow-sm">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold theme-title truncate">{prod.nombre}</p>
                      <p className="text-[10px] text-amber-500"><span className="theme-muted">{prod.marca || 'S/M'}</span> • {prod.categoria}</p>
                    </div>
                    <button onClick={() => handleEliminarMaestro('productos', prod.id)} className="p-1.5 theme-muted hover:text-rose-500 cursor-pointer shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}