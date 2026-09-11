"use client";

import { useState, useEffect, useRef } from 'react';

export default function StickerCalculator({ onClose, currency }: { onClose: () => void, currency: any }) {
  const [skinPrice, setSkinPrice] = useState('');
  const [stickerPrice, setStickerPrice] = useState('');
  const [spPercentage, setSpPercentage] = useState('5'); // Padrão 5%

  const [position, setPosition] = useState({ x: 250, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const skin = parseFloat(skinPrice) || 0;
  const sticker = parseFloat(stickerPrice) || 0;
  const sp = parseFloat(spPercentage) || 0;

  const stickerAddedValue = sticker * (sp / 100);
  const finalPrice = skin + stickerAddedValue;

  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y }; };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => isDragging && setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  return (
    <div className="fixed z-[103] w-full max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden" style={{ left: `${position.x}px`, top: `${position.y}px`, userSelect: isDragging ? 'none' : 'auto' }}>
      <div onMouseDown={handleMouseDown} className="bg-neutral-100 dark:bg-neutral-950/80 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center cursor-move">
        <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm select-none">🏷️ Sticker SP% Calc</h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-red-500 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800">✕</button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Preço Base da Arma ({currency.symbol})</label>
          <input type="number" value={skinPrice} onChange={(e) => setSkinPrice(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-mono" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Valor Total dos Adesivos ({currency.symbol})</label>
          <input type="number" value={stickerPrice} onChange={(e) => setStickerPrice(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-mono" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Sticker Percentage (SP%)</label>
          <div className="flex gap-2">
            <input type="range" min="0" max="25" step="0.5" value={spPercentage} onChange={(e) => setSpPercentage(e.target.value)} className="flex-1 accent-emerald-500" />
            <span className="font-mono text-sm font-bold w-12 text-right">{spPercentage}%</span>
          </div>
        </div>
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 dark:bg-purple-900/10 dark:border-purple-800/30 rounded-lg text-center">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold block mb-1">Preço Justo Recomendado</span>
          <span className="text-2xl font-mono font-bold text-purple-700 dark:text-purple-400 block">{currency.symbol}{finalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}