async function getExchangeRates() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin,litecoin&vs_currencies=usd,brl,eur');
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados');
        }
        const data = await response.json();
        
        const exchangeRates = {
            dolar: data.bitcoin.brl / data.bitcoin.usd, 
            euro: data.bitcoin.brl / data.bitcoin.eur, 
            bitcoin: data.bitcoin.brl, 
            litecoin: data.litecoin.brl, 
            dogecoin: data.dogecoin.brl 
        };
        
        localStorage.setItem('cota', JSON.stringify(exchangeRates));
        return exchangeRates;
    } catch (error) {
        console.error('Erro:', error);
        const listCota = JSON.parse(localStorage.getItem('cota')) || [];
        return listCota;
    }
}

async function updateExchangeRates() {
    const exchangeRates = await getExchangeRates();
    const cota = document.getElementById('cota');

    if(exchangeRates.leaght == 0) return;
    
    if (cota) {
        cota.innerHTML = '';
        
        Object.entries(exchangeRates).forEach(([key, value]) => {
            const div = document.createElement('div');
            div.className = "w-full flex justify-between mb-2";
            div.innerHTML = `<p class="font-semibold max-5xl:text-[22px]">${key.charAt(0).toUpperCase() + key.slice(1)}</p><p class="max-5xl:text-[22px]" >R$ ${value.toFixed(2)}</p>`;
            cota.appendChild(div);
        });
    }
}

document.addEventListener('DOMContentLoaded', updateExchangeRates);
