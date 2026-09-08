import { getConnection } from '../../../lib/db';
import Link from 'next/link';

export default async function SkinPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const pool = await getConnection();

  // 1. Dados da Skin
  const skinResult = await pool.request().input('id', id).query(`SELECT skin_name, image_url FROM dim_skins WHERE tradeup_id = @id`);
  const skin = skinResult.recordset[0];

  // 2. Preços
  const pricesResult = await pool.request().input('id', id).query(`SELECT market_name, wear, price FROM fact_current_prices WHERE tradeup_id = @id`);
  const prices = pricesResult.recordset;

  // 3. Logos dos Mercados
  const marketsInfoResult = await pool.request().query(`SELECT market_name, logo_url AS image_url FROM dim_markets`);
  const marketsInfo = marketsInfoResult.recordset.reduce((acc, curr) => {
    acc[curr.market_name] = curr.image_url;
    return acc;
  }, {} as Record<string, string>);

  if (!skin) {
    return (
      <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-sans">
        <h1 className="text-2xl text-neutral-400 mb-4">Skin não encontrada.</h1>
        <Link href="/" className="text-emerald-500 hover:text-emerald-400 underline">Voltar</Link>
      </main>
    );
  }

  // --- LÓGICA DE NEGÓCIO ---

  // Ordenação de Desgastes
  const wearOrder = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred', 'ST Factory New', 'ST Minimal Wear', 'ST Field-Tested', 'ST Well-Worn', 'ST Battle-Scarred'];
  const uniqueWears = Array.from(new Set(prices.map((p: any) => p.wear))) as string[];
  const wears = uniqueWears.sort((a, b) => {
    const indexA = wearOrder.indexOf(a), indexB = wearOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1; if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Identificação de Mercados (Forçando Steam para o início)
  const allMarkets = Array.from(new Set(prices.map((p: any) => p.market_name))) as string[];
  const steamName = allMarkets.find(m => m.toLowerCase().includes('steam'));
  const otherMarkets = allMarkets.filter(m => m !== steamName).sort();
  const sortedMarkets = steamName ? [steamName, ...otherMarkets] : otherMarkets;

  // Mapa de preços e cálculos analíticos
  const priceMap: Record<string, Record<string, number>> = {};
  const minPrices: Record<string, number> = {};
  const avgPrices: Record<string, number> = {};

  wears.forEach(wear => {
    const wearPrices = prices.filter((p: any) => p.wear === wear);

    // Mapeamento normal
    priceMap[wear] = {};
    wearPrices.forEach((p: any) => { priceMap[wear][p.market_name] = p.price; });

    // Descobre a média
    const sum = wearPrices.reduce((acc, curr) => acc + curr.price, 0);
    avgPrices[wear] = wearPrices.length > 0 ? sum / wearPrices.length : 0;

    // Descobre o menor preço (Ignorando a Steam se você quiser que a Steam seja só referência.
    // Se quiser que a Steam também possa ser a mais barata, remova o '.filter' abaixo)
    const validPricesForMin = wearPrices
      .filter((p: any) => p.market_name !== steamName)
      .map((p: any) => p.price);

    if (validPricesForMin.length > 0) {
      minPrices[wear] = Math.min(...validPricesForMin);
    }
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-10 font-sans">
      <div className="max-w-7xl mx-auto">

        <Link href="/" className="text-emerald-500 hover:text-emerald-400 mb-8 inline-block font-medium transition-colors">
          &larr; Voltar para a Busca
        </Link>

        {/* Topo Dividido: Imagem (Esquerda) e Média (Direita) */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">

          {/* Card da Imagem */}
          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-10 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
            <h1 className="text-3xl font-bold mb-6 text-center text-neutral-100">{skin.skin_name}</h1>
            {skin.image_url ? (
              <img src={skin.image_url} alt={skin.skin_name} className="w-full max-w-md h-auto object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full max-w-md h-48 bg-neutral-800 flex items-center justify-center text-neutral-500 rounded-lg">Sem Imagem</div>
            )}
          </div>

          {/* Card da Mini-tabela de Médias */}
          <div className="w-full lg:w-96 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 text-center font-semibold text-neutral-300">
              Preço Médio Global
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm">
                <tbody>
                  {wears.map(wear => (
                    <tr key={`avg-${wear}`} className="border-b border-neutral-800/50 last:border-0">
                      <td className="py-3 text-neutral-400 font-medium">{wear}</td>
                      <td className="py-3 text-right text-emerald-400 font-mono font-semibold">
                        ${avgPrices[wear]?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Tabela Principal de Mercados */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800">
                <th className="p-5 font-bold text-neutral-300 border-r border-neutral-800 sticky left-0 bg-neutral-950 z-10 w-48 shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                  Wear
                </th>
                {sortedMarkets.map(market => (
                  <th key={market} className="p-4 text-center">
                    {/* Renderiza a logo do mercado se existir, senão mostra o texto */}
                    {marketsInfo[market] ? (
                      <img src={marketsInfo[market]} alt={market} className="h-8 w-auto mx-auto object-contain drop-shadow-md" />
                    ) : (
                      <span className="font-bold text-neutral-300 uppercase tracking-wider text-xs">{market}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {wears.map((wear) => (
                <tr key={wear} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-5 font-medium text-neutral-400 border-r border-neutral-800 sticky left-0 bg-neutral-900 group-hover:bg-neutral-800/80 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.5)] transition-colors">
                    {wear}
                  </td>

                  {sortedMarkets.map(market => {
                    const price = priceMap[wear]?.[market];
                    const isSteam = market === steamName;
                    const isCheapest = !isSteam && price === minPrices[wear]; // Lógica de destaque

                    return (
                      <td key={market} className="p-4 text-center bg-neutral-900/50">
                        {price ? (
                          <div className={`inline-block px-4 py-1.5 border font-mono font-semibold text-sm tracking-tight rounded-full transition-all
                            ${isSteam ? 'bg-slate-800/50 text-slate-300 border-slate-700' : // Estilo Steam
                              isCheapest ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : // Estilo Menor Preço (Preenchido)
                              'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'} // Estilo Padrão (Caixinha redonda)
                          `}>
                            ${price.toFixed(2)}
                          </div>
                        ) : (
                          <span className="text-neutral-700 font-mono text-sm block">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}