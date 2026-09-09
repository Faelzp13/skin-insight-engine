import { getConnection } from '../lib/db';
import SearchBar from './components/SearchBar';
import { getCurrencyInfo, formatPrice } from '../lib/currency';
import Link from 'next/link';

export default async function Home() {
  const pool = await getConnection();
  const { code, rate, symbol } = await getCurrencyInfo();

  // Query analítica: Filtra distorções, exige preço mínimo e rankeia as melhores margens
  const result = await pool.request().query(`
    WITH SteamPrices AS (
      SELECT tradeup_id, wear, price AS steam_price
      FROM fact_current_prices
      WHERE market_name LIKE '%Steam%'
    ),
    ThirdPartyPrices AS (
      SELECT tradeup_id, wear, market_name AS tp_market, price AS tp_price
      FROM fact_current_prices
      WHERE market_name NOT LIKE '%Steam%'
    ),
    RankedOpportunities AS (
      SELECT 
        s.tradeup_id,
        s.wear,
        s.steam_price,
        tp.tp_market,
        tp.tp_price,
        ((s.steam_price - tp.tp_price) / s.steam_price) * 100 AS discount_pct,
        ROW_NUMBER() OVER(PARTITION BY s.tradeup_id, s.wear ORDER BY tp.tp_price ASC) as rn
      FROM SteamPrices s
      JOIN ThirdPartyPrices tp ON s.tradeup_id = tp.tradeup_id AND s.wear = tp.wear
      WHERE s.steam_price >= 15.00 -- Filtro Anti-Centavos: Exige base mínima de $15 dólares na Steam
        AND tp.tp_price > 0 
        AND tp.tp_price < s.steam_price
    )
    SELECT TOP 10
      r.tradeup_id,
      d.skin_name,
      d.image_url,
      r.wear,
      r.tp_market AS market_name,
      r.tp_price AS price,
      r.steam_price,
      r.discount_pct
    FROM RankedOpportunities r
    JOIN dim_skins d ON r.tradeup_id = d.tradeup_id
    WHERE r.rn = 1 -- Garante apenas a melhor oferta por skin/desgaste
    ORDER BY r.discount_pct DESC
  `);

  const skins = result.recordset;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 p-6 md:p-10 font-sans transition-colors">
      <div className="max-w-6xl mx-auto">

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-emerald-600 dark:text-emerald-500">
            Painel de Oportunidades
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
            As maiores distorções de preço no mercado de CS2 agora. Filtramos itens abaixo de US$ 15 na Steam para focar em margens reais de arbitragem.
          </p>
        </header>

        <SearchBar />

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto shadow-xl transition-colors">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-300 dark:border-neutral-800 transition-colors">
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">Item</th>
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">Mercado</th>
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">Ref. Steam</th>
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300">Preço Encontrado</th>
                <th className="p-4 font-semibold text-neutral-700 dark:text-neutral-300 text-right">Margem / Desconto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/50">
              {skins.map((skin, index) => {
                const isST = skin.wear?.startsWith('ST ');
                const isSv = skin.wear?.startsWith('Sv ') || skin.wear?.startsWith('Souvenir ');
                const cleanWear = skin.wear?.replace(/^(ST |Sv |Souvenir )/, '');

                return (
                  <tr
                    key={`${skin.tradeup_id}-${index}`}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="p-4">
                      <Link href={`/skin/${skin.tradeup_id}`} className="flex items-center gap-4 group-hover:opacity-80 transition-opacity">
                        {skin.image_url ? (
                          <img src={skin.image_url} alt={skin.skin_name} className="w-16 h-12 object-contain bg-neutral-100 dark:bg-neutral-800/50 rounded drop-shadow-md" />
                        ) : (
                          <div className="w-16 h-12 bg-neutral-200 dark:bg-neutral-800 rounded flex items-center justify-center text-[10px] text-neutral-500">Sem Foto</div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">{skin.skin_name}</span>
                          <div className="text-xs mt-1">
                            {isST && <span className="text-orange-500 dark:text-orange-400 font-bold mr-1">ST</span>}
                            {isSv && <span className="text-yellow-500 dark:text-yellow-400 font-bold mr-1">Sv</span>}
                            <span className="text-neutral-500 dark:text-neutral-400">{cleanWear || '-'}</span>
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="p-4 text-neutral-600 dark:text-neutral-300 font-medium uppercase tracking-wide text-sm">
                      {skin.market_name}
                    </td>

                    <td className="p-4 text-neutral-400 dark:text-neutral-500 line-through decoration-neutral-300 dark:decoration-neutral-600 decoration-2 font-mono text-sm">
                      {formatPrice(skin.steam_price, rate, symbol)}
                    </td>

                    <td className="p-4 text-neutral-900 dark:text-neutral-100 font-mono font-bold text-lg">
                      {formatPrice(skin.price, rate, symbol)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-500/30">
                          {skin.discount_pct.toFixed(1)}% OFF
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-mono">
                          Lucro: {formatPrice(skin.steam_price - skin.price, rate, symbol)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}