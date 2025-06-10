if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful:', registration.scope);
        })
        .catch(function(error) {
          console.log('ServiceWorker registration failed:', error);
        });
    });
}

function checkInternetConnection() {
    const pElement = document.getElementById("online");

    function checkActiveConnection() {
        return fetch('https://carteira-contas.netlify.app/favicon.ico', { 
            mode: 'no-cors',
            cache: 'no-store',
            method: 'HEAD',
          
            signal: AbortSignal.timeout(5000)
        })
        .then(() => true)
        .catch(() => false);
    }

    async function updateStatus() {
       
        if (navigator.onLine) {
           
            try {
                const isReallyOnline = await checkActiveConnection();
                if (isReallyOnline) {
                    pElement.textContent = "online";
                    pElement.style.color = "#11FF00";
                } else {
                    pElement.textContent = "offline";
                    pElement.style.color = "orange";
                }
            } catch (error) {
                pElement.textContent = "verificando...";
                pElement.style.color = "blue";
            }
        } else {
          
            pElement.textContent = "offline";
            pElement.style.color = "red";
        }
    }

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    setInterval(updateStatus, 30000);
}

checkInternetConnection();

window.addEventListener("online", checkInternetConnection);
window.addEventListener("offline", checkInternetConnection);

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

async function getCityByIP() {
    try {
        const response = await fetch('https://pt.wttr.in/?format=j1');
        console.log(response)
        const city = await response.json();
        return city;
    } catch (error) {
        console.error('Erro ao buscar cidade pelo IP:', error);
        return 'Cidade desconhecida';
    }
}

async function initApp() {
    const currentDateElement = document.getElementById('current-date');
    const cityNameElement = document.getElementById('city-name');
    const temperatureElement = document.getElementById('temperature');

    if (currentDateElement) {
        currentDateElement.textContent = formatDate();
    }

    let cityData;

    try {
        const ipInfo = await getCityByIP();
        cityData = {
            city: ipInfo.nearest_area[0].areaName[0].value,
            temp_C: ipInfo.current_condition[0].temp_C
        };
        localStorage.setItem('city', JSON.stringify(cityData));
    } catch (error) {
        console.error('Erro ao buscar dados pela API, tentando localStorage:', error);
        const storedCity = localStorage.getItem('city');
        if (storedCity) {
            cityData = JSON.parse(storedCity);
        } else {
            cityData = null;
        }
    }

    if (cityData && cityNameElement && temperatureElement) {
        cityNameElement.textContent = cityData.city;
        temperatureElement.textContent = `${cityData.temp_C}º`;
    } else if (cityNameElement && temperatureElement) {
        cityNameElement.textContent = 'Cidade desconhecida';
        temperatureElement.textContent = '--';
    }
}




document.addEventListener('DOMContentLoaded', initApp);


document.addEventListener("DOMContentLoaded", () => {
    
    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme);

    document.getElementById("toggle-theme").addEventListener("click", function () {
        const currentTheme = localStorage.getItem('theme');
        toggleTheme(currentTheme);
    });

    
    function applyTheme(theme) {
        if (theme === 'light') {
            toggleTheme('dark');
        } else {
            toggleTheme('light');
        }
    }

    function toggleTheme(value) {
        if (value === 'dark') {
            toggleClassForElements(".bg-background-200", "bg-background-500", "bg-background-200");
            toggleClassForElements(".bg-background-100", "bg-background-400", "bg-background-100");
            toggleClassForElements(".text-text-100", "text-text-300", "text-text-100");
            toggleClassForElements(".text-text-200", "text-text-400", "text-text-200");
            localStorage.setItem('theme', 'light');
            toggleThemeIcon("light");
        } else if (value === 'light') {
            toggleClassForElements(".bg-background-500", "bg-background-200", "bg-background-500");
            toggleClassForElements(".bg-background-400", "bg-background-100", "bg-background-400");
            toggleClassForElements(".text-text-300", "text-text-100", "text-text-300");
            toggleClassForElements(".text-text-400", "text-text-200", "text-text-400");
            localStorage.setItem('theme', 'dark');
            toggleThemeIcon("dark");
        }
    }

    function toggleClassForElements(selector, class1, class2) {
        const elements = document.querySelectorAll(selector);
        if (elements) {
            elements.forEach(el => {
                el.classList.toggle(class1);
                el.classList.toggle(class2);
            });
        }
    }

    function toggleThemeIcon(theme) {
        const toggleThemeButton = document.getElementById("toggle-theme");
        if (theme === "light") {
            toggleThemeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-11 self-center cursor-pointer" id="toggle-theme">
                <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd" />
            </svg>`;
        } else {
            toggleThemeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-11 self-center cursor-pointer" id="toggle-theme">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
            </svg>`;
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {

    const imgUser = document.getElementById("imgUserEdit");
    const imgUserTwo = document.getElementById("imgUser");
    const nameUser = document.getElementById("nameUserEdit");
    const nameUserTwo = document.getElementById("nameUser");

    if(localStorage.getItem("userName")){
        nameUserTwo.innerText = localStorage.getItem("userName");
        nameUser.value = localStorage.getItem("userName");
    }

    if (localStorage.getItem("profileImage")) {
        imgUser.src = localStorage.getItem("profileImage");
        imgUserTwo.src = localStorage.getItem("profileImage");
    }

    imgUser.addEventListener("click", function () {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", function () {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imgUser.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        input.click();

    });

    document.getElementById('addEditUser').addEventListener('click', function (){
        const imgUser = document.getElementById("imgUserEdit");
        const nameUser = document.getElementById("nameUserEdit");
        localStorage.setItem("profileImage", imgUser.src);
        localStorage.setItem("userName", nameUser.value);
        location.reload();
    });

    document.getElementById('exitPerfil').addEventListener('click', function (){
        document.getElementById('perfilDiv').style.display = 'none';
    });

    document.getElementById('addPerfil').addEventListener('click', function (){
        document.getElementById('perfilDiv').style.display = 'flex';
    });

});

function downloadLocalStorageItem(key, filename) {
    try {
        const data = localStorage.getItem(key);
        if (!data) {
            alert(`Nenhum dado encontrado para ${key} no localStorage`);
            return null;
        }
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `${key}.json`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        return data;
    } catch (error) {
        console.error(`Erro ao baixar ${key}:`, error);
        alert(`Erro ao baixar ${key}: ${error.message}`);
        return null;
    }
}

function downloadMultipleItems(keys, filename) {
    try {
        const data = {};
        let hasData = false;
        
        keys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                try {
                    data[key] = JSON.parse(item);
                    hasData = true;
                } catch (e) {
                    data[key] = item;
                    hasData = true;
                }
            }
        });
        
        if (!hasData) {
            alert('Nenhum dado encontrado no localStorage para as chaves especificadas');
            return;
        }
        
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'localStorage_backup.json';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Erro ao baixar múltiplos itens:', error);
        alert(`Erro ao baixar os dados: ${error.message}`);
    }
}

function saveToLocalStorage(jsonData, keyPrefix = '') {
    try {
        if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
            let saved = 0;
            
            for (const key in jsonData) {
                if (Object.hasOwnProperty.call(jsonData, key)) {
                    const storageKey = keyPrefix ? `${keyPrefix}_${key}` : key;
                    const value = jsonData[key];
                    
                    localStorage.setItem(
                        storageKey, 
                        typeof value === 'object' ? JSON.stringify(value) : value
                    );
                    saved++;
                }
            }
            
            return saved;
        } else {
           
            if (keyPrefix) {
                localStorage.setItem(
                    keyPrefix, 
                    typeof jsonData === 'object' ? JSON.stringify(jsonData) : jsonData
                );
                return 1;
            } else {
                console.error('Não foi possível salvar os dados: chave não especificada para dados não estruturados');
                return 0;
            }
        }
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        alert(`Erro ao salvar no localStorage: ${error.message}`);
        return 0;
    }
}

function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                resolve({
                    filename: file.name,
                    data: jsonData
                });
            } catch (e) {
                reject(`Erro ao analisar o arquivo ${file.name}: ${e.message}`);
            }
        };
        
        reader.onerror = function() {
            reject(`Erro ao ler o arquivo ${file.name}`);
        };
        
        reader.readAsText(file);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const downloadBothBtn = document.getElementById('downloadBoth');
    if (downloadBothBtn) {
        downloadBothBtn.addEventListener('click', function() {
            downloadMultipleItems(['listTransaction', 'listCategory'], 'financial_data.json');
        });
    }

    const deleteButton = document.getElementById('deleteButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', function (){
            localStorage.removeItem('listTransaction');
            localStorage.removeItem('listCategory');
            location.reload();
        });
    }

    const uploadButton = document.getElementById('uploadButton');
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            const fileInput = document.getElementById('fileInput');
            if (!fileInput) {
                alert('Input de arquivo não encontrado.');
                return;
            }
            const files = fileInput.files;

            if (files.length === 0) {
                alert('Por favor, selecione pelo menos um arquivo para upload.');
                return;
            }

            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(readJSONFile(files[i]));
            }

            Promise.all(promises)
                .then(results => {
                    let totalSaved = 0;

                    results.forEach(result => {
                        let keyPrefix = '';
                        if (result.filename.includes('transaction')) {
                            keyPrefix = 'listTransaction';
                        } else if (result.filename.includes('categor')) {
                            keyPrefix = 'listCategory';
                        } else if (result.filename.includes('financial')) {
                            keyPrefix = '';
                        }

                        const saved = saveToLocalStorage(result.data, keyPrefix);
                        totalSaved += saved;
                    });

                    alert(`${totalSaved} itens foram salvos no localStorage com sucesso!`);
                    const divUploadJson = document.getElementById('divUploadJson');
                    if (divUploadJson) {
                        divUploadJson.style.display = 'none';
                    }
                })
                .catch(error => {
                    alert(`Erro ao processar arquivos: ${error}`);
                });

            location.reload();
        });
    }

    const exitUploadJsonBtn = document.getElementById('exitUploadJson');
    if (exitUploadJsonBtn) {
        exitUploadJsonBtn.addEventListener('click', function() {
            const divUploadJson = document.getElementById('divUploadJson');
            if (divUploadJson) {
                divUploadJson.style.display = 'none';
            }
        });
    }

    const seeUploadBtn = document.getElementById('SeeUploadJson');
    if (seeUploadBtn) {
        seeUploadBtn.addEventListener('click', function() {
            const divUploadJson = document.getElementById('divUploadJson');
            if (divUploadJson) {
                divUploadJson.style.display = 'flex';
            }
        });
    }
});
