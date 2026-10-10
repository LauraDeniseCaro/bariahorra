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
  if (puntos >= 1000) return { nombre: 'Héroe Comunitario', icono: Crown, color: 'text-amber-400' };
  if (puntos >= 400) return { nombre: 'Defensor del Bolsillo', icono: ShieldCheck, color: 'text-sky-400' };
  if (puntos >= 150) return { nombre: 'Vecino Activo de Bariloche', icono: Award, color: 'text-emerald-400' };
  if (puntos >= 50) return { nombre: 'Cazador de Ofertas', icono: Flame, color: 'text-indigo-400' };
  return { nombre: 'Vecino Observador', icono: User, color: 'text-slate-400' };
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/');
        return;
      }

      const user = session.user;
      setUsuario(user);

      // 1. Cargar Perfil buscando por id o email
      let datosPerfil = null;
      const { data: perfilPorId } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (perfilPorId) {
        datosPerfil = perfilPorId;
      } else {
        const { data: perfilPorEmail } = await supabase
          .from('perfiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        if (perfilPorEmail) datosPerfil = perfilPorEmail;
      }

      // 2. Extraer apodo asegurando que nunca quede vacío
      const cacheLocal = localStorage.getItem('bariahorra_perfil');
      let apodoCache = '';
      let avatarCache = '';
      if (cacheLocal) {
        try {
          const parsed = JSON.parse(cacheLocal);
          apodoCache = parsed.apodo;
          avatarCache = parsed.avatar_url;
        } catch (e) {}
      }

      const apodoDefinido =
        datosPerfil?.apodo ||
        apodoCache ||
        user.user_metadata?.apodo ||
        user.user_metadata?.username ||
        user.email?.split('@')[0] ||
        'lauchiña';

      const avatarDefinido =
        datosPerfil?.avatar_url ||
        avatarCache ||
        user.user_metadata?.avatar_url ||
        AVATAR_DEFAULT;

      const perfilCompleto = {
        ...datosPerfil,
        apodo: apodoDefinido,
        avatar_url: avatarDefinido,
        puntos: datosPerfil?.puntos || 0,
        precios_aportados: datosPerfil?.precios_aportados || 0
      };

      setPerfil(perfilCompleto);
      setNuevoApodo(apodoDefinido);
      setNuevoAvatar(avatarDefinido);

      localStorage.setItem('bariahorra_perfil', JSON.stringify(perfilCompleto));

      // 3. Cargar ofertas del usuario
      const { data: rawOfertas } = await supabase
        .from('ofertas')
        .select('*');

      const userIdStr = String(user.id).toLowerCase();
      const userEmail = String(user.email || '').toLowerCase();

      const ofertasDelUsuario = (rawOfertas || []).filter((o) => {
        const oUser = String(o.usuario_id || o.user_id || '').toLowerCase();
        const oEmail = String(o.email || '').toLowerCase();
        return oUser === userIdStr || (oEmail && oEmail === userEmail);
      });

      // 4. Traer productos y comercios para resolver nombres si tienen UUIDs
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
    localStorage.removeItem('bariahorra_perfil');
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

      // 1. Guardar en Supabase
      const { error: errUpdate } = await supabase
        .from('perfiles')
        .upsert({
          id: usuario.id,
          apodo: apodoLimpio,
          avatar_url: nuevoAvatar,
          email: usuario.email
        });

      if (errUpdate) {
        console.warn('Nota en update de perfil:', errUpdate.message);
      }

      // 2. Guardar en user_metadata de Auth
      await supabase.auth.updateUser({
        data: { apodo: apodoLimpio, avatar_url: nuevoAvatar }
      });

      // 3. Guardar en estado local y disparar evento para actualizar el Header al instante
      const nuevoEstadoPerfil = {
        ...perfil,
        apodo: apodoLimpio,
        avatar_url: nuevoAvatar
      };

      setPerfil(nuevoEstadoPerfil);
      localStorage.setItem('bariahorra_perfil', JSON.stringify(nuevoEstadoPerfil));
      window.dispatchEvent(new Event('perfil_actualizado'));

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
      <div className="min-h-screen bg-[#0d131f] text-slate-300 flex items-center justify-center text-xs">
        Cargando tu perfil...
      </div>
    );
  }

  const rangoInfo = calcularRango(perfil?.puntos || 0);
  const IconoRango = rangoInfo.icono;

  // Calculamos el total de confirmaciones sumando todos los votos positivos de sus ofertas
  const totalConfirmaciones = misOfertas.reduce((acc, curr) => acc + (curr._votosPositivos || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4 selection:bg-sky-500 selection:text-white">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a las ofertas</span>
        </Link>

        <button
          type="button"
          onClick={handleCerrarSesion}
          className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition font-bold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* TARJETA DE PERFIL */}
      <div className="bg-[#121826] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={perfil?.avatar_url || AVATAR_DEFAULT}
              alt={perfil?.apodo}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-slate-700 object-cover shadow-inner"
            />
            <div>
              <h1 className="text-base sm:text-lg font-black text-white">
                @{perfil?.apodo || usuario?.email?.split('@')[0] || 'vecino'}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                {usuario?.email}
              </p>

              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-200">
                  <IconoRango className={`w-3 h-3 ${rangoInfo.color}`} />
                  <span>{rangoInfo.nombre}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-400 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>{perfil?.puntos || 0} Puntos</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar personaje</span>
          </button>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-3 gap-2.5 mt-6">
          <div className="bg-[#182133] p-3 rounded-2xl border border-slate-800 text-center">
            <p className="text-base sm:text-lg font-black text-white font-mono">
              {perfil?.precios_aportados || misOfertas.length}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Precios aportados</p>
          </div>
          <div className="bg-[#182133] p-3 rounded-2xl border border-slate-800 text-center">
            <p className="text-base sm:text-lg font-black text-white font-mono">
              {totalConfirmaciones}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Confirmaciones</p>
          </div>
          <div className="bg-[#182133] p-3 rounded-2xl border border-slate-800 text-center">
            <p className="text-base sm:text-lg font-black text-amber-400 font-mono">
              {perfil?.puntos || 0}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Puntos comunitarios</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: MIS APORTES */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Mis aportes a la comunidad
            </h2>
            <span className="text-[11px] text-slate-400">
              {misOfertas.length} {misOfertas.length === 1 ? 'activa' : 'activas'}
            </span>
          </div>

          <Link
            href="/cargar"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Aportar precio</span>
          </Link>
        </div>

        {misOfertas.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121826] border border-slate-800 text-center text-xs text-slate-400 space-y-3">
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
                className="p-3.5 rounded-2xl bg-[#121826] border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Store className="w-3 h-3 text-amber-400" />
                      <span>{item._comercio}</span>
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {item._producto}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">
                      ${Number(item._precio || 0).toLocaleString('es-AR')}
                    </span>
                    <span>•</span>
                    <span>{item._votosPositivos} confirmaciones</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEliminarOferta(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition shrink-0 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Editar personaje</h3>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarCambios} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tu apodo único
                </label>
                <div className="relative">
                  <span className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">@</span>
                  <input
                    type="text"
                    value={nuevoApodo}
                    onChange={(e) => setNuevoApodo(e.target.value)}
                    placeholder="lauchiña"
                    className="w-full bg-[#182133] border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
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
                        className={`rounded-xl overflow-hidden border-2 p-1 bg-slate-900 transition cursor-pointer ${
                          seleccionado
                            ? 'border-sky-400 ring-2 ring-sky-500/20'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {mensajeError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mensajeError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-1/2 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-black transition shadow-lg shadow-sky-500/20 cursor-pointer"
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