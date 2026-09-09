import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Coluna 1: Marca e Descrição */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-emerald-600 dark:text-emerald-500 hover:opacity-80 transition-opacity">
              ArbitraCS
            </Link>
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              A plataforma analítica definitiva para o mercado de skins de CS2. Dados reais, arquitetura robusta e margens sem vieses.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Plataforma</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                  Explorar
                </Link>
              </li>
              <li>
                <Link href="/oportunidades" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                  Oportunidades
                </Link>
              </li>
              <li>
                <Link href="/mercados" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors">
                  Mercados Integrados
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Desenvolvedor (Portfólio) */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Engenharia</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/faelzp13" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors flex items-center gap-2">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/in/rafael-policena" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors flex items-center gap-2">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Aviso Legal (Obrigatório para CS2) */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Aviso Legal</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed">
              ArbitraCS não é afiliada, associada, autorizada, endossada por, ou de qualquer forma oficialmente conectada à Valve Corporation. Counter-Strike e CS2 são marcas registradas da Valve Corporation.
            </p>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            &copy; {currentYear} ArbitraCS. Todos os direitos reservados.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Desenvolvido por <span className="font-medium text-neutral-700 dark:text-neutral-300">Rafael Policena</span>
          </p>
        </div>
      </div>
    </footer>
  );
}