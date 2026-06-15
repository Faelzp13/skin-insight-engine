import requests
from bs4 import BeautifulSoup
import pandas as pd
import logging
from pathlib import Path

# Path Engineering
current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent
output_dir = project_root / "data" / "bronze"
output_file = output_dir / "sitemap_raw.csv"
log_file = output_dir / "extraction.log"

output_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler()
    ]
)

SITEMAP_URL = "https://www.tradeupspy.com/sitemap.xml"

# Allowed patterns in the URL
ALLOWED_PATTERNS = ['/skins/item/', '/skins/capsule/']


def extract_skin_data():
    logging.info(f"Starting V4 extraction. Targeted patterns: {ALLOWED_PATTERNS}")

    try:
        response = requests.get(SITEMAP_URL, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'lxml-xml')
        all_urls = [loc.text for loc in soup.find_all('loc')]

        filtered_urls = [url for url in all_urls if any(p in url for p in ALLOWED_PATTERNS)]
        logging.info(f"Identified {len(filtered_urls)} total items across all categories.")

        data_list = []

        for url in filtered_urls:
            parts = url.split('/')

            # URL Structure: .../skins/{type}/{id}/{slug}
            if len(parts) >= 6:
                item_type = parts[-3]  # 'item' or 'capsule'
                item_id = parts[-2]
                skin_slug = parts[-1]

                data_list.append({
                    "item_id": item_id,
                    "item_type": item_type,
                    "skin_slug": skin_slug,
                    "full_url": url
                })

        df = pd.DataFrame(data_list)

        if not df.empty:
            df.to_csv(output_file, index=False)
            logging.info(f"Successfully saved {len(df)} items to {output_file}")
            type_counts = df['item_type'].value_counts().to_dict()
            logging.info(f"Breakdown by type: {type_counts}")
        else:
            logging.warning("No items found matching the patterns.")

    except Exception as e:
        logging.error(f"Failed during sitemap extraction: {e}")


if __name__ == "__main__":
    extract_skin_data()