'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AVATARES } from '@/lib/avatars';
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function AuthModal({ abierto, alCerrar, usuarioActual, perfilActual, alGuardarPerfil }) {
  const [paso, setPaso] = useState('login'); // 'login' | 'onboarding'
  const [apodo, setApodo] = useState('');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState('avatar-1');
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuarioActual && !perfilActual) {
      setPaso('onboarding');
    } else if (!usuarioActual) {
      setPaso('login');
    }
  }, [usuarioActual, perfilActual, abierto]);

  if (!abierto) return null;

  // 1. Iniciar sesión directamente con Google OAuth
  const handleLoginGoogle = async () => {
    try {
      setCargandoGoogle(true);
      setError('');
      const { error: errGoogle } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (errGoogle) throw errGoogle;
    } catch (err) {
      setError(err.message || 'Error al conectar con Google.');
      setCargandoGoogle(false);
    }
  };

  // 2. Guardar avatar y apodo comunitario
  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    const cleanUsername = apodo.trim().replace(/^@/, '');
    if (!cleanUsername) return;

    setCargando(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay sesión activa.');

      const { data, error: errInsert } = await supabase
        .from('perfiles')
        .upsert({
          id: user.id,
          username: cleanUsername,
          avatar_id: avatarSeleccionado,
        })
        .select()
        .single();

      if (errInsert) {
        if (errInsert.code === '23505') {
          throw new Error('Ese apodo ya está en uso. Elegí otro.');
        }
        throw errInsert;
      }

      alGuardarPerfil?.(data);
      alCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-sm theme-card border rounded-3xl p-6 shadow-2xl my-auto">
        <button
          onClick={alCerrar}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full theme-btn-sec border transition cursor-pointer"
          aria-label="Cerrar ventana"
        >
          <X className="w-4 h-4 theme-muted hover:theme-title" />
        </button>

        {/* PASO 1: LOGIN EXCLUSIVO CON GOOGLE */}
        {paso === 'login' && (
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Sparkles className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base sm:text-lg font-black theme-title">
                Comunidad BARI<span className="text-sky-400">AHORRA</span>
              </h3>
              <p className="text-xs theme-muted leading-relaxed max-w-xs mx-auto">
                Ingresá con tu cuenta para guardar tus listas personalizadas y colaborar aportando precios.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLoginGoogle}
              disabled={cargandoGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl border border-slate-300 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
            >
              {cargandoGoogle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                  <span>Conectando con Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center theme-muted pt-1">
              Podés seguir consultando y sumando precios de forma anónima sin registrarte.
            </p>
          </div>
        )}

        {/* PASO 2: ONBOARDING (AVATAR Y APODO) */}
        {paso === 'onboarding' && (
          <form onSubmit={handleGuardarPerfil} className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Sparkles className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base sm:text-lg font-black theme-title">Elegí tu personaje</h3>
              <p className="text-xs theme-muted">Seleccioná tu avatar y tu apodo barilochense</p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2 pt-1">
              {(AVATARES || []).map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setAvatarSeleccionado(av.id)}
                  className={`rounded-2xl p-1.5 transition border flex items-center justify-center cursor-pointer ${
                    avatarSeleccionado === av.id
                      ? 'border-sky-400 bg-sky-500/20 scale-105 shadow-md shadow-sky-500/20 ring-2 ring-sky-500/30'
                      : 'theme-card-sub border hover:opacity-100 opacity-70'
                  }`}
                >
                  <img
                    src={av.src}
                    alt={av.label}
                    className="w-10 h-10 object-contain rounded-xl"
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold theme-subtitle mb-1">Tu apodo público</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 theme-muted text-sm font-bold">@</span>
                <input
                  type="text"
                  placeholder="VecinoDelOeste"
                  value={apodo}
                  onChange={(e) => setApodo(e.target.value)}
                  maxLength={18}
                  required
                  className="w-full theme-input text-xs sm:text-sm rounded-xl pl-8 pr-3.5 py-2.5 border outline-none focus:border-sky-500 font-bold transition shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 font-black py-3 rounded-xl transition text-xs sm:text-sm disabled:opacity-50 shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Comenzar</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}