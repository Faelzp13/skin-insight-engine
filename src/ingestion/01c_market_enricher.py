import pandas as pd
import logging
from pathlib import Path

# --- CONFIGURATION ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

current_file = Path(__file__).resolve()
project_root = current_file.parent.parent.parent
output_file = project_root / "data" / "silver" / "dims" / "dim_markets.csv"

def generate_market_dimension():
    logging.info("Generating static market dimension table...")

    markets_data = [
        {"market": "Steam", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-steam.png"},
        {"market": "Skinport", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-skinport.png"},
        {"market": "CS.Money", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-csmoney.png"},
        {"market": "SkinBaron", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-skinbaron.png"},
        {"market": "DMarket", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-dmarket.png"},
        {"market": "SkinsMonkey", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-skinsmonkey.png"},
        {"market": "CSFloat", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-csfloat.png"},
        {"market": "Tradeit.gg", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-tradeitgg-2.png"},
        {"market": "Skinflow", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-skinflow-v2.png"},
        {"market": "Market_37", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-skinland.png"},
        {"market": "Skinswap", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-skinswap.png"},
        {"market": "MarketCSGO", "market_logo_url": "https://s3.eu-west-3.amazonaws.com/skinsnipe.com/img/common/logos/markets/logo-marketcsgo-2.png"}
    ]

    df = pd.DataFrame(markets_data)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_file, index=False)

    logging.info(f"✅ Success! Table saved at: {output_file.name}")

if __name__ == "__main__":
    generate_market_dimension()