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
  AlertCircle
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

  // Modal de edición
  const [editando, setEditando] = useState(false);
  const [nuevoApodo, setNuevoApodo] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState(AVATAR_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const cargarDatosPerfil = async () => {
    setCargando(true);
    try {
      // 1. Obtener usuario de la sesión activa
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

      // 2. Consultar perfil fresco directo de la base de datos
      const { data: perfilDB } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', activeUser.id)
        .maybeSingle();

      // Apodo prioritario: de la tabla perfiles -> luego metadata -> luego parte previa del email -> fallback 'vecino'
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

      const perfilCompleto = {
        ...perfilDB,
        id: activeUser.id,
        apodo: apodoDefinido,
        username: apodoDefinido,
        avatar_url: avatarDefinido,
        puntos: perfilDB?.puntos || 0,
        precios_aportados: perfilDB?.precios_aportados || 0
      };

      setPerfil(perfilCompleto);
      setNuevoApodo(apodoDefinido);
      setNuevoAvatar(avatarDefinido);

      // Sincronizar en localStorage
      try {
        localStorage.setItem('bariahorra_perfil', JSON.stringify(perfilCompleto));
      } catch (e) { }

      // 3. Cargar ofertas del usuario
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

      // 4. Traer productos y comercios para resolver nombres
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

  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setMensajeError('');
    if (!nuevoApodo.trim()) {
      setMensajeError('El apodo no puede estar vacío.');
      return;
    }

    setGuardando(true);
    try {
      const apodoLimpio = nuevoApodo.trim().replace(/^@/, '');

      // 1. Actualizar directamente en la fila existente de la tabla perfiles
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

      if (errUpdate) {
        console.error('Error detallado de Supabase:', errUpdate);
        throw new Error(errUpdate.message);
      }

      // Si no existía la fila por id, la insertamos
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

      // 2. Guardar en user_metadata de Auth para que no vuelva al nombre de Google
      await supabase.auth.updateUser({
        data: {
          username: apodoLimpio,
          apodo: apodoLimpio,
          full_name: apodoLimpio,
          avatar_url: nuevoAvatar
        }
      });

      // 3. Actualizar estado local
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

      setEditando(false);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setMensajeError(err.message || 'Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
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

  // Calculamos el total de confirmaciones sumando todos los votos positivos de sus ofertas
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

      {/* TARJETA DE PERFIL */}
      <div className="theme-card border rounded-3xl p-5 sm:p-6 shadow-2xl relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={perfil?.avatar_url || AVATAR_DEFAULT}
              alt={perfil?.apodo}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl theme-card-sub border-2 object-cover shadow-inner"
            />
            <div>
              <h1 className="text-base sm:text-lg font-black theme-title">
                @{perfil?.apodo || perfil?.username || usuario?.email?.split('@')[0] || 'vecino'}
              </h1>
              <p className="text-xs theme-muted font-mono">
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
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1.5 theme-btn-sec border px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar personaje</span>
          </button>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-3 gap-2.5 mt-6">
          <div className="theme-card-sub p-3 rounded-2xl border text-center shadow-sm">
            <p className="text-base sm:text-lg font-black theme-title font-mono">
              {perfil?.precios_aportados || misOfertas.length}
            </p>
            <p className="text-[10px] theme-muted leading-tight mt-0.5">Precios aportados</p>
          </div>
          <div className="theme-card-sub p-3 rounded-2xl border text-center shadow-sm">
            <p className="text-base sm:text-lg font-black theme-title font-mono">
              {totalConfirmaciones}
            </p>
            <p className="text-[10px] theme-muted leading-tight mt-0.5">Confirmaciones</p>
          </div>
          <div className="theme-card-sub p-3 rounded-2xl border text-center shadow-sm">
            <p className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400 font-mono">
              {perfil?.puntos || 0}
            </p>
            <p className="text-[10px] theme-muted leading-tight mt-0.5">Puntos comunitarios</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: MIS APORTES */}
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
          <div className="p-8 rounded-2xl theme-card border text-center text-xs theme-muted space-y-3 shadow-sm">
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
                className="p-3.5 rounded-2xl theme-card border flex items-center justify-between gap-3 transition shadow-sm hover:border-slate-500"
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

      {/* MODAL DE EDICIÓN */}
      {editando && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="theme-card border rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black theme-title">Editar personaje</h3>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="p-1 rounded-lg theme-muted hover:theme-title cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarCambios} className="space-y-4">
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
                    className="w-full theme-input border rounded-xl pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-sky-500 transition font-bold shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold theme-subtitle mb-2">
                  Elegí tu avatar de Bariloche
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

              {mensajeError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mensajeError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="w-1/2 py-2 rounded-xl border theme-btn-sec text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-1/2 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-black transition shadow-lg shadow-sky-500/20 cursor-pointer active:scale-95"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}