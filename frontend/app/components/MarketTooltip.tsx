"use client";

import { getMarketInfo } from '../../lib/markets';
import { ReactNode } from 'react';

interface MarketTooltipProps {
  marketName: string;
  children: ReactNode; // Aceita qualquer tag <img> ou <span> dentro dele
}

export default function MarketTooltip({ marketName, children }: MarketTooltipProps) {
  const info = getMarketInfo(marketName);

  return (
    <div className="group/tooltip relative inline-flex items-center justify-center cursor-help">

      {/* Aqui ele renderiza a sua imagem do banco ou seu texto perfeitamente */}
      {children}

      {/* O Balão Flutuante (Só aparece se existir a info no dicionário) */}
      {info && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all z-50 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl p-4 w-56 text-left">

          <div className="flex justify-between items-center border-b border-neutral-700 pb-3 mb-3">
            <span className="text-white font-extrabold text-sm uppercase tracking-wider">{marketName}</span>
            <span className="bg-emerald-900/40 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-800/50">
              ★ {info.trust}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-neutral-400">
              <span className="font-medium">Taxa de Venda:</span>
              <div className="flex flex-col items-end">
                <span className="font-mono text-white font-bold bg-neutral-800 px-1.5 py-0.5 rounded">
                  {info.fee}
                </span>
                {info.extraFee && (
                  <span className="text-[9px] text-neutral-500 mt-0.5">{info.extraFee}</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span className="font-medium">Venda Instantânea:</span>
              <span className="text-sm">{info.instantSell ? '✔️' : '❌'}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span className="font-medium">Trading Bots:</span>
              <span className="text-sm">{info.tradingBots ? '✔️' : '❌'}</span>
            </div>
          </div>

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-neutral-900"></div>
        </div>
      )}
    </div>
  );
}