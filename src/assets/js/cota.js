const CACHE_DURATION = 1000 * 60 * 10;
async function getExchangeRates() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin&vs_currencies=usd,brl,eur,gbp');
        if (!response.ok) throw new Error('Erro ao buscar os dados');
        const data = await response.json();

        const exchangeRates = {
            timestamp: Date.now(),
            rates: {
                dolar: data.bitcoin.brl / data.bitcoin.usd,
                euro: data.bitcoin.brl / data.bitcoin.eur,
                libra: data.bitcoin.brl / data.bitcoin.gbp,
                bitcoin: data.bitcoin.brl,
                dogecoin: data.dogecoin.brl
            }
        };

        localStorage.setItem('cota', JSON.stringify(exchangeRates));
        return exchangeRates;
    } catch (error) {
        console.error('Erro:', error);
        const stored = localStorage.getItem('cota');
        return stored ? JSON.parse(stored) : null;
    }
}



async function updateExchangeRates() {
    const exchangeRates = await getExchangeRates();
    const cota = document.getElementById('cota');

    if(exchangeRates.leaght == 0) return;
    
    if (cota) {
        cota.innerHTML = '';
        
        Object.entries(exchangeRates.rates).forEach(([key, value]) => {
            const div = document.createElement('div');
            div.className = "w-full flex justify-between mb-2";
            div.innerHTML = `<p class="font-semibold max-5xl:text-[22px]">${key.charAt(0).toUpperCase() + key.slice(1)}</p><p class="max-5xl:text-[22px]" > ${Number(value).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}</p>`;
            cota.appendChild(div);
        });
    }
}

document.addEventListener('DOMContentLoaded', updateExchangeRates);
