export interface MarketDetail {
  trust: string;
  fee: string;
  extraFee?: string;
  instantSell: boolean;
  tradingBots: boolean;
}

export const marketDetails: Record<string, MarketDetail> = {
  "CS.Money": { trust: "4.6", fee: "7%", instantSell: true, tradingBots: true },
  "CSMoney": { trust: "4.6", fee: "7%", instantSell: true, tradingBots: true },
  "SkinsMonkey": { trust: "4.8", fee: "7%", instantSell: true, tradingBots: true },
  "CSFloat": { trust: "4.8", fee: "2%", instantSell: false, tradingBots: false },
  "Tradeit.gg": { trust: "4.7", fee: "5%", instantSell: true, tradingBots: true },
  "Skinport": { trust: "4.9", fee: "8%", extraFee: "6% > $1000", instantSell: false, tradingBots: false },
  "SkinSwap": { trust: "4.1", fee: "5%", instantSell: true, tradingBots: true },
  "DMarket": { trust: "4.0", fee: "7%", instantSell: true, tradingBots: true },
  "Skin.land": { trust: "4.6", fee: "10%", instantSell: true, tradingBots: true },
    "market_37": { trust: "4.6", fee: "10%", instantSell: true, tradingBots: true },
  "BitSkins": { trust: "4.0", fee: "10%", extraFee: "5% based on volume", instantSell: true, tradingBots: false },
  "GamerPay": { trust: "3.7", fee: "5% (buying)", instantSell: false, tradingBots: false },
  "Market.CSGO": { trust: "4.2", fee: "5%", instantSell: false, tradingBots: false },
  "Skinflow": { trust: "4.6", fee: "5%", instantSell: true, tradingBots: true },
    "Steam": { trust: "5.0", fee: "15%", extraFee: "Sem saque real (Saldo Steam)", instantSell: true, tradingBots: false }
};

export function getMarketInfo(marketName: string): MarketDetail | undefined {
  if (!marketName) return undefined;
  if (marketDetails[marketName]) return marketDetails[marketName];

  const cleanName = marketName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = Object.keys(marketDetails).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanName);

  return key ? marketDetails[key] : undefined;
}