"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Erro ao buscar:", error);
      }
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="relative w-full max-w-5xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Pesquise por uma skin (ex: Shadow Daggers)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 px-6 py-4 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors shadow-lg"
        />
        {isSearching && (
          <div className="absolute right-6 top-4 text-neutral-500 dark:text-neutral-400 animate-pulse text-sm">
            Buscando...
          </div>
        )}
      </div>

      {/* Container de Resultados - Layout Grid/Wrap sem scroll */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-4 z-50 transition-colors">
          <div className="flex flex-wrap justify-center gap-2">
            {results.map((skin) => (
              <div
                key={skin.tradeup_id}
                onClick={() => {
                  router.push(`/skin/${skin.tradeup_id}`);
                  setSearchTerm('');
                  setResults([]);
                }}
                className="w-24 flex flex-col items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-700/50"
              >
                {skin.image_url ? (
                  <img src={skin.image_url} alt={skin.skin_name} className="w-16 h-12 object-contain drop-shadow-md" />
                ) : (
                  <div className="w-16 h-12 bg-neutral-200 dark:bg-neutral-900 rounded flex items-center justify-center text-[9px] text-neutral-500">Sem Foto</div>
                )}
                <span className="font-medium text-neutral-700 dark:text-neutral-300 text-center text-[10px] leading-tight line-clamp-3 w-full break-words">
                  {skin.skin_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}