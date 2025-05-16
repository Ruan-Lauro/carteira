const valorInicialInput = document.querySelector('input[name="valueInitial"]');
const valorMensalInput = document.querySelectorAll('input[name="valueInitial"]')[1];
const taxaJurosInput = document.querySelectorAll('input[name="valueInitial"]')[2];
const periodoInput = document.querySelectorAll('input[name="valueInitial"]')[3];
const tipoTaxaSelect = document.getElementById('timeInterest');
const tipoPeriodoSelect = document.querySelectorAll('#timeInterest')[1];
const registrarBtn = document.getElementById('addTrasaction');

const valorTotalFinalElement = document.getElementById('valorTotalFinal');
const valorTotalInvestidoElement = document.getElementById('valorTotalInvestido');
const totalJurosElement = document.getElementById('totalJuros');
const tabelaResultados = document.getElementById('tabelaResultados');

const botaoTabela = document.getElementById('botaoTabela');
const botaoGrafico = document.getElementById('botaoGrafico');
const tabelaContainer = document.getElementById('tabelaContainer');
const graficoContainer = document.getElementById('graficoContainer');

let graficoInstance = null;

const STORAGE_KEY = 'jurosCompostosData';

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function salvarDadosLocalStorage(dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function carregarDadosLocalStorage() {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (dadosSalvos) {
        return JSON.parse(dadosSalvos);
    }
    return null;
}

function preencherFormularioComDadosSalvos(dados) {
    if (dados) {
        valorInicialInput.value = dados.inputs.valorInicial.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
            }) || '';
        valorMensalInput.value = dados.inputs.valorMensal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
            }) || '';
        taxaJurosInput.value = dados.inputs.taxaJuros || '';
        periodoInput.value = dados.inputs.periodo || '';
        tipoTaxaSelect.value = dados.inputs.tipoTaxa || 'yearly';
        tipoPeriodoSelect.value = dados.inputs.tipoPeriodo || 'years';
        
        valorTotalFinalElement.textContent = dados.resultados.valorTotalFinal || 'R$ 0,00';
        valorTotalInvestidoElement.textContent = dados.resultados.valorTotalInvestido || 'R$ 0,00';
        totalJurosElement.textContent = dados.resultados.totalJuros || 'R$ 0,00';
        
        if (dados.tabelaResultados && dados.tabelaResultados.length > 0) {
            preencherTabela(dados.tabelaResultados);
            criarGrafico(dados.tabelaResultados);
        }
    }
}

function calcularJurosCompostos() {
    const raw = valorInicialInput.value.replace(/\D/g, '');
    const valueReal = parseFloat(raw) / 100;
    const valorInicial = valueReal || 0;

    const rawTwo = valorMensalInput.value.replace(/\D/g, '');
    const valueRealTwo = parseFloat(rawTwo) / 100;
    const valorMensal = valueRealTwo || 0;

    const taxa = parseFloat(taxaJurosInput.value.replace(',', '.'));
    const taxaJuros = taxa || 0;

    const periodo = parseInt(periodoInput.value) || 0;
    const tipoTaxa = tipoTaxaSelect.value;
    const tipoPeriodo = tipoPeriodoSelect.value;
    
    let taxaMensal = taxaJuros / 100;
    if (tipoTaxa === 'yearly') {
        taxaMensal = Math.pow(1 + taxaMensal, 1/12) - 1;
    } else if (tipoTaxa === 'daily') {
        taxaMensal = Math.pow(1 + taxaMensal, 30) - 1;
    }
    
    let periodoEmMeses = periodo;
    if (tipoPeriodo === 'years') {
        periodoEmMeses = periodo * 12;
    } else if (tipoPeriodo === 'day') {
        periodoEmMeses = periodo / 30;
    }
    
    periodoEmMeses = Math.round(periodoEmMeses);
    
    let montanteTotal = valorInicial;
    let totalInvestido = valorInicial;
    let totalJuros = 0;
    
    tabelaResultados.innerHTML = '';
    
    const resultados = [];
    
    for (let i = 1; i <= periodoEmMeses; i++) {

        const jurosMes = montanteTotal * taxaMensal;
        
        montanteTotal += jurosMes + valorMensal;
        totalInvestido += valorMensal;
        totalJuros += jurosMes;
        
        resultados.push({
            mes: i,
            juros: jurosMes,
            totalAportado: totalInvestido,
            totalJuros: totalJuros,
            totalAcumulado: montanteTotal
        });
    }
    
    valorTotalFinalElement.textContent = formatarMoeda(montanteTotal);
    valorTotalInvestidoElement.textContent = formatarMoeda(totalInvestido);
    totalJurosElement.textContent = formatarMoeda(totalJuros);

    preencherTabela(resultados);
    
    criarGrafico(resultados);
    
    const dadosParaSalvar = {
        inputs: {
            valorInicial,
            valorMensal,
            taxaJuros,
            periodo,
            tipoTaxa,
            tipoPeriodo
        },
        resultados: {
            valorTotalFinal: valorTotalFinalElement.textContent,
            valorTotalInvestido: valorTotalInvestidoElement.textContent,
            totalJuros: totalJurosElement.textContent
        },
        tabelaResultados: resultados
    };
    
    salvarDadosLocalStorage(dadosParaSalvar);
    
    return resultados;
}

function preencherTabela(resultados) { 
    tabelaResultados.innerHTML = '';
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const textColor = currentTheme === 'light' ? 'text-text-200' : 'text-text-100';

    resultados.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add(textColor);
        
        if (item.mes % 2 === 0) {
            row.classList.add('bg-background-200');
        }
        
        row.innerHTML = `
            <td class="py-3 px-4">${item.mes}</td>
            <td class="py-3 px-4">${formatarMoeda(item.juros)}</td>
            <td class="py-3 px-4">${formatarMoeda(item.totalAportado)}</td>
            <td class="py-3 px-4">${formatarMoeda(item.totalJuros)}</td>
            <td class="py-3 px-4">${formatarMoeda(item.totalAcumulado)}</td>
        `;
        
        tabelaResultados.appendChild(row);
    });
}


function criarGrafico(resultados) {

    const canvas = document.getElementById('graficoResultados');
    if (!canvas) return;
    
    const labels = resultados.map(item => `Mês ${item.mes}`);
    const dadosCapital = resultados.map(item => item.totalAportado);
    const dadosJuros = resultados.map(item => item.totalJuros);
    const dadosTotal = resultados.map(item => item.totalAcumulado);
    
    const corCapital = 'rgba(75, 192, 192, 0.7)';
    const corJuros = 'rgba(153, 102, 255, 0.7)';
    const corTotal = 'rgba(54, 162, 235, 0.7)';
    
    if (graficoInstance) {
        graficoInstance.destroy();
    }

    graficoInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Capital Investido',
                    data: dadosCapital,
                    borderColor: corCapital,
                    backgroundColor: corCapital,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Juros Acumulados',
                    data: dadosJuros,
                    borderColor: corJuros,
                    backgroundColor: corJuros,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Total Acumulado',
                    data: dadosTotal,
                    borderColor: corTotal,
                    backgroundColor: corTotal,
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatarMoeda(context.raw);
                        }
                    }
                }
            }
        }
    });
}

registrarBtn.addEventListener('click', calcularJurosCompostos);

document.addEventListener("DOMContentLoaded", () => {
    const botaoTabela = document.getElementById("botaoTabela");
    const botaoGrafico = document.getElementById("botaoGrafico");
    const tabelaContainer = document.getElementById("tabelaContainer");
    const graficoContainer = document.getElementById("graficoContainer");

    function atualizarTemaBotoes() {
        const currentTheme = localStorage.getItem("theme") || "dark";
        const tabelaAtiva = !tabelaContainer.classList.contains("hidden");

        if (currentTheme === "dark") {
            botaoTabela.classList.toggle("bg-background-100", tabelaAtiva);
            botaoTabela.classList.toggle("text-[#5e81ac]", tabelaAtiva);
            botaoTabela.classList.toggle("text-[#d8dee9]", !tabelaAtiva);

            botaoGrafico.classList.toggle("bg-background-100", !tabelaAtiva);
            botaoGrafico.classList.toggle("text-[#5e81ac]", !tabelaAtiva);
            botaoGrafico.classList.toggle("text-[#d8dee9]", tabelaAtiva);
        } else {
            botaoTabela.classList.toggle("bg-background-400", tabelaAtiva);
            botaoTabela.classList.toggle("text-[#5e81ac]", tabelaAtiva);
            botaoTabela.classList.toggle("text-[#d8dee9]", !tabelaAtiva);

            botaoGrafico.classList.toggle("bg-background-400", !tabelaAtiva);
            botaoGrafico.classList.toggle("text-[#5e81ac]", !tabelaAtiva);
            botaoGrafico.classList.toggle("text-[#d8dee9]", tabelaAtiva);
        }
    }

    botaoTabela.addEventListener("click", () => {
        tabelaContainer.classList.remove("hidden");
        graficoContainer.classList.add("hidden");
        atualizarTemaBotoes();
    });

    botaoGrafico.addEventListener("click", () => {
        tabelaContainer.classList.add("hidden");
        graficoContainer.classList.remove("hidden");
        atualizarTemaBotoes();
        
        if (typeof graficoInstance !== "undefined") {
            setTimeout(() => {
                graficoInstance.resize();
            }, 100);
        }
    });

    atualizarTemaBotoes();
});


function formatDate() {
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    const hoje = new Date();
    const diaSemana = diasSemana[hoje.getDay()];
    const dia = hoje.getDate();
    const mes = meses[hoje.getMonth()];
    const ano = hoje.getFullYear();
    
    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
}

function configurarDataAtual() {
    document.getElementById('current-dateN').textContent = formatDate();
}

function carregarChartJS() {
    const dadosSalvos = carregarDadosLocalStorage();
    if (dadosSalvos && dadosSalvos.tabelaResultados && dadosSalvos.tabelaResultados.length > 0) {
        preencherFormularioComDadosSalvos(dadosSalvos);
    }
}

document.addEventListener('DOMContentLoaded', () => {
   
    configurarDataAtual();
    
    carregarChartJS();
});