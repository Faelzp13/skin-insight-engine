import json
import pandas as pd
import logging
from pathlib import Path
from datetime import datetime
from azure.storage.blob import BlobServiceClient
import os

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Dynamic Path Configuration ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent

today_str = datetime.now().strftime("%Y-%m-%d")

bronze_dir = project_root / "data" / "bronze" / "prices" / today_str
silver_dir = project_root / "data" / "silver" / "facts"


def find_latest_json():
    # Finds the most recent JSON file in today's target folder.
    if not bronze_dir.exists():
        return None

    files = list(bronze_dir.glob("*.json"))
    if not files:
        return None

    return max(files, key=lambda p: p.stat().st_mtime)


def process_silver_v2():
    json_path = find_latest_json()

    if json_path is None:
        logging.error(f"No JSON file found in {bronze_dir}")
        return

    logging.info(f"Reading file: {json_path.name}")

    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    final_table = []

    # Market Mapping Dictionary
    market_names = {
        1: "Steam", 2: "Skinport", 5: "CS.Money", 6: "SkinBaron",
        8: "DMarket", 14: "SkinsMonkey", 19: "CSFloat", 25: "Skinflow",
        29: "Skinswap", 31: "MarketCSGO", 35: "Tradeit.gg", 37: "Market_37"
    }

    for item in items:
        metadata = item['metadata']
        data = item['data']

        # Wear translator mapping
        header_map = {}
        for h in data.get('headers', []):
            key = (h['extraId'], h['exteriorId'])
            name = f"{h['extraAbbreviation']} {h['exteriorName']}".strip()
            header_map[key] = name

        # Iterate through markets and their respective prices
        for market in data.get('markets', []):
            m_id = market['marketId']
            m_name = market_names.get(m_id, f"Market_{m_id}")

            for p in market.get('prices', []):
                wear_key = (p['idExtra'], p['idExterior'])
                full_wear_name = header_map.get(wear_key, "Unknown")

                # Only process valid prices
                if p['value'] and p['value'] > 0:
                    final_table.append({
                        "timestamp": metadata['timestamp'],
                        "tradeup_id": metadata['tradeup_id'],
                        "skin": metadata['slug'],
                        "wear": full_wear_name,
                        "market": m_name,
                        "price": p['value']
                    })

    if final_table:
        df = pd.DataFrame(final_table)
        silver_dir.mkdir(parents=True, exist_ok=True)

        # Nomeia o arquivo com o sufixo de hora do JSON original
        json_filename = json_path.stem
        time_suffix = json_filename.split('_')[-1]
        output_file = silver_dir / f"prices_silver_{today_str}_{time_suffix}.parquet"

        # Salva o arquivo em formato Parquet usando a engine pyarrow
        df.to_parquet(output_file, index=False, engine='pyarrow')
        logging.info(f"Success! {len(df)} rows processed locally: {output_file}")

        # --- NOVO: Upload para o Azure (Camada Silver) ---
        conn_str = os.getenv("AZURE_CONNECTION_STRING")
        if conn_str:
            try:
                blob_service_client = BlobServiceClient.from_connection_string(conn_str)
                # Define o caminho dentro do container silver: facts/prices_silver_2026-08-31_14h30.parquet
                blob_path = f"facts/{output_file.name}"
                blob_client = blob_service_client.get_blob_client(container="silver", blob=blob_path)

                with open(output_file, "rb") as data:
                    blob_client.upload_blob(data, overwrite=True)
                logging.info(f"Upload para o Azure Silver concluído: {blob_path}")
            except Exception as e:
                logging.error(f"Erro ao fazer upload para o Azure: {e}")
        else:
            logging.warning("AZURE_CONNECTION_STRING não encontrada. Upload não realizado.")
    else:
        logging.warning("No price data found within the JSON.")


if __name__ == "__main__":
    process_silver_v2()