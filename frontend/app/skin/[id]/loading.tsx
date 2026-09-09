export default function LoadingSkin() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-10 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Placeholder do botão voltar */}
        <div className="w-32 h-6 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-8"></div>
        <div className="mb-8 w-full max-w-3xl mx-auto h-14 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"></div>

        {/* Topo Dividido: Imagem e Média */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Card da Imagem */}
          <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-10 flex flex-col items-center justify-center shadow-xl h-80 animate-pulse">
            <div className="w-64 h-8 bg-neutral-200 dark:bg-neutral-800 rounded mb-6"></div>
            <div className="w-full max-w-sm h-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
          </div>

          {/* Card da Mini-tabela */}
          <div className="w-full lg:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl h-80 animate-pulse flex flex-col">
            <div className="h-12 bg-neutral-200 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-700"></div>
            <div className="p-4 space-y-4 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="w-24 h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="w-16 h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placeholder do Gráfico */}
        <div className="w-full h-[400px] bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-10 mt-8"></div>

      </div>
    </main>
  );
}