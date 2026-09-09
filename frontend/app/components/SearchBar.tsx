"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // Para navegação pelo teclado

  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fecha os resultados ao clicar fora da barra
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1); // Reseta a seleção quando digita algo novo

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    // Calcula dinamicamente quantas colunas a grade tem na tela atual
    // Cada item tem 96px (w-24) + 8px (gap) = 104px
    const gridRef = document.getElementById('search-results-grid');
    const cols = gridRef ? Math.max(1, Math.floor(gridRef.clientWidth / 104)) : 1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        if (prev === -1) return 0;
        const next = prev + cols; // Pula uma linha inteira para baixo
        return next < results.length ? next : results.length - 1;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const next = prev - cols; // Pula uma linha inteira para cima
        return next >= 0 ? next : 0;
      });
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedSkin = results[selectedIndex];
      router.push(`/skin/${selectedSkin.tradeup_id}`);
      setSearchTerm('');
      setResults([]);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto" ref={searchContainerRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Pesquise por uma skin (ex: Shadow Daggers)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 px-6 py-4 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors shadow-lg"
        />
        {isSearching && (
          <div className="absolute right-6 top-4 text-neutral-500 dark:text-neutral-400 animate-pulse text-sm">
            Buscando...
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-4 z-50 transition-colors max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Adicionamos o ID aqui para o JavaScript ler a largura do grid */}
          <div id="search-results-grid" className="flex flex-wrap justify-center gap-2">
            {results.map((skin, index) => (
              <div
                key={skin.tradeup_id}
                onClick={() => {
                  router.push(`/skin/${skin.tradeup_id}`);
                  setSearchTerm('');
                  setResults([]);
                }}
                className={`w-24 flex flex-col items-center gap-2 p-2 rounded-md cursor-pointer transition-colors border 
                  ${selectedIndex === index 
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500' 
                    : 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700/50'
                  }`}
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