document.getElementById('addTrasaction').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const raw = document.getElementById('value').value;
    const valueReal = raw.replace(/\D/g, '');
    const value = parseFloat(valueReal) / 100;
    const category = document.getElementById('category').value;

    console.log(name, value,     category);

    if (!name) {
        alert("Falta colocar o nome");
        return;
    }

    if (!value) {
        alert("Falta colocar o valor");
        return;
    }

    if (!category) {
        alert("Falta a categoria");
        return;
    }

    const type = document.querySelector("#type p").innerText;

    if (!type) {
        alert("Falta colocar o tipo");
        return;
    }

    const generateId = () => `trans-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transactionData = {
        id: generateId(),
        name: name,
        value: parseFloat(value).toFixed(2), 
        categoryId: category,  
        type: type,
        date: new Date().toLocaleDateString('pt-BR') 
    };

    const listTransaction = JSON.parse(localStorage.getItem('listTransaction')) || [];
    listTransaction.push(transactionData);
    localStorage.setItem('listTransaction', JSON.stringify(listTransaction));

    dataTrasacao();
    moneyMenu();
    Income();

    alert('Transação criada com sucesso!');
});

const dataTrasacao = () => {
    const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];
    const listTransaction = JSON.parse(localStorage.getItem('listTransaction')) || [];
    const htmlTransaction = document.getElementById('showTransaction');

    if (!htmlTransaction) return;

    htmlTransaction.innerHTML = listTransaction.map(trans => {
       
        const category = listCategory.find(cat => cat.id === trans.categoryId);
     
        const color = category ? category.color : '#ccc';
        const icon = category ? category.icon : 'fa-question-circle';
        const name = category ? category.name : 'Categoria Desconhecida';
        const valueMoney = Number(trans.value).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });


        return `
            <div class="flex justify-between pr-2 max-5xl:flex-col max-5xl:mb-3">
                <div class="flex items-center gap-5 mb-2 max-5xl:mb-3">
                    <div class="flex items-center justify-center w-13 h-13 rounded-full " style="background-color: ${color};">
                        <i class="fas ${icon} text-[28px] text-[#eceff4]"></i>
                    </div>
                    <div class="flex flex-col">
                        <p class=" text-[26px] font-semibold mb-[-5px] max-5xl:text-[22px] truncate max-w-[237px]">${trans.name}</p>
                        <p class="opacity-60 text-[18px] font-semibold max-5xl:text-[16px] truncate max-w-[237px]">${name}</p>
                    </div>
                </div>
                <p class="font-bold text-[26px]  max-5xl:text-[22px]" style="color: ${trans.type === "despesa" ? '#f5284e' : '#27f53c'};">
                    ${trans.type === "despesa" ? '- ' : ''} ${valueMoney}
                </p>
            </div>
        `;
    }).join('');
};

document.addEventListener('DOMContentLoaded', dataTrasacao);

const moneyMenu = () => {
    const listTransaction = JSON.parse(localStorage.getItem('listTransaction')) || [];
    const moneyMenu = document.getElementById('money');
    if (listTransaction.length === 0){
        moneyMenu.style.color = '#27f53c';
        moneyMenu.innerText = `R$ 0`;
        return;
    };

    if (moneyMenu) {
        let money = 0;
        listTransaction.forEach(val => {
            let value = parseFloat(val.value); 

            if (!isNaN(value)) { 
                if (val.type === 'despesa') {
                    money -= value;
                } else {
                    money += value;
                }
            }
        });

        moneyMenu.style.color = money >= 0?'#27f53c':'#f5284e';
        moneyMenu.innerText = money.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

    }
};

moneyMenu();

const Income = () => {
    const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];
    const listTransaction = JSON.parse(localStorage.getItem('listTransaction')) || [];
    const incomeHtml = document.getElementById('income');
    const chartContainer = document.getElementById('expense-chart');
    const legendContainer = document.getElementById('chart-legend');
    
    if (!incomeHtml || !chartContainer || !legendContainer) return;
    if (listCategory.length == 0) return;
    
    incomeHtml.innerHTML = '';
    chartContainer.innerHTML = '';
    legendContainer.innerHTML = '';
    
    const listExpenditure = [];
    
    listCategory.forEach(list => {
      let moneyIncome = 0;
      
      if (list.type !== "despesa") {
        const listTransactionIdCategory = listTransaction.filter(ele => ele.categoryId === list.id);
        
        listTransactionIdCategory.forEach(val => {
          let value = parseFloat(val.value);
          if (!isNaN(value)) {
            moneyIncome += value;
          }
        });

        let valueMoneyIncome = moneyIncome.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        
        incomeHtml.innerHTML += `
          <div class="flex justify-between pr-2 mb-5 max-5xl:flex-col">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-13 h-13 rounded-full " style="background-color: ${list.color};">
                <i class="fas ${list.icon} text-[28px] text-[#eceff4]"></i>
              </div>
              <p class=" text-[26px] font-semibold max-5xl:text-[22px] max-w-[100px] break-words">${list.name}</p>
            </div>
            <p class="font-semibold text-[26px] flex items-center max-5xl:text-[22px] max-5xl:mt-2" style="color: #27f53c;">
              ${valueMoneyIncome}
            </p>
          </div>
        `;
      } else {
        const listTransactionIdCategory = listTransaction.filter(ele => ele.categoryId === list.id);
        
        let totalExpense = 0;
        listTransactionIdCategory.forEach(val => {
          let value = parseFloat(val.value);
          if (!isNaN(value)) {
            totalExpense += value; 
          }
        });
        
        if (totalExpense > 0) {
          const expenditure = {
            color: list.color,
            total: totalExpense,
            name: list.name
          };
          listExpenditure.push(expenditure);
        }
      }
    });
    
    listExpenditure.sort((a, b) => b.total - a.total);
    
    const totalExpenseAmount = listExpenditure.reduce((sum, item) => sum + item.total, 0);
    
    const topCategories = listExpenditure.slice(0, 4);
    console.log(topCategories)
    let othersTotal = 0;
    if (listExpenditure.length > 4) {
      othersTotal = listExpenditure.slice(4).reduce((sum, item) => sum + item.total, 0);
    }
    
    const chartData = [...topCategories];
    if (othersTotal > 0) {
      chartData.push({
        color: '#f1f1f1', 
        total: othersTotal,
        name: 'Outros'
      });
    }

    console.log(chartData)
    
    chartData.forEach(item => {
      
      const heightPercentage = (item.total / totalExpenseAmount) * 100;
      
      const bar = document.createElement('div');
      bar.className = 'h-full flex flex-col items-center justify-end';
      
      const barElement = document.createElement('div');
      barElement.style.height = `${heightPercentage}%`;
      barElement.style.backgroundColor = item.color;
      if(window.screen.width < 400){
        barElement.className = 'w-13 hover:scale-105 transition-all duration-300 cursor-pointer';
      }else{
        barElement.className = 'w-16 hover:scale-105 transition-all duration-300 cursor-pointer';
      }
      
      bar.appendChild(barElement);
      
      chartContainer.appendChild(bar);
      
      const legendItem = document.createElement('div');
      legendItem.className = 'flex items-center gap-1';
      legendItem.innerHTML = `
        <div class="w-4 h-4" style="background-color: ${item.color};"></div>
        <span class="truncate max-w-[94px]">${item.name}</span>
      `;
      legendContainer.appendChild(legendItem);
    });
};
  
document.addEventListener('DOMContentLoaded', Income);





