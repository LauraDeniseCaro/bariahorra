'use client';

import Link from 'next/link';
import { Coffee } from 'lucide-react';

// Vectores SVG vectoriales limpios (Lucide no incluye logos de marcas propietarias)
function InstagramIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

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
            <Coffee className="w-4 h-4 stroke-[2.5]" />
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
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:text-blue-400 transition"
          >
            <FacebookIcon className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-400 hover:text-white transition"
          >
            <TikTokIcon className="w-3.5 h-3.5" />
            <span>TikTok</span>
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
            {/* Acceso discreto para administración */}
            <Link href="/admin" className="text-slate-600 hover:text-slate-400 transition">
              • Gestión
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}