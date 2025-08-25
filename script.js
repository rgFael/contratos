// Array de las 10 marcas solicitadas
const initialBrands = [
    'Veltar', 'Auryon', 'Kyntra', 'Zephyra', 'Orvane',
    'Lunari', 'Vyral', 'Aethrix', 'Ryvos', 'Solvix'
];

// Rangos de oferta inicial
const initialOfferRanges = [
    { minF: 1, maxF: 100000, minO: 50000, maxO: 100000 },
    { minF: 100001, maxF: 500000, minO: 100000, maxO: 250000 },
    { minF: 500001, maxF: 1000000, minO: 250000, maxO: 500000 },
    { minF: 1000001, maxF: 2000000, minO: 500000, maxO: 750000 },
    { minF: 2000001, maxF: 4000000, minO: 750000, maxO: 1000000 },
    { minF: 4000001, maxF: 6000000, minO: 1000000, maxO: 2000000 },
    { minF: 6000001, maxF: 8000000, minO: 2000000, maxO: 3000000 },
    { minF: 8000001, maxF: 10000000, minO: 3000000, maxO: 4000000 },
    { minF: 10000001, maxF: 12000000, minO: 4000000, maxO: 4500000 },
    { minF: 12000001, maxF: 14000000, minO: 4500000, maxO: 5000000 },
    { minF: 14000001, maxF: 16000000, minO: 5000000, maxO: 5500000 },
    { minF: 16000001, maxF: 18000000, minO: 6000000, maxO: 6500000 },
    { minF: 18000001, maxF: 20000000, minO: 6500000, maxO: 7000000 },
    { minF: 20000001, maxF: Infinity, minO: 7500000, maxO: 10000000 },
];

// Rangos de contraoferta
const counterOfferRanges = [
    { minF: 1, maxF: 100000, minO: 10000, maxO: 20000 },
    { minF: 100001, maxF: 500000, minO: 20000, maxO: 40000 },
    { minF: 500001, maxF: 1000000, minO: 40000, maxO: 60000 },
    { minF: 1000001, maxF: 2000000, minO: 60000, maxO: 80000 },
    { minF: 2000001, maxF: 4000000, minO: 80000, maxO: 100000 },
    { minF: 4000001, maxF: 6000000, minO: 100000, maxO: 130000 },
    { minF: 6000001, maxF: 8000000, minO: 130000, maxO: 160000 },
    { minF: 8000001, maxF: 10000000, minO: 160000, maxO: 200000 },
    { minF: 10000001, maxF: 12000000, minO: 200000, maxO: 250000 },
    { minF: 12000001, maxF: 14000000, minO: 250000, maxO: 300000 },
    { minF: 14000001, maxF: 16000000, minO: 300000, maxO: 360000 },
    { minF: 16000001, maxF: 18000000, minO: 360000, maxO: 430000 },
    { minF: 18000001, maxF: 20000000, minO: 430000, maxO: 500000 },
    { minF: 20000001, maxF: Infinity, minO: 500000, maxO: 600000 },
];

// Estado de la aplicación
let brands = [];
let probability = '';
let followers = '';
let phase = 'initial'; // 'initial', 'counter', 'complete'
let lastHighestOffer = 0;

// Referencias a elementos del DOM
const brandsContainer = document.getElementById('brands-container');
const probInput = document.getElementById('probabilidad');
const followersInput = document.getElementById('seguidores');
const messageBox = document.getElementById('message-box');
const resetButton = document.getElementById('reset-button');

/**
 * Initializes the game state.
 * @param {object} initialImages - An object mapping brand names to their image data URL for persistence.
 */
function initializeState(initialImages = {}) {
    // Si existen imágenes persistidas, se usan, de lo contrario, se crea un array de marcas vacío
    brands = initialBrands.map(name => ({
        name,
        status: 'pending', // 'pending', 'offered', 'no_offer', 'eliminated'
        offer: 0,
        image: initialImages[name] || null, // Asigna la imagen persistida si existe
        canCounter: false,
        winner: false, // Nuevo estado para marcar al ganador
    }));
    
    probability = '';
    followers = '';
    phase = 'initial';
    lastHighestOffer = 0;
    messageBox.textContent = '';
    messageBox.classList.add('hidden');
    resetButton.classList.add('hidden');
    probInput.disabled = false;
    followersInput.disabled = false;
}

// Función para renderizar las marcas en el DOM
function renderBrands() {
    brandsContainer.innerHTML = '';
    brands.forEach((brand, index) => {
        const brandCard = document.createElement('div');
        
        // Determinar clases CSS según el estado de la marca
        let cardColorClass = 'bg-gray-800 border-2 border-gray-700';
        if (brand.winner) {
            // Clases para el ganador (cubo dorado)
            cardColorClass = 'bg-amber-500 border-2 border-amber-300 shadow-amber-500/50';
        } else if (brand.status === 'offered') {
            cardColorClass = 'bg-green-700 border-2 border-green-500';
        } else if (brand.status === 'no_offer' || brand.status === 'eliminated') {
            cardColorClass = 'bg-red-700 opacity-60';
        }

        brandCard.className = `p-5 rounded-3xl shadow-2xl transition-all duration-300 transform hover:scale-105 ${cardColorClass}`;
        
        // HTML interno de la tarjeta de la marca
        brandCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-white">${brand.name}</h2>
                <label class="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full cursor-pointer hover:bg-gray-600 transition-colors file-input-label">
                    <i class="${brand.image ? '' : 'fas fa-plus'} ${brand.image ? '' : 'text-gray-400 text-lg'}"></i>
                    <input type="file" accept="image/*" class="hidden" data-index="${index}" />
                    ${brand.image ? `<img src="${brand.image}" alt="Logo" class="w-full h-full rounded-full object-cover shadow-lg">` : ''}
                </label>
            </div>
            <div class="flex flex-col items-start space-y-2 mb-4">
                <span class="text-sm font-semibold text-gray-400">
                    Estado:
                    <span class="ml-2 font-bold ${brand.status === 'offered' ? 'text-green-300' : brand.status === 'no_offer' ? 'text-red-300' : 'text-gray-300'}">
                        ${brand.status === 'offered' ? 'Ofertó' : brand.status === 'no_offer' ? 'No ofertó' : brand.status === 'eliminated' ? 'Eliminada' : brand.winner ? 'GANADOR' : 'Pendiente'}
                    </span>
                </span>
                ${brand.offer > 0 ? `
                    <span class="text-sm font-semibold text-gray-400">
                        Oferta:
                        <span class="ml-2 font-bold text-white">¥${brand.offer.toLocaleString()}</span>
                    </span>
                ` : ''}
            </div>
            
            ${(phase === 'initial' && brand.status === 'pending') ? `
                <button class="w-full flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-95" data-action="initial-offer" data-index="${index}">
                    <div class="p-2 bg-purple-700 rounded-xl mr-3 transform rotate-45">
                        <div class="w-5 h-5 bg-white cube-animate-initial"></div>
                    </div>
                    <span class="uppercase tracking-wide">Verificar</span>
                </button>
            ` : ''}
            
            ${(phase === 'counter' && brand.status === 'offered' && brand.canCounter) ? `
                <button class="w-full flex items-center justify-center p-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-95 bg-blue-600 hover:bg-blue-700"
                        data-action="counter-offer" data-index="${index}">
                    <i class="fas fa-coins text-xl mr-3"></i>
                    <span class="uppercase tracking-wide">Contraofertar</span>
                </button>
            ` : ''}
            
            ${(brand.winner) ? `
                <button class="w-full flex items-center justify-center p-4 rounded-2xl text-white font-bold text-lg shadow-lg cursor-not-allowed bg-amber-600">
                    <i class="fas fa-trophy text-xl mr-3 text-white"></i>
                    <span class="uppercase tracking-wide">GANADOR</span>
                </button>
            ` : ''}

            ${(phase === 'counter' && brand.status === 'offered' && !brand.canCounter) ? `
                <button class="w-full flex items-center justify-center p-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300 transform cursor-not-allowed opacity-50 bg-gray-700">
                    <i class="fas fa-ban text-xl mr-3"></i>
                    <span class="uppercase tracking-wide">Contraoferta Pendiente</span>
                </button>
            ` : ''}
        `;
        brandsContainer.appendChild(brandCard);
    });
}

// Función para mostrar mensajes
function showMessage(text, isError = false) {
    messageBox.textContent = text;
    messageBox.classList.remove('hidden');
    if (isError) {
        messageBox.classList.remove('bg-purple-600');
        messageBox.classList.add('bg-red-600');
    } else {
        messageBox.classList.remove('bg-red-600');
        messageBox.classList.add('bg-purple-600', 'animate-pulse');
    }
    setTimeout(() => {
        messageBox.classList.remove('animate-pulse');
    }, 500);
}

// Función para obtener un rango de oferta basado en los seguidores
function getOfferRange(type, followerCount) {
    const ranges = type === 'initial' ? initialOfferRanges : counterOfferRanges;
    const count = parseInt(followerCount);
    return ranges.find(range => count >= range.minF && count <= range.maxF);
}

// Función para generar un número aleatorio en un rango
function getRandomAmount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Lógica principal del juego
function checkGamePhase() {
    if (phase === 'initial') {
        const checkedBrandsCount = brands.filter(b => b.status !== 'pending').length;
        if (checkedBrandsCount === brands.length) {
            const offeredBrands = brands.filter(b => b.status === 'offered');
            if (offeredBrands.length === 1) {
                phase = 'complete';
                offeredBrands[0].winner = true; // Establecer el estado de ganador
                showMessage(`Solo ${offeredBrands[0].name} hizo una oferta. ¡Contrato asegurado!`);
                resetButton.classList.remove('hidden');
                renderBrands(); // Llama a renderizar para actualizar el estado del ganador
            } else if (offeredBrands.length >= 2) {
                phase = 'counter';
                showMessage('¡Hay más de una oferta! Comienza la fase de contraofertas.');
                probInput.disabled = true;
                followersInput.disabled = true;

                const highestOffer = Math.max(...offeredBrands.map(b => b.offer));
                lastHighestOffer = highestOffer;

                brands.forEach(brand => {
                    if (brand.status === 'offered') {
                        brand.canCounter = true;
                    }
                    if (brand.offer === highestOffer) {
                        // La marca con la oferta más alta no puede contraofertar primero
                        brand.canCounter = false;
                    }
                });
                renderBrands();
            } else {
                phase = 'complete';
                showMessage('Ninguna marca hizo una oferta. No hay contrato.');
                resetButton.classList.remove('hidden');
                renderBrands(); // Llama a renderizar para actualizar el estado sin ofertas
            }
        }
    } else if (phase === 'counter') {
        const offeredBrands = brands.filter(b => b.status === 'offered');
        if (offeredBrands.length === 1) {
            phase = 'complete';
            offeredBrands[0].winner = true; // Esta es la línea que soluciona el problema
            showMessage(`¡La marca ${offeredBrands[0].name} es la única que queda! ¡Contrato asegurado con ¥${offeredBrands[0].offer.toLocaleString()}!`);
            resetButton.classList.remove('hidden');
            renderBrands(); // Llama a renderizar para actualizar el estado del ganador
        } else if (offeredBrands.length > 1) {
            const highestOffer = Math.max(...offeredBrands.map(b => b.offer));
            lastHighestOffer = highestOffer;
            brands.forEach(brand => {
                if (brand.status === 'offered') {
                    brand.canCounter = true;
                }
                if (brand.offer === highestOffer) {
                    brand.canCounter = false;
                }
            });
            renderBrands();
        } else if (offeredBrands.length === 0) {
             phase = 'complete';
             showMessage('Todas las marcas han sido eliminadas. No hay contrato.');
             resetButton.classList.remove('hidden');
             renderBrands();
        }
    }
}

// Manejador de clics en el contenedor de marcas
brandsContainer.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const index = parseInt(button.dataset.index);
    const action = button.dataset.action;

    if (action === 'initial-offer') {
        const prob = parseFloat(probInput.value);
        const currentFollowers = parseFloat(followersInput.value);
        
        if (isNaN(prob) || isNaN(currentFollowers) || prob < 0 || prob > 100 || currentFollowers < 1) {
            showMessage('Por favor, ingresa una probabilidad válida (0-100) y un número de seguidores válido.', true);
            return;
        }

        const didOffer = Math.random() * 100 < prob;
        if (didOffer) {
            const range = getOfferRange('initial', currentFollowers);
            const offerAmount = getRandomAmount(range.minO, range.maxO);
            brands[index].status = 'offered';
            brands[index].offer = offerAmount;
            showMessage(`${brands[index].name} ha hecho una oferta inicial de ¥${offerAmount.toLocaleString()}.`);
        } else {
            brands[index].status = 'no_offer';
            showMessage(`${brands[index].name} no ha hecho una oferta.`);
        }
        renderBrands();
        checkGamePhase();

    } else if (action === 'counter-offer') {
        const prob = parseFloat(probInput.value);
        const currentFollowers = parseFloat(followersInput.value);
        
        if (isNaN(prob) || isNaN(currentFollowers)) {
            showMessage('Datos inválidos.', true);
            return;
        }

        const didOffer = Math.random() * 100 < prob;
        if (didOffer) {
            const range = getOfferRange('counter', currentFollowers);
            const counterAmount = getRandomAmount(range.minO, range.maxO);
            brands[index].offer = lastHighestOffer + counterAmount;
            brands[index].canCounter = false;
            showMessage(`${brands[index].name} ha hecho una contraoferta de ¥${brands[index].offer.toLocaleString()}.`);
        } else {
            brands[index].status = 'eliminated';
            brands[index].canCounter = false;
            showMessage(`${brands[index].name} no quiso contraofertar y ha sido eliminada.`);
        }
        renderBrands();
        checkGamePhase();
    }
});

// Manejador de carga de imágenes
brandsContainer.addEventListener('change', (e) => {
    const input = e.target.closest('input[type="file"]');
    if (!input) return;

    const index = parseInt(input.dataset.index);
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            brands[index].image = reader.result;
            renderBrands();

            // Guardar las imágenes en localStorage para persistencia
            const imagesToSave = {};
            brands.forEach(brand => {
                if (brand.image) {
                    imagesToSave[brand.name] = brand.image;
                }
            });
            try {
                localStorage.setItem('contratos_app_images', JSON.stringify(imagesToSave));
            } catch (error) {
                console.error("Error al guardar en localStorage:", error);
            }
        };
        reader.readAsDataURL(file);
    }
});

// Manejador para el botón de reinicio
resetButton.addEventListener('click', () => {
    probInput.value = '';
    followersInput.value = '';
    
    // Cargar imágenes guardadas desde localStorage para mantenerlas después del reinicio
    let storedImages = {};
    try {
        const storedImagesJSON = localStorage.getItem('contratos_app_images');
        if (storedImagesJSON) {
            storedImages = JSON.parse(storedImagesJSON);
        }
    } catch (error) {
        console.error("Error al cargar desde localStorage:", error);
    }
    
    initializeState(storedImages);
    renderBrands();
});

// Inicializar la aplicación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Cargar imágenes guardadas desde localStorage al iniciar la página
    let storedImages = {};
    try {
        const storedImagesJSON = localStorage.getItem('contratos_app_images');
        if (storedImagesJSON) {
            storedImages = JSON.parse(storedImagesJSON);
        }
    } catch (error) {
        console.error("Error al cargar desde localStorage:", error);
    }
    
    initializeState(storedImages);
    renderBrands();
});