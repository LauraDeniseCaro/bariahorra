'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { Trophy, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AVATAR_DEFAULT = 'https://api.dicebear.com/7.x/bottts/svg?seed=bariloche';

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [modoClaro, setModoClaro] = useState(false);

  useEffect(() => {
    // 1. Detectar si el modo claro está activo al cargar
    const checkTema = () => {
      const esClaro = document.documentElement.classList.contains('light-mode') || 
                      localStorage.getItem('bariahorra_tema') === 'light';
      setModoClaro(esClaro);
    };

    checkTema();

    // 2. Observador para detectar en tiempo real cuando ThemeToggle agrega/saca 'light-mode'
    const observer = new MutationObserver(() => {
      setModoClaro(document.documentElement.classList.contains('light-mode'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 3. Sesión y perfil de Supabase
    obtenerSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUsuario(session?.user || null);
      if (session?.user) {
        cargarPerfil(session.user);
      } else {
        setPerfil(null);
      }
    });

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
      observer.disconnect();
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
      const cacheLocal = localStorage.getItem('bariahorra_perfil');
      if (cacheLocal) {
        try {
          const cacheParseado = JSON.parse(cacheLocal);
          if (cacheParseado.apodo) {
            setPerfil(cacheParseado);
          }
        } catch (e) { }
      }

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
      <header className="px-3 sm:px-4 py-2 border-b theme-card backdrop-blur sticky top-0 z-40 flex items-center justify-between gap-1.5 sm:gap-2 shadow-sm transition-colors">
        
        {/* LOGO DINÁMICO */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center shrink-0">
            <img
              src={modoClaro ? '/icon-light-192.png' : '/icon-192.png'}
              alt="Bariahorra"
              key={modoClaro ? 'logo-claro' : 'logo-oscuro'}
              className="w-full h-full object-cover transition-opacity duration-150"
            />
          </div>
          <div className="min-w-0">
            <span className="font-black text-sm sm:text-base tracking-tight theme-title block leading-none">
              BARI<span className="text-sky-400">AHORRA</span>
            </span>
            <span className="hidden xs:block text-[10px] theme-muted font-medium mt-0.5">
              Precios de Bariloche
            </span>
          </div>
        </Link>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* 1. Modo Claro / Oscuro */}
          <div className="h-9 w-9 flex items-center justify-center [&>button]:h-9 [&>button]:w-9 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:rounded-xl">
            <ThemeToggle />
          </div>

          {/* 2. Botón Ranking */}
          <Link
            href="/ranking"
            className="h-9 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition active:scale-95 shrink-0"
            title="Ver ranking comunitario"
          >
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="hidden sm:inline font-bold">Ranking</span>
          </Link>

          {/* 3. Botón Perfil / Ingresar */}
          {usuario ? (
            <Link
              href="/perfil"
              className="h-9 w-9 flex items-center justify-center theme-card-sub hover:opacity-90 border border-[var(--border-sub)] rounded-xl transition shrink-0 overflow-hidden shadow-xs active:scale-95"
              title={`Perfil de @${perfil?.apodo || 'vecino'}`}
            >
              <img
                src={perfil?.avatar_url || AVATAR_DEFAULT}
                alt="Mi perfil"
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarModalAuth(true)}
              className="h-9 flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 font-bold px-2.5 sm:px-3.5 rounded-xl text-xs transition cursor-pointer active:scale-95 shrink-0"
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">Ingresar</span>
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