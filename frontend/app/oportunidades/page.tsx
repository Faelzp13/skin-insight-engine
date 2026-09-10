import Link from "next/link";

export default function OportunidadesPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-12 transition-colors">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-4">Oportunidades de Mercado</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-3xl">
            Selecione o modelo de análise. Nossos algoritmos comparam o histórico de preços com o valor atual para garantir que você não caia em falsas promoções.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Arbitragem Real */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl shadow-lg flex flex-col h-full">
            <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mb-4">Arbitragem Real</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 flex-1">
              Encontre skins baratas em mercados terceiros com alto potencial de revenda na Steam, usando a <strong>média histórica de 7 dias</strong> para evitar falsas anomalias.
            </p>
            <Link href="/oportunidades/arbitragem" className="w-full">
              <button className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors">
                Acessar Módulo
              </button>
            </Link>
          </div>

          {/* Card 2: Mínimas Históricas */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl shadow-lg flex flex-col h-full">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-500 mb-4">Mínimas Históricas</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 flex-1">
              Filtre itens cujo preço atual seja menor ou igual ao menor preço registrado nos últimos 30 dias em qualquer mercado. Ideal para investir a longo prazo.
            </p>
            <Link href="/oportunidades/minimas" className="w-full">
              <button className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors">
                Acessar Módulo
              </button>
            </Link>
          </div>

          {/* Card 3: Tendências */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl shadow-lg flex flex-col h-full">
            <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-4">Tendências (Em Alta)</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 flex-1">
              Visualize quais itens tiveram um aumento de preço substancial nos últimos 7 dias em comparação com a semana anterior. Ideal para surfar no hype.
            </p>
            <Link href="/oportunidades/tendencias" className="w-full">
              <button className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 transition-colors">
                Analisar Tendências
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}