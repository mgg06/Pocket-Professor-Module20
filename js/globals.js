// ==========================================
// VARIABLES GLOBALES Y ELEMENTOS DEL DOM
// ==========================================
const introScreen = document.getElementById('intro-screen');
const cityScreen = document.getElementById('city-screen');
const genericBuildingScreen = document.getElementById('generic-building-screen');
const apartmentScreen = document.getElementById('apartment-screen');
const teacherScreen = document.getElementById('teacher-screen');
const hangoutScreen = document.getElementById('hangout-screen');
const travelTransition = document.getElementById('travel-transition');
const startBtn = document.getElementById('start-btn');

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

let currentTeacher = null;
let moveInterval = null;
let bubbleInterval = null;
let coins = 200;
let inventory = { pizza: 0, agua: 0, manzana: 0, sandwich: 0, doritos: 0, chuches: 0, cafe: 0, sushi: 0, carne: 0, macarrones: 0, lasana: 0, pelota: 0, boli: 0, microfono: 0, ordenador: 0, osito: 0, tareas: 0, telefono: 0 };
let cart = {};
let currentBuilding = '';
let currentGift = null;
let hangoutIntervals = [];

function showCustomAlert(message) {
    let modal = document.getElementById('custom-alert-modal');
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
    document.getElementById('custom-alert-message').innerText = message;
    modal.style.display = 'flex';
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