'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AVATARES } from '../lib/avatars';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#161d2b] border border-slate-700 rounded-3xl p-6 shadow-2xl my-auto">
        <button
          onClick={alCerrar}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition font-bold text-sm"
          aria-label="Cerrar ventana"
        >
          ✕
        </button>

        {/* PASO 1: EMAIL */}
        {paso === 'email' && (
          <form onSubmit={handleEnviarCodigo} className="space-y-4 pt-2">
            <div className="text-center space-y-1">
              <div className="text-4xl">🏔️</div>
              <h3 className="text-lg font-bold text-white">Comunidad Bariahorra</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingresá tu correo para recibir un código de acceso numérico. Sin contraseñas ni registros largos.
              </p>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">{error}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tu correo electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full bg-[#10141f] text-sm text-white rounded-xl px-3.5 py-2.5 border border-slate-700 outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold py-3 rounded-xl transition text-sm disabled:opacity-50 shadow-md"
            >
              {cargando ? 'Enviando código...' : 'Recibir código de acceso'}
            </button>

            <p className="text-[11px] text-center text-slate-500">
              Podés seguir consultando y sumando precios de forma anónima sin registrarte.
            </p>
          </form>
        )}

        {/* PASO 2: CÓDIGO FLEXIBLE (6 A 8 DÍGITOS) */}
        {paso === 'codigo' && (
          <form onSubmit={handleVerificarCodigo} className="space-y-4 pt-2">
            <div className="text-center space-y-1">
              <div className="text-4xl">🔢</div>
              <h3 className="text-lg font-bold text-white">Ingresá el código</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enviamos tu clave numérica a <span className="text-slate-200 font-semibold">{email}</span>.
              </p>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">{error}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
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
                className="w-full bg-[#10141f] text-center tracking-[0.2em] text-xl font-black text-white rounded-2xl px-4 py-3.5 border border-slate-700 outline-none focus:border-orange-500 font-mono shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={cargando || codigoToken.length < 6}
              className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold py-3 rounded-xl transition text-sm disabled:opacity-50 shadow-md"
            >
              {cargando ? 'Verificando...' : 'Confirmar e Ingresar'}
            </button>

            <button
              type="button"
              onClick={() => { setPaso('email'); setError(''); setCodigoToken(''); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition"
            >
              ← Corregir correo o reenviar
            </button>
          </form>
        )}

        {/* PASO 3: ONBOARDING */}
        {paso === 'onboarding' && (
          <form onSubmit={handleGuardarPerfil} className="space-y-4 pt-2">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Elegí tu personaje</h3>
              <p className="text-xs text-slate-400">Seleccioná un avatar y tu apodo barilochense</p>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-xl">{error}</p>
            )}

            <div className="grid grid-cols-5 gap-2 pt-1">
              {AVATARES.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setAvatarSeleccionado(av.id)}
                  className={`rounded-2xl p-1.5 transition border flex items-center justify-center ${
                    avatarSeleccionado === av.id
                      ? 'border-orange-500 bg-orange-500/20 scale-105 shadow-md shadow-orange-500/20'
                      : 'border-slate-800 bg-[#10141f] hover:border-slate-600 opacity-70 hover:opacity-100'
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tu apodo público</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-bold">@</span>
                <input
                  type="text"
                  placeholder="VecinoDelOeste"
                  value={apodo}
                  onChange={(e) => setApodo(e.target.value)}
                  maxLength={18}
                  required
                  className="w-full bg-[#10141f] text-sm text-white rounded-xl pl-8 pr-3.5 py-2.5 border border-slate-700 outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Comenzar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}