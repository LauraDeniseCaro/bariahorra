'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Trophy,
  Award,
  Crown,
  ShieldCheck,
  Flame,
  User,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Plus
} from 'lucide-react';

const AVATAR_DEFAULT = 'https://api.dicebear.com/7.x/bottts/svg?seed=bariloche';

// Medallas y rangos comunitarios según puntaje
function obtenerRangoComunitario(puntos = 0) {
  if (puntos >= 1000) {
    return {
      nombre: 'Héroe Comunitario',
      colorTexto: 'text-amber-400',
      colorBg: 'bg-amber-500/10 border-amber-500/30',
      icono: Crown
    };
  }
  if (puntos >= 400) {
    return {
      nombre: 'Defensor del Bolsillo',
      colorTexto: 'text-sky-400',
      colorBg: 'bg-sky-500/10 border-sky-500/30',
      icono: ShieldCheck
    };
  }
  if (puntos >= 150) {
    return {
      nombre: 'Vecino Activo de Bariloche',
      colorTexto: 'text-emerald-400',
      colorBg: 'bg-emerald-500/10 border-emerald-500/30',
      icono: Award
    };
  }
  if (puntos >= 50) {
    return {
      nombre: 'Cazador de Ofertas',
      colorTexto: 'text-indigo-400',
      colorBg: 'bg-indigo-500/10 border-indigo-500/30',
      icono: Flame
    };
  }
  return {
    nombre: 'Vecino Observador',
    colorTexto: 'text-slate-400',
    colorBg: 'bg-slate-800/60 border-slate-700/60',
    icono: User
  };
}

export default function RankingPage() {
  const [vecinos, setVecinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    cargarRanking();
  }, []);

  const cargarRanking = async () => {
    setCargando(true);
    try {
      // 1. Obtener sesión de usuario para identificar su puesto
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id ? String(session.user.id).toLowerCase() : null;

      // 2. Consultar tabla perfiles ordenada por puntos
      const { data, error } = await supabase
        .from('perfiles')
        .select('*');

      if (error) throw error;

      // 3. Ordenar en memoria por puntos de forma segura
      const perfilesOrdenados = (data || [])
        .map((p) => ({
          ...p,
          puntos: Number(p.puntos || 0),
          apodo: p.apodo || p.username || 'vecino',
          avatar_url: p.avatar_url || AVATAR_DEFAULT
        }))
        .sort((a, b) => b.puntos - a.puntos);

      setVecinos(perfilesOrdenados);

      // 4. Ubicar posición del usuario actual
      if (currentUserId && perfilesOrdenados.length > 0) {
        const index = perfilesOrdenados.findIndex((v) => {
          const id = String(v.id || '').toLowerCase();
          const userId = String(v.user_id || '').toLowerCase();
          return id === currentUserId || userId === currentUserId;
        });

        if (index !== -1) {
          setUsuarioActual({
            ...perfilesOrdenados[index],
            posicion: index + 1
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar ranking:', err.message || err);
    } finally {
      setCargando(false);
    }
  };

  const top1 = vecinos[0];
  const top2 = vecinos[1];
  const top3 = vecinos[2];
  const restoVecinos = vecinos.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 selection:bg-sky-500 selection:text-white">

      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a las ofertas</span>
        </Link>

        <Link
          href="/cargar"
          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Sumar +10 pts</span>
        </Link>
      </div>

      {/* ENCABEZADO Y BANNER INFORMATIVO */}
      <div className="bg-[#121826] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Ranking <span className="text-sky-400">Comunitario</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Vecinos que más colaboran cuidando el bolsillo en Bariloche
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{vecinos.length} vecinos activos</span>
          </div>
        </div>

        {/* CÓMO SUMAR PUNTOS */}
        <div className="bg-[#182133] border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Cada aporte suma 10 puntos comunitarios</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Compartí precios que veas en góndola para escalar en el podio.
              </p>
            </div>
          </div>

          {usuarioActual && (
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-3 py-1.5 text-right shrink-0">
              <span className="text-[10px] text-sky-300 block font-medium">Tu posición actual</span>
              <span className="text-xs font-black text-white font-mono">
                #{usuarioActual.posicion} • {usuarioActual.puntos} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-20 text-slate-400 text-xs">
          Cargando posiciones de la comunidad...
        </div>
      ) : vecinos.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs bg-[#121826] rounded-3xl border border-slate-800 space-y-3">
          <p>Todavía no hay vecinos con puntos registrados.</p>
          <Link
            href="/cargar"
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Cargar el primer precio (+10 pts)
          </Link>
        </div>
      ) : (
        <>
          {/* PODIO TOP 3 (OLÍMPICO) */}
          <section className="bg-[#121826] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 text-center">
              Podio de Honor
            </h2>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto pt-2">
              
              {/* PUESTO 2 (Plata) */}
              <div className="flex flex-col items-center">
                {top2 ? (
                  <div className="w-full flex flex-col items-center bg-[#182133] border border-slate-700/60 rounded-2xl p-3 relative">
                    <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                      2
                    </div>
                    <img
                      src={top2.avatar_url}
                      alt={top2.apodo}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-slate-400 object-cover mt-2 bg-slate-900"
                    />
                    <p className="text-xs font-bold text-slate-200 mt-2 truncate max-w-full text-center">
                      @{top2.apodo}
                    </p>
                    <span className="text-xs font-black text-slate-300 font-mono mt-0.5">
                      {top2.puntos} pts
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 truncate max-w-full">
                      Plata
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                    Disponible
                  </div>
                )}
              </div>

              {/* PUESTO 1 (Oro - Al Centro y Más Alto) */}
              <div className="flex flex-col items-center -mt-6">
                {top1 && (
                  <div className="w-full flex flex-col items-center bg-gradient-to-b from-amber-500/20 to-[#182133] border-2 border-amber-400/80 rounded-2xl p-3.5 relative shadow-xl shadow-amber-500/10">
                    <Crown className="w-6 h-6 text-amber-400 absolute -top-4 animate-bounce" />
                    <div className="absolute -top-2.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                      1
                    </div>
                    <img
                      src={top1.avatar_url}
                      alt={top1.apodo}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 object-cover mt-3 bg-slate-900 shadow-inner"
                    />
                    <p className="text-xs sm:text-sm font-black text-amber-200 mt-2 truncate max-w-full text-center">
                      @{top1.apodo}
                    </p>
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono mt-0.5">
                      {top1.puntos} pts
                    </span>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full mt-1.5">
                      Líder
                    </span>
                  </div>
                )}
              </div>

              {/* PUESTO 3 (Bronce) */}
              <div className="flex flex-col items-center">
                {top3 ? (
                  <div className="w-full flex flex-col items-center bg-[#182133] border border-amber-900/60 rounded-2xl p-3 relative">
                    <div className="absolute -top-3 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow">
                      3
                    </div>
                    <img
                      src={top3.avatar_url}
                      alt={top3.apodo}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-700 object-cover mt-2 bg-slate-900"
                    />
                    <p className="text-xs font-bold text-slate-200 mt-2 truncate max-w-full text-center">
                      @{top3.apodo}
                    </p>
                    <span className="text-xs font-black text-amber-500 font-mono mt-0.5">
                      {top3.puntos} pts
                    </span>
                    <span className="text-[9px] font-bold text-amber-600 mt-1 truncate max-w-full">
                      Bronce
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                    Disponible
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* TABLA DE POSICIONES (4° en adelante) */}
          {restoVecinos.length > 0 && (
            <section className="bg-[#121826] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
                Tabla General de Posiciones
              </h2>

              <div className="space-y-2">
                {restoVecinos.map((vecino, idx) => {
                  const posReal = idx + 4;
                  const rango = obtenerRangoComunitario(vecino.puntos);
                  const IconoRango = rango.icono;
                  const esYo = usuarioActual && (usuarioActual.id === vecino.id || usuarioActual.user_id === vecino.user_id);

                  return (
                    <article
                      key={vecino.id || idx}
                      className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between transition ${
                        esYo
                          ? 'bg-sky-500/10 border-sky-500/40 shadow-md shadow-sky-500/5'
                          : 'bg-[#182133] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono font-black text-slate-400 w-6 text-center shrink-0">
                          #{posReal}
                        </span>
                        <img
                          src={vecino.avatar_url}
                          alt={vecino.apodo}
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover shrink-0 bg-slate-900"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">
                              @{vecino.apodo}
                            </p>
                            {esYo && (
                              <span className="text-[9px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded-full">
                                Vos
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <IconoRango className={`w-3 h-3 ${rango.colorTexto}`} />
                            <span className={`text-[10px] font-medium truncate ${rango.colorTexto}`}>
                              {rango.nombre}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-black text-white font-mono">
                          {vecino.puntos}
                        </p>
                        <span className="text-[10px] text-slate-400">puntos</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

    </div>
  );
}