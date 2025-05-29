
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

const deleteTransaction = (id) => {
  const listTransaction = JSON.parse(localStorage.getItem('listTransaction')) || [];
  const updatedList = listTransaction.filter(trans => trans.id !== id);
  localStorage.setItem('listTransaction', JSON.stringify(updatedList));
  dataTrasacao();
  moneyMenu(); 
};

const addDeleteListeners = () => {
  document.querySelectorAll('.delete-transaction').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idToDelete = e.currentTarget.getAttribute('data-id');
      deleteTransaction(idToDelete);
    });
  });
};

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
            <div class="flex justify-between pr-2 max-5xl:flex-col max-5xl:mb-3" id="${trans.id}">
                <div class="flex items-center gap-5 mb-2 max-5xl:mb-3">
                    <div class="flex items-center justify-center w-13 h-13 rounded-full " style="background-color: ${color};">
                        <i class="fas ${icon} text-[28px] text-[#eceff4]"></i>
                    </div>
                    <div class="flex flex-col">
                        <p class=" text-[26px] font-semibold mb-[-5px] max-5xl:text-[22px] truncate max-w-[237px]">${trans.name}</p>
                        <p class="opacity-60 text-[18px] font-semibold max-5xl:text-[16px] truncate max-w-[237px]">${name}</p>
                    </div>
                </div>
                <div class="flex gap-3 items-center" >
                  <p class="font-bold text-[26px]  max-5xl:text-[22px]" style="color: ${trans.type === "despesa" ? '#f5284e' : '#27f53c'};">
                    ${trans.type === "despesa" ? '- ' : ''} ${valueMoney}
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg"
                      class="text-[#f5284e] hover:text-[#ff0000] cursor-pointer hover:scale-105 transition-all duration-300 delete-transaction"
                      data-id="${trans.id}"
                      viewBox="0 0 30 30" width="20px" height="20px">
                    <path d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z"
                          fill="currentColor" />
                  </svg>

                </div>
            </div>
        `;
    }).join('');

    addDeleteListeners();
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

window.dataTrasacao = dataTrasacao;
window.moneyMenu = moneyMenu;


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
          <div class="flex justify-between pr-2  max-5xl:flex-col">
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
      bar.className = 'h-full flex flex-col items-center justify-end text-[#ff6464]';
      
      const barElement = document.createElement('div');
      barElement.style.height = `${heightPercentage}%`;
      barElement.style.backgroundColor = item.color;
      if(window.screen.width < 400){
        barElement.className = 'w-13 hover:scale-105 transition-all duration-300 cursor-pointer';
      }else{
        barElement.className = 'w-16 hover:scale-105 transition-all duration-300 cursor-pointer';
      }
      bar.append(heightPercentage.toFixed(2)+"%")
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

const iconButton = document.getElementById('RCicon');

iconButton.addEventListener('click', function () {
  const svg = iconButton.querySelector('svg');
  const incomeHtml = document.getElementById('income');
  const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];
  const listTransaction = JSON.parse(localStorage.getItem('listTransaction')) || [];
  const chartContainer = document.getElementById('expense-chart2');
  const legendContainer = document.getElementById('chart-legend2');

  if (svg.id !== 'graph') {
    iconButton.innerHTML = `
      <svg class="text-[#5e81ac] hover:text-text-200 cursor-pointer" width="30px" height="30px" id="graph" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19,3 L5,3 C3.9,3 3,3.9 3,5 L3,19 C3,20.1 3.9,21 5,21 L19,21 C20.1,21 21,20.1 21,19 L21,5 C21,3.9 20.1,3 19,3 Z M9,17 L7,17 L7,10 L9,10 Z M13,17 L11,17 L11,7 L13,7 Z M17,17 L15,17 L15,13 L17,13 Z" fill="currentColor"/>
      </svg>
    `;
    incomeHtml.innerHTML = ''; 
    incomeHtml.style.display = "flex";
    chartContainer.style.display = "none";
    legendContainer.style.display = "none";

    listCategory.forEach(list => {
      if (list.type !== "despesa") {
        let moneyIncome = 0;

        const listTransactionIdCategory = listTransaction.filter(ele => ele.categoryId === list.id);

        listTransactionIdCategory.forEach(val => {
          let value = parseFloat(val.value);
          if (!isNaN(value)) {
            moneyIncome += value;
          }
        });

        const valueMoneyIncome = moneyIncome.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

        incomeHtml.innerHTML += `
          <div class="flex justify-between pr-2 mb-5 max-5xl:flex-col">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-13 h-13 rounded-full" style="background-color: ${list.color};">
                <i class="fas ${list.icon} text-[28px] text-[#eceff4]"></i>
              </div>
              <p class="text-[26px] font-semibold max-5xl:text-[22px] max-w-[100px] break-words">${list.name}</p>
            </div>
            <p class="font-semibold text-[26px] flex items-center max-5xl:text-[22px] max-5xl:mt-2" style="color: #27f53c;">
              ${valueMoneyIncome}
            </p>
          </div>
        `;
      }
    });
  } else {
    iconButton.innerHTML = `
      <svg id='list' class='text-[#5e81ac] hover:text-text-200 cursor-pointer' width='25px' height='25px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
      </svg>
    `;

    incomeHtml.style.display = "none";
    incomeHtml.innerHTML = ''; 
    chartContainer.style.display = "flex";
    legendContainer.style.display = "flex";
    chartContainer.innerHTML = ''; 
    legendContainer.innerHTML = ''; 

    const listExpenditure = [];

    listCategory.forEach(list => {
      if (list.type !== "despesa") {
        const listTransactionIdCategory = listTransaction.filter(ele => ele.categoryId === list.id);
        let totalExpense = 0;

        listTransactionIdCategory.forEach(val => {
          let value = parseFloat(val.value);
          if (!isNaN(value)) {
            totalExpense += value;
          }
        });

        if (totalExpense > 0) {
          listExpenditure.push({
            color: list.color,
            total: totalExpense,
            name: list.name
          });
        }
      }
    });

    listExpenditure.sort((a, b) => b.total - a.total);
    const totalExpenseAmount = listExpenditure.reduce((sum, item) => sum + item.total, 0);
    const topCategories = listExpenditure.slice(0, 4);
    const othersTotal = listExpenditure.slice(4).reduce((sum, item) => sum + item.total, 0);

    const chartData = [...topCategories];
    if (othersTotal > 0) {
      chartData.push({
        color: '#f1f1f1',
        total: othersTotal,
        name: 'Outros'
      });
    }

    chartData.forEach(item => {
      const heightPercentage = (item.total / totalExpenseAmount) * 100;
      const bar = document.createElement('div');
      bar.className = 'h-full flex flex-col items-center justify-end text-[#27f53c]';

      const barElement = document.createElement('div');
      barElement.style.height = `${heightPercentage}%`;
      barElement.style.backgroundColor = item.color;
      barElement.className = window.screen.width < 400
        ? 'w-13 hover:scale-105 transition-all duration-300 cursor-pointer'
        : 'w-16 hover:scale-105 transition-all duration-300 cursor-pointer';
        
      bar.append(heightPercentage.toFixed(2)+"%");
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
  }
});

document.getElementById('RCicon2').addEventListener('click', function () {
  const svg = document.querySelector('#RCicon2 svg');
  const expenseHtml = document.getElementById('income2');
  const listCategory = JSON.parse(localStorage.getItem('listCategory')) || [];
  const listTransaction = JSON.parse(localStorage.getItem('listTransaction')) || [];
  const chartContainer = document.getElementById('expense-chart');
  const legendContainer = document.getElementById('chart-legend');

  if (svg.id !== 'graph2') {
    this.innerHTML = '';
    this.innerHTML = `
       <svg class="text-[#5e81ac] hover:text-text-200 cursor-pointer mt-5" width="30px" height="30px" id="graph2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19,3 L5,3 C3.9,3 3,3.9 3,5 L3,19 C3,20.1 3.9,21 5,21 L19,21 C20.1,21 21,20.1 21,19 L21,5 C21,3.9 20.1,3 19,3 Z M9,17 H7 V10 H9 V17 Z M13,17 H11 V7 H13 V17 Z M17,17 H15 V13 H17 V17 Z" fill="currentColor"/>
      </svg>
    `;

    expenseHtml.style.display = "flex";
    chartContainer.style.display = "none";
    legendContainer.style.display = "none";
    expenseHtml.innerHTML = '';

    listCategory.forEach(list => {
      if (list.type === "despesa") {
        let total = 0;
        const transactions = listTransaction.filter(tx => tx.categoryId === list.id);

        transactions.forEach(tx => {
          const value = parseFloat(tx.value);
          if (!isNaN(value)) total += value;
        });

        const formatted = total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

        expenseHtml.innerHTML += `
          <div class="flex justify-between pr-2 mb-5 max-5xl:flex-col">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-13 h-13 rounded-full" style="background-color: ${list.color};">
                <i class="fas ${list.icon} text-[28px] text-[#eceff4]"></i>
              </div>
              <p class="text-[26px] font-semibold max-5xl:text-[22px] max-w-[100px] break-words">${list.name}</p>
            </div>
            <p class="font-semibold text-[26px] flex items-center max-5xl:text-[22px] max-5xl:mt-2" style="color: #ff6464;">
             - ${formatted}
            </p>
          </div>
        `;
      }
    });

  } else {
    this.innerHTML = '';
    this.innerHTML = `
       <svg id='list2' class='text-[#5e81ac] mt-10 hover:text-text-200 cursor-pointer' width='25px' height='25px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
      </svg>
    `;

    expenseHtml.style.display = "none";
    chartContainer.style.display = "flex";
    legendContainer.style.display = "flex";
    chartContainer.innerHTML = '';
    legendContainer.innerHTML = '';

    const listExpense = [];

    listCategory.forEach(list => {
      if (list.type === "despesa") {
        let total = 0;
        const transactions = listTransaction.filter(tx => tx.categoryId === list.id);

        transactions.forEach(tx => {
          const value = parseFloat(tx.value);
          if (!isNaN(value)) total += value;
        });

        if (total > 0) {
          listExpense.push({ color: list.color, total, name: list.name });
        }
      }
    });

    listExpense.sort((a, b) => b.total - a.total);

    const totalAmount = listExpense.reduce((sum, item) => sum + item.total, 0);
    const topItems = listExpense.slice(0, 4);
    const othersTotal = listExpense.slice(4).reduce((sum, item) => sum + item.total, 0);

    const chartData = [...topItems];
    if (othersTotal > 0) {
      chartData.push({ color: '#f1f1f1', total: othersTotal, name: 'Outros' });
    }

    chartData.forEach(item => {
      const percent = (item.total / totalAmount) * 100;

      const barWrapper = document.createElement('div');
      barWrapper.className = 'h-full flex flex-col items-center justify-end';

      const bar = document.createElement('div');
      bar.style.height = `${percent}%`;
      bar.style.backgroundColor = item.color;
      bar.className = window.screen.width < 400
        ? 'w-13 hover:scale-105 transition-all duration-300 cursor-pointer'
        : 'w-16 hover:scale-105 transition-all duration-300 cursor-pointer';

      barWrapper.append(percent.toFixed(2)+"%")
      barWrapper.appendChild(bar);
      chartContainer.appendChild(barWrapper);

      const legend = document.createElement('div');
      legend.className = 'flex items-center gap-1';
      legend.innerHTML = `
        <div class="w-4 h-4" style="background-color: ${item.color};"></div>
        <span class="truncate max-w-[94px]">${item.name}</span>
      `;
      legendContainer.appendChild(legend);
    });
  }
});
  
document.addEventListener('DOMContentLoaded', Income);