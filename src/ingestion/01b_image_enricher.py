import asyncio
import aiohttp
import pandas as pd
import logging
import re
from pathlib import Path

# --- CONFIGURATION ---
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent
mapping_file = project_root / "data" / "bronze" / "id_mapping.csv"
output_file = project_root / "data" / "silver" / "dims" / "dim_skins.csv"
log_file = project_root / "data" / "missing_items.log"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

API_ENDPOINTS = [
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/stickers.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/agents.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/collectibles.json"
]


def generate_clean_slug(raw_name: str) -> str:
    text = str(raw_name).lower()

    text = re.sub(r'[★™\(\)]', '', text)

    text = re.sub(r'[\s\|_]+', '-', text)

    text = re.sub(r'-+', '-', text)

    return text.strip('-')


async def main():
    if not mapping_file.exists():
        logging.error(f"Mapping file not found: {mapping_file}")
        return

    logging.info("1. Reading local mapping file...")
    df_mapped_items = pd.read_csv(mapping_file)

    logging.info("2. Fetching community API datasets...")
    cs2_db = []

    async with aiohttp.ClientSession() as session:
        for url in API_ENDPOINTS:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json(content_type=None)
                    cs2_db.extend(data)
                    logging.info(f"   -> Fetched: {url.split('/')[-1]} ({len(data)} items)")
                else:
                    logging.error(f"   -> Failed to fetch {url} - Status: {response.status}")

    logging.info("3. Building O(1) Hash Map for fast lookups...")
    db_lookup = {}
    for item in cs2_db:
        if 'name' in item and 'image' in item:
            clean_api_slug = generate_clean_slug(item['name'])
            db_lookup[clean_api_slug] = item['image']

    results = []
    not_found = []

    logging.info("4. Cross-referencing items...")

    for _, row in df_mapped_items.iterrows():
        original_slug = str(row['slug'])
        target_slug = generate_clean_slug(original_slug)

        image_url = db_lookup.get(target_slug)

        if not image_url:
            fallback_slug = re.sub(r'stattrak-|souvenir-', '', target_slug)
            image_url = db_lookup.get(fallback_slug)

        if image_url:
            results.append({
                "tradeup_id": row['tradeup_id'],
                "slug": original_slug,  #
                "image_url": image_url
            })
        else:
            not_found.append(original_slug)

    logging.info("5. Exporting results...")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(results).to_csv(output_file, index=False)

    with open(log_file, "w", encoding='utf-8') as f:
        f.write("\n".join(not_found))

    logging.info(f"Success: {len(results)} items successfully mapped.")
    if not_found:
        logging.warning(f"{len(not_found)} items missing. Checked generated log: missing_items.log")


if __name__ == "__main__":
    asyncio.run(main())