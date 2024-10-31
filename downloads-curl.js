const downloadButton = document.getElementById("download-btn");
const countdownElement = document.getElementById("countdown");
const adCheckbox = document.getElementById("ad-checkbox");
const adModeLabel = document.getElementById("ad-mode-label");
const adUrls = [
  "https://popcash.net/home/460280",
  "https://www.highrevenuenetwork.com/m2wtrhrv?key=9b4ae116c47e779ba318891398640d77"
];
const directDomains = [
  "hakoniwafansub.blogspot.com",
  "sendasubs.blogspot.com",
  "onionnofansub.es",
  "hidrogenosdelbueno.art.blog",
  "meltedfansub.wordpress.com"
];
let selectedDownloadUrl = '';

// Función para guardar el estado en Local Storage
function saveAdModeToLocalStorage(isNoAdMode) {
    localStorage.setItem("noAdMode", isNoAdMode);
}

// Función para cargar el estado desde Local Storage
function loadAdModeFromLocalStorage() {
    const storedValue = localStorage.getItem("noAdMode");
    return storedValue === "true";
}

// Función para obtener el último post del dominio
async function getLastPostUrl(domain) {
    try {
        const response = await fetch(`https://${domain}/feeds/posts/default?alt=json`);
        const data = await response.json();
        // Obtenemos la URL del post más reciente
        return data.feed.entry[0].link.find(link => link.rel === 'alternate').href;
    } catch (error) {
        console.error('Error fetching the last post URL:', error);
        return `https://${domain}`;
    }
}

// Al cargar la página, aplicamos el modo almacenado
document.addEventListener("DOMContentLoaded", () => {
    const isNoAdMode = loadAdModeFromLocalStorage();
    adCheckbox.checked = isNoAdMode;
    if (adModeLabel) {
        adModeLabel.textContent = isNoAdMode ? "Modo sin anuncios" : "Modo anuncios";
    }
});

// Cambia el texto del modo de anuncios y guarda el estado
adCheckbox.addEventListener("change", () => {
    const isNoAdMode = adCheckbox.checked;
    if (adModeLabel) {
        adModeLabel.textContent = isNoAdMode ? "Modo sin anuncios" : "Modo anuncios";
    }
    saveAdModeToLocalStorage(isNoAdMode);
});

// Función para abrir una URL en una nueva pestaña
function openInNewTab(url) {
    window.open(url, "_blank");
}

// Función para manejar el proceso de descarga
async function handleDownload() {
    const radios = document.querySelectorAll(".radio");
    for (const radio of radios) {
        if (radio.checked) {
            selectedDownloadUrl = radio.getAttribute("url");
            
            const domain = new URL(selectedDownloadUrl).hostname;
            if (directDomains.includes(domain)) {
                selectedDownloadUrl = await getLastPostUrl(domain);
            }
            
            if (adCheckbox.checked) {
                // Modo sin anuncios: descarga directa sin redirección ni cuenta regresiva
                openInNewTab(selectedDownloadUrl);
            } else {
                // Modo con anuncios: redirige al anuncio y aplica el conteo regresivo
                const randomChoice = Math.random() < 0.5; // 50% de probabilidad de redirigir a adUrls o directDomains
                let randomUrl;
                if (randomChoice) {
                    randomUrl = adUrls[Math.floor(Math.random() * adUrls.length)];
                } else {
                    const randomDomain = directDomains[Math.floor(Math.random() * directDomains.length)];
                    randomUrl = await getLastPostUrl(randomDomain);
                }
                openInNewTab(randomUrl);
                downloadButton.disabled = true;
                countdownElement.style.display = "block";
                let countdown = 10;
                countdownElement.textContent = `Espere ${countdown} segundos...`;
                const countdownInterval = setInterval(() => {
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        countdownElement.style.display = "none";
                        downloadButton.disabled = false;
                        openInNewTab(selectedDownloadUrl);
                    } else {
                        countdownElement.textContent = `Espere ${countdown} segundos...`;
                    }
                }, 1000);
            }
            break; // Salimos del bucle después de encontrar el radio seleccionado
        }
    }
}

downloadButton.addEventListener("click", handleDownload);
