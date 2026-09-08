import { getConnection } from '../lib/db';
import SearchBar from './components/SearchBar';

export default async function Home() {
  const pool = await getConnection();

  // Query atualizada com a tabela dim_skins e puxando a image_url
  const result = await pool.request().query(`
    SELECT TOP 10 
      d.skin_name,
      d.image_url,
      f.market_name,
      f.wear, 
      f.price 
    FROM fact_current_prices f
    JOIN dim_skins d ON f.tradeup_id = d.tradeup_id
    ORDER BY f.price DESC
  `);

  const skins = result.recordset;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-emerald-500">CS2 Skin Insights</h1>
        <p className="text-neutral-400 mb-8">
          Os 10 itens mais caros no momento, puxados diretamente do Azure SQL.
        </p>

        <SearchBar />

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-800 border-b border-neutral-700">
                <th className="p-4 font-semibold text-neutral-300">Skin</th>
                <th className="p-4 font-semibold text-neutral-300">Mercado</th>
                <th className="p-4 font-semibold text-neutral-300">Desgaste</th>
                <th className="p-4 font-semibold text-neutral-300 text-right">Preço (US$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {skins.map((skin, index) => (
                <tr
                  key={index}
                  className="hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="p-4 flex items-center gap-4">
                    {/* Renderiza a imagem da skin se a URL existir */}
                    {skin.image_url ? (
                      <img
                        src={skin.image_url}
                        alt={skin.skin_name}
                        className="w-16 h-12 object-contain bg-neutral-800/50 rounded drop-shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-neutral-800 rounded flex items-center justify-center text-[10px] text-neutral-500">
                        Sem Foto
                      </div>
                    )}
                    <span className="font-medium text-neutral-100">{skin.skin_name}</span>
                  </td>
                  <td className="p-4 text-neutral-400">{skin.market_name}</td>
                  <td className="p-4 text-neutral-400">{skin.wear || '-'}</td>
                  <td className="p-4 text-emerald-400 font-mono text-right font-medium">
                    US$ {skin.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}