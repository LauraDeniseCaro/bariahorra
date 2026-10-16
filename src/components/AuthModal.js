'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AVATARES } from '@/lib/avatars';
import {
  X,
  Mail,
  KeyRound,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function AuthModal({ abierto, alCerrar, usuarioActual, perfilActual, alGuardarPerfil }) {
  const [paso, setPaso] = useState('email'); // 'email', 'codigo', 'onboarding'
  const [email, setEmail] = useState('');
  const [codigoToken, setCodigoToken] = useState('');
  const [apodo, setApodo] = useState('');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState('avatar-1');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuarioActual && !perfilActual) {
      setPaso('onboarding');
    } else if (!usuarioActual) {
      setPaso('email');
    }
  }, [usuarioActual, perfilActual, abierto]);

  if (!abierto) return null;

  // 1. Enviar el código por correo
  const handleEnviarCodigo = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setCargando(true);
    setError('');

    try {
      const { error: errOtp } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });
      if (errOtp) throw errOtp;
      setPaso('codigo');
    } catch (err) {
      setError(err.message || 'Error al enviar el código de acceso.');
    } finally {
      setCargando(false);
    }
  };

  // 2. Verificar el código ingresado (acepta 6 u 8 dígitos)
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    const tokenLimpio = codigoToken.trim();
    if (tokenLimpio.length < 6 || tokenLimpio.length > 8) {
      setError('Ingresá el código numérico completo recibido en tu correo.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const { data, error: errVerify } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: tokenLimpio,
        type: 'email',
      });

      if (errVerify) throw errVerify;

      // Consultar si ya tiene un perfil comunitario
      const { data: perfilExistente } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (perfilExistente) {
        alGuardarPerfil?.(perfilExistente);
        alCerrar();
      } else {
        setPaso('onboarding');
      }
    } catch (err) {
      setError(err.message || 'Código incorrecto o vencido.');
    } finally {
      setCargando(false);
    }
  };

  // 3. Guardar avatar y apodo
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

        {/* PASO 1: EMAIL */}
        {paso === 'email' && (
          <form onSubmit={handleEnviarCodigo} className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Mail className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base sm:text-lg font-black theme-title">
                Comunidad BARI<span className="text-sky-400">AHORRA</span>
              </h3>
              <p className="text-xs theme-muted leading-relaxed max-w-xs mx-auto">
                Ingresá tu correo para recibir un código de acceso numérico. Sin contraseñas ni registros largos.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold theme-subtitle mb-1.5">Tu correo electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full theme-input text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border outline-none focus:border-sky-500 font-medium transition shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 font-black py-3 rounded-xl transition text-xs sm:text-sm disabled:opacity-50 shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando código...</span>
                </>
              ) : (
                <span>Recibir código de acceso</span>
              )}
            </button>

            <p className="text-[11px] text-center theme-muted">
              Podés seguir consultando y sumando precios de forma anónima sin registrarte.
            </p>
          </form>
        )}

        {/* PASO 2: CÓDIGO FLEXIBLE (6 A 8 DÍGITOS) */}
        {paso === 'codigo' && (
          <form onSubmit={handleVerificarCodigo} className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <KeyRound className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base sm:text-lg font-black theme-title">Ingresá el código</h3>
              <p className="text-xs theme-muted leading-relaxed">
                Enviamos tu clave numérica a <span className="theme-subtitle font-bold">{email}</span>.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold theme-subtitle mb-1.5 text-center">
                Código de verificación
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={8}
                placeholder="12345678"
                value={codigoToken}
                onChange={(e) => setCodigoToken(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
                className="w-full theme-input text-center tracking-[0.25em] text-xl font-black rounded-2xl px-4 py-3 border outline-none focus:border-amber-400 font-mono shadow-inner transition"
              />
            </div>

            <button
              type="submit"
              disabled={cargando || codigoToken.length < 6}
              className="w-full bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 font-black py-3 rounded-xl transition text-xs sm:text-sm disabled:opacity-50 shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Confirmar e Ingresar</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setPaso('email'); setError(''); setCodigoToken(''); }}
              className="w-full text-center text-xs theme-muted hover:text-sky-400 transition flex items-center justify-center gap-1 cursor-pointer font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Corregir correo o reenviar</span>
            </button>
          </form>
        )}

        {/* PASO 3: ONBOARDING */}
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