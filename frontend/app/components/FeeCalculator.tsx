"use client";

import { useState, useEffect, useRef } from 'react';
import { marketDetails } from '../../lib/markets';

// NOVO: Adicionamos a propriedade currency
interface FeeCalculatorProps {
  onClose: () => void;
  currency: { code: string; symbol: string; flag: string };
}

export default function FeeCalculator({ onClose, currency }: FeeCalculatorProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('Steam');
  const [isBuying, setIsBuying] = useState<boolean>(false);

  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const markets = ['Steam', 'CSFloat', 'Skinport', 'Tradeit.gg', 'CS.Money', 'Skin.Land', 'DMarket', 'SkinSwap'];
  const marketInfo = marketDetails[selectedMarket];

  const feeString = marketInfo?.fee || "0";
  const feePercentage = parseFloat(feeString.replace(/[^0-9.]/g, '')) || 0;
  const rawAmount = parseFloat(amount) || 0;

  let finalAmount = 0;
  let feeValue = 0;

  if (isBuying) {
    feeValue = rawAmount * (feePercentage / 100);
    finalAmount = rawAmount + feeValue;
  } else {
    feeValue = rawAmount * (feePercentage / 100);
    finalAmount = rawAmount - feeValue;
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed z-[100] w-full max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl transition-colors overflow-hidden"
      style={{ left: `${position.x}px`, top: `${position.y}px`, userSelect: isDragging ? 'none' : 'auto' }}
    >
      <div
        onMouseDown={handleMouseDown}
        className="bg-neutral-100 dark:bg-neutral-950/80 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center cursor-move"
      >
        <h3 className="font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2 text-sm select-none">
          🧮 Calculadora de Taxas
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-red-500 transition-colors bg-neutral-200 dark:bg-neutral-800 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="p-5">
        <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg mb-4 border border-neutral-200 dark:border-neutral-800">
          <button onClick={() => setIsBuying(false)} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${!isBuying ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow' : 'text-neutral-500'}`}>Vender</button>
          <button onClick={() => setIsBuying(true)} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${isBuying ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow' : 'text-neutral-500'}`}>Comprar</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Plataforma</label>
            <select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
              {markets.map(m => (
                <option key={m} value={m}>{m} ({marketDetails[m]?.fee})</option>
              ))}
            </select>
          </div>

          <div>
            {/* NOVO: A label avisa o símbolo da moeda */}
            <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              Valor Anunciado ({currency.code})
            </label>
            <div className="relative">
              {/* NOVO: Símbolo dinâmico dentro do input */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm">{currency.symbol}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-md font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-lg">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="text-neutral-600 dark:text-neutral-400">Taxa ({feeString}):</span>
            {/* NOVO: Símbolo dinâmico no valor da taxa */}
            <span className="text-red-500 font-mono font-medium">
              -{currency.symbol}{feeValue > 0 ? feeValue.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="border-t border-emerald-200 dark:border-emerald-800/50 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
              {isBuying ? 'Vai pagar:' : 'Vai receber:'}
            </span>
            {/* NOVO: Símbolo dinâmico no valor final */}
            <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {currency.symbol}{finalAmount > 0 ? finalAmount.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}