'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0f18] border-t border-slate-800/80 pt-8 pb-24 md:pb-10 px-6 text-slate-400 text-xs mt-12">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
        
        {/* Botón Cafecito */}
        <div className="w-full max-w-xs">
          <a
            href="https://cafecito.app/bariahorra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition"
          >
            <span className="text-base">☕</span>
            <span>Apoyar el proyecto en Cafecito</span>
          </a>
        </div>

        {/* Redes Sociales */}
        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:text-pink-400 transition"
          >
            <span>📸</span> Instagram
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:text-blue-400 transition"
          >
            <span>👥</span> Facebook
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-400 hover:text-white transition"
          >
            <span>🎵</span> TikTok
          </a>
        </div>

        {/* Créditos de Desarrollo y Acceso Discreto */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full border-t border-slate-800/60 pt-6 text-[11px] text-slate-500 gap-2">
          <p>
            Desarrollado con orgullo en la Patagonia por{' '}
            <span className="font-bold text-slate-300">argos.it</span>
          </p>
          <div className="flex items-center gap-3">
            <span>Bariahorra © {new Date().getFullYear()}</span>
            {/* Acceso discreto para vos sin llamar la atención */}
            <Link href="/admin" className="text-slate-600 hover:text-slate-400 transition">
              • Gestión
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}