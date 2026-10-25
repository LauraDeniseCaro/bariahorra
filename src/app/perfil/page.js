'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Award,
  Crown,
  ShieldCheck,
  Flame,
  User,
  X,
  Sparkles,
  Store,
  AlertCircle,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Check
} from 'lucide-react';

const AVATARES_DISPONIBLES = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=bariloche',
  'https://api.dicebear.com/7.x/bottts/svg?seed=nahuel',
  'https://api.dicebear.com/7.x/bottts/svg?seed=catedral',
  'https://api.dicebear.com/7.x/bottts/svg?seed=otto',
  'https://api.dicebear.com/7.x/bottts/svg?seed=huapi',
  'https://api.dicebear.com/7.x/bottts/svg?seed=choclo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=frambuesa',
  'https://api.dicebear.com/7.x/bottts/svg?seed=cerveza',
  'https://api.dicebear.com/7.x/bottts/svg?seed=trucha',
  'https://api.dicebear.com/7.x/bottts/svg?seed=bosque'
];

const AVATAR_DEFAULT = AVATARES_DISPONIBLES[0];

// Catálogo sobrio sin emojis, con iconos vectoriales de Lucide
const MEDIOS_PAGO_DISPONIBLES = [
  { id: 'bna_modo', nombre: 'Banco Nación (MODO)', tipo: 'banco', Icono: Building2 },
  { id: 'cuenta_dni', nombre: 'Cuenta DNI', tipo: 'billetera', Icono: Smartphone },
  { id: 'patagonia', nombre: 'Banco Patagonia', tipo: 'banco', Icono: Building2 },
  { id: 'bpn', nombre: 'Banco Neuquén (BPN)', tipo: 'banco', Icono: Building2 },
  { id: 'galicia', nombre: 'Banco Galicia', tipo: 'banco', Icono: Building2 },
  { id: 'santander', nombre: 'Santander', tipo: 'banco', Icono: Building2 },
  { id: 'personal_pay', nombre: 'Personal Pay', tipo: 'billetera', Icono: Smartphone },
  { id: 'mercado_pago', nombre: 'Mercado Pago', tipo: 'billetera', Icono: Smartphone },
  { id: 'naranja_x', nombre: 'Naranja X', tipo: 'tarjeta', Icono: CreditCard }
];

function calcularRango(puntos = 0) {
  if (puntos >= 1000) return { nombre: 'Héroe Comunitario', icono: Crown, color: 'text-amber-500 dark:text-amber-400' };
  if (puntos >= 400) return { nombre: 'Defensor del Bolsillo', icono: ShieldCheck, color: 'text-sky-500 dark:text-sky-400' };
  if (puntos >= 150) return { nombre: 'Vecino Activo de Bariloche', icono: Award, color: 'text-emerald-500 dark:text-emerald-400' };
  if (puntos >= 50) return { nombre: 'Cazador de Ofertas', icono: Flame, color: 'text-indigo-500 dark:text-indigo-400' };
  return { nombre: 'Vecino Observador', icono: User, color: 'theme-muted' };
}

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [misOfertas, setMisOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal 1: Personaje (Apodo + Avatar)
  const [modalPersonaje, setModalPersonaje] = useState(false);
  const [nuevoApodo, setNuevoApodo] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState(AVATAR_DEFAULT);
  const [guardandoPersonaje, setGuardandoPersonaje] = useState(false);
  const [errorPersonaje, setErrorPersonaje] = useState('');

  // Modal 2: Billetera independiente
  const [modalBilletera, setModalBilletera] = useState(false);
  const [mediosSeleccionados, setMediosSeleccionados] = useState([]);
  const [guardandoBilletera, setGuardandoBilletera] = useState(false);

  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const cargarDatosPerfil = async () => {
    setCargando(true);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      let activeUser = user;

      if (authErr || !activeUser) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeUser = sessionData?.session?.user || null;
      }

      if (!activeUser) {
        router.push('/');
        return;
      }

      setUsuario(activeUser);

      const { data: perfilDB } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', activeUser.id)
        .maybeSingle();

      const apodoDefinido =
        perfilDB?.apodo ||
        perfilDB?.username ||
        activeUser.user_metadata?.apodo ||
        activeUser.user_metadata?.username ||
        activeUser.email?.split('@')[0] ||
        'vecino';

      const avatarDefinido =
        perfilDB?.avatar_url ||
        activeUser.user_metadata?.avatar_url ||
        AVATAR_DEFAULT;

      const mediosDefinidos = Array.isArray(perfilDB?.medios_pago)
        ? perfilDB.medios_pago
        : [];

      const perfilCompleto = {
        ...perfilDB,
        id: activeUser.id,
        apodo: apodoDefinido,
        username: apodoDefinido,
        avatar_url: avatarDefinido,
        medios_pago: mediosDefinidos,
        puntos: perfilDB?.puntos || 0,
        precios_aportados: perfilDB?.precios_aportados || 0
      };

      setPerfil(perfilCompleto);
      setNuevoApodo(apodoDefinido);
      setNuevoAvatar(avatarDefinido);
      setMediosSeleccionados(mediosDefinidos);

      try {
        localStorage.setItem('bariahorra_perfil', JSON.stringify(perfilCompleto));
      } catch (e) { }

      // Cargar aportes del usuario
      const { data: rawOfertas } = await supabase
        .from('ofertas')
        .select('*');

      const userIdStr = String(activeUser.id).toLowerCase();
      const userEmail = String(activeUser.email || '').toLowerCase();

      const ofertasDelUsuario = (rawOfertas || []).filter((o) => {
        const oUser = String(o.usuario_id || o.user_id || '').toLowerCase();
        const oEmail = String(o.email || '').toLowerCase();
        return oUser === userIdStr || (oEmail && oEmail === userEmail);
      });

      const [resProd, resCom] = await Promise.allSettled([
        supabase.from('productos').select('*'),
        supabase.from('comercios').select('*')
      ]);

      const prodsList = resProd.status === 'fulfilled' && resProd.value.data ? resProd.value.data : [];
      const comsList = resCom.status === 'fulfilled' && resCom.value.data ? resCom.value.data : [];

      const mapProd = new Map();
      prodsList.forEach((p) => mapProd.set(String(p.id).toLowerCase(), p));

      const mapCom = new Map();
      comsList.forEach((c) => mapCom.set(String(c.id).toLowerCase(), c));

      const ofertasMapeadas = ofertasDelUsuario.map((item) => {
        const prodRel = mapProd.get(String(item.producto_id || '').toLowerCase());
        const comRel = mapCom.get(String(item.comercio_id || '').toLowerCase());

        return {
          ...item,
          _producto: prodRel?.nombre || prodRel?.producto_generico || item.producto_generico || item.producto || 'Producto en góndola',
          _comercio: comRel?.nombre || item.comercio || item.supermercado || 'Comercio Bariloche',
          _precio: Number(item.precio || 0),
          _votosPositivos: Number(item.votos_positivos || 0),
          _votosNegativos: Number(item.votos_negativos || 0)
        };
      });

      ofertasMapeadas.sort((a, b) => (b.id || 0) - (a.id || 0));
      setMisOfertas(ofertasMapeadas);

    } catch (err) {
      console.error('Detalle de carga de perfil:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      localStorage.removeItem('bariahorra_perfil');
    } catch (e) { }
    await supabase.auth.signOut();
    router.push('/');
  };

  // Guardar solo Personaje (Apodo y Avatar)
  const handleGuardarPersonaje = async (e) => {
    e.preventDefault();
    setErrorPersonaje('');
    if (!nuevoApodo.trim()) {
      setErrorPersonaje('El apodo no puede estar vacío.');
      return;
    }

    setGuardandoPersonaje(true);
    try {
      const apodoLimpio = nuevoApodo.trim().replace(/^@/, '');

      const { data: updateData, error: errUpdate } = await supabase
        .from('perfiles')
        .update({
          username: apodoLimpio,
          apodo: apodoLimpio,
          avatar_url: nuevoAvatar,
          avatar_id: 'bottts'
        })
        .eq('id', usuario.id)
        .select();

      if (errUpdate) throw errUpdate;

      if (!updateData || updateData.length === 0) {
        await supabase.from('perfiles').insert([
          {
            id: usuario.id,
            username: apodoLimpio,
            apodo: apodoLimpio,
            avatar_url: nuevoAvatar,
            avatar_id: 'bottts'
          }
        ]);
      }

      await supabase.auth.updateUser({
        data: {
          username: apodoLimpio,
          apodo: apodoLimpio,
          full_name: apodoLimpio,
          avatar_url: nuevoAvatar
        }
      });

      const nuevoEstadoPerfil = {
        ...perfil,
        username: apodoLimpio,
        apodo: apodoLimpio,
        avatar_url: nuevoAvatar
      };

      setPerfil(nuevoEstadoPerfil);
      try {
        localStorage.setItem('bariahorra_perfil', JSON.stringify(nuevoEstadoPerfil));
        window.dispatchEvent(new Event('perfil_actualizado'));
      } catch (e) { }

      setModalPersonaje(false);
    } catch (err) {
      console.error('Error al guardar personaje:', err);
      setErrorPersonaje(err.message || 'Error al guardar los cambios.');
    } finally {
      setGuardandoPersonaje(false);
    }
  };

  // Guardar solo Billetera (Medios de Pago)
  const handleGuardarBilletera = async () => {
    setGuardandoBilletera(true);
    try {
      const { error: errUpdate } = await supabase
        .from('perfiles')
        .update({
          medios_pago: mediosSeleccionados
        })
        .eq('id', usuario.id);

      if (errUpdate) throw errUpdate;

      await supabase.auth.updateUser({
        data: {
          medios_pago: mediosSeleccionados
        }
      });

      const nuevoEstadoPerfil = {
        ...perfil,
        medios_pago: mediosSeleccionados
      };

      setPerfil(nuevoEstadoPerfil);
      try {
        localStorage.setItem('bariahorra_perfil', JSON.stringify(nuevoEstadoPerfil));
        window.dispatchEvent(new Event('perfil_actualizado'));
      } catch (e) { }

      setModalBilletera(false);
    } catch (err) {
      console.error('Error al guardar billetera:', err);
      alert('Hubo un problema al guardar tus medios de pago.');
    } finally {
      setGuardandoBilletera(false);
    }
  };

  const toggleMedioPago = (medioId) => {
    setMediosSeleccionados((prev) =>
      prev.includes(medioId)
        ? prev.filter((id) => id !== medioId)
        : [...prev, medioId]
    );
  };

  const handleEliminarOferta = async (ofertaId) => {
    if (!confirm('¿Seguro que querés eliminar esta oferta?')) return;

    try {
      const { error } = await supabase
        .from('ofertas')
        .delete()
        .eq('id', ofertaId);

      if (error) throw error;
      setMisOfertas((prev) => prev.filter((o) => o.id !== ofertaId));
    } catch (err) {
      console.error('Error eliminando oferta:', err);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen theme-muted flex items-center justify-center text-xs">
        Cargando tu perfil...
      </div>
    );
  }

  const rangoInfo = calcularRango(perfil?.puntos || 0);
  const IconoRango = rangoInfo.icono;
  const totalConfirmaciones = misOfertas.reduce((acc, curr) => acc + (curr._votosPositivos || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4 selection:bg-sky-500 selection:text-white pb-24">

      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs theme-muted hover:text-sky-400 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a las ofertas</span>
        </Link>

        <button
          type="button"
          onClick={handleCerrarSesion}
          className="inline-flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition font-bold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* BLOQUE 1: TARJETA DE IDENTIDAD / PERSONAJE */}
      <div className="theme-card border rounded-3xl p-5 sm:p-6 shadow-xl relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={perfil?.avatar_url || AVATAR_DEFAULT}
              alt={perfil?.apodo}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl theme-card-sub border-2 object-cover shadow-inner shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black theme-title truncate">
                @{perfil?.apodo || perfil?.username || usuario?.email?.split('@')[0] || 'vecino'}
              </h1>
              <p className="text-xs theme-muted font-mono truncate">
                {usuario?.email}
              </p>

              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 theme-btn-sec border px-2.5 py-1 rounded-full text-[10px] font-bold theme-subtitle">
                  <IconoRango className={`w-3 h-3 ${rangoInfo.color}`} />
                  <span>{rangoInfo.nombre}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-500 dark:text-amber-400 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>{perfil?.puntos || 0} Puntos</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNuevoApodo(perfil?.apodo || '');
              setNuevoAvatar(perfil?.avatar_url || AVATAR_DEFAULT);
              setErrorPersonaje('');
              setModalPersonaje(true);
            }}
            className="inline-flex items-center gap-1.5 theme-btn-sec border px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar personaje</span>
          </button>
        </div>

        {/* MÉTRICAS COMUNITARIAS */}
        <div className="grid grid-cols-3 gap-2.5 mt-6">
          <div className="theme-card-sub p-3 rounded-2xl border text-center shadow-xs">
            <p className="text-base sm:text-lg font-black theme-title font-mono">
              {perfil?.precios_aportados || misOfertas.length}
            </p>
            <p className="text-[10px] theme-muted leading-tight mt-0.5">Precios aportados</p>
          </div>
          <div className="theme-card-sub p-3 rounded-2xl border text-center shadow-xs">
            <p className="text-base sm:text-lg font-black theme-title font-mono">
              {totalConfirmaciones}
            </p>
            <p className="text-[10px] theme-muted leading-tight mt-0.5">Confirmaciones</p>
          </div>
          <div className="theme-card-sub p-3 rounded-2xl border text-center shadow-xs">
            <p className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400 font-mono">
              {perfil?.puntos || 0}
            </p>
            <p className="text-[10px] theme-muted leading-tight mt-0.5">Puntos comunitarios</p>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: BILLETERA DE AHORRO INDEPENDIENTE */}
      <div className="theme-card border rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black theme-title">
                Mis Medios de Pago y Descuentos
              </h2>
              <p className="text-[11px] theme-muted">
                Bancos y billeteras virtuales configuradas para comparar precios
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMediosSeleccionados(perfil?.medios_pago || []);
              setModalBilletera(true);
            }}
            className="inline-flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Gestionar</span>
          </button>
        </div>

        {(perfil?.medios_pago || []).length === 0 ? (
          <div className="theme-card-sub border border-dashed rounded-2xl p-4 text-center space-y-2">
            <p className="text-xs theme-muted">
              No tenés ninguna billetera configurada.
            </p>
            <button
              type="button"
              onClick={() => {
                setMediosSeleccionados(perfil?.medios_pago || []);
                setModalBilletera(true);
              }}
              className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
            >
              + Elegir mis bancos y billeteras
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {perfil.medios_pago.map((medioId) => {
              const infoMedio = MEDIOS_PAGO_DISPONIBLES.find((m) => m.id === medioId);
              if (!infoMedio) return null;
              const IconoM = infoMedio.Icono;
              return (
                <span
                  key={medioId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 border border-sky-500/25 text-sky-400"
                >
                  <IconoM className="w-3.5 h-3.5" />
                  <span>{infoMedio.nombre}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* BLOQUE 3: MIS APORTES */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider theme-subtitle">
              Mis aportes a la comunidad
            </h2>
            <span className="text-[11px] theme-muted">
              {misOfertas.length} {misOfertas.length === 1 ? 'activa' : 'activas'}
            </span>
          </div>

          <Link
            href="/cargar"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Aportar precio</span>
          </Link>
        </div>

        {misOfertas.length === 0 ? (
          <div className="p-8 rounded-2xl theme-card border text-center text-xs theme-muted space-y-3 shadow-xs">
            <p>Todavía no cargaste ningún precio.</p>
            <Link
              href="/cargar"
              className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Cargar mi primer precio (+10 pts)
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {misOfertas.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl theme-card border flex items-center justify-between gap-3 transition shadow-xs hover:border-slate-500"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Store className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                      <span>{item._comercio}</span>
                    </span>
                    <span className="text-xs font-bold theme-title truncate">
                      {item._producto}
                    </span>
                  </div>
                  <div className="text-[11px] theme-muted mt-1 flex items-center gap-2">
                    <span className="font-mono font-bold theme-subtitle">
                      ${Number(item._precio || 0).toLocaleString('es-AR')}
                    </span>
                    <span>•</span>
                    <span>{item._votosPositivos} confirmaciones</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEliminarOferta(item.id)}
                  className="p-2 rounded-xl theme-muted hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition shrink-0 cursor-pointer"
                  title="Eliminar oferta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1 EXCLUSIVO: EDITAR PERSONAJE (APODO + AVATAR) */}
      {modalPersonaje && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="theme-card border rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black theme-title">Editar personaje</h3>
                <p className="text-[11px] theme-muted">Tu alias y avatar en la comunidad</p>
              </div>
              <button
                type="button"
                onClick={() => setModalPersonaje(false)}
                className="p-1 rounded-lg theme-muted hover:theme-title cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarPersonaje} className="space-y-4">
              <div>
                <label className="block text-xs font-bold theme-subtitle mb-1">
                  Tu apodo único
                </label>
                <div className="relative">
                  <span className="theme-muted absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">@</span>
                  <input
                    type="text"
                    value={nuevoApodo}
                    onChange={(e) => setNuevoApodo(e.target.value)}
                    placeholder="Escribí tu apodo..."
                    className="w-full theme-input border rounded-xl pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-sky-500 transition font-bold shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold theme-subtitle mb-2">
                  Elegí tu robotito de Bariloche
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARES_DISPONIBLES.map((avatar) => {
                    const seleccionado = nuevoAvatar === avatar;
                    return (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setNuevoAvatar(avatar)}
                        className={`rounded-xl overflow-hidden border-2 p-1 theme-card-sub transition cursor-pointer ${
                          seleccionado
                            ? 'border-sky-400 ring-2 ring-sky-500/20'
                            : 'border-transparent hover:border-slate-500'
                        }`}
                      >
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorPersonaje && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorPersonaje}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPersonaje(false)}
                  className="w-1/2 py-2 rounded-xl border theme-btn-sec text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPersonaje}
                  className="w-1/2 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-black transition shadow-lg shadow-sky-500/20 cursor-pointer active:scale-95"
                >
                  {guardandoPersonaje ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 EXCLUSIVO: GESTIONAR BILLETERAS Y TARJETAS */}
      {modalBilletera && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="theme-card border rounded-3xl p-5 max-w-md w-full shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black theme-title">Gestionar billeteras</h3>
                <p className="text-[11px] theme-muted">Tildá tus tarjetas y cuentas con reintegro</p>
              </div>
              <button
                type="button"
                onClick={() => setModalBilletera(false)}
                className="p-1 rounded-lg theme-muted hover:theme-title cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {MEDIOS_PAGO_DISPONIBLES.map((medio) => {
                const seleccionado = mediosSeleccionados.includes(medio.id);
                const IconoM = medio.Icono;
                return (
                  <button
                    key={medio.id}
                    type="button"
                    onClick={() => toggleMedioPago(medio.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                      seleccionado
                        ? 'bg-sky-500/15 border-sky-400 text-sky-400 shadow-xs'
                        : 'theme-card-sub border-[var(--border-card)] theme-muted hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`p-1.5 rounded-lg border ${
                        seleccionado
                          ? 'bg-sky-500/20 border-sky-400/30 text-sky-400'
                          : 'theme-card border-[var(--border-card)] theme-muted'
                      }`}>
                        <IconoM className="w-4 h-4" />
                      </div>
                      <span className="truncate">{medio.nombre}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                      seleccionado
                        ? 'bg-sky-500 border-sky-400 text-slate-950'
                        : 'border-slate-600 bg-transparent'
                    }`}>
                      {seleccionado && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-card)]">
              <button
                type="button"
                onClick={() => setModalBilletera(false)}
                className="w-1/2 py-2.5 rounded-xl border theme-btn-sec text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardandoBilletera}
                onClick={handleGuardarBilletera}
                className="w-1/2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-black transition shadow-lg shadow-sky-500/20 cursor-pointer active:scale-95"
              >
                {guardandoBilletera ? 'Guardando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}