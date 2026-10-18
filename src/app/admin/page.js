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
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  CheckCheck,
  MapPin,
  Navigation,
  Edit2,
  PackagePlus
} from 'lucide-react';

const ADMIN_EMAILS = [
  'lauradenisecaro87@gmail.com',
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

  // Edición rápida de ofertas
  const [editandoId, setEditandoId] = useState(null);
  const [precioEdit, setPrecioEdit] = useState('');

  // Creación rápida de registros maestros
  const [nuevoNombreComercio, setNuevoNombreComercio] = useState('');
  const [nuevoComercioDireccion, setNuevoComercioDireccion] = useState('');
  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdMarca, setNuevoProdMarca] = useState('');
  const [nuevoProdCat, setNuevoProdCat] = useState('Súper');
  const [guardandoMaestro, setGuardandoMaestro] = useState(false);

  // Edición de comercios (Ubicación / GPS)
  const [editandoComercioId, setEditandoComercioId] = useState(null);
  const [editComercioDireccion, setEditComercioDireccion] = useState('');
  const [editComercioLat, setEditComercioLat] = useState('');
  const [editComercioLng, setEditComercioLng] = useState('');

  // Edición rápida de productos nuevos en cola de revisión
  const [editandoProdId, setEditandoProdId] = useState(null);
  const [editProdNombre, setEditProdNombre] = useState('');
  const [editProdMarca, setEditProdMarca] = useState('');
  const [editProdCat, setEditProdCat] = useState('Súper');

  // Control local de productos ya validados por el admin
  const [prodsValidados, setProdsValidados] = useState([]);

  const esAdmin = useMemo(() => {
    if (!adminUser || !adminUser.email) return false;
    const emailNormalizado = adminUser.email.toLowerCase().trim();
    return ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === emailNormalizado);
  }, [adminUser]);

  useEffect(() => {
    try {
      const guardados = localStorage.getItem('bariahorra_prods_validados');
      if (guardados) setProdsValidados(JSON.parse(guardados));
    } catch (e) { }

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
          id, precio, precio_propuesto, votos_propuesto, votos_positivos, votos_negativos, motivo_revision, es_catalogo, estado, foto_url, creado_en, usuario_id,
          productos ( id, nombre, marca, categoria, creado_en ),
          comercios ( id, nombre, direccion, latitud, longitud, creado_en )
        `).order('creado_en', { ascending: false }),
        supabase.from('comercios').select('*').order('nombre'),
        supabase.from('productos').select('*').order('creado_en', { ascending: false })
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

  // Ofertas: Aprobar y limpiar avisos
  const handleAprobarOferta = async (item) => {
    try {
      const updatePayload = {
        estado: 'activa',
        motivo_revision: null,
        votos_negativos: 0
      };
      const { error } = await supabase.from('ofertas').update(updatePayload).eq('id', item.id);
      if (error) throw error;
      setOfertas((prev) => prev.map((o) => (o.id === item.id ? { ...o, ...updatePayload } : o)));
    } catch (err) {
      alert('Error aprobando oferta: ' + err.message);
    }
  };

  // Ofertas: Aceptar precio propuesto
  const handleAceptarPrecioPropuesto = async (item) => {
    if (!item.precio_propuesto) return;
    try {
      const nuevoValor = Number(item.precio_propuesto);
      const updatePayload = {
        precio: nuevoValor,
        precio_propuesto: null,
        votos_propuesto: 0,
        votos_positivos: 1,
        votos_negativos: 0,
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

  // Ofertas: Descartar propuesta errónea
  const handleDescartarPropuesta = async (item) => {
    try {
      const updatePayload = {
        precio_propuesto: null,
        votos_propuesto: 0,
        motivo_revision: null,
        estado: 'activa'
      };
      const { error } = await supabase.from('ofertas').update(updatePayload).eq('id', item.id);
      if (error) throw error;
      setOfertas((prev) => prev.map((o) => (o.id === item.id ? { ...o, ...updatePayload } : o)));
    } catch (err) {
      alert('Error al descartar propuesta: ' + err.message);
    }
  };

  // Ofertas: Aprobar lote
  const handleAprobarTodasPendientes = async () => {
    if (!confirm(`¿Aprobar todas las ${ofertasPendientes.length} ofertas pendientes?`)) return;
    try {
      const ids = ofertasPendientes.map((o) => o.id);
      const { error } = await supabase
        .from('ofertas')
        .update({ estado: 'activa', motivo_revision: null, votos_negativos: 0 })
        .in('id', ids);

      if (error) throw error;
      cargarTodo();
    } catch (err) {
      alert('Error aprobando en lote: ' + err.message);
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
        estado: 'activa',
        votos_negativos: 0
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

  // Productos Nuevos: Validar / Marcar como revisado
  const handleValidarProducto = (prodId) => {
    const nuevosValidados = [...prodsValidados, prodId];
    setProdsValidados(nuevosValidados);
    try {
      localStorage.setItem('bariahorra_prods_validados', JSON.stringify(nuevosValidados));
    } catch (e) { }
  };

  // Productos Nuevos: Guardar corrección inline
  const handleGuardarEdicionProducto = async (prodId) => {
    if (!editProdNombre.trim()) return;
    try {
      const payload = {
        nombre: editProdNombre.trim(),
        marca: editProdMarca.trim() || null,
        categoria: editProdCat
      };
      const { error } = await supabase.from('productos').update(payload).eq('id', prodId);
      if (error) throw error;

      handleValidarProducto(prodId);
      setEditandoProdId(null);
      cargarTodo();
    } catch (err) {
      alert('Error actualizando producto: ' + err.message);
    }
  };

  // Comercios: Guardar
  const handleCrearComercio = async (e) => {
    e.preventDefault();
    if (!nuevoNombreComercio.trim()) return;
    setGuardandoMaestro(true);
    try {
      const { error } = await supabase.from('comercios').insert([{
        nombre: nuevoNombreComercio.trim(),
        direccion: nuevoComercioDireccion.trim() || null
      }]);
      if (error) throw error;
      setNuevoNombreComercio('');
      setNuevoComercioDireccion('');
      cargarTodo();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardandoMaestro(false);
    }
  };

  // Comercios: Guardar ubicación y coordenadas
  const handleGuardarUbicacionComercio = async (comercioId) => {
    try {
      const payload = {
        direccion: editComercioDireccion.trim() || null,
        latitud: editComercioLat ? parseFloat(editComercioLat) : null,
        longitud: editComercioLng ? parseFloat(editComercioLng) : null
      };

      const { error } = await supabase.from('comercios').update(payload).eq('id', comercioId);
      if (error) throw error;

      setComercios((prev) => prev.map((c) => (c.id === comercioId ? { ...c, ...payload } : c)));
      setEditandoComercioId(null);
    } catch (err) {
      alert('Error al guardar ubicación: ' + err.message);
    }
  };

  const handleCapturarGPSActual = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditComercioLat(pos.coords.latitude.toFixed(6));
        setEditComercioLng(pos.coords.longitude.toFixed(6));
      },
      (err) => {
        alert('No se pudo obtener la ubicación: ' + err.message);
      }
    );
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

  const analizarAlerta = (item) => {
    const precio = Number(item.precio || 0);
    const propuesto = Number(item.precio_propuesto || 0);
    const motivo = item.motivo_revision || '';

    if (propuesto > 0 && precio > 0 && Math.abs(propuesto - precio * 10) < precio * 2) {
      return {
        tipo: 'cero_extra',
        color: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
        icono: AlertTriangle,
        texto: `Variación extrema (${Math.round((propuesto / precio) * 100)}%). ¿Quiso poner $${Math.round(propuesto / 10).toLocaleString('es-AR')}?`
      };
    }

    if (motivo.toLowerCase().includes('inusual') || (propuesto > 0 && precio > 0 && Math.abs(propuesto - precio) / precio > 0.5)) {
      return {
        tipo: 'variacion_fuerte',
        color: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
        icono: AlertTriangle,
        texto: motivo || `Variación de más del 50% vs $${precio.toLocaleString('es-AR')}`
      };
    }

    if (propuesto > 0) {
      return {
        tipo: 'propuesta',
        color: 'bg-sky-500/10 border-sky-500/30 text-sky-500',
        icono: TrendingUp,
        texto: motivo || `Propuesta de cambio a $${propuesto.toLocaleString('es-AR')}`
      };
    }

    if (item.votos_negativos >= 2 || motivo.toLowerCase().includes('aumentado')) {
      return {
        tipo: 'reporte',
        color: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
        icono: AlertTriangle,
        texto: motivo || `Reportado como aumentado (${item.votos_negativos} avisos)`
      };
    }

    return {
      tipo: 'normal',
      color: 'bg-slate-500/10 border-slate-500/30 theme-muted',
      icono: ShieldCheck,
      texto: motivo || 'En revisión'
    };
  };

  // Productos nuevos de la comunidad (últimos 7 días y no validados aún)
  const productosNuevosComunidad = useMemo(() => {
    const haceSieteDias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return productos.filter((p) => {
      const fecha = new Date(p.creado_en || 0);
      return fecha >= haceSieteDias && !prodsValidados.includes(p.id);
    });
  }, [productos, prodsValidados]);

  const ofertasPendientes = useMemo(() => {
    return ofertas.filter((o) => o.estado === 'en_revision' || Boolean(o.motivo_revision) || Boolean(o.precio_propuesto));
  }, [ofertas]);

  const totalPendientesRevision = ofertasPendientes.length + productosNuevosComunidad.length;

  const comerciosSinUbicacion = useMemo(() => {
    return comercios.filter((c) => !c.direccion || !c.latitud);
  }, [comercios]);

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
    return comercios.filter((c) =>
      String(c.nombre || '').toLowerCase().includes(q) ||
      String(c.direccion || '').toLowerCase().includes(q)
    );
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

  if (cargandoAuth) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6 text-center theme-muted text-xs">
        Verificando credenciales de administración...
      </main>
    );
  }

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
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black theme-title">Piloto Automático de Moderación</h2>
                <span className="bg-emerald-500/15 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" /> Activo
                </span>
              </div>
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
        <div className="flex items-center justify-between gap-2 flex-wrap">
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
              {totalPendientesRevision > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  vistaActual === 'pendientes' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                }`}>
                  {totalPendientesRevision}
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
              <span>Todas ({ofertas.length})</span>
            </button>
            <button
              onClick={() => { setVistaActual('comercios'); setBusqueda(''); }}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border relative ${
                vistaActual === 'comercios'
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                  : 'theme-btn-sec border'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Comercios ({comercios.length})</span>
              {comerciosSinUbicacion.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white" title={`${comerciosSinUbicacion.length} comercios sin dirección`}>
                  {comerciosSinUbicacion.length}
                </span>
              )}
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

          {vistaActual === 'pendientes' && ofertasPendientes.length > 1 && (
            <button
              onClick={handleAprobarTodasPendientes}
              className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Aprobar todo el lote de ofertas</span>
            </button>
          )}
        </div>

        {/* BUSCADOR */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 theme-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por producto, súper o motivo de alerta..."
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

        {/* CONTENIDO PRINCIPAL */}
        <div className="min-h-[50vh]">
          {cargandoDatos ? (
            <div className="text-center py-16 theme-muted text-xs">Cargando registros...</div>
          ) : vistaActual === 'pendientes' ? (
            <div className="space-y-4">

              {/* SECCIÓN OPCIÓN A: PRODUCTOS NUEVOS DE LA COMUNIDAD */}
              {productosNuevosComunidad.length > 0 && (
                <div className="theme-card border-2 border-sky-500/40 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[var(--border-card)] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                        <PackagePlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black theme-title">
                          Productos Nuevos creados por Vecinos ({productosNuevosComunidad.length})
                        </h3>
                        <p className="text-[10px] theme-muted">
                          Revisá la ortografía y el rubro para mantener limpio el catálogo público
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                    {productosNuevosComunidad.map((prod) => {
                      const estaEditando = editandoProdId === prod.id;

                      return (
                        <div key={prod.id} className="theme-card-sub border rounded-2xl p-3 space-y-2 shadow-xs">
                          {estaEditando ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editProdNombre}
                                onChange={(e) => setEditProdNombre(e.target.value)}
                                placeholder="Nombre del producto..."
                                className="w-full theme-input text-xs px-2.5 py-1 rounded-lg border outline-none font-bold"
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  value={editProdMarca}
                                  onChange={(e) => setEditProdMarca(e.target.value)}
                                  placeholder="Marca..."
                                  className="w-full theme-input text-xs px-2 py-1 rounded-lg border outline-none"
                                />
                                <select
                                  value={editProdCat}
                                  onChange={(e) => setEditProdCat(e.target.value)}
                                  className="w-full theme-input text-xs px-2 py-1 rounded-lg border outline-none font-bold text-amber-500"
                                >
                                  <option value="Súper">Súper</option>
                                  <option value="Carnicería">Carnicería</option>
                                  <option value="Verdulería">Verdulería</option>
                                  <option value="Lácteos">Lácteos</option>
                                  <option value="Bebidas">Bebidas</option>
                                  <option value="Limpieza">Limpieza</option>
                                </select>
                              </div>
                              <div className="flex items-center justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleGuardarEdicionProducto(prod.id)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg transition"
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditandoProdId(null)}
                                  className="px-2 py-1 theme-btn-sec border text-[10px] rounded-lg"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black theme-title truncate">{prod.nombre}</h4>
                                <p className="text-[10px] theme-muted mt-0.5 truncate">
                                  <span className="theme-subtitle font-bold">{prod.marca || 'S/M'}</span> • <span className="text-amber-500 font-semibold">{prod.categoria || 'Súper'}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditandoProdId(prod.id);
                                    setEditProdNombre(prod.nombre || '');
                                    setEditProdMarca(prod.marca || '');
                                    setEditProdCat(prod.categoria || 'Súper');
                                  }}
                                  className="p-1.5 theme-btn-sec rounded-lg border text-sky-500 hover:border-sky-500 transition cursor-pointer"
                                  title="Corregir nombre, marca o rubro"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleValidarProducto(prod.id)}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                                  title="Validar y dar visto bueno"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEliminarMaestro('productos', prod.id)}
                                  className="p-1.5 theme-muted hover:text-rose-500 cursor-pointer"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LISTA DE OFERTAS PENDIENTES */}
              {ofertasFiltradas.length === 0 && productosNuevosComunidad.length === 0 ? (
                <div className="text-center py-16 theme-muted text-xs theme-card rounded-3xl border space-y-2">
                  <p>No hay alertas ni productos pendientes de revisión.</p>
                  <p className="text-emerald-500 font-bold">¡Excelente! El piloto automático tiene todo bajo control.</p>
                </div>
              ) : (
                <>
                  {/* VISTA MÓVIL */}
                  <div className="block sm:hidden space-y-3">
                    {ofertasFiltradas.map((item) => {
                      const tieneFoto = Boolean(item.foto_url);
                      const tienePropuesto = Boolean(item.precio_propuesto);
                      const alerta = analizarAlerta(item);
                      const IconoAlerta = alerta.icono;

                      const fechaFormateada = new Date(item.creado_en).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      });

                      return (
                        <div key={item.id} className="theme-card border rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow-md">
                          {(item.motivo_revision || tienePropuesto) && (
                            <div className={`p-2 rounded-xl border text-[11px] font-bold flex items-start gap-1.5 ${alerta.color}`}>
                              <IconoAlerta className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="leading-tight">{alerta.texto}</span>
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
                                      title="Clic para editar precio"
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
                                  title="Eliminar oferta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {tienePropuesto && (
                              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-2">
                                <div className="text-[11px] min-w-0">
                                  <span className="theme-muted">Propuesto: </span>
                                  <strong className="text-sky-500 font-mono font-black">${Number(item.precio_propuesto).toLocaleString('es-AR')}</strong>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleAceptarPrecioPropuesto(item)}
                                    className="px-2 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-black flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Aceptar $</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDescartarPropuesta(item)}
                                    className="p-1 rounded-lg theme-btn-sec text-rose-500 hover:bg-rose-500/10 border text-[10px] cursor-pointer"
                                    title="Descartar propuesta"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* VISTA ESCRITORIO */}
                  <div className="hidden sm:block theme-card rounded-3xl border overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="theme-card-sub border-b text-[10px] font-black uppercase tracking-wider theme-muted">
                          <th className="p-3 pl-4 w-12 text-center">Foto</th>
                          <th className="p-3">Producto y Marca</th>
                          <th className="p-3">Supermercado</th>
                          <th className="p-3 text-right">Precio Actual</th>
                          <th className="p-3">Diagnóstico del Piloto Automático</th>
                          <th className="p-3 pr-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y theme-card-sub/50 text-xs">
                        {ofertasFiltradas.map((item) => {
                          const tieneFoto = Boolean(item.foto_url);
                          const tienePropuesto = Boolean(item.precio_propuesto);
                          const alerta = analizarAlerta(item);
                          const IconoAlerta = alerta.icono;

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
                                <div>
                                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold text-[11px]">
                                    {item.comercios?.nombre || 'Comercio'}
                                  </span>
                                  {item.comercios?.direccion && (
                                    <p className="text-[9px] theme-muted mt-0.5 flex items-center gap-1">
                                      <MapPin className="w-2.5 h-2.5 text-sky-500" />
                                      <span className="truncate max-w-[140px]">{item.comercios.direccion}</span>
                                    </p>
                                  )}
                                </div>
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
                                {(item.motivo_revision || tienePropuesto) ? (
                                  <div className="space-y-1">
                                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1 ${alerta.color}`}>
                                      <IconoAlerta className="w-3 h-3 shrink-0" />
                                      <span>{alerta.texto}</span>
                                    </span>

                                    {tienePropuesto && (
                                      <div className="flex items-center gap-1.5 pt-0.5">
                                        <span className="text-[10px] theme-muted font-mono">Nuevo: <strong className="text-sky-500">${Number(item.precio_propuesto).toLocaleString('es-AR')}</strong></span>
                                        <button
                                          onClick={() => handleAceptarPrecioPropuesto(item)}
                                          className="px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-black cursor-pointer shadow-xs"
                                        >
                                          Aceptar $
                                        </button>
                                        <button
                                          onClick={() => handleDescartarPropuesta(item)}
                                          className="p-1 rounded theme-btn-sec text-rose-500 hover:bg-rose-500/10 border text-[10px] cursor-pointer"
                                          title="Descartar propuesta"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Verificado
                                  </span>
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
          ) : vistaActual === 'ofertas' ? (
            /* --- PESTAÑA TODAS LAS OFERTAS --- */
            <div className="space-y-3">
              <div className="hidden sm:block theme-card rounded-3xl border overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="theme-card-sub border-b text-[10px] font-black uppercase tracking-wider theme-muted">
                      <th className="p-3 pl-4 w-12 text-center">Foto</th>
                      <th className="p-3">Producto y Marca</th>
                      <th className="p-3">Supermercado</th>
                      <th className="p-3 text-right">Precio Actual</th>
                      <th className="p-3 pr-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-card-sub/50 text-xs">
                    {ofertasFiltradas.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-500/5 transition">
                        <td className="p-3 pl-4 text-center">
                          {item.foto_url ? (
                            <a href={item.foto_url} target="_blank" rel="noreferrer" className="inline-block w-9 h-9 rounded-lg theme-card-sub border overflow-hidden">
                              <img src={item.foto_url} alt="Foto" className="w-full h-full object-cover" />
                            </a>
                          ) : (
                            <div className="w-9 h-9 rounded-lg theme-card-sub border flex items-center justify-center mx-auto theme-muted">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-black theme-title">{item.productos?.nombre || 'Producto'}</p>
                          <p className="text-[10px] theme-muted">{item.productos?.marca || 'Genérica'} • {item.productos?.categoria || 'Súper'}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold text-[11px]">
                            {item.comercios?.nombre || 'Comercio'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-500 text-sm">
                          ${Number(item.precio || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="p-3 pr-4 text-right space-x-1.5 whitespace-nowrap">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : vistaActual === 'comercios' ? (
            /* --- PESTAÑA COMERCIOS (UBICACIÓN Y GPS) --- */
            <div className="space-y-3">
              <form onSubmit={handleCrearComercio} className="flex flex-col sm:flex-row gap-2 theme-card p-3 rounded-2xl border shadow-sm">
                <input
                  type="text"
                  placeholder="Nombre del supermercado o comercio..."
                  value={nuevoNombreComercio}
                  onChange={(e) => setNuevoNombreComercio(e.target.value)}
                  required
                  className="flex-1 theme-input text-xs px-3 py-2 rounded-xl border outline-none"
                />
                <input
                  type="text"
                  placeholder="Dirección o barrio (ej: Mitre 450, Km 8)..."
                  value={nuevoComercioDireccion}
                  onChange={(e) => setNuevoComercioDireccion(e.target.value)}
                  className="flex-1 theme-input text-xs px-3 py-2 rounded-xl border outline-none"
                />
                <button type="submit" disabled={guardandoMaestro} className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow shrink-0">
                  + Agregar
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {comerciosFiltrados.map((com) => {
                  const tieneDireccion = Boolean(com.direccion);
                  const tieneCoords = Boolean(com.latitud && com.longitud);
                  const estaEditando = editandoComercioId === com.id;

                  return (
                    <div key={com.id} className="theme-card p-3.5 rounded-2xl border flex flex-col justify-between shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-black theme-title truncate">{com.nombre}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {tieneDireccion ? (
                              <p className="text-[10px] theme-muted flex items-center gap-1 truncate">
                                <MapPin className="w-2.5 h-2.5 text-sky-500 shrink-0" />
                                <span className="truncate">{com.direccion}</span>
                              </p>
                            ) : (
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.2 rounded">
                                Sin dirección
                              </span>
                            )}

                            {tieneCoords && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                GPS OK
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (estaEditando) {
                                setEditandoComercioId(null);
                              } else {
                                setEditandoComercioId(com.id);
                                setEditComercioDireccion(com.direccion || '');
                                setEditComercioLat(com.latitud || '');
                                setEditComercioLng(com.longitud || '');
                              }
                            }}
                            className="p-1.5 theme-btn-sec rounded-lg border text-sky-500 hover:border-sky-500 transition cursor-pointer"
                            title="Editar ubicación y coordenadas"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarMaestro('comercios', com.id)}
                            className="p-1.5 theme-muted hover:text-rose-500 cursor-pointer"
                            title="Eliminar comercio"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {estaEditando && (
                        <div className="theme-card-sub border border-sky-500/40 rounded-xl p-2.5 space-y-2 pt-2 animate-in fade-in duration-150">
                          <div>
                            <label className="text-[9px] theme-muted block mb-0.5">Dirección en Bariloche:</label>
                            <input
                              type="text"
                              value={editComercioDireccion}
                              onChange={(e) => setEditComercioDireccion(e.target.value)}
                              placeholder="Ej: Av. Bustillo Km 4, Onelli 1200"
                              className="w-full theme-input text-xs px-2.5 py-1 rounded-lg border outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[9px] theme-muted block mb-0.5">Latitud:</label>
                              <input
                                type="text"
                                value={editComercioLat}
                                onChange={(e) => setEditComercioLat(e.target.value)}
                                placeholder="-41.133..."
                                className="w-full theme-input text-[11px] font-mono px-2 py-1 rounded-lg border outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] theme-muted block mb-0.5">Longitud:</label>
                              <input
                                type="text"
                                value={editComercioLng}
                                onChange={(e) => setEditComercioLng(e.target.value)}
                                placeholder="-71.310..."
                                className="w-full theme-input text-[11px] font-mono px-2 py-1 rounded-lg border outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1 pt-1">
                            <button
                              type="button"
                              onClick={handleCapturarGPSActual}
                              className="text-[10px] theme-btn-sec border px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer hover:border-sky-500"
                              title="Toma tu posición GPS si estás en el local"
                            >
                              <Navigation className="w-2.5 h-2.5 text-sky-500" />
                              <span>Mi GPS</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleGuardarUbicacionComercio(com.id)}
                                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditandoComercioId(null)}
                                className="theme-btn-sec border text-[10px] px-2 py-1 rounded-lg cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* --- PESTAÑA PRODUCTOS --- */
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