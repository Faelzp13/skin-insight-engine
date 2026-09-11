import { cookies } from 'next/headers';

export async function getCurrencyInfo() {
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'USD';

  if (currency === 'USD') return { code: 'USD', symbol: 'US$', rate: 1 };

  try {
    // Nova API, super amigável com IPs da Vercel
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 } // Cache no Next.js de 1 hora
    });

    if (!res.ok) {
      throw new Error(`API de câmbio respondeu com status: ${res.status}`);
    }

    const data = await res.json();
    const rate = data.rates[currency]; // Ex: data.rates['BRL']

    return {
      code: currency,
      symbol: currency === 'BRL' ? 'R$' : '€',
      rate: rate || 1
    };
  } catch (error) {
    console.error("Erro ao buscar cotação na API:", error);
    // PLANO B: Valores fixos caso a API externa falhe, garantindo que o site nunca caia
    const fallbackRates: Record<string, number> = { 'BRL': 5.50, 'EUR': 0.92 };

    return {
      code: currency,
      symbol: currency === 'BRL' ? 'R$' : '€',
      rate: fallbackRates[currency] || 1
    };
  }
}

export function formatPrice(priceInUSD: number, rate: number, symbol: string) {
  const converted = priceInUSD * rate;
  return `${symbol} ${converted.toFixed(2)}`;
}