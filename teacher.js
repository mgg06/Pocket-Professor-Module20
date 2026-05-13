// ==========================================
// SISTEMA DE LOS PROFESORES Y SUS ACCIONES
// ==========================================
function updateTeacherUI() {
    const data = teachersData[currentTeacher];
    document.getElementById('teacher-name').innerText = currentTeacher;
    document.getElementById('teacher-title-display').innerText = `${data.name} - ${currentTeacher}`;
    
    const avatarImg = document.getElementById('avatar-img');
    if (avatarImg) avatarImg.src = data.image;

    const giftContainer = document.getElementById('gift-container');
    const avatarContainer = document.getElementById('teacher-avatar');

    if (currentGift && storeItems[currentGift]) {
        const giftWidth = currentGift === 'pelota' ? '70px' : '120px';
        giftContainer.innerHTML = `<img id="active-gift" src="${storeItems[currentGift].image}" style="width: ${giftWidth}; filter: drop-shadow(0px 5px 5px rgba(89,13,34,0.3)); animation: bounceGift 0.8s infinite alternate ease-in-out;">`;
        giftContainer.style.bottom = '12%';
        giftContainer.style.top = 'auto';
        giftContainer.style.left = avatarContainer.style.left || '50%';
        giftContainer.style.transform = 'translateX(70px)';
    } else {
        giftContainer.innerHTML = '';
    }

    const coinsDisplayMenu = document.getElementById('teacher-coins-display');
    if(coinsDisplayMenu) coinsDisplayMenu.innerText = coins;

    document.getElementById('happiness-bar').style.width = data.happiness + "%";
    document.getElementById('hunger-bar').style.width = data.hunger + "%";
}

function talkToTeacher() {
    const container = document.getElementById('talk-options-container');
    const list = document.getElementById('talk-options-list');
    const foodContainer = document.getElementById('inventory-food-container');
    const giftContainer = document.getElementById('inventory-gift-container');

    // Si el menú ya estaba abierto, lo cerramos
    if (container.style.display === 'flex') {
        container.style.display = 'none';
        return;
    }

    // Ocultamos los otros menús
    if (foodContainer) foodContainer.style.display = 'none';
    if (giftContainer) giftContainer.style.display = 'none';

    list.innerHTML = '';
    const shuffled = talkOptions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    selected.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.text;
        btn.style.margin = '0';
        btn.style.fontSize = '12px'; // Texto un poco más pequeño para caber bien
        btn.style.padding = '10px';
        btn.onclick = () => selectTalkOption(opt);
        list.appendChild(btn);
    });
    container.style.display = 'flex';
}

function closeTalkOptions() { document.getElementById('talk-options-container').style.display = 'none'; }

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

function startTeacherMovement() {
    const avatar = document.getElementById('teacher-avatar');
    if(avatar) avatar.style.left = "50%";
    clearInterval(moveInterval);
    moveInterval = setInterval(() => {
        const currentLeft = parseFloat(avatar.style.left) || 50;
        const img = avatar.querySelector('img');
        const giftContainer = document.getElementById('gift-container');
        const giftImg = giftContainer ? giftContainer.querySelector('#active-gift') : null;
        
        if (!img) return;
        
        const actionRoll = Math.random(); // Tirada de dado para elegir acción (0 a 1)
        
        if (currentGift && actionRoll < 0.25) {
            // 25% de probabilidad: Juega con su juguete (animaciones especiales y frase)
            img.classList.add('playing');
            if (giftImg) giftImg.classList.add('playing-toy');
            
            const bubble = document.getElementById('teacher-bubble');
            const bubbleText = document.getElementById('teacher-bubble-text');
            if (bubble && bubbleText) {
                const itemData = storeItems[currentGift];
                const phrases = [
                    ...itemData.msgLike,
                    `¡Mira cómo uso mi ${itemData.name}!`,
                    `¡Esto es divertidísimo!`,
                    `¡No me canso de usar esto!`,
                    `¡El mejor regalo del mundo!`,
                    `¡Wiii! ¡Mira, mira!`,
                    `¡Qué pasada de regalo!`
                ];
                bubbleText.innerText = phrases[Math.floor(Math.random() * phrases.length)];
                bubble.style.opacity = "1";
                setTimeout(() => { if (bubble) bubble.style.opacity = "0"; }, 3000);
            }
            setTimeout(() => { img.classList.remove('playing'); if(giftImg) giftImg.classList.remove('playing-toy'); }, 1500);
        } else if (actionRoll < 0.35) {
            // 10% de probabilidad: Da un pequeño salto en el sitio
            img.classList.add('jumping');
            setTimeout(() => { img.classList.remove('jumping'); }, 500);
        } else if (actionRoll < 0.40) {
            // 5% de probabilidad: Gira como una peonza
            img.classList.add('spinning');
            setTimeout(() => { img.classList.remove('spinning'); }, 600);
        } else if (actionRoll < 0.45) {
            // 5% de probabilidad: Se tambalea mareado
            img.classList.add('wobbling');
            setTimeout(() => { img.classList.remove('wobbling'); }, 500);
        } else if (actionRoll < 0.50) {
            // 5% de probabilidad: Asiente con la cabeza afirmando
            img.classList.add('nodding');
            setTimeout(() => { img.classList.remove('nodding'); }, 800);
        } else if (actionRoll < 0.55) {
            // 5% de probabilidad: Niega con la cabeza
            img.classList.add('shaking');
            setTimeout(() => { img.classList.remove('shaking'); }, 600);
        } else if (actionRoll < 0.65) {
            // 10% de probabilidad: Gira su dirección sin moverse del sitio
            const flip = img.style.getPropertyValue('--flip') === '-1' ? '1' : '-1';
            img.style.setProperty('--flip', flip);
        } else {
            // 35% de probabilidad: Camina a una nueva posición (comportamiento por defecto)
            const randomLeft = Math.floor(Math.random() * 70) + 15;
            if (randomLeft > currentLeft) img.style.setProperty('--flip', '-1'); else img.style.setProperty('--flip', '1'); 
            img.classList.add('walking');
            avatar.style.left = randomLeft + "%";
            if (giftContainer) giftContainer.style.left = randomLeft + "%";
            setTimeout(() => { img.classList.remove('walking'); }, 3000);
        }
    }, 4000);
}

function startBubbleSystem() {
    clearInterval(bubbleInterval);
    bubbleInterval = setInterval(() => {
        const bubble = document.getElementById('teacher-bubble');
        const bubbleText = document.getElementById('teacher-bubble-text');
        if (bubble && currentTeacher && Math.random() > 0.3) {
            const phrases = teachersData[currentTeacher].phrases;
            bubbleText.innerText = phrases[Math.floor(Math.random() * phrases.length)];
            bubble.style.opacity = "1";
            setTimeout(() => { if (bubble) bubble.style.opacity = "0"; }, 4000);
        }
    }, 6000);
}

function setupAvatarDrag() {
    const avatar = document.getElementById('teacher-avatar');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let currentTop = 0, currentLeft = 0;
    let fallTimeout = null;
    let dragPhraseInterval = null;

    window.dragMouseDown = function(e) { 
        e = e || window.event; 
        e.preventDefault(); 
        if (fallTimeout) clearTimeout(fallTimeout); 

        // Añadimos la animación de patalear/zarandearse
        const img = avatar.querySelector('img');
        if (img) img.classList.add('struggling');

        // El objeto (si lo tiene) se queda en el suelo
        const giftContainer = document.getElementById('gift-container');
        if (giftContainer) {
            giftContainer.style.transition = 'none';
        }

        pos3 = e.clientX; 
        pos4 = e.clientY;
        clearInterval(moveInterval);

        // Función para que el profesor se queje mientras está en el aire
        const sayPhrase = () => {
            const bubble = document.getElementById('teacher-bubble');
            const bubbleText = document.getElementById('teacher-bubble-text');
            if (bubble && bubbleText) {
                const specificDragPhrases = teachersData[currentTeacher].dragPhrases;
                let p = (specificDragPhrases && Math.random() < 0.4) ? specificDragPhrases[Math.floor(Math.random() * specificDragPhrases.length)] : dragPhrases[Math.floor(Math.random() * dragPhrases.length)];
                bubbleText.innerText = p;
                bubble.style.opacity = "1";
                setTimeout(() => { if (bubble) bubble.style.opacity = "0"; }, 2000);
            }
        };
        
        sayPhrase(); // Dice algo justo al agarrarlo
        dragPhraseInterval = setInterval(sayPhrase, 3000); // Y luego sigue quejándose

        currentTop = avatar.offsetTop; 
        currentLeft = avatar.offsetLeft;
        avatar.style.top = currentTop + "px"; 
        avatar.style.left = currentLeft + "px"; 
        avatar.style.bottom = "auto"; 
        
        avatar.style.transition = "none"; // Quita la animación para arrastre instantáneo
        
        document.onmouseup = closeDragElement; 
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event; 
        e.preventDefault();
        pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
        pos3 = e.clientX; pos4 = e.clientY;
        currentTop = currentTop - pos2; currentLeft = currentLeft - pos1;

        // Barreras invisibles: Impide que se salga del recuadro de la clase
        const screenWidth = document.getElementById('game-area').clientWidth;
        const minLeft = screenWidth * 0.1; // Límite izquierdo (junto al menú)
        const maxLeft = screenWidth * 0.9; // Límite derecho
        
        if (currentLeft < minLeft) currentLeft = minLeft;
        if (currentLeft > maxLeft) currentLeft = maxLeft;

        avatar.style.top = currentTop + "px"; 
        avatar.style.left = currentLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null; 
        document.onmousemove = null;
        clearInterval(dragPhraseInterval);

        const img = avatar.querySelector('img');
        if (img) img.classList.remove('struggling');

        // Calculamos dónde está el suelo y lo hacemos caer hasta ahí
        const screenHeight = document.getElementById('game-area').clientHeight;
        const floorTop = screenHeight * 0.95 - avatar.clientHeight;
        avatar.style.top = floorTop + "px";
        avatar.style.transition = "top 0.4s cubic-bezier(0.5, 0, 1, 1)"; 

        const giftContainer = document.getElementById('gift-container');
        if (giftContainer) {
            giftContainer.style.transition = "left 0.4s ease-in-out";
            const screenWidth = document.getElementById('game-area').clientWidth;
            const leftPercent = (avatar.offsetLeft / screenWidth) * 100;
            giftContainer.style.left = leftPercent + "%";
        }

        // Cuando termina de caer (400ms después) se reanuda todo
        fallTimeout = setTimeout(() => {
            const screenWidth = document.getElementById('game-area').clientWidth;
            const leftPercent = (avatar.offsetLeft / screenWidth) * 100;
            avatar.style.left = leftPercent + "%";
            avatar.style.transition = "left 3s ease-in-out"; 
            avatar.style.top = ""; 
            avatar.style.bottom = "5%"; 
            
            if (giftContainer) {
                giftContainer.style.transition = "left 3s ease-in-out";
                giftContainer.style.left = leftPercent + "%";
            }

            startTeacherMovement();
        }, 400);
    }
}
setupAvatarDrag();

// Bucle global: Deterioro de estadísticas. Cada 15 segundos sube el hambre y baja la felicidad.
// Deterioro de estadísticas
setInterval(() => {
    let uiNeedsUpdate = false;
    for (const t in teachersData) {
        if (teachersData[t].happiness > 0) { teachersData[t].happiness = Math.max(0, teachersData[t].happiness - 1); uiNeedsUpdate = true; }
        if (teachersData[t].hunger < 100) { teachersData[t].hunger = Math.min(100, teachersData[t].hunger + 1); uiNeedsUpdate = true; }
    }
    if (currentTeacher && uiNeedsUpdate) updateTeacherUI();
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
    
    // Contenedor principal del minijuego
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

function changeRoomBackground(bgImage) {
    if (currentTeacher && teachersData[currentTeacher]) {
        teachersData[currentTeacher].background = bgImage;
    }
    const gameArea = document.getElementById('game-area');
    const teacherScreen = document.getElementById('teacher-screen'); // for script.js compatibility
    if (gameArea) {
        gameArea.style.backgroundImage = `url('assets/images/${bgImage}')`;
    }
    // Parche de retrocompatibilidad. Coloca el fondo en la interfaz anticuada teacher-screen por si carece de game-area.
    if (teacherScreen && teacherScreen.style.backgroundImage.includes('.jpg')) {
        teacherScreen.style.backgroundImage = `url('assets/images/${bgImage}')`;
    }
}

// ==========================================
// SISTEMA DE RULETA DE DESCANSITO
// ==========================================

// Base de datos que configura la ruleta según el profesor activo, determinando
// la probabilidad de sacar "Sí" o "No" al descanso.
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

/**
 * Abre la ventana modal de la Ruleta del Descansito.
 * Dibuja la ruleta de manera dinámica calculando los ángulos para cada trozo de la tarta (CSS conic-gradient).
 */
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
    
    // Analizamos qué profesor hay para saber cuánta probabilidad otorgarle de descansar
    const config = rouletteConfig[currentTeacher] || rouletteConfig['BASE DE DATOS'];
    const slices = config.slices;
    
    // Calculamos el valor en grados de cada porción (normalmente 8 porciones = 45º cada una)
    const numSlices = slices.length;
    const sliceAngle = 360 / numSlices;
    
    // Algoritmo para generar el degradado cónico que pinta las porciones circulares 
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
    
    // Pintamos el plato físico de la ruleta
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
    
    // Bucle para colocar el texto ("Sí", "No") perfectamente centrado de forma radial en su porción
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
    
    // Diseñamos con bordes CSS el triángulo (flecha selectora) que apunta hacia abajo
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
    
    // Variables de control de estado y acumulación del giro visual en el DOM
    let isSpinning = false;
    let currentRotation = 0;
    
    // Lógica central del giro (Se ejecuta al pulsar el botón "!Girar!")
    spinBtn.onclick = () => {
        if (isSpinning) return; // Antispam
        isSpinning = true;
        
        const spins = 5; // Da 5 vueltas completas como mínimo antes de pararse para crear suspense
        const targetSlice = Math.floor(Math.random() * numSlices); // Elige el trozo ganador al azar
        const randomOffsetInsideSlice = Math.floor(Math.random() * (sliceAngle - 4)) + 2; // Añade variedad dentro del trozo
        
        // Determina el ángulo exacto al que debe apuntar la flecha para declarar a ese trozo ganador
        const targetAngleOnWheel = (targetSlice * sliceAngle) + randomOffsetInsideSlice;
        
        // Le sumamos a las rotaciones previas todo el giro extra. Así la rueda no vuelve al 0 bruscamente.
        const baseRotations = Math.floor(currentRotation / 360) * 360;
        const newRotation = baseRotations + (360 * spins) + (360 - targetAngleOnWheel);
        
        wheel.style.transform = `rotate(${newRotation}deg)`;
        currentRotation = newRotation;
        
        // Espera que la animación fluida termine (exactamente en 4 segundos)
        setTimeout(() => {
            isSpinning = false;
            // Dispara una alerta interactiva comunicando la frase incrustada del profesor
            showCustomAlert(slices[targetSlice].msg);
        }, 4000); 
    };
    
    // Botón tradicional para ocultar el minijuego de la UI
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