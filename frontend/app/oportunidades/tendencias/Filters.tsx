"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function FiltersTendencias() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '5');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '2000');
  const [category, setCategory] = useState(searchParams.get('category') || 'normal');
  const [minGrowth, setMinGrowth] = useState(searchParams.get('minGrowth') || '5'); // Crescimento mínimo de 5%

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (category) params.set('category', category);
    if (minGrowth) params.set('minGrowth', minGrowth);

    params.set('page', '1'); // Sempre volta para a página 1 ao filtrar

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 mb-8 shadow-md transition-colors">
      <div className="flex flex-col md:flex-row gap-4 items-end">

        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="all">Todas as Skins</option>
            <option value="normal">Apenas Normais (Sem ST/Sv)</option>
            <option value="st">Apenas StatTrak™</option>
            <option value="sv">Apenas Souvenirs</option>
          </select>
        </div>

        <div className="flex-1 w-full flex gap-2">
          <div className="w-1/2">
            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Preço Mín ($)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Preço Máx ($)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Alta Mínima (%)</label>
          <input
            type="number"
            value={minGrowth}
            onChange={(e) => setMinGrowth(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="w-full md:w-auto mt-4 md:mt-0">
          <button
            onClick={applyFilters}
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>
  );
}