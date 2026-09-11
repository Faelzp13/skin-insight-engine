"use client";

import { useState, useEffect, useRef } from 'react';

export default function CurrencyConverter({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('100');
  const [rates, setRates] = useState<any>(null);

  const [position, setPosition] = useState({ x: 50, y: 250 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Busca na API que você já usa
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,EUR-USD')
      .then(res => res.json())
      .then(data => setRates(data));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y }; };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => isDragging && setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  const value = parseFloat(amount) || 0;

  return (
    <div className="fixed z-[104] w-full max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden" style={{ left: `${position.x}px`, top: `${position.y}px`, userSelect: isDragging ? 'none' : 'auto' }}>
      <div onMouseDown={handleMouseDown} className="bg-neutral-100 dark:bg-neutral-950/80 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center cursor-move">
        <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm select-none">🔄 Câmbio Real-time</h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-red-500 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800">✕</button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Valor em Dólar (USD)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-lg font-mono text-center font-bold" />
        </div>

        {rates ? (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <span className="font-bold text-sm">🇧🇷 BRL</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {(value * parseFloat(rates.USDBRL.bid)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <span className="font-bold text-sm">🇪🇺 EUR</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">€ {(value / parseFloat(rates.EURUSD.bid)).toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-neutral-500 py-4 animate-pulse">Carregando cotações...</div>
        )}
      </div>
    </div>
  );
}