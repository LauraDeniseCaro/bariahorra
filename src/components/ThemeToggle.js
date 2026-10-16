'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [tema, setTema] = useState('dark');

  useEffect(() => {
    // Leer preferencia guardada o usar oscuro por defecto
    const guardado = localStorage.getItem('bariahorra_tema') || 'dark';
    setTema(guardado);
    aplicarTema(guardado);
  }, []);

  const aplicarTema = (nuevoTema) => {
    const root = document.documentElement;
    if (nuevoTema === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    } else {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    }
  };

  const alternarTema = () => {
    const proximo = tema === 'dark' ? 'light' : 'dark';
    setTema(proximo);
    localStorage.setItem('bariahorra_tema', proximo);
    aplicarTema(proximo);
  };

  return (
    <button
      onClick={alternarTema}
      aria-label="Cambiar modo de luz"
      className="p-2 rounded-xl theme-btn-sec border transition active:scale-95 shrink-0 cursor-pointer shadow-sm"
    >
      {tema === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-sky-400" />
      )}
    </button>
  );
}