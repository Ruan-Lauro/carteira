document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const resultDiv = document.getElementById('result');
    const resultText = document.getElementById('resultText');
    const exchangeRate = document.getElementById('exchangeRate');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const errorText = document.getElementById('errorText');

    function loadSettings() {
        const savedAmount = localStorage.getItem('amount');
        const savedFromCurrency = localStorage.getItem('fromCurrency');
        const savedToCurrency = localStorage.getItem('toCurrency');
        
        if (savedAmount) amountInput.value = savedAmount;
        if (savedFromCurrency) fromCurrencySelect.value = savedFromCurrency;
        if (savedToCurrency) toCurrencySelect.value = savedToCurrency;
    }
    
    function saveSettings() {
        localStorage.setItem('amount', amountInput.value);
        localStorage.setItem('fromCurrency', fromCurrencySelect.value);
        localStorage.setItem('toCurrency', toCurrencySelect.value);
    }

    function saveConversionResult(fromCurrency, toCurrency, rate, timestamp) {
        const conversionKey = `${fromCurrency}_${toCurrency}`;
        const conversionData = {
            rate: rate,
            timestamp: timestamp
        };
        localStorage.setItem(`conversion_${conversionKey}`, JSON.stringify(conversionData));
    }

    function getStoredConversionRate(fromCurrency, toCurrency) {
        const conversionKey = `${fromCurrency}_${toCurrency}`;
        const storedData = localStorage.getItem(`conversion_${conversionKey}`);
        
        if (storedData) {
            return JSON.parse(storedData);
        }

        const inverseKey = `${toCurrency}_${fromCurrency}`;
        const inverseData = localStorage.getItem(`conversion_${inverseKey}`);
        
        if (inverseData) {
            const parsed = JSON.parse(inverseData);
            return {
                rate: 1 / parsed.rate,
                timestamp: parsed.timestamp,
                isInverse: true
            };
        }
        
        return null;
    }

    fromCurrencySelect.addEventListener('change', updateCurrencyOptions);
    toCurrencySelect.addEventListener('change', updateCurrencyOptions);


    function updateCurrencyOptions() {
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        Array.from(toCurrencySelect.options).forEach(option => {
            option.disabled = option.value === fromCurrency;
        });

        Array.from(fromCurrencySelect.options).forEach(option => {
            option.disabled = option.value === toCurrency;
        });

        if (fromCurrency === toCurrency) {
            const firstAvailable = [...toCurrencySelect.options].find(opt => !opt.disabled);
            if (firstAvailable) {
                toCurrencySelect.value = firstAvailable.value;
            }
        }
    }

    loadSettings();
    updateCurrencyOptions();

    convertBtn.addEventListener('click', async () => {
        
        const raw = amountInput.value.replace(/\D/g, '');
        const valorEmReais = parseFloat(raw) / 100;
        const amount = valorEmReais;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            showError('Informe um valor válido');
            return;
        }

        saveSettings();

        resultDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const result = await convertCurrency(amount, fromCurrency, toCurrency);
            showResult(result, amount, fromCurrency, toCurrency);
            
            saveConversionResult(fromCurrency, toCurrency, result.rate, Date.now());
        } catch (error) {
            console.error('Erro na API:', error);
            
            const storedData = getStoredConversionRate(fromCurrency, toCurrency);
            
            if (storedData) {
                const lastUpdate = new Date(storedData.timestamp);
                const result = {
                    convertedAmount: amount * storedData.rate,
                    rate: storedData.rate
                };
                
                showResult(result, amount, fromCurrency, toCurrency, true, lastUpdate);
                showError(`Usando taxa salva de ${formatDate(lastUpdate)}`);
            } else {
                showError('Erro na conversão e nenhum valor salvo anteriormente.');
            }
        }

        loadingDiv.classList.add('hidden');
    });

    const CACHE_DURATION = 1000 * 60 * 10;

    async function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return { convertedAmount: amount, rate: 1 };

        let stored = localStorage.getItem('cota');
        let data;

        if (stored) {
            const parsed = JSON.parse(stored);
            const isFresh = Date.now() - parsed.timestamp < CACHE_DURATION;
            data = isFresh ? parsed : await getExchangeRates();
        } else {
            data = await getExchangeRates();
        }

        const rates = data?.rates || {};

        const aliases = {
            usd: 'dolar',
            eur: 'euro',
            brl: 'brl',
            btc: 'bitcoin',
            doge: 'dogecoin',
            Fgbp: 'libra'
        };

        const fromRate = aliases[fromCurrency] === 'brl' ? 1 : rates[aliases[fromCurrency]];
        const toRate = aliases[toCurrency] === 'brl' ? 1 : rates[aliases[toCurrency]];

        console.log('Rates:', rates);
        console.log('De:', fromCurrency, '=>', fromRate);
        console.log('Para:', toCurrency, '=>', toRate);

        if (fromRate && toRate) {
            const rate = fromRate / toRate; // CORRETO: todos os valores são baseados em BRL
            const convertedAmount = amount * rate;
            return { convertedAmount, rate };
        }

        return await convertCurrencyAlternative(amount, fromCurrency, toCurrency);
    }



    async function convertCurrencyAlternative(amount, fromCurrency, toCurrency) {
        const currencyPair = `${fromCurrency}_${toCurrency}`;
        const url = `https://free.currconv.com/api/v7/convert?q=${currencyPair}&compact=ultra&apiKey=sample-key-do-not-use-in-prod`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro na API alternativa: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data[currencyPair]) {
                throw new Error('Taxa de conversão não encontrada');
            }
            
            const rate = data[currencyPair];
            const convertedAmount = amount * rate;
            return { convertedAmount, rate };
        } catch (error) {
            return await convertCurrencyDirect(amount, fromCurrency, toCurrency);
        }
    }
    
    async function convertCurrencyDirect(amount, fromCurrency, toCurrency) {
        const cryptoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`;
        
        try {
            const response = await fetch(cryptoUrl);
            if (!response.ok) {
                throw new Error(`Erro na API direta: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data[fromCurrency] && data[fromCurrency][toCurrency]) {
                const rate = data[fromCurrency][toCurrency];
                const convertedAmount = amount * rate;
                return { convertedAmount, rate };
            } else {
                const reverseUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${toCurrency}&vs_currencies=${fromCurrency}`;
                const reverseResponse = await fetch(reverseUrl);
                
                if (!reverseResponse.ok) {
                    throw new Error('Dados insuficientes');
                }
                
                const reverseData = await reverseResponse.json();
                
                if (reverseData[toCurrency] && reverseData[toCurrency][fromCurrency]) {
                    const rate = 1 / reverseData[toCurrency][fromCurrency];
                    const convertedAmount = amount * rate;
                    return { convertedAmount, rate };
                } else {
                    throw new Error('Dados insuficientes para conversão');
                }
            }
        } catch (error) {
            console.error('Todas as tentativas de API falharam:', error);
            throw new Error('Todas as tentativas de API falharam');
        }
    }

    function formatDynamicDecimal(value) {
        let [intPart, decimalPart] = value.toString().split('.');

        if (!decimalPart) return `${intPart},00`;

        let trimmed = decimalPart.replace(/0+$/, '');

        if (trimmed.length === 1) {
            return `${intPart},${trimmed}`;
        }

        let output = '';
        for (let i = 0; i < trimmed.length; i++) {
            output += trimmed[i];
            const len = output.length;
            if (len >= 2 && output[len - 1] !== '0' && output[len - 2] !== '0') {
                break;
            }
        }

        return `${intPart},${output}`;
    }


    function showResult(result, amount, fromCurrency, toCurrency, isFromCache = false, lastUpdate = null) {
        const convertedAmount = result.convertedAmount;
        const rate = result.rate;

        const formattedAmount = amount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const formattedConvertedAmount = formatDynamicDecimal(convertedAmount);
        console.log(convertedAmount)

        const formattedRate = rate.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        let content = `
            ${getCurrencySymbol(fromCurrency)} ${formattedAmount} ${fromCurrency.toUpperCase()} equivalem a<br>
            <span class="text-2xl">${getCurrencySymbol(toCurrency)} ${formattedConvertedAmount}</span><br>
            ${toCurrency.toUpperCase()}`;
            
        if (isFromCache && lastUpdate) {
            content += `<br><span class="text-sm text-gray-500">(Taxa armazenada de ${formatDate(lastUpdate)})</span>`;
        }

        resultText.innerHTML = content;
        exchangeRate.textContent = `Taxa: 1 ${fromCurrency.toUpperCase()} = ${formattedRate} ${toCurrency.toUpperCase()}`;
        resultDiv.classList.remove('hidden');
    }


    function showError(message) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    function getCurrencySymbol(currency) {
        const symbols = {
            'usd': '$',
            'brl': 'R$',
            'eur': '€',
            'gbp': '£',
            'btc': '₿',
            'doge': 'Ð'
        };
        return symbols[currency] || '';
    }
    
    function formatDate(date) {
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }


    convertBtn.click();
});