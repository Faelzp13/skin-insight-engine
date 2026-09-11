"use client";

import { useState, useRef, useEffect } from 'react';
import FeeCalculator from './FeeCalculator';
import ROICalculator from './ROICalculator';
import TradeUpCalculator from './TradeUpCalculator';
import StickerCalculator from './StickerCalculator';
import CurrencyConverter from './CurrencyConverter';

interface ToolsMenuProps {
  currency: { code: string; symbol: string; flag: string };
}

export default function ToolsMenu({ currency }: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estados individuais para cada janela
  const [showFee, setShowFee] = useState(false);
  const [showROI, setShowROI] = useState(false);
  const [showTradeUp, setShowTradeUp] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
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
          <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 overflow-hidden py-2">

            <button onClick={() => { setShowFee(true); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 font-medium">
              <span>🧮</span> Calculadora de Taxas
            </button>
            <button onClick={() => { setShowROI(true); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 font-medium">
              <span>📈</span> Calculadora de ROI
            </button>
            <button onClick={() => { setShowTradeUp(true); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 font-medium">
              <span>🔫</span> Simulador de Trade-Up
            </button>
            <button onClick={() => { setShowSticker(true); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 font-medium">
              <span>🏷️</span> Calculadora SP% (Adesivos)
            </button>
            <div className="border-t border-neutral-200 dark:border-neutral-800 my-1"></div>
            <button onClick={() => { setShowCurrency(true); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 font-medium">
              <span>🔄</span> Câmbio Real-time
            </button>

          </div>
        )}
      </div>

      {/* Renderiza as janelas soltas na tela quando ativadas */}
      {showFee && <FeeCalculator onClose={() => setShowFee(false)} currency={currency} />}
      {showROI && <ROICalculator onClose={() => setShowROI(false)} currency={currency} />}
      {showTradeUp && <TradeUpCalculator onClose={() => setShowTradeUp(false)} />}
      {showSticker && <StickerCalculator onClose={() => setShowSticker(false)} currency={currency} />}
      {showCurrency && <CurrencyConverter onClose={() => setShowCurrency(false)} />}
    </>
  );
}