"""
Module: Skin Image Enricher (Dimension Layer) - Open Source DB Version (Full Items)
Author: Rafael Antônio Policena
Description: Uses a public CS2 open-source database to map images for skins, crates, stickers, and agents.
"""

import asyncio
import aiohttp
import pandas as pd
import logging
from pathlib import Path

# --- CONFIGURAÇÕES ---
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent
mapping_file = project_root / "data" / "bronze" / "id_mapping.csv"
output_file = project_root / "data" / "silver" / "dim_skins.csv"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Lista com todas as categorias do CSGO-API
API_ENDPOINTS = [
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json",    # Caixas e Cápsulas
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/stickers.json",  # Adesivos
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/agents.json",    # Agentes
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/collectibles.json" # Pins, Moedas
]

async def main():
    if not mapping_file.exists():
        logging.error(f"Arquivo não encontrado: {mapping_file}")
        return

    logging.info("1. Lendo nossos dados mapeados...")
    df_nossos_itens = pd.read_csv(mapping_file)

    logging.info("2. Baixando todas as tabelas oficiais da comunidade...")

    cs2_db = [] # Lista vazia que vai receber todos os itens do jogo

    async with aiohttp.ClientSession() as session:
        for url in API_ENDPOINTS:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json(content_type=None)
                    cs2_db.extend(data) # Junta o resultado na nossa lista principal
                    logging.info(f"   -> Baixado: {url.split('/')[-1]} ({len(data)} itens)")
                else:
                    logging.warning(f"   -> Falha ao baixar: {url}")

    logging.info(f"3. Download completo! {len(cs2_db)} itens totais no banco. Iniciando cruzamento...")

    resultados = []

    db_lookup = {}
    for item in cs2_db:
        if 'name' in item and 'image' in item:
            # A mesma normalização para garantir que o cruzamento bata perfeitamente
            nome_normalizado = item['name'].lower().replace(" | ", "-").replace(" ", "-")
            db_lookup[nome_normalizado] = item['image']

    itens_com_sucesso = 0
    for _, row in df_nossos_itens.iterrows():
        slug = str(row['slug']).lower()
        tradeup_id = row['tradeup_id']

        imagem_url = None

        if slug in db_lookup:
            imagem_url = db_lookup[slug]
        else:
            # Limpa variações de nome
            slug_limpo = slug.replace("stattrak™-", "").replace("souvenir-", "").replace("stattrak-", "")
            if slug_limpo in db_lookup:
                imagem_url = db_lookup[slug_limpo]

        if imagem_url:
            itens_com_sucesso += 1
            resultados.append({
                "tradeup_id": tradeup_id,
                "slug": row['slug'],
                "image_url": imagem_url
            })

    dim_df = pd.DataFrame(resultados)

    if not dim_df.empty:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        dim_df.to_csv(output_file, index=False)
        logging.info(f"✅ Sucesso Absoluto! {itens_com_sucesso} imagens mapeadas.")
        logging.info(f"💾 Tabela de Dimensão salva em: {output_file.name}")
    else:
        logging.warning("Nenhuma imagem conseguiu ser cruzada.")

if __name__ == "__main__":
    asyncio.run(main())