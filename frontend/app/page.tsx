import SearchBar from './components/SearchBar';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans transition-colors">

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-neutral-900 dark:text-white">
          O Raio-X do Mercado de <span className="text-emerald-600 dark:text-emerald-500">CS2</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Uma plataforma analítica orientada a dados para rastrear preços, analisar históricos de longo prazo e encontrar as margens mais lucrativas entre a Steam e mercados de terceiros.
        </p>

        <div className="w-full max-w-3xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Cards de Navegação Rápida */}
      <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/oportunidades" className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:border-emerald-500/50">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-100">Painel de Oportunidades</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Descubra arbitragens reais, distorções de preço e tendências de mercado atualizadas diariamente.</p>
        </Link>

        <Link href="/mercados" className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:border-blue-500/50">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-100">Mercados Monitorados</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Consulte os marketplaces suportados, integrações ativas e compare taxas operacionais.</p>
        </Link>
      </section>

      {/* Sobre o Projeto */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">Sobre o Projeto</h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed md:text-lg">
            Desenvolvido por Rafael Policena, estudante de Ciência da Computação na UniRitter e desenvolvedor focado em Engenharia de Dados.
            A ideia desta ferramenta nasceu da união de duas paixões: jogar Counter-Strike 2 e construir pipelines de dados automatizados e eficientes.
            O objetivo é aplicar na prática conceitos de ETL e Arquitetura Medallion para entregar análises reais e precisas para a comunidade, sem os vieses comuns de outros sites.
          </p>
        </div>
      </section>

    </main>
  );
}