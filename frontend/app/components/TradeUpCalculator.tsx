"use client";

import { useState, useEffect, useRef } from 'react';

export default function TradeUpCalculator({ onClose }: { onClose: () => void }) {
  const [avgFloat, setAvgFloat] = useState('');
  const [minFloat, setMinFloat] = useState('0.00');
  const [maxFloat, setMaxFloat] = useState('1.00');

  const [position, setPosition] = useState({ x: 200, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const avg = parseFloat(avgFloat) || 0;
  const min = parseFloat(minFloat) || 0;
  const max = parseFloat(maxFloat) || 1;

  const resultFloat = (max - min) * avg + min;

  let wearName = "Indisponível";
  let wearColor = "text-neutral-500";
  if (resultFloat < 0.07) { wearName = "Factory New"; wearColor = "text-emerald-500"; }
  else if (resultFloat < 0.15) { wearName = "Minimal Wear"; wearColor = "text-blue-500"; }
  else if (resultFloat < 0.38) { wearName = "Field-Tested"; wearColor = "text-yellow-500"; }
  else if (resultFloat < 0.45) { wearName = "Well-Worn"; wearColor = "text-orange-500"; }
  else if (resultFloat <= 1.0) { wearName = "Battle-Scarred"; wearColor = "text-red-500"; }

  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y }; };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => isDragging && setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  return (
    <div className="fixed z-[102] w-full max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden" style={{ left: `${position.x}px`, top: `${position.y}px`, userSelect: isDragging ? 'none' : 'auto' }}>
      <div onMouseDown={handleMouseDown} className="bg-neutral-100 dark:bg-neutral-950/80 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center cursor-move">
        <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm select-none">🔫 Trade-Up Simulator</h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-red-500 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800">✕</button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Float Médio das 10 Armas</label>
          <input type="number" step="0.01" value={avgFloat} onChange={(e) => setAvgFloat(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-mono" placeholder="Ex: 0.12" />
        </div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Float Mín (Alvo)</label>
            <input type="number" step="0.01" value={minFloat} onChange={(e) => setMinFloat(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-mono" />
          </div>
          <div className="w-1/2">
            <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Float Máx (Alvo)</label>
            <input type="number" step="0.01" value={maxFloat} onChange={(e) => setMaxFloat(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-mono" />
          </div>
        </div>
        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
          <span className="text-xs text-neutral-500 uppercase font-bold block mb-1">Resultado Esperado</span>
          <span className="text-2xl font-mono font-bold text-neutral-900 dark:text-white block">{resultFloat.toFixed(6)}</span>
          <span className={`text-sm font-bold mt-1 block ${wearColor}`}>{wearName}</span>
        </div>
      </div>
    </div>
  );
}