"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Constantes de Filtros
const CATEGORIES = [
  { id: 'Normal', label: 'Normal', colorClass: 'bg-emerald-500 border-emerald-500 text-white' },
  { id: 'ST', label: 'StatTrak™', colorClass: 'bg-orange-500 border-orange-500 text-white' },
  { id: 'Sv', label: 'Souvenir', colorClass: 'bg-yellow-500 border-yellow-500 text-white' }
];

const WEARS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
const WEAR_COLORS: Record<string, string> = {
  'Factory New': '#10b981', // Verde
  'Minimal Wear': '#3b82f6', // Azul
  'Field-Tested': '#eab308', // Amarelo
  'Well-Worn': '#f97316', // Laranja
  'Battle-Scarred': '#ef4444' // Vermelho
};

const TIME_RANGES = [
  { id: '7D', label: '7 Dias' },
  { id: '30D', label: '1 Mês' },
  { id: '1Y', label: '1 Ano' },
  { id: 'ALL', label: 'Tudo' }
];

const formatCurrency = (value: number, rate: number, symbol: string) => {
  return `${symbol} ${(value * rate).toFixed(2)}`;
};

export default function PriceHistoryChart({ data, rate, symbol }: { data: any[], rate: number, symbol: string }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Estados dos Filtros (Valores padrão ao carregar a página)
  const [activeTime, setActiveTime] = useState('ALL');
  const [activeCats, setActiveCats] = useState<string[]>(['Normal']); // Começa mostrando só Normal
  const [activeWears, setActiveWears] = useState<string[]>(['Factory New', 'Minimal Wear', 'Field-Tested']); // Top 3 desgastes

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[600px] w-full animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-lg mt-8"></div>;

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#404040' : '#e5e5e5';
  const textColor = isDark ? '#a3a3a3' : '#525252';

  // Toggle para multiplas seleções
  const toggleCategory = (catId: string) => {
    setActiveCats(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };
  const toggleWear = (wearId: string) => {
    setActiveWears(prev => prev.includes(wearId) ? prev.filter(w => w !== wearId) : [...prev, wearId]);
  };

  // Gerador dinâmico de Linhas baseado nos filtros selecionados
  const activeLines: any[] = [];
  activeCats.forEach(cat => {
    activeWears.forEach(wear => {
      let dataKey = wear;
      let strokeDash = undefined; // Linha sólida para Normal

      if (cat === 'ST') {
        dataKey = `ST ${wear}`;
        strokeDash = "5 5"; // Linha tracejada para StatTrak
      } else if (cat === 'Sv') {
        dataKey = `Sv ${wear}`;
        strokeDash = "2 4"; // Linha pontilhada para Souvenir
      }

      activeLines.push({
        key: dataKey,
        color: WEAR_COLORS[wear],
        dash: strokeDash,
        name: dataKey
      });
    });
  });

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-xl transition-colors mt-8">

      {/* Cabeçalho e Botões de Tempo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Histórico de Preços (Média Global)
        </h3>

        <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
          {TIME_RANGES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTime(t.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                activeTime === t.id 
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de Categoria e Desgaste */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 p-4 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg border border-neutral-100 dark:border-neutral-800/50">

        {/* Tipos (Normal, ST, Sv) */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 block">Variantes</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const isActive = activeCats.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    isActive ? c.colorClass : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block w-px bg-neutral-200 dark:bg-neutral-800"></div>

        {/* Desgastes */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 block">Desgastes (Wears)</span>
          <div className="flex flex-wrap gap-2">
            {WEARS.map(wear => {
              const isActive = activeWears.includes(wear);
              return (
                <button
                  key={wear}
                  onClick={() => toggleCategory(wear)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    isActive 
                      ? 'bg-neutral-800 dark:bg-neutral-200 border-neutral-800 dark:border-neutral-200 text-white dark:text-neutral-900 shadow-sm' 
                      : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                  }`}
                  onClickCapture={(e) => { e.stopPropagation(); toggleWear(wear); }}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: WEAR_COLORS[wear] }}></span>
                  {wear}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Área do Gráfico */}
      <div className="h-[400px] w-full">
        {activeLines.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
            Selecione pelo menos uma variante e um desgaste acima para visualizar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

              <XAxis dataKey="date" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value, rate, symbol)} dx={-10} />

              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#171717' : '#ffffff', borderColor: isDark ? '#404040' : '#e5e5e5', color: isDark ? '#f5f5f5' : '#171717', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number, name: string) => [formatCurrency(value, rate, symbol), name]}
                labelStyle={{ color: isDark ? '#a3a3a3' : '#737373', marginBottom: '8px' }}
              />

              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {/* Renderiza as linhas ativas baseadas nos checkboxes */}
              {activeLines.map(line => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={3}
                  strokeDasharray={line.dash}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls={true} // Útil caso um mercado não tenha preço naquele dia
                />
              ))}

            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}