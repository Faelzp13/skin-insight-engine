import { cookies } from 'next/headers';

export async function getCurrencyInfo() {
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'USD';

  if (currency === 'USD') return { code: 'USD', symbol: 'US$', rate: 1 };

  try {
    const res = await fetch(`https://economia.awesomeapi.com.br/last/USD-${currency}`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`AwesomeAPI respondeu com status: ${res.status}`);
    }

    const data = await res.json();
    const rate = parseFloat(data[`USD${currency}`].bid);

    return {
      code: currency,
      symbol: currency === 'BRL' ? 'R$' : '€',
      rate
    };
  } catch (error) {
    console.error("Erro ao buscar cotação na API:", error);
    // Fallback de segurança: se a API falhar, volta para Dólar para não quebrar a tela
    return { code: 'USD', symbol: 'US$', rate: 1 };
  }
}

// Função auxiliar para formatar o número na tela
export function formatPrice(priceInUSD: number, rate: number, symbol: string) {
  const converted = priceInUSD * rate;
  return `${symbol} ${converted.toFixed(2)}`;
}