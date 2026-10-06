'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [estaInstalada, setEstaInstalada] = useState(false);

  useEffect(() => {
    // Detectar si ya corre instalada en pantalla completa
    const esStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone;

    if (esStandalone) {
      setEstaInstalada(true);
    }

    // Registrar Service Worker para habilitar el prompt directo
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Error al registrar Service Worker:', err);
      });
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setEstaInstalada(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstalarApp = async () => {
    if (!deferredPrompt) {
      alert(
        'Para instalar en PC: buscá el ícono de instalación en la barra del navegador. En celular: menú de tres puntos > "Instalar o Agregar a pantalla de inicio".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setEstaInstalada(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="px-5 pt-4 pb-3 border-b border-slate-800 bg-[#121826]/90 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-lg font-black tracking-tight text-white">
              BARI<span className="text-sky-400">AHORRA</span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Precios reales de Bariloche
          </p>
        </div>

        <div>
          {estaInstalada ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
              <span>✓</span>
              <span>APP INSTALADA</span>
            </div>
          ) : (
            <button
              onClick={handleInstalarApp}
              className="flex items-center gap-1.5 bg-sky-500/15 hover:bg-sky-500/25 px-2.5 py-1 rounded-full border border-sky-500/30 text-[11px] font-semibold text-sky-400 transition"
            >
              <span>📲 Instalar App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}