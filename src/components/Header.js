'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { Trophy, User } from 'lucide-react';

const AVATAR_DEFAULT = 'https://api.dicebear.com/7.x/bottts/svg?seed=bariloche';

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);

  useEffect(() => {
    obtenerSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUsuario(session?.user || null);
      if (session?.user) {
        cargarPerfil(session.user);
      } else {
        setPerfil(null);
      }
    });

    // Escuchar actualizaciones de perfil hechas desde /perfil
    const actualizarLocalmente = () => {
      const guardado = localStorage.getItem('bariahorra_perfil');
      if (guardado) {
        try {
          const parseado = JSON.parse(guardado);
          setPerfil((prev) => ({ ...prev, ...parseado }));
        } catch (e) { }
      }
    };

    window.addEventListener('perfil_actualizado', actualizarLocalmente);
    window.addEventListener('storage', actualizarLocalmente);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('perfil_actualizado', actualizarLocalmente);
      window.removeEventListener('storage', actualizarLocalmente);
    };
  }, []);

  const obtenerSesion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUsuario(session.user);
        cargarPerfil(session.user);
      }
    } catch (err) {
      console.error('Error obteniendo sesión:', err);
    }
  };

  const cargarPerfil = async (user) => {
    try {
      // 1. Revisar si hay copia rápida en localStorage
      const cacheLocal = localStorage.getItem('bariahorra_perfil');
      if (cacheLocal) {
        try {
          const cacheParseado = JSON.parse(cacheLocal);
          if (cacheParseado.apodo) {
            setPerfil(cacheParseado);
          }
        } catch (e) { }
      }

      // 2. Buscar en Supabase por id, user_id o email
      let perfilData = null;

      const { data: porId } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (porId) {
        perfilData = porId;
      } else {
        const { data: porEmail } = await supabase
          .from('perfiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        if (porEmail) perfilData = porEmail;
      }

      const apodoFinal =
        perfilData?.apodo ||
        user.user_metadata?.apodo ||
        user.user_metadata?.username ||
        user.email?.split('@')[0] ||
        'vecino';

      const avatarFinal =
        perfilData?.avatar_url ||
        user.user_metadata?.avatar_url ||
        AVATAR_DEFAULT;

      const perfilActualizado = {
        ...perfilData,
        apodo: apodoFinal,
        avatar_url: avatarFinal
      };

      setPerfil(perfilActualizado);
      localStorage.setItem('bariahorra_perfil', JSON.stringify(perfilActualizado));

    } catch (err) {
      console.error('Error cargando perfil en header:', err);
    }
  };

  return (
    <>
      <header className="px-4 py-3 border-b border-slate-800/80 bg-[#0f1523]/95 backdrop-blur sticky top-0 z-40 flex items-center justify-between gap-2">
        {/* Logo oficial Bariahorra con 'AHORRA' en CELESTE */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center overflow-hidden">
            <img
              src="/icon-192.png"
              alt="Bariahorra"
              className="w-6 h-6 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <span className="font-black text-sm sm:text-base tracking-tight text-white block leading-tight">
              BARI<span className="text-sky-400">AHORRA</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-medium -mt-0.5">
              Precios de Bariloche
            </span>
          </div>
        </Link>

        {/* Acciones del Header */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/ranking"
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            title="Ver ranking"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranking</span>
          </Link>

          {usuario ? (
            <Link
              href="/perfil"
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 rounded-full py-1 pl-1 pr-3 transition"
            >
              <img
                src={perfil?.avatar_url || AVATAR_DEFAULT}
                alt={perfil?.apodo || 'perfil'}
                className="w-6 h-6 rounded-full bg-slate-900 object-cover"
              />
              <span className="text-xs font-bold text-slate-200">
                @{perfil?.apodo || usuario.email?.split('@')[0] || 'vecino'}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarModalAuth(true)}
              className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </header>

      {mostrarModalAuth && (
        <AuthModal
          abierto={true}
          alCerrar={() => setMostrarModalAuth(false)}
        />
      )}
    </>
  );
}