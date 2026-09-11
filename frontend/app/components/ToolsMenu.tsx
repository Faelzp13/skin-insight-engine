"use client";

import { useState, useRef, useEffect } from 'react';
import FeeCalculator from './FeeCalculator';

// NOVO: Adicionado para receber a moeda
interface ToolsMenuProps {
  currency: { code: string; symbol: string; flag: string };
}

export default function ToolsMenu({ currency }: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
        >
          Tools
          <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 overflow-hidden py-1">
            <button
              onClick={() => {
                setShowCalculator(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 font-medium"
            >
              <span>🧮</span> Calculadora
            </button>

            <button disabled className="w-full text-left px-4 py-2.5 text-sm text-neutral-400 dark:text-neutral-600 cursor-not-allowed flex items-center gap-3 font-medium">
              <span className="opacity-50">🔄</span> Conversor
            </button>
          </div>
        )}
      </div>

      {/* NOVO: Passando a moeda para a Calculadora */}
      {showCalculator && (
        <FeeCalculator onClose={() => setShowCalculator(false)} currency={currency} />
      )}
    </>
  );
}