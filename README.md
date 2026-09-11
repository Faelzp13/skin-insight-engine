Markdown
# ArbitraCS 📈

![Data Volume](https://img.shields.io/badge/Preços_Extraídos-200k%2B-blue)
![Skins Mapeadas](https://img.shields.io/badge/Skins_Mapeadas-10k%2B-purple)
![Marketplaces](https://img.shields.io/badge/Marketplaces-10%2B-success)

O **ArbitraCS** é uma plataforma analítica full-stack orientada a dados, desenvolvida para o mercado de skins de Counter-Strike 2. O projeto rastreia preços globais, analisa históricos de longo prazo e encontra as margens de arbitragem mais lucrativas entre a Steam e marketplaces de terceiros.

A aplicação é dividida em duas grandes frentes: um **Pipeline de Dados ETL (Arquitetura Medallion)** e um **Dashboard Web (Next.js)**.

---

## Arquitetura do Projeto

### 1. Data Engineering (ETL Pipeline)
O pipeline de dados foi construído em Python e orquestrado via GitHub Actions (`pipeline.yml`), executando raspagens e consolidações a cada 3 horas. Os dados fluem por uma **Arquitetura Medallion**:

* **Bronze (Ingestão Raw):** Coleta de metadados, mapeamento de IDs e extração assíncrona (`aiohttp`, `asyncio`) de preços em tempo real das APIs de mercado. Armazenamento compactado no Azure Blob Storage.
* **Silver (Limpeza e Transformação):** Processamento dos arquivos JSON, padronização de nomenclaturas de *Wears* (ex: Souvenir para Sv) e conversão para o formato colunar **Parquet** (`pyarrow`).
* **Gold (Modelagem de Negócio):** Carga dos dados no **Azure SQL Database** utilizando `SQLAlchemy`. Implementação de tabelas de Dimensão (`dim_skins`, `dim_markets`) e Fatos (`fact_current_prices`, `fact_history_daily`), com lógica de retenção de snapshots históricos (diário, semanal, mensal e anual).

### 2. Frontend (Next.js App Router)
O frontend consome diretamente o banco Azure SQL e exibe os dados em uma interface limpa e reativa.

* **Framework:** Next.js 15+ (App Router) e React 18.
* **Estilização:** Tailwind CSS v4.
* **Visualização de Dados:** Gráficos interativos com `Recharts` iterando sobre históricos de preços de múltiplas variantes simultaneamente.
* **Ferramentas Flutuantes (Widgets):** Calculadoras em tempo real construídas com estado local (Câmbio, ROI, Taxas, Trade-Up e SP% de Stickers).

---

## 🚀 Funcionalidades

* **Arbitragem Real:** Identifica skins subprecificadas em mercados terceiros comparando com a média de 7 dias da Steam (evitando anomalias de preço).
* **Mínimas Históricas:** Rastreamento de itens que atingiram seu menor valor global nos últimos 30 dias.
* **Tendências de Mercado:** Monitoramento de itens "quentes" cujo preço atual está superando significativamente a média histórica.
* **Raio-X da Skin:** Página de detalhes individuais com gráficos dinâmicos de preço, comparação instantânea entre 10+ marketplaces e conversão de moeda em tempo real.

---

## 🛠️ Tecnologias Utilizadas

* **Backend & Dados:** Python 3.11, Pandas, Asyncio, SQLAlchemy, Azure SQL, Azure Blob Storage.
* **Frontend:** TypeScript, Next.js, Tailwind CSS, Recharts, Lucide React.
* **DevOps:** GitHub Actions (Cron Jobs).

---

## 💻 Como Rodar Localmente

1. Clone o repositório:
```
git clone [https://github.com/faelzp13/ArbitraCS.git](https://github.com/faelzp13/ArbitraCS.git)
cd ArbitraCS

cd frontend
npm install
npm run dev
```

2. Crie um arquivo .env.local na pasta /frontend com as credenciais do banco:
```
AZURE_SQL_USER=seu_usuario
AZURE_SQL_PASSWORD=sua_senha
AZURE_SQL_DATABASE=seu_banco
AZURE_SQL_SERVER=seu_servidor
```

3. Pipeline ETL:
```
# Na raiz do projeto
pip install -r requirements.txt

python src/ingestion/02_price_extractor.py
Requer .env configurado com AZURE_CONNECTION_STRING e AZURE_SQL_CONNECTION_STRING.
