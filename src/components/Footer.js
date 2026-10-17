'use client';

import Link from 'next/link';
import { Coffee } from 'lucide-react';

// TikTok con resplandor Neón Cian & Fucsia
function TikTokIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12.5 1.5v13.5a3.5 3.5 0 1 1-3.5-3.5c.6 0 1.2.15 1.7.4V8a7 7 0 1 0 5.3 6.8V6.5a6 6 0 0 0 4.5 1.9V5a5 5 0 0 1-4.5-3.5h-3.5z"
        fill="#00F2FE"
        style={{ filter: 'drop-shadow(0 0 4px #00F2FE) drop-shadow(1px 1px 0px #FE2C55)' }}
      />
    </svg>
  );
}

// Instagram con gradiente Neón Coral/Fucsia
function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="neonInsta" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke="url(#neonInsta)" style={{ filter: 'drop-shadow(0 0 3px rgba(214, 41, 118, 0.4))' }} />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#neonInsta)" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="url(#neonInsta)" />
    </svg>
  );
}

// Facebook en Azul Neón eléctrico
function FacebookIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0084FF" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 132, 255, 0.4))' }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Correo / Gmail en Rojo/Coral Neón
function MailNeonIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#FF4757" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 71, 87, 0.4))' }}>
      <rect width="20" height="16" x="2" y="4" rx="3" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full theme-card border-t border-[var(--border-card)] pt-8 pb-28 md:pb-12 px-6 theme-muted text-xs mt-12 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
        
        {/* Botón Cafecito minimalista integrado */}
        <div className="w-full max-w-xs">
          <a
            href="https://cafecito.app/bariahorra"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2.5 theme-btn-sec border border-amber-500/30 hover:border-amber-500/60 font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coffee className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="theme-title text-xs">
              Invitanos un <strong className="text-amber-500">Cafecito</strong>
            </span>
          </a>
        </div>

        {/* Canales de Contacto con estilo Neón */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center">
          {/* Contacto Correo */}
          <a
            href="mailto:bariahorra@gmail.com?subject=Consulta%20o%20Sugerencia%20-%20BariAhorra"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-btn-sec border hover:border-rose-500/50 hover:shadow-sm hover:shadow-rose-500/20 transition cursor-pointer font-bold text-slate-800 dark:text-slate-100"
            title="Escribinos por correo"
          >
            <MailNeonIcon className="w-4 h-4 shrink-0" />
            <span>Contacto</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-btn-sec border hover:border-pink-500/50 hover:shadow-sm hover:shadow-pink-500/20 transition cursor-pointer font-bold text-slate-800 dark:text-slate-100"
          >
            <InstagramIcon className="w-4 h-4 shrink-0" />
            <span>Instagram</span>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-btn-sec border hover:border-blue-500/50 hover:shadow-sm hover:shadow-blue-500/20 transition cursor-pointer font-bold text-slate-800 dark:text-slate-100"
          >
            <FacebookIcon className="w-4 h-4 shrink-0" />
            <span>Facebook</span>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-btn-sec border hover:border-cyan-400/50 hover:shadow-sm hover:shadow-cyan-400/20 transition cursor-pointer font-bold text-slate-800 dark:text-slate-100"
          >
            <TikTokIcon className="w-4 h-4 shrink-0" />
            <span>TikTok</span>
          </a>
        </div>

        {/* Créditos de Desarrollo y Acceso Discreto */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full border-t border-[var(--border-card)] pt-6 text-[11px] theme-muted gap-3 px-2 sm:px-4">
          <p className="leading-relaxed">
            Desarrollado con orgullo en la Patagonia por{' '}
            <span className="font-bold theme-title">argos.it</span>
          </p>
          <div className="flex items-center gap-3">
            <span>BariAhorra © {new Date().getFullYear()}</span>
            <Link 
              href="/admin" 
              className="theme-muted hover:text-sky-600 dark:hover:text-sky-400 transition font-medium"
              title="Acceso al panel"
            >
              • Gestión
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}