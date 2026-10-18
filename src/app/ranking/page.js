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
  Plus,
  ThumbsUp
} from 'lucide-react';

const AVATAR_DEFAULT = 'https://api.dicebear.com/7.x/bottts/svg?seed=bariloche';

function obtenerRangoComunitario(puntos = 0) {
  if (puntos >= 1000) {
    return {
      nombre: 'Héroe Comunitario',
      colorTexto: 'text-amber-500',
      icono: Crown
    };
  }
  if (puntos >= 400) {
    return {
      nombre: 'Defensor del Bolsillo',
      colorTexto: 'text-sky-500',
      icono: ShieldCheck
    };
  }
  if (puntos >= 150) {
    return {
      nombre: 'Vecino Activo de Bariloche',
      colorTexto: 'text-emerald-500',
      icono: Award
    };
  }
  if (puntos >= 50) {
    return {
      nombre: 'Cazador de Ofertas',
      colorTexto: 'text-indigo-500',
      icono: Flame
    };
  }
  return {
    nombre: 'Vecino Observador',
    colorTexto: 'theme-muted',
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
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id ? String(session.user.id).toLowerCase() : null;

      // Consultar perfiles y ofertas en simultáneo
      const [resPerfiles, resOfertas] = await Promise.all([
        supabase.from('perfiles').select('*'),
        supabase.from('ofertas').select('usuario_id, votos_positivos')
      ]);

      const perfilesData = resPerfiles.data || [];
      const ofertasData = resOfertas.data || [];

      // Mapear aportes y confirmaciones recibidas por usuario
      const mapaStats = new Map();
      ofertasData.forEach((o) => {
        const uId = String(o.usuario_id || '').toLowerCase();
        if (!uId) return;
        if (!mapaStats.has(uId)) {
          mapaStats.set(uId, { aportes: 0, confirmaciones: 0 });
        }
        const actual = mapaStats.get(uId);
        actual.aportes += 1;
        actual.confirmaciones += Number(o.votos_positivos || 0);
      });

      // Calcular puntos reales: 10 pts por aporte + 2 pts por cada confirmación
      const perfilesCalculados = perfilesData.map((p) => {
        const uId = String(p.id || '').toLowerCase();
        const stats = mapaStats.get(uId) || { aportes: 0, confirmaciones: 0 };
        
        const aportesReales = Math.max(Number(p.precios_aportados || 0), stats.aportes);
        const confirmacionesReales = stats.confirmaciones;
        const puntosTotales = (aportesReales * 10) + (confirmacionesReales * 2);

        return {
          ...p,
          aportes: aportesReales,
          confirmaciones: confirmacionesReales,
          puntos: puntosTotales,
          apodo: p.apodo || p.username || 'vecino',
          avatar_url: p.avatar_url || AVATAR_DEFAULT
        };
      });

      // Ordenar de mayor a menor puntaje
      perfilesCalculados.sort((a, b) => b.puntos - a.puntos);
      setVecinos(perfilesCalculados);

      // Ubicar la fila del usuario actual si está logueado
      if (currentUserId && perfilesCalculados.length > 0) {
        const index = perfilesCalculados.findIndex((v) => {
          return String(v.id || '').toLowerCase() === currentUserId;
        });

        if (index !== -1) {
          setUsuarioActual({
            ...perfilesCalculados[index],
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
    <div className="w-full max-w-4xl mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 selection:bg-sky-500 selection:text-white pb-24">

      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs theme-muted hover:text-sky-500 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la góndola</span>
        </Link>

        <Link
          href="/cargar"
          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Sumar +10 pts</span>
        </Link>
      </div>

      {/* ENCABEZADO Y EXPLICACIÓN DE PUNTOS */}
      <div className="theme-card border rounded-3xl p-4 sm:p-6 shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black theme-title tracking-tight">
                Ranking <span className="text-sky-500">Comunitario</span>
              </h1>
              <p className="text-[11px] sm:text-xs theme-muted mt-0.5">
                Vecinos que más colaboran cuidando el bolsillo en Bariloche
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto theme-btn-sec border px-3 py-1.5 rounded-full text-xs font-bold theme-subtitle">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{vecinos.length} vecinos activos</span>
          </div>
        </div>

        {/* REGLA DE PUNTOS */}
        <div className="theme-card-sub border rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold theme-title">
                +10 pts por aporte • +2 pts por confirmación de vecinos
              </p>
              <p className="theme-muted text-[11px] mt-0.5">
                Cada precio confirmado en góndola te hace escalar posiciones en el podio.
              </p>
            </div>
          </div>

          {usuarioActual && (
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-3 py-1.5 text-right shrink-0">
              <span className="text-[10px] text-sky-600 block font-bold">Tu posición</span>
              <span className="text-xs font-black theme-title font-mono">
                #{usuarioActual.posicion} • {usuarioActual.puntos} pts
              </span>
            </div>
          )}
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-20 theme-muted text-xs">
          Cargando posiciones de la comunidad...
        </div>
      ) : vecinos.length === 0 ? (
        <div className="text-center py-16 theme-muted text-xs theme-card rounded-3xl border space-y-3">
          <p>Todavía no hay vecinos con puntos registrados.</p>
          <Link
            href="/cargar"
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Cargar el primer precio (+10 pts)
          </Link>
        </div>
      ) : (
        <>
          {/* PODIO OLÍMPICO (RESPONSIVE PARA MÓVILES ANGOSTOS) */}
          <section className="theme-card border rounded-3xl p-4 sm:p-6 shadow-xl">
            <h2 className="text-xs font-black uppercase tracking-wider theme-muted mb-6 text-center">
              Podio de Honor
            </h2>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-4 items-end max-w-md mx-auto pt-2">
              
              {/* PUESTO 2 (Plata) */}
              <div className="flex flex-col items-center">
                {top2 ? (
                  <div className="w-full flex flex-col items-center theme-card-sub border rounded-2xl p-2 sm:p-3 relative shadow-xs">
                    <div className="absolute -top-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] sm:text-xs flex items-center justify-center shadow">
                      2
                    </div>
                    <img
                      src={top2.avatar_url}
                      alt={top2.apodo}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-slate-400 object-cover mt-1 bg-slate-900 shadow-xs"
                    />
                    <p className="text-[11px] sm:text-xs font-bold theme-title mt-1.5 truncate max-w-full text-center">
                      @{top2.apodo}
                    </p>
                    <span className="text-[11px] sm:text-xs font-black theme-subtitle font-mono mt-0.5">
                      {top2.puntos} pts
                    </span>
                    <span className="text-[9px] font-bold theme-muted mt-0.5 truncate">
                      {top2.confirmaciones} conf.
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-28 rounded-2xl border border-dashed theme-card-sub flex items-center justify-center text-[10px] theme-muted">
                    Vacío
                  </div>
                )}
              </div>

              {/* PUESTO 1 (Oro - Al centro y más alto) */}
              <div className="flex flex-col items-center -mt-5">
                {top1 && (
                  <div className="w-full flex flex-col items-center bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent theme-card-sub border-2 border-amber-400 rounded-2xl p-2.5 sm:p-3.5 relative shadow-lg shadow-amber-500/10">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 absolute -top-4 animate-bounce" />
                    <div className="absolute -top-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs flex items-center justify-center shadow">
                      1
                    </div>
                    <img
                      src={top1.avatar_url}
                      alt={top1.apodo}
                      className="w-13 h-13 sm:w-18 sm:h-18 rounded-full border-2 border-amber-400 object-cover mt-2 bg-slate-900 shadow-sm"
                    />
                    <p className="text-xs sm:text-sm font-black text-amber-600 mt-1.5 truncate max-w-full text-center">
                      @{top1.apodo}
                    </p>
                    <span className="text-xs sm:text-sm font-black text-amber-600 font-mono mt-0.5">
                      {top1.puntos} pts
                    </span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded-full mt-1">
                      {top1.confirmaciones} conf.
                    </span>
                  </div>
                )}
              </div>

              {/* PUESTO 3 (Bronce) */}
              <div className="flex flex-col items-center">
                {top3 ? (
                  <div className="w-full flex flex-col items-center theme-card-sub border border-amber-700/30 rounded-2xl p-2 sm:p-3 relative shadow-xs">
                    <div className="absolute -top-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-700 text-amber-100 font-black text-[10px] sm:text-xs flex items-center justify-center shadow">
                      3
                    </div>
                    <img
                      src={top3.avatar_url}
                      alt={top3.apodo}
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-amber-700/60 object-cover mt-1 bg-slate-900 shadow-xs"
                    />
                    <p className="text-[11px] sm:text-xs font-bold theme-title mt-1.5 truncate max-w-full text-center">
                      @{top3.apodo}
                    </p>
                    <span className="text-[11px] sm:text-xs font-black text-amber-600 font-mono mt-0.5">
                      {top3.puntos} pts
                    </span>
                    <span className="text-[9px] font-bold text-amber-600 mt-0.5 truncate">
                      {top3.confirmaciones} conf.
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-28 rounded-2xl border border-dashed theme-card-sub flex items-center justify-center text-[10px] theme-muted">
                    Vacío
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* LISTADO DE POSICIONES (4° en adelante) */}
          {restoVecinos.length > 0 && (
            <section className="theme-card border rounded-3xl p-4 sm:p-6 shadow-xl space-y-2.5">
              <h2 className="text-xs font-black uppercase tracking-wider theme-muted px-1">
                Tabla General de Posiciones
              </h2>

              <div className="space-y-2">
                {restoVecinos.map((vecino, idx) => {
                  const posReal = idx + 4;
                  const rango = obtenerRangoComunitario(vecino.puntos);
                  const IconoRango = rango.icono;
                  const esYo = usuarioActual && String(usuarioActual.id).toLowerCase() === String(vecino.id).toLowerCase();

                  return (
                    <article
                      key={vecino.id || idx}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                        esYo
                          ? 'bg-sky-500/10 border-sky-500/40 shadow-xs'
                          : 'theme-card-sub hover:opacity-95'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-black theme-muted w-5 text-center shrink-0">
                          #{posReal}
                        </span>
                        <img
                          src={vecino.avatar_url}
                          alt={vecino.apodo}
                          className="w-9 h-9 rounded-full border border-slate-700/60 object-cover shrink-0 bg-slate-900"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold theme-title truncate">
                              @{vecino.apodo}
                            </p>
                            {esYo && (
                              <span className="text-[9px] font-black bg-sky-500/20 text-sky-600 border border-sky-500/30 px-1.5 py-0.2 rounded-full">
                                Vos
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] theme-muted flex-wrap">
                            <span className="flex items-center gap-1">
                              <IconoRango className={`w-3 h-3 ${rango.colorTexto}`} />
                              <span className={rango.colorTexto}>{rango.nombre}</span>
                            </span>
                            <span>•</span>
                            <span>{vecino.aportes} aportes</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                              <ThumbsUp className="w-2.5 h-2.5" />
                              {vecino.confirmaciones}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <p className="text-xs sm:text-sm font-black theme-title font-mono">
                          {vecino.puntos}
                        </p>
                        <span className="text-[10px] theme-muted">puntos</span>
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