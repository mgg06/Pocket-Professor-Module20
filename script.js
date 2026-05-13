// ==========================================================================
// REFERENCIAS AL DOM (Pantallas principales)
// ==========================================================================
const introScreen = document.getElementById('intro-screen'); // Pantalla de inicio con el logo
const cityScreen = document.getElementById('city-screen'); // Mapa panorámico de la ciudad 
const genericBuildingScreen = document.getElementById('generic-building-screen'); // Pantalla de tiendas (Mercadona, etc.)
const apartmentScreen = document.getElementById('apartment-screen'); // Pantalla del pasillo (Medac)
const teacherScreen = document.getElementById('teacher-screen'); // Pantalla del aula privada del profesor
const startBtn = document.getElementById('start-btn'); // Botón gigante de "Empezar"

// ==========================================================================
// SISTEMA DE AUDIO (Música de fondo y Efectos de Sonido)
// ==========================================================================
const bgMusic = new Audio('assets/audio/soundtrack.mp3');
bgMusic.loop = true; // Hace que se reproduzca en bucle
bgMusic.volume = 0.4; // Ajusta el volumen a un nivel agradable

const cursorSound = new Audio('assets/audio/cursor.mp3');
cursorSound.volume = 0.5; // Ajusta el volumen del efecto de sonido

// Intenta reproducir la música al cargar la página
bgMusic.play().catch(err => console.log("Esperando interacción para reproducir audio", err));

// Inicia la música con el primer clic en la pantalla (por restricciones de navegadores)
document.addEventListener('click', () => {
    if (bgMusic.paused && !bgMusic.muted) bgMusic.play().catch(err => console.log("Esperando interacción para reproducir audio", err));
}, { once: true });

// Evento para reproducir sonido al pasar el ratón por elementos clicables
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('button, .door-wrapper, .char-select-card, [id$="-wrapper"], .inv-item, #audio-controls');
    if (target) {
        cursorSound.currentTime = 0; // Reinicia el sonido por si se pasa muy rápido
        cursorSound.play().catch(err => console.log("Esperando interacción para reproducir audio de cursor", err));
    }
});

// ==========================================================================
// SILENCIAR/ACTIVAR SONIDO GENERAL
// ==========================================================================
let isMuted = false;
function toggleAudio() {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    cursorSound.muted = isMuted;
    const muteIcon = document.getElementById('mute-icon');
    if (muteIcon) {
        muteIcon.innerText = isMuted ? '🔇' : '🔊';
    }
}

// ==========================================================================
// ESTADO GLOBAL Y MEMORIA DEL JUGADOR (El "Save Data" en vivo)
// ==========================================================================
let currentTeacher = null; // Inicializa una variable para mantener el registro de qué profesor estás visitando
let moveInterval = null; // Variable para controlar el movimiento aleatorio
let bubbleInterval = null; // Variable para controlar los globos de texto
let coins = 200; // Monedas iniciales del jugador
let inventory = { pizza: 0, agua: 0, manzana: 0, sandwich: 0, doritos: 0, chuches: 0, cafe: 0, sushi: 0, carne: 0, macarrones: 0, lasana: 0, pelota: 0, boli: 0, microfono: 0, ordenador: 0, osito: 0, tareas: 0, telefono: 0 }; // Modelo de datos para la mochila del usuario
let cart = {}; // Memoria temporal del Carrito de la compra
let currentBuilding = ''; // Indica en qué tienda se encuentra
let currentGift = null; // Guarda el ID del juguete desplegado en el aula en ese instante

// ==========================================================================
// SISTEMA DE ALERTAS PERSONALIZADAS (Pop-ups que sustituyen al 'alert()' clásico del navegador)
// ==========================================================================
function showCustomAlert(message) {
    let modal = document.getElementById('custom-alert-modal');
    // Si el modal no existe, lo inyecta dinámicamente en el HTML
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'custom-alert-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(89, 13, 34, 0.6)';
        modal.style.zIndex = '10010';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#fff0f3';
        modalContent.style.border = '4px solid #ff4d6d';
        modalContent.style.borderRadius = '20px';
        modalContent.style.padding = '30px';
        modalContent.style.textAlign = 'center';
        modalContent.style.boxShadow = '0 8px 20px rgba(89, 13, 34, 0.4)';
        modalContent.style.maxWidth = '80%';
        modalContent.style.minWidth = '300px';

        const messageP = document.createElement('p');
        messageP.id = 'custom-alert-message';
        messageP.style.color = '#590d22';
        messageP.style.fontSize = '18px';
        messageP.style.fontWeight = 'bold';
        messageP.style.marginBottom = '20px';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Aceptar';
        closeBtn.style.backgroundColor = '#ff4d6d';
        closeBtn.style.color = 'white';
        closeBtn.style.border = '3px solid #ffccd5';
        closeBtn.style.padding = '10px 25px';
        closeBtn.style.borderRadius = '15px';
        closeBtn.style.fontSize = '16px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.boxShadow = '0 4px 6px rgba(89, 13, 34, 0.3)';
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        
        modalContent.appendChild(messageP);
        modalContent.appendChild(closeBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    // Reemplaza el texto con el nuevo mensaje y lo hace visible
    document.getElementById('custom-alert-message').innerText = message;
    modal.style.display = 'flex';
}

function hideAllScreens() { // Declara una función de utilidad para limpiar la pantalla ocultando todos los menús
    introScreen.classList.add('hidden'); // Añade la clase 'hidden' a la pantalla de inicio principal
    cityScreen.classList.add('hidden'); // Añade la clase 'hidden' a la pantalla del mapa de la ciudad
    genericBuildingScreen.classList.add('hidden'); // Añade la clase 'hidden' a la vista de edificio genérico (tiendas)
    apartmentScreen.classList.add('hidden'); // Añade la clase 'hidden' a la vista del pasillo de los profesores
    teacherScreen.classList.add('hidden'); // Añade la clase 'hidden' al interior del aula del profesor
} // Termina la función hideAllScreens

startBtn.addEventListener('click', () => { // Añade un detector de eventos para capturar los clics en el botón de inicio
    hideAllScreens(); // Llama a la función para apagar cualquier pantalla residual
    cityScreen.classList.remove('hidden'); // Elimina la clase 'hidden' del mapa de la ciudad para hacerlo visible
    bgMusic.play().catch(err => console.log("Esperando interacción para reproducir audio", err));
    if (typeof showTutorial === 'function') showTutorial();
}); // Cierra el bloque del evento de clic para el botón de inicio

function openBuilding(buildingName) { // Función para abrir comercios. Toma el nombre del edificio como argumento
    currentBuilding = buildingName;
    cart = {}; // Limpiar carrito al entrar a un nuevo edificio
    hideAllScreens(); // Se asegura de que no se superpongan otras interfaces
    document.getElementById('building-title').innerText = buildingName; // Actualiza el rótulo superior del edificio en el DOM
    
    // Configuramos el fondo dinámico del edificio
    let bgUrl = "none";
    switch (buildingName) {
        case 'MERCADONA':
            bgUrl = "url('assets/images/fondo-mercadona.png')";
            break;
        case 'TRANVIBUS':
            bgUrl = "url('assets/images/tranvibus-fondo.jpg')";
            break;
        case 'ZONA ESTE':
            bgUrl = "url('assets/images/zona-este-fondo.jpeg')";
            break;
        case 'PALACIO DE CONGRESOS':
            bgUrl = "url('assets/images/palacio-congresos-fondo.jpg')";
            break;
    }
    
    genericBuildingScreen.style.backgroundImage = bgUrl;
    genericBuildingScreen.style.backgroundSize = "cover";
    genericBuildingScreen.style.backgroundPosition = "center";
    
    updateBuildingContent(buildingName); // Carga el contenido de la tienda si es necesario
    genericBuildingScreen.classList.remove('hidden'); // Enciende la visibilidad de la pantalla de tienda
} // Termina la función openBuilding

function goBackToCity() { // Define el atajo para retroceder a la vista aérea de la ciudad
    hideAllScreens(); // Apaga la capa actual en la que esté el jugador
    cityScreen.classList.remove('hidden'); // Restituye el flujo visual de la ciudad principal
} // Termina la función goBackToCity

function visitTeacher(teacherName) { // Lógica que gestiona la entrada física al aula de un profesor
    currentTeacher = teacherName; // Ancla la identidad del docente en la memoria viva de la app
    currentGift = null; // Reiniciamos el regalo visible
    hideAllScreens(); // Apaga el pasillo para dar paso a la clase
    
    // Configuramos el fondo de la clase
    const bg = teachersData[teacherName].background || 'clase.jpg';
    teacherScreen.style.backgroundImage = `url('assets/images/${bg}')`;
    teacherScreen.style.backgroundSize = "cover";
    teacherScreen.style.backgroundPosition = "center";
    teacherScreen.style.position = "relative";
    teacherScreen.style.overflow = "hidden";
    teacherScreen.style.padding = "0";

    document.getElementById('teacher-menu').classList.add('hidden'); // Ocultar el menú al entrar
    document.getElementById('talk-options-container').classList.add('hidden'); // Ocultar opciones de diálogo al entrar
    updateInventoryUI(); // Actualizar la UI del inventario
    updateTeacherUI(); // Recompila e inserta visualmente los niveles y sprites del profesor en el DOM
    teacherScreen.classList.remove('hidden'); // Destapa el telón para revelar el aula interactiva
    startTeacherMovement(); // Inicia el movimiento aleatorio
    startBubbleSystem(); // Inicia el sistema de globos de texto
} // Termina la función visitTeacher

function updateTeacherUI() { // Rutina para refrescar la interfaz (UI) sincronizando los datos en tiempo real
    const data = teachersData[currentTeacher]; // Recupera toda la configuración y estadísticas asociadas a ese docente
    document.getElementById('teacher-name').innerText = currentTeacher; // Imprime el nombre propio en los indicadores de pantalla
    document.getElementById('teacher-title-display').innerText = `${data.name} - ${currentTeacher}`;
    
    let giftHTML = '';
    if (currentGift && storeItems[currentGift]) {
        const giftWidth = currentGift === 'pelota' ? '60px' : '100px';
        const rightPos = currentGift === 'pelota' ? '-40px' : '-60px';
        giftHTML = `<img id="active-gift" src="${storeItems[currentGift].image}" style="position: absolute; bottom: 10%; right: ${rightPos}; width: ${giftWidth}; z-index: 60; filter: drop-shadow(0px 5px 5px rgba(89,13,34,0.3)); animation: bounceGift 0.8s infinite alternate ease-in-out;">`;
    }

    // Actualiza el texto de las monedas en el menú
    const coinsDisplayMenu = document.getElementById('teacher-coins-display');
    if(coinsDisplayMenu) coinsDisplayMenu.innerText = coins;

    // Inyectamos el globo (oculto por defecto) y aumentamos el tamaño del profe a 280px
    document.getElementById('teacher-avatar').innerHTML = `
        <div id="teacher-bubble" style="opacity: 0; pointer-events: none; transition: opacity 0.3s; background: #fff0f3; border: 3px solid #ff4d6d; border-radius: 15px; padding: 12px 18px; box-shadow: 0 4px 8px rgba(89, 13, 34, 0.3); margin-bottom: 15px; max-width: 250px; text-align: center; font-weight: bold; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); z-index: 60; font-size: 14px; color: #590d22;">
            <div style="position: absolute; bottom: -11px; left: 50%; transform: translateX(-50%); border-width: 8px 8px 0; border-style: solid; border-color: #ff4d6d transparent transparent transparent;"></div>
            <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); border-width: 6px 6px 0; border-style: solid; border-color: #fff0f3 transparent transparent transparent;"></div>
            <span id="teacher-bubble-text" style="color: #590d22;"></span>
        </div>
        <div style="position: relative; display: flex; justify-content: center;">
            <img id="avatar-img" src="${data.image}" alt="${currentTeacher}" style="max-height: 280px; width: auto; transform: scaleX(var(--flip, 1)); transition: transform 0.4s;">
            ${giftHTML}
        </div>
    `; 
    
    // Actualizamos las barras visuales en el menú
    document.getElementById('happiness-bar').style.width = data.happiness + "%";
    document.getElementById('hunger-bar').style.width = data.hunger + "%";
} // Termina la función updateTeacherUI

function feedTeacher() { // Lógica básica en desuso o alternativa para alimentar a un profesor de forma genérica
    if (teachersData[currentTeacher].hunger > 0) { // Evalúa si la barra de apetito aún admite comida (no es cero)
        teachersData[currentTeacher].hunger -= 10; // Sacia un 10% el hambre estática de su estómago
        teachersData[currentTeacher].happiness += 5; // Recompensa su estado de ánimo pasivamente
        updateTeacherUI(); // Envía una petición para cambiar gráficamente las barras de progreso
        showCustomAlert('¡Has alimentado a ' + currentTeacher + '!'); // Despacha un aviso modal visual para el jugador
    } else { // Ruta de escape condicional si el atributo de hambre topó el límite mínimo
        showCustomAlert(currentTeacher + ' no tiene hambre ahora mismo.'); // Protege de sobrealimentar
    } // Cierra el condicional restrictivo de topes
} // Final de la rutina feedTeacher

function talkToTeacher() { // Genera aleatoriamente el menú de opciones de conversación interactiva
    const container = document.getElementById('talk-options-container');
    const list = document.getElementById('talk-options-list');
    list.innerHTML = '';
    
    // Escoge 4 opciones aleatorias de toda tu lista
    const shuffled = talkOptions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    
    selected.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.text;
        btn.style.margin = '0';
        btn.style.fontSize = '14px';
        btn.style.padding = '10px';
        btn.onclick = () => selectTalkOption(opt);
        list.appendChild(btn);
    });
    
    container.classList.remove('hidden');
} // Finaliza la función talkToTeacher

function closeTalkOptions() {
    document.getElementById('talk-options-container').classList.add('hidden');
}

function selectTalkOption(opt) {
    closeTalkOptions();
    
    teachersData[currentTeacher].happiness = Math.max(0, Math.min(100, teachersData[currentTeacher].happiness + opt.change));
    updateTeacherUI();
    
    const bubble = document.getElementById('teacher-bubble');
    const bubbleText = document.getElementById('teacher-bubble-text');
    if (bubble && bubbleText) {
        bubbleText.innerText = opt.reply;
        bubble.style.opacity = "1";
        setTimeout(() => { if (bubble) bubble.style.opacity = "0"; }, 4000);
    }
}

function leaveTeacher() { // Ejecuta la limpieza de memoria al salir de un aula
    currentTeacher = null; // Libera de la memoria RAM qué profesor estaba activo
    currentGift = null; // Reiniciar regalo al salir
    hideAllScreens(); // Fundido en negro para todas las capas visuales
    clearInterval(moveInterval); // Detenemos el movimiento al salir de la sala
    clearInterval(bubbleInterval); // Detenemos los globos al salir
    document.getElementById('talk-options-container').classList.add('hidden');
    apartmentScreen.classList.remove('hidden'); // Muestra de nuevo la pantalla principal del pasillo de los apartamentos
} // Termina el proceso de abandono de aula

// --- FUNCIONES PARA LA CLASE Y EL PROFESOR ---
function toggleTeacherMenu() {
    const menu = document.getElementById('teacher-menu');
    menu.classList.toggle('hidden');
}

function startTeacherMovement() {
    const avatar = document.getElementById('teacher-avatar');
    avatar.style.left = "50%"; // Posición inicial en el centro
    
    clearInterval(moveInterval);
    moveInterval = setInterval(() => {
        // Calculamos una posición aleatoria (entre 15% y 85% de la pantalla)
        const randomLeft = Math.floor(Math.random() * 70) + 15;
        const currentLeft = parseFloat(avatar.style.left) || 50;
        
        // Voltear la imagen según si va a la izquierda o derecha
        const img = avatar.querySelector('img');
        if (img) {
            if (randomLeft > currentLeft) {
                img.style.setProperty('--flip', '-1'); // Voltea hacia la derecha usando una variable CSS
            } else {
                img.style.setProperty('--flip', '1'); // Normal, mirando a la izquierda
            }
            
            // Añade la clase de la animación graciosa de caminar
            img.classList.add('walking');
            // Y se la quitamos cuando termina el movimiento (3 segundos después)
            setTimeout(() => { if (img) img.classList.remove('walking'); }, 3000);
        }
        
        // Mueve el avatar usando la propiedad CSS transition
        avatar.style.left = randomLeft + "%";
    }, 4000); // Cada 4 segundos cambia de posición
}

function startBubbleSystem() {
    clearInterval(bubbleInterval);
    bubbleInterval = setInterval(() => {
        const bubble = document.getElementById('teacher-bubble');
        const bubbleText = document.getElementById('teacher-bubble-text');
        
        // Mostrar el globo aleatoriamente si estamos con el profe
        if (bubble && currentTeacher && Math.random() > 0.3) {
            const phrases = teachersData[currentTeacher].phrases;
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            
            bubbleText.innerText = randomPhrase;
            bubble.style.opacity = "1"; // Lo hace visible
            
            // Ocultar el globo después de 4 segundos
            setTimeout(() => { if (bubble) bubble.style.opacity = "0"; }, 4000);
        }
    }, 6000); // Cada 6 segundos el sistema tira los dados para ver si el profe dice algo
}

// --- NUEVO CÓDIGO ---
// Inyectamos el mapa y los edificios directamente desde JavaScript para evitar problemas de CSS/HTML
function setupCityMap() {
    // Forzamos los estilos del fondo
    cityScreen.style.backgroundImage = "url('assets/images/fondo.png')"; 
    cityScreen.style.backgroundSize = "cover";
    cityScreen.style.backgroundPosition = "center";
    cityScreen.style.position = "relative";
    cityScreen.style.width = "100vw";
    cityScreen.style.minHeight = "100vh";
    cityScreen.style.padding = "0"; // Quitamos el padding para que la imagen ocupe todo
    
    // Lista de edificios con sus posiciones
    const buildings = [
        { id: 'img-medac', src: 'assets/images/medac.png', name: 'MEDAC', top: '35%', left: '67%', width: '450px', zIndex: 10 },
        { id: 'img-mercadona', src: 'assets/images/mercadona.png', name: 'MERCADONA', top: '35%', left: '0%', width: '500px', zIndex: 20 },
        { id: 'img-palacio', src: 'assets/images/palacio-congresos.png', name: 'PALACIO DE CONGRESOS', top: '28%', left: '28%', width: '320px', zIndex: 5 },
        { id: 'img-tranvibus', src: 'assets/images/tranvibus.png', name: 'TRANVIBUS', top: '55%', left: '-150px', width: '500px', zIndex: 20 },
        { id: 'img-plaza', src: 'assets/images/plaza.png', name: 'PLAZA', top: '66%', left: '30%', width: '600px', zIndex: 15 },
        { id: 'img-zona-este', src: 'assets/images/zona-este.png', name: 'ZONA ESTE', top: '35%', left: '49%', width: '350px', zIndex: 3 }
    ];

    buildings.forEach(building => {
        let wrapper = document.getElementById(building.id + '-wrapper');
        if (!wrapper) { 
            wrapper = document.createElement('div');
            wrapper.id = building.id + '-wrapper';
            wrapper.style.position = 'absolute';
            wrapper.style.top = building.top;
            wrapper.style.left = building.left;
            wrapper.style.width = building.width;
            wrapper.style.zIndex = building.zIndex || '10';
            
            let img = document.createElement('img');
            img.id = building.id;
            img.src = building.src;
            img.alt = building.name;
            img.style.width = '100%';
            img.style.display = 'block';
            
            wrapper.onclick = () => {
                if (building.name === 'MEDAC') {
                    hideAllScreens();
                    apartmentScreen.classList.remove('hidden');
                } else {
                    openBuilding(building.name);
                }
            };

            // Crear el globo de texto (tooltip) para la ciudad
            const tooltip = document.createElement('div');
            tooltip.innerText = building.name;
            tooltip.style.position = "absolute";
            tooltip.style.bottom = "100%"; 
            tooltip.style.left = "50%";
            tooltip.style.transform = "translateX(-50%) translateY(0px)";
            tooltip.style.backgroundColor = "#fff0f3"; 
            tooltip.style.color = "#590d22";
            tooltip.style.padding = "10px 15px";
            tooltip.style.borderRadius = "15px";
            tooltip.style.fontWeight = "bold";
            tooltip.style.fontSize = "16px";
            tooltip.style.boxShadow = "0 4px 10px rgba(89, 13, 34, 0.3)";
            tooltip.style.border = "3px solid #ff4d6d";
            tooltip.style.opacity = "0"; 
            tooltip.style.pointerEvents = "none"; 
            tooltip.style.transition = "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)"; 
            tooltip.style.whiteSpace = "nowrap";
            tooltip.style.zIndex = "100";

            const tailOuter = document.createElement('div');
            tailOuter.style.position = "absolute";
            tailOuter.style.bottom = "-11px"; 
            tailOuter.style.left = "50%";
            tailOuter.style.transform = "translateX(-50%)";
            tailOuter.style.borderWidth = "8px 8px 0";
            tailOuter.style.borderStyle = "solid";
            tailOuter.style.borderColor = "#ff4d6d transparent transparent transparent";
            
            const tailInner = document.createElement('div');
            tailInner.style.position = "absolute";
            tailInner.style.bottom = "-7px"; 
            tailInner.style.left = "50%";
            tailInner.style.transform = "translateX(-50%)";
            tailInner.style.borderWidth = "6px 6px 0";
            tailInner.style.borderStyle = "solid";
            tailInner.style.borderColor = "#fff0f3 transparent transparent transparent";
            
            tooltip.appendChild(tailOuter);
            tooltip.appendChild(tailInner);
            wrapper.appendChild(tooltip);
            wrapper.appendChild(img);
            
            // Efectos visuales de agrandar y enseñar globo
            wrapper.onmouseover = () => {
                img.style.transform = "scale(1.03)";
                tooltip.style.opacity = "1";
                tooltip.style.transform = "translateX(-50%) translateY(-15px)";
            };
            wrapper.onmouseout = () => {
                img.style.transform = "scale(1)";
                tooltip.style.opacity = "0";
                tooltip.style.transform = "translateX(-50%) translateY(0px)";
            };
            img.style.transition = "transform 0.2s ease-in-out";

            cityScreen.appendChild(wrapper);
        }
    });
}

// Ejecutamos la función nada más cargar el juego
setupCityMap();

// Configuramos la pantalla del pasillo (Medac)
function setupApartmentScreen() {
    // Estilos del fondo de la pared
    apartmentScreen.style.backgroundImage = "url('assets/images/pared.png')"; 
    apartmentScreen.style.backgroundSize = "cover";
    apartmentScreen.style.backgroundPosition = "center";
    apartmentScreen.style.minHeight = "100vh";
    apartmentScreen.style.width = "100vw";
    apartmentScreen.style.padding = "0"; 
    apartmentScreen.style.position = "relative"; // Necesario para posicionar las puertas abajo
    
    // Estilos del contenedor de las puertas para alinearlas y separarlas
    const doorsContainer = document.getElementById('doors-container');
    if (doorsContainer) {
        doorsContainer.style.display = "flex";
        doorsContainer.style.justifyContent = "center";
        doorsContainer.style.alignItems = "flex-end"; // Alinea las puertas por su base
        doorsContainer.style.gap = "80px"; // Separación un poco mayor
        doorsContainer.style.position = "absolute"; 
        doorsContainer.style.bottom = "3%"; // Sube las puertas un poco para que no se corten
        doorsContainer.style.width = "100%"; // Asegura que sigan centradas
        doorsContainer.style.flexWrap = "wrap"; // Adaptable si la pantalla es estrecha
    }

    // Estilos y efectos visuales de cada puerta y su globo de texto
    const doorWrappers = document.querySelectorAll('.door-wrapper');
    doorWrappers.forEach(wrapper => {
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.position = "relative"; // Necesario para posicionar el globo
        
        // Obtener el nombre de la clase desde el atributo alt de la imagen
        const img = wrapper.querySelector('.door-img');
        const className = img.alt;
        
        // Crear el globo de texto (tooltip)
        const tooltip = document.createElement('div');
        tooltip.innerText = className;
        tooltip.style.position = "absolute";
        tooltip.style.bottom = "100%"; // Lo coloca justo por encima de la puerta
        tooltip.style.left = "50%";
        tooltip.style.transform = "translateX(-50%) translateY(0px)";
        tooltip.style.backgroundColor = "#fff0f3"; 
        tooltip.style.color = "#590d22";
        tooltip.style.padding = "10px 15px";
        tooltip.style.borderRadius = "15px";
        tooltip.style.fontWeight = "bold";
        tooltip.style.fontSize = "16px";
        tooltip.style.boxShadow = "0 4px 10px rgba(89, 13, 34, 0.3)";
        tooltip.style.border = "3px solid #ff4d6d";
        tooltip.style.opacity = "0"; // Oculto por defecto
        tooltip.style.pointerEvents = "none"; // Evita que interfiera con el clic de la puerta
        tooltip.style.transition = "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)"; // Animación de rebote suave
        tooltip.style.whiteSpace = "nowrap";
        tooltip.style.zIndex = "100";

        // Crear la colita del globo (triángulo apuntando hacia abajo)
        const tailOuter = document.createElement('div');
        tailOuter.style.position = "absolute";
        tailOuter.style.bottom = "-11px"; 
        tailOuter.style.left = "50%";
        tailOuter.style.transform = "translateX(-50%)";
        tailOuter.style.borderWidth = "8px 8px 0";
        tailOuter.style.borderStyle = "solid";
        tailOuter.style.borderColor = "#ff4d6d transparent transparent transparent";
        
        const tailInner = document.createElement('div');
        tailInner.style.position = "absolute";
        tailInner.style.bottom = "-7px"; 
        tailInner.style.left = "50%";
        tailInner.style.transform = "translateX(-50%)";
        tailInner.style.borderWidth = "6px 6px 0";
        tailInner.style.borderStyle = "solid";
        tailInner.style.borderColor = "#fff0f3 transparent transparent transparent";
        
        tooltip.appendChild(tailOuter);
        tooltip.appendChild(tailInner);
        wrapper.appendChild(tooltip);
        
        // Efecto hover para mostrar el globo con una animación de subida
        wrapper.onmouseover = () => {
            tooltip.style.opacity = "1";
            tooltip.style.transform = "translateX(-50%) translateY(-15px)"; // Sube un poco al aparecer
        };
        wrapper.onmouseout = () => {
            tooltip.style.opacity = "0";
            tooltip.style.transform = "translateX(-50%) translateY(0px)"; // Baja al desaparecer
        };
    });

    document.querySelectorAll('.door-img').forEach(img => {
        img.style.width = "220px"; // Puertas un poco más grandes
    });
}

// Inicializamos la pantalla del pasillo
setupApartmentScreen();

// --- NUEVO: Función para hacer arrastrable al profesor ---
function setupAvatarDrag() {
    const avatar = document.getElementById('teacher-avatar');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let currentTop = 0, currentLeft = 0;
    let fallTimeout = null;

    avatar.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault(); // Previene el comportamiento por defecto de arrastrar imágenes
        
        if (fallTimeout) clearTimeout(fallTimeout); // Detener la caída si lo agarramos en el aire

        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Pausar movimiento automático
        clearInterval(moveInterval);
        
        // Guardar posiciones estáticas iniciales para evitar saltos extraños
        currentTop = avatar.offsetTop;
        currentLeft = avatar.offsetLeft;

        avatar.style.top = currentTop + "px";
        avatar.style.left = currentLeft + "px";
        avatar.style.bottom = "auto"; // Anular el bottom original

        // Quitar la transición y cambiar cursor para un arrastre instantáneo
        avatar.style.transition = "none";

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Calcular la nueva posición de forma absoluta y limpia
        currentTop = currentTop - pos2;
        currentLeft = currentLeft - pos1;

        avatar.style.top = currentTop + "px";
        avatar.style.left = currentLeft + "px";
    }

    function closeDragElement() {
        // Detener el arrastre
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Calcular dónde está el "suelo" de la pantalla
        const screenHeight = document.getElementById('teacher-screen').clientHeight;
        const floorTop = screenHeight * 0.95 - avatar.clientHeight;
        
        // Animamos la caída usando top y un efecto de aceleración por gravedad
        avatar.style.transition = "top 0.4s cubic-bezier(0.5, 0, 1, 1)"; 
        avatar.style.top = floorTop + "px";
        
        // Una vez termine de caer al suelo (después de 400ms), restauramos el funcionamiento
        fallTimeout = setTimeout(() => {
            // Convertir left de píxeles a porcentaje para mantener su lógica original
            const screenWidth = document.getElementById('teacher-screen').clientWidth;
            const leftPercent = (avatar.offsetLeft / screenWidth) * 100;
            avatar.style.left = leftPercent + "%";

            avatar.style.transition = "left 3s ease-in-out";
            avatar.style.top = "";
            avatar.style.bottom = "5%";
            
            startTeacherMovement();
        }, 400);
    }
}

// Inicializar el sistema de arrastre
setupAvatarDrag();

// --- SISTEMA DE INVENTARIO Y TIENDA ---

function updateBuildingContent(buildingName) {
    const contentDiv = document.getElementById('building-content');
    const coinsDisplay = document.getElementById('coins-display');
    
    if (coinsDisplay) coinsDisplay.innerText = `Saldo: ${coins} €`;
    contentDiv.innerHTML = ''; // Limpiar contenido

    if (buildingName === 'MERCADONA' || buildingName === 'ZONA ESTE') {
        const isMercadona = buildingName === 'MERCADONA';
        const itemType = isMercadona ? 'food' : 'gift';
        const shopTitle = isMercadona ? '¡Bienvenido al Mercadona!' : '¡Tienda de Regalos!';

        let itemsHTML = '';
        for (const key in storeItems) {
            const item = storeItems[key];
            if (item.type !== itemType) continue; // Filtrar por tipo de tienda
            itemsHTML += `
                <div style="border: 3px solid #ffccd5; padding: 15px; border-radius: 15px; background: white; width: 180px; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 8px rgba(89,13,34,0.1);">
                    <img src="${item.image}" alt="${item.name}" style="width: ${item.id === 'pelota' ? '60px' : '100px'}; height: 100px; object-fit: contain; margin-bottom: 10px;">
                    <h4 style="margin: 0; font-size: 14px; color: #800f2f;">${item.name}</h4>
                    <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${item.price} €</p>
                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                        <label for="qty-${item.id}" style="font-size: 12px; color: #590d22;">Cant:</label>
                        <input type="number" id="qty-${item.id}" value="1" min="1" style="width: 50px; border-radius: 10px; border: 2px solid #ffccd5; padding: 3px; text-align: center; font-family: inherit;">
                    </div>
                    <button onclick="addToCart('${item.id}')" style="padding: 8px 15px; font-size: 14px; margin: 0; width: 100%;">Añadir</button>
                </div>
            `;
        }
        
        // Generar HTML del Carrito
        let cartHTML = '';
        let total = 0;
        let cartEmpty = true;
        for (const key in cart) {
            if (cart[key] > 0) {
                cartEmpty = false;
                const itemData = storeItems[key];
                const subtotal = itemData.price * cart[key];
                total += subtotal;
                cartHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dashed #ffccd5; padding-bottom: 8px;">
                        <span style="font-size: 14px; color: #590d22; text-align: left; flex: 1;">${itemData.name} (x${cart[key]})</span>
                        <span style="font-size: 14px; font-weight: bold; color: #800f2f; margin-right: 10px;">${subtotal} €</span>
                        <button onclick="removeFromCart('${key}')" style="background: transparent; border: none; color: #ff4d6d; cursor: pointer; padding: 0; margin: 0; box-shadow: none; font-size: 16px;">❌</button>
                    </div>
                `;
            }
        }

        if (cartEmpty) {
            cartHTML = `<p style="font-size: 14px; color: #590d22;">El carrito está vacío.</p>`;
        } else {
            cartHTML += `
                <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 16px; color: #800f2f;">
                    <span>TOTAL:</span>
                    <span>${total} €</span>
                </div>
                <button onclick="checkoutCart()" style="width: 100%; margin-top: 15px; font-size: 16px; background-color: #8bc34a; border-color: #689f38;">Comprar Todo</button>
            `;
        }
        
        contentDiv.innerHTML = `
            <div style="display: flex; gap: 30px; width: 100%; max-width: 1100px; justify-content: center; align-items: flex-start; text-align: left; margin-top: 10px;">
                <!-- Productos -->
                <div style="flex: 1; min-width: 60%;">
                    <h3 style="margin-top: 0; text-align: center; color: #ff4d6d; background: rgba(255, 240, 243, 0.9); padding: 10px; border-radius: 15px; border: 3px solid #ffccd5;">${shopTitle}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; max-height: 55vh; overflow-y: auto; padding: 10px; background: rgba(255, 255, 255, 0.5); border-radius: 20px;">
                        ${itemsHTML}
                    </div>
                </div>
                <!-- Carrito -->
                <div style="width: 320px; background: white; border: 4px solid #ff4d6d; border-radius: 20px; padding: 20px; position: sticky; top: 20px; box-shadow: 0 8px 20px rgba(89, 13, 34, 0.2);">
                    <h3 style="margin-top: 0; text-align: center; color: #ff4d6d; border-bottom: 2px dashed #ffb3c1; padding-bottom: 10px;">🛒 Carrito</h3>
                    ${cartHTML}
                </div>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `<p style="color: #590d22; font-weight: bold; font-size: 18px; background: rgba(255,255,255,0.8); padding: 10px 20px; border-radius: 10px;">Actualmente no hay nada que hacer aquí. Dirígete al tranvibús si quieres que los profesores se desplacen.</p>`;
    }
}

function addToCart(itemId) {
    const qtyInput = document.getElementById(`qty-${itemId}`);
    let qty = 1;
    if (qtyInput) {
        qty = parseInt(qtyInput.value) || 1;
    }
    if (qty < 1) qty = 1;
    
    if (!cart[itemId]) cart[itemId] = 0;
    cart[itemId] += qty;
    updateBuildingContent(currentBuilding);
}

function removeFromCart(itemId) {
    delete cart[itemId];
    updateBuildingContent(currentBuilding);
}

function checkoutCart() {
    let total = 0;
    for (const key in cart) {
        total += storeItems[key].price * cart[key];
    }
    if (total === 0) {
        showCustomAlert("El carrito está vacío.");
        return;
    }
    if (coins >= total) {
        coins -= total;
        for (const key in cart) {
            inventory[key] += cart[key];
        }
        cart = {}; // Vaciar carrito
        updateBuildingContent(currentBuilding);
        showCustomAlert(`¡Compra realizada con éxito por ${total} €!`);
    } else {
        showCustomAlert(`No tienes suficientes euros. Te faltan ${total - coins} €.`);
    }
}

function updateInventoryUI() {
    const foodBar = document.getElementById('inventory-food-bar');
    const giftBar = document.getElementById('inventory-gift-bar');
    if(!foodBar || !giftBar) return;
    
    foodBar.innerHTML = ''; // Limpiar inventario de comida
    giftBar.innerHTML = ''; // Limpiar inventario de regalos
    let hasFood = false;
    let hasGifts = false;
    
    for (const key in inventory) {
        if (inventory[key] > 0) {
            const itemData = storeItems[key];
            const itemHTML = `
                <div class="inv-item" draggable="true" ondragstart="drag(event)" data-item="${key}" style="display: flex; flex-direction: column; align-items: center; background: white; border: 3px solid #ffccd5; border-radius: 10px; padding: 10px; width: 85px;">
                    <img src="${itemData.image}" alt="${itemData.name}" style="width: 60px; height: 60px; object-fit: contain; pointer-events: none;">
                    <span style="font-weight: bold; color: #590d22; margin-top: 5px;">${inventory[key]}</span>
                </div>
            `;
            
            if (itemData.type === 'food') {
                foodBar.innerHTML += itemHTML;
                hasFood = true;
            } else if (itemData.type === 'gift') {
                giftBar.innerHTML += itemHTML;
                hasGifts = true;
            }
        }
    }
    
    if (!hasFood) {
        foodBar.innerHTML = '<p style="color: #590d22; font-size: 14px; margin: 0;">No tienes comida.</p>';
    }
    if (!hasGifts) {
        giftBar.innerHTML = '<p style="color: #590d22; font-size: 14px; margin: 0;">No tienes regalos.</p>';
    }
}

function drag(ev) {
    // Busca el elemento padre que tiene la clase inv-item por si pulsamos en el emoji (texto) en lugar del div
    const target = ev.target.closest('.inv-item');
    if (target) {
        ev.dataTransfer.setData("text", target.dataset.item);
    }
}

function allowDropFood(ev) {
    ev.preventDefault();
}

function dropFood(ev) {
    ev.preventDefault();
    const item = ev.dataTransfer.getData("text");
    
    if (item && inventory[item] !== undefined && inventory[item] > 0) {
        inventory[item]--;
        updateInventoryUI();
        
        const itemData = storeItems[item];
        
        // Sistema de gustos aleatorio (70% le gusta, 30% no le gusta)
        const likesIt = Math.random() > 0.3;
        let rewardCoins = 0;
        
        if (likesIt) {
            teachersData[currentTeacher].hunger = Math.max(0, teachersData[currentTeacher].hunger - itemData.hunger);
            teachersData[currentTeacher].happiness = Math.min(100, teachersData[currentTeacher].happiness + itemData.happiness);
            
            // Sistema de recompensas: Te dan el valor del objeto + un 50% de bonificación
            rewardCoins = Math.floor(itemData.price * 1.5);
            coins += rewardCoins;
            
            // Animación del dinero flotante
            const avatar = document.getElementById('teacher-avatar');
            const floatingMoney = document.createElement('div');
            floatingMoney.innerText = `+${rewardCoins} €`;
            floatingMoney.className = 'floating-money';
            
            // Inicia por encima de la cabeza del profesor
            floatingMoney.style.left = '50%';
            floatingMoney.style.top = '-20px';
            avatar.appendChild(floatingMoney);
            
            // Lo eliminamos cuando termine la animación
            setTimeout(() => { if (floatingMoney.parentNode) floatingMoney.parentNode.removeChild(floatingMoney); }, 1500);
        } else {
            // Si no le gusta, recupera menos hambre y pierde un poco de felicidad
            teachersData[currentTeacher].hunger = Math.max(0, teachersData[currentTeacher].hunger - Math.floor(itemData.hunger / 2));
            teachersData[currentTeacher].happiness = Math.max(0, teachersData[currentTeacher].happiness - 10);
        }
        
        if (itemData.type === 'gift') {
            currentGift = item;
        }

        updateTeacherUI();

        // Mensaje del profesor
        const bubble = document.getElementById('teacher-bubble');
        const bubbleText = document.getElementById('teacher-bubble-text');
        if (bubble && bubbleText) {
            const phrases = likesIt ? itemData.msgLike : itemData.msgDislike;
            let phrase = phrases[Math.floor(Math.random() * phrases.length)];
            
            bubbleText.innerText = phrase;
            bubble.style.opacity = "1";
            setTimeout(() => { if (bubble) bubble.style.opacity = "0"; }, 3000);
        }
    }
}

// --- Sistema de deterioro progresivo de estadísticas ---
// Cada 15 segundos su felicidad bajará y su hambre subirá un poquito
setInterval(() => {
    let uiNeedsUpdate = false;
    for (const t in teachersData) {
        if (teachersData[t].happiness > 0) {
            teachersData[t].happiness = Math.max(0, teachersData[t].happiness - 1);
            uiNeedsUpdate = true;
        }
        if (teachersData[t].hunger < 100) {
            teachersData[t].hunger = Math.min(100, teachersData[t].hunger + 1);
            uiNeedsUpdate = true;
        }
    }
    // Si estamos en la habitación de un profesor, la barra se bajará en directo
    if (currentTeacher && uiNeedsUpdate) {
        updateTeacherUI();
    }
}, 15000); 

// ==========================================
// SISTEMA DE SELECCIÓN DE CUARTO
// ==========================================
function openRoomSelector() {
    let modal = document.getElementById('room-selector-modal');
    // Destruye el menú antiguo si existía, para que pueda recalcular las opciones correctamente
    if (modal) {
        modal.remove();
    }
    
    modal = document.createElement('div');
    modal.id = 'room-selector-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(89, 13, 34, 0.6)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff0f3';
    modalContent.style.border = '4px solid #ff4d6d';
    modalContent.style.borderRadius = '20px';
    modalContent.style.padding = '30px';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxShadow = '0 8px 20px rgba(89, 13, 34, 0.4)';
    modalContent.style.maxWidth = '80%';
    
    const title = document.createElement('h2');
    title.innerText = 'Elige un nuevo fondo para la clase';
    title.style.color = '#ff4d6d';
    title.style.marginTop = '0';
    
    const bgs = [
        { id: 'clase.jpg', name: 'Original' },
        { id: 'fondo2.jpg', name: 'SMR' },
        { id: 'fondo3.jpg', name: 'Entrada' },
        { id: 'fondo4.jpg', name: 'Gimnasio' },
        { id: 'fondo5.jpg', name: 'Otro' }
    ];
    
    // Averigua el fondo que tiene puesto ahora mismo o, si no tiene, asume que es el original
    const currentBg = (currentTeacher && teachersData[currentTeacher] && teachersData[currentTeacher].background) ? teachersData[currentTeacher].background : 'clase.jpg';
    // Filtra la lista para no incluir el que ya está puesto
    const filteredBgs = bgs.filter(bg => bg.id !== currentBg);
    
    const grid = document.createElement('div');
    grid.style.display = 'flex';
    grid.style.gap = '15px';
    grid.style.justifyContent = 'center';
    grid.style.flexWrap = 'wrap';
    grid.style.marginBottom = '20px';
    
    filteredBgs.forEach((bg) => {
        const btn = document.createElement('button');
        btn.style.padding = '10px';
        btn.style.backgroundColor = 'white';
        btn.style.color = '#590d22';
        btn.style.border = '3px solid #ffccd5';
        btn.style.borderRadius = '15px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.fontSize = '14px';
        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.alignItems = 'center';
        btn.style.transition = 'transform 0.2s';
        
        // Mostramos la previsualización del fondo en miniatura
        btn.innerHTML = `<img src="assets/images/${bg.id}" alt="${bg.name}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 10px; margin-bottom: 8px;"><span>${bg.name}</span>`;

        btn.onmouseover = () => { btn.style.backgroundColor = '#ffccd5'; btn.style.transform = 'scale(1.05)'; };
        btn.onmouseout = () => { btn.style.backgroundColor = 'white'; btn.style.transform = 'scale(1)'; };
        btn.onclick = () => {
            changeRoomBackground(bg.id);
            modal.style.display = 'none';
        };
        grid.appendChild(btn);
    });
    
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Cancelar';
    closeBtn.style.backgroundColor = '#ff4d6d';
    closeBtn.style.color = 'white';
    closeBtn.style.border = '3px solid #ffccd5';
    closeBtn.style.padding = '10px 25px';
    closeBtn.style.borderRadius = '15px';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    
    modalContent.appendChild(title);
    modalContent.appendChild(grid);
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// ==========================================
// TUTORIAL PRINCIPAL (Estilo Tomodachi - Diapositivas)
// ==========================================
function showTutorial() {
    let modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.style.display = 'flex';
        return;
    }

    modal = document.createElement('div');
    modal.id = 'tutorial-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(89, 13, 34, 0.8)';
    modal.style.zIndex = '10020';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff0f3';
    modalContent.style.border = '6px solid #ff4d6d';
    modalContent.style.borderRadius = '25px';
    modalContent.style.padding = '30px';
    modalContent.style.width = '90%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    modalContent.style.fontFamily = 'inherit';

    function createRow(imgSrc, name, desc) {
        return `
            <div style="display: flex; align-items: center; gap: 15px; background: white; padding: 12px; border-radius: 12px; border: 2px dashed #ffb3c1; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <img src="${imgSrc}" alt="${name}" style="width: 80px; height: 80px; object-fit: contain; flex-shrink: 0; filter: drop-shadow(0 4px 6px rgba(89,13,34,0.2));">
                <div style="text-align: left;">
                    <h4 style="margin: 0 0 5px 0; color: #c9184a; font-size: 18px;">${name}</h4>
                    <p style="margin: 0; font-size: 15px; color: #590d22;">${desc}</p>
                </div>
            </div>
        `;
    }

    const slides = [
        {
            title: '✨ Bienvenido a Teacher Life ✨',
            subtitle: '¡Todo lo que necesitas saber para que tus profesores sean felices!',
            content: `
                <div style="text-align: center; margin-top: 0;">
                    <img src="assets/images/logo.png" style="max-width: 100%; max-height: 360px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(89,13,34,0.3)); margin-bottom: 5px;">
                    <p style="color: #590d22; font-size: 18px; line-height: 1.6; font-weight: bold;">
                        En este juego eres el encargado de cuidar a los profesores del centro. <br><br>
                        ¡Dales de comer, regálales cosas, llévalos de viaje y haz que no se estresen!
                    </p>
                </div>
            `
        },
        {
            title: '👤 Los Profesores y el Dinero 💰',
            subtitle: 'Mecánicas básicas',
            content: `
                <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; padding: 10px;">
                    <p style="margin:0;"><strong>1. Cuidando a los Profesores:</strong> En el edificio <strong>MEDAC</strong> podrás entrar a las aulas. Su felicidad y hambre bajarán con el tiempo, ¡<strong>arrastra objetos</strong> desde el inventario hacia ellos para mantenerlos contentos!</p>
                    <p style="margin:0;"><strong>2. Ganar Dinero:</strong> Comienzas con 200€. Si le das a un profesor algo que le gusta (una comida deliciosa o un buen regalo), te pagarán <strong>el coste del objeto + un 50% de beneficio extra</strong>. ¡Así te harás rico!</p>
                    <p style="margin:0;"><strong>3. Interacciones:</strong> Puedes hablar con ellos, girar la <strong>Ruleta</strong> para ver si dan descansito, arrastrarlos en el aire por la clase (¡se quejarán!), y cambiarles el fondo del aula.</p>
                </div>
            `
        },
        {
            title: '🏙️ ¿Qué hacer en la Ciudad?',
            subtitle: 'Explora y diviértete',
            content: `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${createRow('assets/images/medac.png', 'MEDAC', 'Edificio principal. Contiene el Pasillo con las puertas a las aulas de todos los profesores.')}
                    ${createRow('assets/images/mercadona.png', 'MERCADONA', 'Supermercado. Compra comida (pizzas, agua, chuches...) para que no pasen hambre.')}
                    ${createRow('assets/images/zona-este.png', 'ZONA ESTE', 'Tienda de regalos. Compra ordenadores, pelotas y regalos para subir rápidamente la felicidad.')}
                    ${createRow('assets/images/tranvibus.png', 'TRANVIBÚS', 'Estación de transporte. Sube de 1 a 4 profesores y llévalos de excursión para que pasen el rato juntos.')}
                    ${createRow('assets/images/palacio-congresos.png', 'PALACIO Y PLAZA', 'Destinos de excursión. Aquí los profes se pasearán, formarán grupitos de charla y tendrán diálogos muy divertidos.')}
                </div>
            `
        }
    ];

    let currentSlide = 0;

    function renderSlide() {
        modalContent.innerHTML = '';
        
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.borderBottom = '3px dashed #ffb3c1';
        header.style.paddingBottom = '15px';
        header.style.marginBottom = '20px';
        
        const title = document.createElement('h1');
        title.innerText = slides[currentSlide].title;
        title.style.color = '#c9184a';
        title.style.margin = '0 0 10px 0';
        title.style.fontSize = '32px';

        const subtitle = document.createElement('p');
        subtitle.innerText = slides[currentSlide].subtitle;
        subtitle.style.color = '#590d22';
        subtitle.style.fontSize = '18px';
        subtitle.style.margin = '0';
        subtitle.style.fontWeight = 'bold';

        header.appendChild(title);
        header.appendChild(subtitle);
        modalContent.appendChild(header);

        const contentDiv = document.createElement('div');
        contentDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        contentDiv.style.border = '3px solid #ffccd5';
        contentDiv.style.borderRadius = '15px';
        contentDiv.style.padding = '20px';
        contentDiv.style.marginBottom = '20px';
        contentDiv.style.color = '#590d22';
        contentDiv.style.fontSize = '16px';
        contentDiv.style.lineHeight = '1.6';
        contentDiv.innerHTML = slides[currentSlide].content;
        modalContent.appendChild(contentDiv);

        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'center';
        footer.style.marginTop = '20px';

        const prevBtn = document.createElement('button');
        prevBtn.innerText = '⬅️ Anterior';
        prevBtn.style.padding = '10px 20px';
        prevBtn.style.fontSize = '16px';
        prevBtn.style.fontWeight = 'bold';
        prevBtn.style.borderRadius = '20px';
        prevBtn.style.border = '3px solid #ffccd5';
        prevBtn.style.backgroundColor = currentSlide === 0 ? '#ffe5ec' : '#ff8fa3';
        prevBtn.style.color = currentSlide === 0 ? '#ffb3c1' : 'white';
        prevBtn.style.cursor = currentSlide === 0 ? 'default' : 'pointer';
        prevBtn.disabled = currentSlide === 0;
        if (currentSlide > 0) {
            prevBtn.onclick = () => {
                currentSlide--;
                renderSlide();
                if(typeof cursorSound !== 'undefined') {
                    cursorSound.currentTime = 0; 
                    cursorSound.play().catch(e=>e); 
                }
            };
        }

        const dotsContainer = document.createElement('div');
        dotsContainer.style.display = 'flex';
        dotsContainer.style.gap = '8px';
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = idx === currentSlide ? '#ff4d6d' : '#ffccd5';
            dotsContainer.appendChild(dot);
        });

        const nextBtn = document.createElement('button');
        const isLast = currentSlide === slides.length - 1;
        nextBtn.innerText = isLast ? '¡A jugar! 🎮' : 'Siguiente ➡️';
        nextBtn.style.padding = '10px 20px';
        nextBtn.style.fontSize = '16px';
        nextBtn.style.fontWeight = 'bold';
        nextBtn.style.borderRadius = '20px';
        nextBtn.style.border = isLast ? '4px solid #689f38' : '3px solid #ffccd5';
        nextBtn.style.backgroundColor = isLast ? '#8bc34a' : '#ff4d6d';
        nextBtn.style.color = 'white';
        nextBtn.style.cursor = 'pointer';
        nextBtn.onclick = () => {
            if (isLast) {
                modal.style.display = 'none';
            } else {
                currentSlide++;
                renderSlide();
            }
            if(typeof cursorSound !== 'undefined') {
                cursorSound.currentTime = 0; 
                cursorSound.play().catch(e=>e); 
            }
        };

        footer.appendChild(prevBtn);
        footer.appendChild(dotsContainer);
        footer.appendChild(nextBtn);
        modalContent.appendChild(footer);
    }

    renderSlide();
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function changeRoomBackground(bgImage) {
    if (currentTeacher && teachersData[currentTeacher]) {
        teachersData[currentTeacher].background = bgImage;
    }
    const gameArea = document.getElementById('game-area');
    const teacherScreen = document.getElementById('teacher-screen'); // compatibilidad para código antiguo y otras interfaces
    if (gameArea) {
        gameArea.style.backgroundImage = `url('assets/images/${bgImage}')`;
    }
    // Parche para script.js antiguo que ponía el fondo en el teacher-screen
    if (teacherScreen && teacherScreen.style.backgroundImage.includes('.jpg')) {
        teacherScreen.style.backgroundImage = `url('assets/images/${bgImage}')`;
    }
}

// ==========================================
// SISTEMA DE RULETA DE DESCANSITO
// ==========================================
const rouletteConfig = {
    'LENGUAJE DE MARCAS': { // Oskar (Todo Sí menos un No)
        slices: [
            { text: 'Sí', color: '#ff758f', msg: '¡Qué bien, vamos a descansar! Tienes 30 segundos.' },
            { text: 'Sí', color: '#ff4d6d', msg: '¡Qué bien, vamos a descansar! Tienes 30 segundos.' },
            { text: 'Sí', color: '#ff758f', msg: '¡Qué bien, vamos a descansar! Tienes 30 segundos.' },
            { text: 'Sí', color: '#ff4d6d', msg: '¡Qué bien, vamos a descansar! Tienes 30 segundos.' },
            { text: 'Sí', color: '#ff758f', msg: '¡Qué bien, vamos a descansar! Tienes 30 segundos.' },
            { text: 'Sí', color: '#ff4d6d', msg: '¡Qué bien, vamos a descansar! Tienes 30 segundos.' },
            { text: 'Sí', color: '#ff758f', msg: '¡Qué bien, vamos a descansar! Tienes 30 segundos.' },
            { text: 'No', color: '#a4133c', msg: 'Hoy Oskar no estaba de humor.' }
        ]
    },
    'ENTORNOS DE DESARROLLO': { // Mari Carmen (Sí y Preguntadle a Luis)
        slices: [
            { text: 'Sí', color: '#ff758f', msg: '¡Qué bien! Aunque vamos a darnos prisa antes de que venga Luis.' },
            { text: 'Luis dirá', color: '#ffb3c1', msg: 'No.' },
            { text: 'Sí', color: '#ff4d6d', msg: '¡Qué bien! Aunque vamos a darnos prisa antes de que venga Luis.' },
            { text: 'Luis dirá', color: '#ffb3c1', msg: 'No.' },
            { text: 'Sí', color: '#ff758f', msg: '¡Qué bien! Aunque vamos a darnos prisa antes de que venga Luis.' },
            { text: 'Luis dirá', color: '#ffb3c1', msg: 'No.' },
            { text: 'Sí', color: '#ff4d6d', msg: '¡Qué bien! Aunque vamos a darnos prisa antes de que venga Luis.' },
            { text: 'Luis dirá', color: '#ffb3c1', msg: 'No.' }
        ]
    },
    'SISTEMAS INFORMÁTICOS': { // Luis (Todo No menos un Sí)
        slices: [
            { text: 'Sí', color: '#ff758f', msg: '¡Los astros se han alineado! Oleeee corre al descansito tienes 30 segundos.' },
            { text: 'No', color: '#a4133c', msg: 'Otro día será...' },
            { text: 'No', color: '#c9184a', msg: 'Otro día será...' },
            { text: 'No', color: '#a4133c', msg: 'Otro día será...' },
            { text: 'No', color: '#c9184a', msg: 'Otro día será...' },
            { text: 'No', color: '#a4133c', msg: 'Otro día será...' },
            { text: 'No', color: '#c9184a', msg: 'Otro día será...' },
            { text: 'No', color: '#a4133c', msg: 'Otro día será...' }
        ]
    },
    'BASE DE DATOS': { // Juan (Configuración Estándar)
        slices: [
            { text: 'Sí', color: '#ff758f', msg: '¡Oleeee corre al descansito tienes 30 segundos!' },
            { text: 'No', color: '#a4133c', msg: 'Otro día será...' },
            { text: 'Sí', color: '#ff4d6d', msg: '¡Oleeee corre al descansito tienes 30 segundos!' },
            { text: 'No', color: '#c9184a', msg: 'Otro día será...' },
            { text: 'Sí', color: '#ff758f', msg: '¡Oleeee corre al descansito tienes 30 segundos!' },
            { text: 'No', color: '#a4133c', msg: 'Otro día será...' },
            { text: 'Sí', color: '#ff4d6d', msg: '¡Oleeee corre al descansito tienes 30 segundos!' },
            { text: 'No', color: '#c9184a', msg: 'Otro día será...' }
        ]
    }
};

function openRoulette() {
    let modal = document.getElementById('roulette-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'roulette-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(89, 13, 34, 0.6)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff0f3';
    modalContent.style.border = '4px solid #ff4d6d';
    modalContent.style.borderRadius = '20px';
    modalContent.style.padding = '30px';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxShadow = '0 8px 20px rgba(89, 13, 34, 0.4)';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    modalContent.style.alignItems = 'center';
    
    const title = document.createElement('h2');
    title.innerText = '¿Dará el descansito hoy?';
    title.style.color = '#ff4d6d';
    title.style.marginTop = '0';
    title.style.marginBottom = '10px';
    
    const config = rouletteConfig[currentTeacher] || rouletteConfig['BASE DE DATOS'];
    const slices = config.slices;
    
    const numSlices = slices.length;
    const sliceAngle = 360 / numSlices;
    
    let gradientParts = [];
    slices.forEach((slice, i) => {
        const start = i * sliceAngle;
        const end = (i + 1) * sliceAngle;
        gradientParts.push(`${slice.color} ${start}deg ${end}deg`);
    });
    
    const wheelContainer = document.createElement('div');
    wheelContainer.style.position = 'relative';
    wheelContainer.style.width = '300px';
    wheelContainer.style.height = '300px';
    wheelContainer.style.margin = '20px 0';
    
    const wheel = document.createElement('div');
    wheel.id = 'roulette-wheel';
    wheel.style.width = '100%';
    wheel.style.height = '100%';
    wheel.style.borderRadius = '50%';
    wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    wheel.style.border = '5px solid #590d22';
    wheel.style.position = 'absolute';
    wheel.style.transition = 'transform 4s cubic-bezier(0.33, 1, 0.68, 1)';
    wheel.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
    
    slices.forEach((slice, i) => {
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = '50%';
        label.style.left = '50%';
        label.style.width = '50%'; 
        label.style.height = '20px';
        label.style.marginTop = '-10px';
        label.style.transformOrigin = '0 50%';
        const angle = (i * sliceAngle) + (sliceAngle / 2) - 90;
        label.style.transform = `rotate(${angle}deg)`;
        label.style.textAlign = 'right';
        label.style.paddingRight = '15px';
        label.style.fontWeight = 'bold';
        label.style.color = 'white';
        label.style.textShadow = '1px 1px 2px black';
        label.style.fontSize = '14px';
        label.style.boxSizing = 'border-box';
        label.innerText = slice.text;
        wheel.appendChild(label);
    });
    
    const pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.top = '-15px';
    pointer.style.left = '50%';
    pointer.style.transform = 'translateX(-50%)';
    pointer.style.width = '0';
    pointer.style.height = '0';
    pointer.style.borderLeft = '15px solid transparent';
    pointer.style.borderRight = '15px solid transparent';
    pointer.style.borderTop = '30px solid #590d22';
    pointer.style.zIndex = '10';
    pointer.style.filter = 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))';
    
    wheelContainer.appendChild(wheel);
    wheelContainer.appendChild(pointer);
    
    const spinBtn = document.createElement('button');
    spinBtn.innerText = '¡Girar!';
    spinBtn.style.padding = '10px 25px';
    spinBtn.style.fontSize = '18px';
    spinBtn.style.fontWeight = 'bold';
    spinBtn.style.backgroundColor = '#ff4d6d';
    spinBtn.style.color = 'white';
    spinBtn.style.border = '3px solid #c9184a';
    spinBtn.style.borderRadius = '15px';
    spinBtn.style.cursor = 'pointer';
    spinBtn.style.marginBottom = '15px';
    spinBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
    
    let isSpinning = false;
    let currentRotation = 0;
    
    spinBtn.onclick = () => {
        if (isSpinning) return;
        isSpinning = true;
        
        const spins = 5; 
        const targetSlice = Math.floor(Math.random() * numSlices);
        const randomOffsetInsideSlice = Math.floor(Math.random() * (sliceAngle - 4)) + 2; 
        
        const targetAngleOnWheel = (targetSlice * sliceAngle) + randomOffsetInsideSlice;
        
        const baseRotations = Math.floor(currentRotation / 360) * 360;
        const newRotation = baseRotations + (360 * spins) + (360 - targetAngleOnWheel);
        
        wheel.style.transform = `rotate(${newRotation}deg)`;
        currentRotation = newRotation;
        
        setTimeout(() => {
            isSpinning = false;
            showCustomAlert(slices[targetSlice].msg);
        }, 4000); 
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Cerrar';
    closeBtn.style.backgroundColor = '#ff4d6d';
    closeBtn.style.color = 'white';
    closeBtn.style.border = '3px solid #ffccd5';
    closeBtn.style.padding = '10px 25px';
    closeBtn.style.borderRadius = '15px';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    
    modalContent.appendChild(title);
    modalContent.appendChild(wheelContainer);
    modalContent.appendChild(spinBtn);
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}