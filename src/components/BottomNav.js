'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const esInicio = pathname === '/';
  const esCargar = pathname === '/cargar';

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="w-full bg-[#111827] border-t border-slate-800/80 py-3 px-4 mt-auto">
      <div className="max-w-md mx-auto flex items-center justify-center gap-4">
        {/* Enlace Inicio / Precios */}
        <Link
          href="/"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition border ${
            esInicio
              ? 'bg-slate-800 text-sky-400 border-sky-500/40 shadow-sm'
              : 'text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Ver Precios</span>
        </Link>

        {/* Botón Central Sumar Oferta */}
        <Link
          href="/cargar"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition border shadow-md active:scale-95 ${
            esCargar
              ? 'bg-sky-500 text-slate-950 border-sky-400'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-emerald-500/10'
          }`}
        >
          <span className="text-base font-black leading-none">+</span>
          <span>Sumar Oferta</span>
        </Link>
      </div>
    </nav>
  );
}