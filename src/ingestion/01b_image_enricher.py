import asyncio
import aiohttp
import pandas as pd
import logging
from pathlib import Path

# --- CONFIGURATION ---
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent
mapping_file = project_root / "data" / "bronze" / "id_mapping.csv"
output_file = project_root / "data" / "silver" / "dims" / "dim_skins.csv"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

API_ENDPOINTS = [
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/stickers.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/agents.json",
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/collectibles.json"
]

async def main():
    if not mapping_file.exists():
        logging.error(f"File not found: {mapping_file}")
        return

    logging.info("1. Reading mapped data...")
    df_mapped_items = pd.read_csv(mapping_file)

    logging.info("2. Downloading community database tables...")

    cs2_db = []

    async with aiohttp.ClientSession() as session:
        for url in API_ENDPOINTS:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json(content_type=None)
                    cs2_db.extend(data)
                    logging.info(f"   -> Downloaded: {url.split('/')[-1]} ({len(data)} items)")
                else:
                    logging.warning(f"   -> Error: {url}")

    logging.info(f"3. Download complete! {len(cs2_db)} items in database. Starting cross-reference...")

    results = []
    db_lookup = {}

    for item in cs2_db:
        if 'name' in item and 'image' in item:
            normalized_name = item['name'].lower().replace(" | ", "-").replace(" ", "-")
            db_lookup[normalized_name] = item['image']

    success_count = 0
    for _, row in df_mapped_items.iterrows():
        slug = str(row['slug']).lower()
        tradeup_id = row['tradeup_id']

        image_url = None

        if slug in db_lookup:
            image_url = db_lookup[slug]
        else:
            clean_slug = slug.replace("stattrak™-", "").replace("souvenir-", "").replace("stattrak-", "")
            if clean_slug in db_lookup:
                image_url = db_lookup[clean_slug]

        if image_url:
            success_count += 1
            results.append({
                "tradeup_id": tradeup_id,
                "slug": row['slug'],
                "image_url": image_url
            })

    dim_df = pd.DataFrame(results)

    if not dim_df.empty:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        dim_df.to_csv(output_file, index=False)
        logging.info(f"✅ Success! {success_count} images mapped.")
        logging.info(f"💾 Dimension table saved at: {output_file.name}")
    else:
        logging.warning("No images could be cross-referenced.")

if __name__ == "__main__":
    asyncio.run(main())