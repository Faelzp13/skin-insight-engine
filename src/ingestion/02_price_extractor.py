"""
Module: Price Extractor (Bronze Layer)
Author: Rafael Antônio Policena
Description: Fetches price data in batches with a cooldown period and robust CSV reading.
"""

import os
import asyncio
import aiohttp
import pandas as pd
import json
import logging
from datetime import datetime
from pathlib import Path
from tqdm.asyncio import tqdm
from dotenv import load_dotenv

# Load environment variables securely
load_dotenv()

# --- Configuration ---
BATCH_SIZE = 5114
COOLDOWN_TIME = 300
SEMAPHORE_LIMIT = 15

# Path Setup
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent
mapping_file = project_root / "data" / "bronze" / "id_mapping.csv"

# Date Organization
today_str = datetime.now().strftime("%Y-%m-%d")
hour_str = datetime.now().strftime("%Hh%M")
output_dir = project_root / "data" / "bronze" / "prices" / today_str
output_dir.mkdir(parents=True, exist_ok=True)

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

semaphore = asyncio.Semaphore(SEMAPHORE_LIMIT)


async def fetch_item_price(session, row):
    snipe_id = row['skinsnipe_id']
    url = f"https://pricing.tradeupspy.com/compare/export?id={snipe_id}"

    # Get the cookie from the .env file. If not found, uses an empty string.
    cookie_data = os.getenv("TRADEUPSPY_COOKIE", "")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0",
        "Referer": "https://www.tradeupspy.com/",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://www.tradeupspy.com",
        "Cookie": cookie_data
    }

    async with semaphore:
        try:
            async with session.get(url, headers=headers, timeout=20) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "metadata": {
                            "tradeup_id": row['tradeup_id'],
                            "slug": row['slug'],
                            "timestamp": datetime.now().isoformat()
                        },
                        "data": data
                    }
                else:
                    if response.status == 403:
                        logging.warning(f"Received HTTP 403 for ID {snipe_id}. Consider reducing batch size.")
                    return None
        except Exception:
            return None


async def main():
    if not mapping_file.exists():
        logging.error("id_mapping.csv not found.")
        return

    try:
        df = pd.read_csv(
            mapping_file,
            sep=',',
            quotechar='"',
            on_bad_lines='skip',
            encoding='utf-8'
        )
    except Exception as e:
        logging.error(f"Critical error reading mapping file: {e}")
        return

    items = df.to_dict('records')
    total_items = len(items)

    logging.info(f"Starting Full Load of {total_items} items in batches of {BATCH_SIZE}.")

    all_results = []

    async with aiohttp.ClientSession() as session:
        for i in range(0, total_items, BATCH_SIZE):
            batch = items[i:i + BATCH_SIZE]
            current_batch_num = (i // BATCH_SIZE) + 1

            logging.info(f"Processing Batch {current_batch_num} ({len(batch)} items)...")

            tasks = [fetch_item_price(session, item) for item in batch]
            batch_results = await tqdm.gather(*tasks, desc=f"Batch {current_batch_num}")

            valid_batch = [r for r in batch_results if r is not None]
            all_results.extend(valid_batch)

            if i + BATCH_SIZE < total_items:
                logging.info(f"Pausing for {COOLDOWN_TIME // 60} minutes to reset server limits...")
                await asyncio.sleep(COOLDOWN_TIME)

    snapshot_path = output_dir / f"full_snapshot_{hour_str}.json"
    with open(snapshot_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=4)

    logging.info(f"Success! Total of {len(all_results)} items collected.")
    logging.info(f"Final file saved at: {snapshot_path}")


if __name__ == "__main__":
    asyncio.run(main())