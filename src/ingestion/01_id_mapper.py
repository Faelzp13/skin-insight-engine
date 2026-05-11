"""
Module: ID Mapper (Universal & Shielded Version)
Author: Rafael Antônio Policena
Description: Maps TradeUpSpy IDs to SkinSnipe IDs with universal hyphen handling
             and resilient CSV reading to skip malformed lines.
"""

import asyncio
import aiohttp
import pandas as pd
import logging
import random
import csv
from pathlib import Path
from tqdm.asyncio import tqdm

# Path Setup
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent
input_file = project_root / "data" / "bronze" / "sitemap_raw.csv"
mapping_file = project_root / "data" / "bronze" / "id_mapping.csv"


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename=project_root / "data" / "bronze" / "mapping_debug.log"
)


semaphore = asyncio.Semaphore(15)

async def get_skinsnipe_id(session, row):
    slug = str(row['skin_slug'])
    target_id = str(row['item_id'])

    search_attempts = [
        slug.replace('-47-', '-47 ').replace('-S-', '-S '),
        slug.replace('-', ' '),
        slug.split('-')[-1]
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "Referer": "https://www.tradeupspy.com/",
        "Accept": "application/json"
    }

    async with semaphore:
        for query in list(dict.fromkeys(search_attempts)):
            try:
                await asyncio.sleep(random.uniform(0.1, 0.2))
                url = f"https://api.tradeupspy.com/api/skins/search/headers?skinname={query}"

                async with session.get(url, headers=headers, timeout=15) as response:
                    if response.status != 200: continue
                    data = await response.json()
                    if not data: continue

                    for item in data:
                        remote_ids = item.get('ids', [])
                        if not isinstance(remote_ids, list):
                            remote_ids = [remote_ids]

                        remote_ids_str = [str(i) for i in remote_ids]

                        if target_id in remote_ids_str or str(item.get('id')) == target_id:
                            return {
                                "tradeup_id": row['item_id'],
                                "skinsnipe_id": item.get('skinSnipeId'),
                                "slug": row['skin_slug'],
                                "type": row.get('item_type', 'unknown')
                            }
            except:
                continue
    return None


async def main():
    if not input_file.exists():
        print("Error: sitemap_raw.csv not found!")
        return

    try:
        df = pd.read_csv(
            input_file,
            sep=';',
            quotechar='"',
            on_bad_lines='skip',
            engine='python',
            encoding='utf-8'
        )

        df.columns = df.columns.str.strip().str.lower()

        column_map = {
            'item_id': 'item_id',
            'skin_slug': 'skin_slug',
            'slug': 'skin_slug'
        }

        df = df.rename(columns=column_map)

        if 'skin_slug' not in df.columns:
            print(f"❌ Critical error: Column 'skin_slug' not found!")
            print(f"Coluns found: {df.columns.tolist()}")
            return

        print(f"📂 Sitemap read. {len(df)} valid items to process.")

    except Exception as e:
        print(f"❌ Fatal error while read sitemap_raw.csv: {e}")
        return

    items = df.to_dict('records')

    print(f"🚀 Starting Mapping: {len(items)} items.")

    async with aiohttp.ClientSession() as session:
        tasks = [get_skinsnipe_id(session, item) for item in items]
        results = await tqdm.gather(*tasks, desc="Mapping IDs")

    mapping_results = [r for r in results if r is not None]

    if mapping_results:
        mapping_df = pd.DataFrame(mapping_results)
        mapping_df = mapping_df.drop_duplicates(subset=['tradeup_id'])

        mapping_df.to_csv(
            mapping_file,
            index=False,
            quoting=csv.QUOTE_ALL,
            encoding='utf-8'
        )
        print(f"\n✅ Sucess! {len(mapping_df)} saved items on {mapping_file}")
    else:
        print("\n❌ Error: None items mapped.")

if __name__ == "__main__":
    asyncio.run(main())