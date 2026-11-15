'use client';

import Link from 'next/link';
import { Coffee } from 'lucide-react';

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

// Correo / Gmail en Rojo/Coral Neón
function MailNeonIcon({ className = 'w-5 h-5' }) {
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
        
        {/* Llamado a la acción de Contacto / Comercios / Errores */}
        <a
          href="mailto:bariahorra@gmail.com?subject=Contacto%20%2F%20Sumar%20Comercio%20-%20BariAhorra"
          className="group w-full max-w-md theme-card-sub border border-[var(--border-card)] hover:border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left shadow-sm hover:shadow-md hover:shadow-rose-500/10 transition-all active:scale-[0.99] cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <MailNeonIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-xs font-black theme-title group-hover:text-rose-400 transition-colors">
              ¿Querés sumar tu comercio, contactarnos o reportar un error?
            </p>
            <p className="text-[11px] theme-muted">
              Escribinos a{' '}
              <span className="font-mono font-bold text-rose-400 underline underline-offset-2">
                bariahorra@gmail.com
              </span>
            </p>
          </div>
        </a>

        {/* Botones de Comunidad: Instagram y Cafecito */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Instagram */}
          <a
            href="https://instagram.com/bariahorra"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl theme-btn-sec border hover:border-pink-500/50 shadow-sm hover:shadow-md hover:shadow-pink-500/15 transition-all active:scale-95 cursor-pointer font-bold theme-title"
          >
            <InstagramIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            <span>@bariahorra</span>
          </a>

          {/* Cafecito */}
          <a
            href="https://cafecito.app/bariahorra"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 theme-btn-sec border border-amber-500/30 hover:border-amber-500/60 font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coffee className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="theme-title">
              Invitanos un <strong className="text-amber-500">Cafecito</strong>
            </span>
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