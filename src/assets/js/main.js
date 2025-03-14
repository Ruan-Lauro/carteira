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

localStorage.setItem('theme', 'dark');

async function checkSiteStatus(url) {
    const pElement = document.getElementById("online");
    try {
        const response = await fetch(url, { mode: "no-cors" });
        pElement.textContent = "Site Online";
        pElement.style.color = "green";
    } catch (error) {
        pElement.textContent = "Site Offline";
        pElement.style.color = "red";
    }
}

checkSiteStatus("https://carteira-contas.netlify.app/");
  
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

async function getCityByGeolocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&format=json&api_key=67cb5cda5738f625118564tdo320fcc`);
                        const data = await response.json();
                        if (data.address && data.address.city) {
                            resolve({ city: data.address.city, latitude, longitude });
                        } else {
                            reject("Cidade não encontrada.");
                        }
                    } catch (error) {
                        reject("Erro ao buscar a cidade.");
                    }
                },
                () => reject("Permissão negada.")
            );
        } else {
            reject("Geolocalização não suportada.");
        }
    });
}

async function getWeatherData(latitude, longitude, city) {
    try {
        if (!latitude || !longitude) {
            throw new Error("Coordenadas inválidas");
        }

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`);
        const weatherData = await weatherResponse.json();

        return {
            temperature: Math.round(weatherData.current.temperature_2m),
            cityName: city
        };
    } catch (error) {
        console.error('Erro ao obter dados meteorológicos:', error);
        return {
            temperature: '--',
            cityName: city
        };
    }
}


async function initApp() {
    document.getElementById('current-date').textContent = formatDate();

    let locationData;
    let weatherData = { temperature: '--', cityName: 'null' };

    try {
        locationData = await getCityByGeolocation();
        console.log("Localização:", locationData.city);
        
        weatherData = await getWeatherData(
            locationData.latitude, 
            locationData.longitude, 
            locationData.city
        );
    } catch (error) {
        console.warn("Geolocalização falhou:", error);
       
    }

    document.getElementById('city-name').textContent = weatherData.cityName;
    document.getElementById('temperature').textContent = `${weatherData.temperature}º`;
}

document.addEventListener('DOMContentLoaded', initApp);

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("toggle-theme").addEventListener("click", function () {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        toggleTheme(currentTheme);
    });

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