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

    // Função para carregar as configurações iniciais
    function loadSettings() {
        const savedAmount = localStorage.getItem('amount');
        const savedFromCurrency = localStorage.getItem('fromCurrency');
        const savedToCurrency = localStorage.getItem('toCurrency');
        
        if (savedAmount) amountInput.value = savedAmount;
        if (savedFromCurrency) fromCurrencySelect.value = savedFromCurrency;
        if (savedToCurrency) toCurrencySelect.value = savedToCurrency;
    }
    
    // Função para salvar as configurações atuais
    function saveSettings() {
        localStorage.setItem('amount', amountInput.value);
        localStorage.setItem('fromCurrency', fromCurrencySelect.value);
        localStorage.setItem('toCurrency', toCurrencySelect.value);
    }

    // Função para salvar resultados de conversões bem-sucedidas
    function saveConversionResult(fromCurrency, toCurrency, rate, timestamp) {
        const conversionKey = `${fromCurrency}_${toCurrency}`;
        const conversionData = {
            rate: rate,
            timestamp: timestamp
        };
        localStorage.setItem(`conversion_${conversionKey}`, JSON.stringify(conversionData));
    }

    // Função para obter resultados de conversões anteriores
    function getStoredConversionRate(fromCurrency, toCurrency) {
        const conversionKey = `${fromCurrency}_${toCurrency}`;
        const storedData = localStorage.getItem(`conversion_${conversionKey}`);
        
        if (storedData) {
            return JSON.parse(storedData);
        }
        
        // Tentar a conversão inversa se disponível
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

    // Carregar configurações iniciais
    loadSettings();

    convertBtn.addEventListener('click', async () => {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            showError('Informe um valor válido');
            return;
        }

        // Salvar as configurações atuais
        saveSettings();

        // Esconder elementos e mostrar o loading
        resultDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            // Tentar fazer a conversão online
            const result = await convertCurrency(amount, fromCurrency, toCurrency);
            showResult(result, amount, fromCurrency, toCurrency);
            
            // Salvar o resultado bem-sucedido
            saveConversionResult(fromCurrency, toCurrency, result.rate, Date.now());
        } catch (error) {
            console.error('Erro na API:', error);
            
            // Tentar usar dados salvos anteriormente
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

    async function convertCurrency(amount, fromCurrency, toCurrency) {
        // Se as moedas são iguais, a taxa é 1
        if (fromCurrency === toCurrency) {
            return { convertedAmount: amount, rate: 1 };
        }

        // Modificado para usar a API corretamente
        const url = `https://api.coingecko.com/api/v3/exchange_rates`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificar se temos as taxas necessárias
        if (!data.rates || !data.rates[fromCurrency] || !data.rates[toCurrency]) {
            // Tente uma URL alternativa se a primeira não retornar os dados esperados
            return await convertCurrencyAlternative(amount, fromCurrency, toCurrency);
        }
        
        // Calcular a taxa de conversão usando as taxas em relação ao BTC ou USD
        const fromRate = data.rates[fromCurrency].value;
        const toRate = data.rates[toCurrency].value;
        const rate = toRate / fromRate;
        
        const convertedAmount = amount * rate;
        return { convertedAmount, rate };
    }
    
    // Função alternativa de conversão caso a primeira falhe
    async function convertCurrencyAlternative(amount, fromCurrency, toCurrency) {
        // Tentar usar uma URL alternativa com as moedas específicas
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
            // Se também falhar, tente uma terceira abordagem
            return await convertCurrencyDirect(amount, fromCurrency, toCurrency);
        }
    }
    
    // Função direta para conversão como último recurso
    async function convertCurrencyDirect(amount, fromCurrency, toCurrency) {
        // Formato específico da API do CoinGecko para criptomoedas
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
                // Se não encontrou, tentar uma maneira diferente
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

    function showResult(result, amount, fromCurrency, toCurrency, isFromCache = false, lastUpdate = null) {
        const convertedAmount = result.convertedAmount;
        const rate = result.rate;
        const formattedAmount = amount.toFixed(4);
        const formattedConvertedAmount = convertedAmount.toFixed(4);

        let content = `
            ${getCurrencySymbol(fromCurrency)} ${formattedAmount} ${fromCurrency.toUpperCase()} equivalem a<br>
            <span class="text-2xl">${getCurrencySymbol(toCurrency)} ${formattedConvertedAmount}</span><br>
            ${toCurrency.toUpperCase()}`;
            
        if (isFromCache && lastUpdate) {
            content += `<br><span class="text-sm text-gray-500">(Taxa armazenada de ${formatDate(lastUpdate)})</span>`;
        }
        
        resultText.innerHTML = content;
        exchangeRate.textContent = `Taxa: 1 ${fromCurrency.toUpperCase()} = ${rate.toFixed(6)} ${toCurrency.toUpperCase()}`;
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

    // Executar conversão automaticamente ao carregar
    convertBtn.click();
});