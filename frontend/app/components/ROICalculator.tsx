"use client";

import { useState, useEffect, useRef } from 'react';
import { marketDetails } from '../../lib/markets';

export default function ROICalculator({ onClose, currency }: { onClose: () => void, currency: any }) {
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('Steam');

  // Posição inicial levemente deslocada (Cascata)
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const markets = ['Steam', 'CSFloat', 'Skinport', 'Tradeit.gg', 'CS.Money', 'Skin.Land', 'DMarket', 'SkinSwap'];
  const feeString = marketDetails[selectedMarket]?.fee || "0";
  const feePercentage = parseFloat(feeString.replace(/[^0-9.]/g, '')) || 0;

  const buy = parseFloat(buyPrice) || 0;
  const sell = parseFloat(sellPrice) || 0;

  const feeValue = sell * (feePercentage / 100);
  const netRevenue = sell - feeValue;
  const profit = netRevenue - buy;
  const roi = buy > 0 ? (profit / buy) * 100 : 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => isDragging && setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  return (
    <div className="fixed z-[101] w-full max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden" style={{ left: `${position.x}px`, top: `${position.y}px`, userSelect: isDragging ? 'none' : 'auto' }}>
      <div onMouseDown={handleMouseDown} className="bg-neutral-100 dark:bg-neutral-950/80 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center cursor-move">
        <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm select-none">📈 Calculadora de ROI</h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-red-500 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800">✕</button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Preço de Compra ({currency.symbol})</label>
          <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-mono" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Preço de Venda Esperado ({currency.symbol})</label>
          <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-mono" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1 uppercase">Vender Onde?</label>
          <select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm">
            {markets.map(m => <option key={m} value={m}>{m} (Taxa: {marketDetails[m]?.fee})</option>)}
          </select>
        </div>
        <div className={`mt-4 p-3 rounded-lg border ${profit >= 0 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/30' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30'}`}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-500">Líquido de Venda:</span>
            <span className="font-mono">{currency.symbol}{netRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-sm">Lucro Puro:</span>
            <div className="text-right">
              <span className={`block text-lg font-mono font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{profit > 0 ? '+' : ''}{currency.symbol}{profit.toFixed(2)}</span>
              <span className={`block text-xs font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>ROI: {roi.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}