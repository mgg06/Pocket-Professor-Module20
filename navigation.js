// ==========================================
// MOTOR DE MEMORIA (EVITA REPETICIONES)
// ==========================================

/**
 * Función global que evita repetir elementos de un array de manera consecutiva.
 * Lo logra creando un "pool" barajado del que va extrayendo elementos uno a uno.
 */
if (!window.getUnrepeated) {
    window.getUnrepeated = function(array) {
        if (!array._pool || array._pool.length === 0) array._pool = [...array].sort(() => 0.5 - Math.random());
        return array._pool.pop();
    };
}

// ==========================================
// NAVEGACIÓN Y CAMBIO DE PANTALLAS
// ==========================================
/**
 * Oculta todas las interfaces principales añadiéndoles la clase CSS 'hidden'.
 */
function hideAllScreens() {
    introScreen.classList.add('hidden');
    cityScreen.classList.add('hidden');
    genericBuildingScreen.classList.add('hidden');
    apartmentScreen.classList.add('hidden');
    teacherScreen.classList.add('hidden');
    if (hangoutScreen) hangoutScreen.classList.add('hidden');
}

// Transición al hacer clic en "Empezar" en el menú principal
startBtn.addEventListener('click', () => {
    hideAllScreens();
    cityScreen.classList.remove('hidden');
    bgMusic.play().catch(err => console.log("Esperando interacción para reproducir audio", err));
    if (typeof showTutorial === 'function') showTutorial();
});

/**
 * Abre un edificio interactivo (Supermercado, Tienda, etc.)
 * Limpia el carrito y carga el fondo correspondiente.
 */
function openBuilding(buildingName) {
    currentBuilding = buildingName;
    cart = {}; // Limpiar carrito al entrar
    hideAllScreens();
    document.getElementById('building-title').innerText = buildingName;
    
    // Asigna dinámicamente la imagen de fondo según el lugar visitado
    let bgUrl = "none";
    switch (buildingName) {
        case 'MERCADONA': bgUrl = "url('assets/images/fondo-mercadona.png')"; break;
        case 'TRANVIBUS': bgUrl = "url('assets/images/tranvibus-fondo.jpg')"; break;
        case 'ZONA ESTE': bgUrl = "url('assets/images/zona-este-fondo.jpeg')"; break;
        case 'PALACIO DE CONGRESOS': bgUrl = "url('assets/images/palacio-congresos-fondo.jpg')"; break;
        case 'PLAZA': bgUrl = "url('assets/images/plaza-fondo.jpg')"; break;
    }
    
    genericBuildingScreen.style.backgroundImage = bgUrl;
    genericBuildingScreen.style.backgroundSize = "cover";
    genericBuildingScreen.style.backgroundPosition = "center";
    
    updateBuildingContent(buildingName);
    genericBuildingScreen.classList.remove('hidden');
}

/**
 * Cierra las pantallas activas y devuelve al jugador a la vista de la ciudad.
 */
function goBackToCity() {
    hideAllScreens();
    cityScreen.classList.remove('hidden');
}

/**
 * Permite entrar al aula del profesor indicado, inicializando su modelo, 
 * ciclos de movimiento y la ventana de diálogo.
 */
function visitTeacher(teacherName) {
    currentTeacher = teacherName;
    currentGift = null; 
    hideAllScreens();
    
    const gameArea = document.getElementById('game-area');
    const bg = teachersData[teacherName].background || 'clase.jpg';
    gameArea.style.backgroundImage = `url('assets/images/${bg}')`;
    gameArea.style.backgroundSize = "cover";
    gameArea.style.backgroundPosition = "center";

    teacherScreen.style.display = "flex";
    document.getElementById('talk-options-container').style.display = 'none';
    document.getElementById('inventory-food-container').style.display = 'none';
    document.getElementById('inventory-gift-container').style.display = 'none';
    updateInventoryUI();
    updateTeacherUI();
    teacherScreen.classList.remove('hidden');
    startTeacherMovement();
    startBubbleSystem();
}

/**
 * Sale del aula, limpiando en el proceso los bucles temporales para ahorrar memoria.
 */
function leaveTeacher() {
    currentTeacher = null;
    currentGift = null;
    hideAllScreens();
    clearInterval(moveInterval);
    clearInterval(bubbleInterval);
    document.getElementById('talk-options-container').style.display = 'none';
    apartmentScreen.classList.remove('hidden');
}

// ==========================================
// VIAJES Y QUEDADAS GRUPALES (HANGOUT)
// ==========================================

/**
 * Inicia la lógica de una excursión. Instancia a todos los profesores elegidos 
 * en el mismo escenario (Palacio o Plaza) y activa sus comportamientos sociales.
 */
function openHangout(teachers, destination) {
    hideAllScreens();
    
    let bgUrl = "none";
    if (destination === 'PALACIO DE CONGRESOS') {
        bgUrl = "url('assets/images/palacio-congresos-fondo.jpg')";
    } else if (destination === 'PLAZA') {
        bgUrl = "url('assets/images/plaza-fondo.jpg')"; 
    }
    
    hangoutScreen.style.backgroundImage = bgUrl;
    hangoutScreen.style.backgroundSize = "cover";
    hangoutScreen.style.backgroundPosition = "center";
    
    document.getElementById('hangout-title').innerText = destination;
    
    // Vaciamos el contenedor visual previo para evitar duplicados
    const avatarsContainer = document.getElementById('hangout-avatars-container');
    avatarsContainer.innerHTML = ''; 
    
    // Eliminamos inteligencias artificiales de excursiones anteriores
    hangoutIntervals.forEach(interval => clearInterval(interval));
    hangoutIntervals = [];
    
    // Generación iterativa del DOM para cada profesor en la excursión
    teachers.forEach((teacherName, index) => {
        const data = teachersData[teacherName];
        const avatarDiv = document.createElement('div');
        avatarDiv.id = `hangout-avatar-${teacherName}`;
        avatarDiv.style.position = 'absolute';
        const bottomPos = 5 + Math.random() * 15; // Profundidad aleatoria
        avatarDiv.style.bottom = bottomPos + '%'; 
        avatarDiv.style.left = (20 + (index * 20)) + '%';
        avatarDiv.style.transform = 'translateX(-50%)';
        avatarDiv.style.transition = 'left 3s ease-in-out';
        avatarDiv.style.display = 'flex';
        avatarDiv.style.flexDirection = 'column';
        avatarDiv.style.alignItems = 'center';
        avatarDiv.style.zIndex = Math.floor(100 - bottomPos); // Más abajo = más z-index
        
        const bubble = document.createElement('div');
        bubble.className = "bubble";
        bubble.style.cssText = "opacity: 0; pointer-events: none; transition: opacity 0.3s; background: #fff0f3; border: 3px solid #ff4d6d; border-radius: 15px; padding: 10px 15px; box-shadow: 0 4px 8px rgba(89, 13, 34, 0.3); margin-bottom: 15px; max-width: 220px; text-align: center; font-weight: bold; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); z-index: 60; font-size: 14px; color: #590d22;";
        bubble.innerHTML = `
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); border-width: 6px 6px 0; border-style: solid; border-color: #ff4d6d transparent transparent transparent;"></div>
            <span class="bubble-text" style="color: #590d22;"></span>
        `;
        
        const img = document.createElement('img');
        img.src = data.image;
        img.style.maxHeight = '200px'; 
        img.style.width = 'auto';
        img.style.transform = 'scaleX(var(--flip, 1))';
        img.style.transition = 'transform 0.4s';
        
        avatarDiv.appendChild(bubble);
        avatarDiv.appendChild(img);
        avatarsContainer.appendChild(avatarDiv);
        
        // --- SISTEMA DE ARRASTRE PARA LA EXCURSIÓN ---
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let currentTop = 0, currentLeft = 0;
        let dragPhraseInterval = null;
        let fallTimeout = null;
        
        // Previene conflicto con la lógica nativa de arrastre del navegador
        img.ondragstart = function() { return false; }; // Previene el error nativo del navegador al arrastrar
        
        // Evento que salta al agarrar con el ratón a un profesor en la excursión
        avatarDiv.onmousedown = function(e) {
            e = e || window.event; e.preventDefault();
            if (avatarDiv.getAttribute('data-conversing') === 'true') return; 
            if (fallTimeout) clearTimeout(fallTimeout);
            
            avatarDiv.setAttribute('data-dragging', 'true');
            img.classList.add('struggling');
            
            pos3 = e.clientX; pos4 = e.clientY;
            
            currentTop = avatarDiv.offsetTop;
            currentLeft = avatarDiv.offsetLeft;
            
            avatarDiv.style.top = currentTop + "px";
            avatarDiv.style.left = currentLeft + "px";
            avatarDiv.style.bottom = "auto";
            
            avatarDiv.style.transition = 'none';
            avatarDiv.style.zIndex = 1000;
            
            // Hace que suelten frases de queja mientras cuelgan
            const sayDragPhrase = () => {
                let p = (data.dragPhrases && Math.random() < 0.4) ? window.getUnrepeated(data.dragPhrases) : window.getUnrepeated(dragPhrases);
                bubble.querySelector('.bubble-text').innerText = p;
                bubble.style.opacity = "1";
                setTimeout(() => bubble.style.opacity = "0", 2000);
            };
            sayDragPhrase();
            dragPhraseInterval = setInterval(sayDragPhrase, 3000);
            
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };

        // Ejecución en bucle mientras deslizamos el ratón
        function elementDrag(e) {
            e = e || window.event; e.preventDefault();
            pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
            pos3 = e.clientX; pos4 = e.clientY;
            
            currentTop = currentTop - pos2;
            currentLeft = currentLeft - pos1;
            
            const screenWidth = hangoutScreen.clientWidth;
            const minLeft = screenWidth * 0.05;
            const maxLeft = screenWidth * 0.95;
            
            if (currentLeft < minLeft) currentLeft = minLeft;
            if (currentLeft > maxLeft) currentLeft = maxLeft;
            
            avatarDiv.style.top = currentTop + "px";
            avatarDiv.style.left = currentLeft + "px";
        }

        // Liberación del click
        function closeDragElement() {
            document.onmouseup = null; document.onmousemove = null;
            clearInterval(dragPhraseInterval);
            img.classList.remove('struggling');
            
            const screenHeight = hangoutScreen.clientHeight;
            const floorTop = screenHeight * 0.95 - avatarDiv.clientHeight;
            
            avatarDiv.style.transition = "top 0.4s cubic-bezier(0.5, 0, 1, 1)";
            avatarDiv.style.top = floorTop + "px";
            
            // Devolvemos el estado al profesor cuando choca con el suelo
            fallTimeout = setTimeout(() => {
                const screenWidth = hangoutScreen.clientWidth;
                avatarDiv.style.left = ((avatarDiv.offsetLeft / screenWidth) * 100) + "%";
                avatarDiv.style.transition = "left 3s ease-in-out";
                avatarDiv.style.top = "";
                const randomDepth = 5 + Math.random() * 15;
                avatarDiv.style.bottom = randomDepth + "%";
                avatarDiv.style.zIndex = Math.floor(100 - randomDepth);
                avatarDiv.removeAttribute('data-dragging');
            }, 400);
        }

        // --- SISTEMA DE INTELIGENCIA Y MOVIMIENTO ---
        
        /**
         * Cerebro de la excursión: Define en intervalos si el avatar andará, 
         * charlará con otro, correrá o hará alguna animación.
         */
        const moveInterval = setInterval(() => {
            if (avatarDiv.getAttribute('data-dragging') === 'true') return;
            if (avatarDiv.getAttribute('data-conversing') === 'true') return; // Está atrapado en una conversación grupal

            const currentLeft = parseFloat(avatarDiv.style.left) || 50;
            const otherTeachers = teachers.filter(t => t !== teacherName);
            const isSolo = otherTeachers.length === 0;

            // Calcular probabilidad ajustada para que no saturen si hay 4 personas
            let actionRoll = Math.random();
            if (teachers.length === 4) actionRoll += 0.2; // Menos acciones individuales
            if (teachers.length === 3) actionRoll += 0.1;
            
            let conversing = false;

            // 1. INTENTAR CONVERSACIÓN GRUPAL (Solo si no está solo y saca buena tirada)
            if (!isSolo && actionRoll < 0.30) {
                let shuffledOthers = [...otherTeachers].sort(() => 0.5 - Math.random());
                let convSize = Math.floor(Math.random() * (teachers.length - 1)) + 2; // Grupo de 2, 3 o 4
                
                let participants = [teacherName];
                for(let i=0; i < convSize-1; i++) { participants.push(shuffledOthers[i]); }
                
                // Comprobar que TODOS los seleccionados están libres
                let allFree = participants.every(p => {
                    let pDiv = document.getElementById(`hangout-avatar-${p}`);
                    return pDiv && pDiv.getAttribute('data-conversing') !== 'true' && pDiv.getAttribute('data-dragging') !== 'true';
                });

                if (allFree) {
                    conversing = true;
                    participants.forEach(p => document.getElementById(`hangout-avatar-${p}`).setAttribute('data-conversing', 'true'));
                    
                    // Cargar un guión de conversación apropiado para la cantidad de personas libres
                    let seq = [];
                    if (participants.length === 4 && hangoutDialogues4.length > 0) {
                        seq = hangoutDialogues4[Math.floor(Math.random() * hangoutDialogues4.length)];
                    } else if (participants.length >= 3 && hangoutDialogues3.length > 0) {
                        seq = hangoutDialogues3[Math.floor(Math.random() * hangoutDialogues3.length)];
                        participants = participants.slice(0, 3);
                    } else {
                        seq = hangoutDialogues2[Math.floor(Math.random() * hangoutDialogues2.length)];
                        participants = participants.slice(0, 2);
                    }

                    let delay = 0;
                    // Lectura coordinada del diálogo (espera sus turnos midiendo el 'time')
                    seq.forEach((step) => {
                        setTimeout(() => {
                            let speakerName = participants[step.s];
                            let speakerDiv = document.getElementById(`hangout-avatar-${speakerName}`);
                            if (speakerDiv) {
                                let speakerImg = speakerDiv.querySelector('img');
                                let speakerBubble = speakerDiv.querySelector('.bubble');
                                let speakerBubbleText = speakerBubble.querySelector('.bubble-text');
                                
                                // Sustituir los {0}, {1} por nombres reales
                                let text = step.t;
                                for(let i=0; i<participants.length; i++) {
                                    text = text.replace(new RegExp(`\\{${i}\\}`, 'g'), teachersData[participants[i]].name);
                                }
                                speakerBubbleText.innerText = text;
                                speakerBubble.style.opacity = "1";
                                setTimeout(() => speakerBubble.style.opacity = "0", step.time - 300);
                                
                                if (speakerImg) {
                                    speakerImg.classList.add('nodding');
                                    setTimeout(() => speakerImg.classList.remove('nodding'), 600);
                                }
                            }
                        }, delay);
                        delay += step.time;
                    });
                    
                    // Liberarlos tras la charla
                    setTimeout(() => {
                        participants.forEach(p => {
                            let pDiv = document.getElementById(`hangout-avatar-${p}`);
                            if(pDiv) pDiv.removeAttribute('data-conversing');
                        });
                    }, delay);
                    return; // Termina el turno
                }
            }

            // 2. LÓGICA DE MOVIMIENTO INDIVIDUAL Y EVITAR CHOCAR
            if (!conversing) {
                let animClass = "";
                let animDuration = 0;
                let phrase = "";

                if (actionRoll < 0.35 && !isSolo) {
                    animClass = 'dancing'; animDuration = 2000;
                    phrase = ["¡A mover el esqueleto!", "¡Ritmo, ritmo!"][Math.floor(Math.random()*2)];
                } else if (actionRoll < 0.45) {
                    animClass = 'sitting'; animDuration = 3000;
                } else if (actionRoll < 0.55 && !isSolo) {
                    animClass = 'running'; animDuration = 1500;
                    phrase = "¡A que no me pillas!";
                    const newLeft = Math.floor(Math.random() * 75) + 12; // Posición aleatoria
                    if (newLeft > currentLeft) img.style.setProperty('--flip', '-1'); else img.style.setProperty('--flip', '1'); 
                    avatarDiv.style.transition = 'left 1.5s linear'; // Lo hace moverse más rápido para simular carrera
                    avatarDiv.style.left = newLeft + "%";
                    setTimeout(() => { if (avatarDiv && avatarDiv.getAttribute('data-dragging') !== 'true') avatarDiv.style.transition = 'left 3s ease-in-out'; }, 1500); // Restaura la velocidad base si no lo están arrastrando
                } else if (actionRoll < 0.65) {
                    const flip = img.style.getPropertyValue('--flip') === '-1' ? '1' : '-1';
                    img.style.setProperty('--flip', flip);
                } else {
                    // CAMINAR ALEATORIAMENTE SIN BLOQUEARSE VISUALMENTE
                    const newLeft = Math.floor(Math.random() * 75) + 12; // De 12% a 87%

                    if (newLeft > currentLeft) img.style.setProperty('--flip', '-1'); else img.style.setProperty('--flip', '1'); 
                    
                    // COMPROBAR SI SE CRUZAN AL CAMINAR (CHOQUE)
                    let crossing = Array.from(document.querySelectorAll('[id^="hangout-avatar-"]')).some(av => {
                        if (av.id === avatarDiv.id) return false;
                        let otherLeft = parseFloat(av.style.left) || 50;
                        return (currentLeft < otherLeft && newLeft > otherLeft) || (currentLeft > otherLeft && newLeft < otherLeft);
                    });

                    if (crossing && !isSolo && Math.random() < 0.6) {
                        setTimeout(() => {
                            bubble.querySelector('.bubble-text').innerText = bumpPhrases[Math.floor(Math.random() * bumpPhrases.length)];
                            bubble.style.opacity = "1";
                            setTimeout(() => bubble.style.opacity = "0", 2000);
                        }, 1000);
                    }

                    img.classList.add('walking');
                    avatarDiv.style.left = newLeft + "%";
                    setTimeout(() => img.classList.remove('walking'), 3000);

                    // Frase ambiental ocasional o garantizada si está solo
                    if (isSolo || Math.random() < 0.3) { 
                        let envPhrases = destination === 'PALACIO DE CONGRESOS' ? soloPalacioPhrases : soloPlazaPhrases;
                        phrase = envPhrases[Math.floor(Math.random() * envPhrases.length)];
                    }
                }

                // Reproducir animación y frase suelta si la hubiera
                if (animClass) {
                    img.classList.add(animClass);
                    setTimeout(() => img.classList.remove(animClass), animDuration);
                }

                // Evita decir frases sueltas compulsivamente si el grupo es grande
                if (phrase !== "" && !isSolo && teachers.length <= 2) {
                    bubble.querySelector('.bubble-text').innerText = phrase;
                    bubble.style.opacity = "1";
                    setTimeout(() => bubble.style.opacity = "0", 3000);
                } else if (phrase !== "" && isSolo) {
                    bubble.querySelector('.bubble-text').innerText = phrase;
                    bubble.style.opacity = "1";
                    setTimeout(() => bubble.style.opacity = "0", 3000);
                }
            }
        }, 4500 + Math.random() * 2500); 
        
        hangoutIntervals.push(moveInterval);
    });
    
    hangoutScreen.classList.remove('hidden');
}

/**
 * Anula la excursión grupal y destruye sus procesos matemáticos de memoria.
 */
function leaveHangout() {
    hangoutIntervals.forEach(interval => clearInterval(interval));
    hangoutIntervals = [];
    hideAllScreens();
    cityScreen.classList.remove('hidden');
}