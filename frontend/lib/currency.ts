import { cookies } from 'next/headers';

export async function getCurrencyInfo() {
  // Pega o cookie salvo pelo Navbar (Next.js 15+ exige await no cookies)
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'USD';

  if (currency === 'USD') return { code: 'USD', symbol: 'US$', rate: 1 };

  try {
    // Faz a requisição para a AwesomeAPI (ex: USD-BRL ou USD-EUR)
    // O Next.js vai fazer cache dessa cotação por 1 hora (3600 segundos)
    const res = await fetch(`https://economia.awesomeapi.com.br/last/USD-${currency}`, {
      next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3000)
    });

    const data = await res.json();
    const rate = parseFloat(data[`USD${currency}`].bid);

    return {
      code: currency,
      symbol: currency === 'BRL' ? 'R$' : '€',
      rate
    };
  } catch (error) {
    console.error("Erro ao buscar cotação na API:", error);
    // Fallback de segurança: se a API cair, volta para Dólar
    return { code: 'USD', symbol: 'US$', rate: 1 };
  }
}

// Função auxiliar para formatar o número na tela
export function formatPrice(priceInUSD: number, rate: number, symbol: string) {
  const converted = priceInUSD * rate;
  return `${symbol} ${converted.toFixed(2)}`;
}