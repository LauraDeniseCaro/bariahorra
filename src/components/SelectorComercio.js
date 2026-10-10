'use client';

import { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown } from 'lucide-react';

const COMERCIOS_BARILOCHE = [
  'La Anónima (Albarracín)',
  'La Anónima (Gallardo)',
  'La Anónima (Km 4)',
  'La Anónima (Km 13)',
  'Todo Supermercados (Moreno)',
  'Todo Supermercados (Mitre)',
  'Todo Supermercados (Pioneros)',
  'ChangoMás',
  'Diarco',
  'Maxiconsumo',
  'Carrefour Express',
  'Carnicería de Barrio',
  'Verdulería de Barrio',
  'Almacén / Kiosco',
];

export default function SelectorComercio({ valor, alCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState(valor || '');
  const [indiceFoco, setIndiceFoco] = useState(-1);
  const contenedorRef = useRef(null);

  const filtrados = COMERCIOS_BARILOCHE.filter((c) =>
    c.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    setBusqueda(valor || '');
  }, [valor]);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const clickAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', clickAfuera);
    return () => document.removeEventListener('mousedown', clickAfuera);
  }, []);

  const handleKeyDown = (e) => {
    if (!abierto && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setAbierto(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceFoco((prev) => (prev < filtrados.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceFoco((prev) => (prev > 0 ? prev - 1 : filtrados.length - 1));
    } else if (e.key === 'Enter' && indiceFoco >= 0 && filtrados[indiceFoco]) {
      e.preventDefault();
      seleccionar(filtrados[indiceFoco]);
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  };

  const seleccionar = (nombre) => {
    setBusqueda(nombre);
    alCambiar(nombre);
    setAbierto(false);
    setIndiceFoco(-1);
  };

  return (
    <div className="relative" ref={contenedorRef}>
      <div className="relative">
        <Store className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Escribí ej: anoni, diarco, todo..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            alCambiar(e.target.value);
            setAbierto(true);
            setIndiceFoco(-1);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={handleKeyDown}
          required
          className="w-full bg-[#10141f] text-sm text-white rounded-xl pl-10 pr-9 py-2.5 border border-slate-700 outline-none focus:border-orange-500 font-medium"
        />
        <ChevronDown
          className="absolute right-3.5 top-3 w-4 h-4 text-slate-500 cursor-pointer"
          onClick={() => setAbierto(!abierto)}
        />
      </div>

      {abierto && filtrados.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-[#161d2b] border border-slate-700 rounded-xl shadow-xl py-1 divide-y divide-slate-800">
          {filtrados.map((c, i) => (
            <li
              key={c}
              onClick={() => seleccionar(c)}
              className={`px-3.5 py-2 text-xs cursor-pointer transition flex items-center justify-between ${
                indiceFoco === i ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{c}</span>
              {busqueda && c.toLowerCase() === busqueda.toLowerCase() && (
                <span className="text-[10px] opacity-75 font-mono">Seleccionado</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}