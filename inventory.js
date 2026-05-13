// ==========================================
// SISTEMA DE INVENTARIO Y ARRASTRAR (DRAG & DROP)
// ==========================================

/**
 * Lee el estado actual de la mochila del jugador y mapea visualmente el array 
 * a las bandejas laterales de iconos disponibles para arrastrar al aula.
 */
function updateInventoryUI() {
    const foodBar = document.getElementById('inventory-food-bar');
    const giftBar = document.getElementById('inventory-gift-bar');
    if(!foodBar || !giftBar) return;
    
    foodBar.innerHTML = ''; 
    giftBar.innerHTML = ''; 
    let hasFood = false;
    let hasGifts = false;
    
    for (const key in inventory) {
        if (inventory[key] > 0) {
            const itemData = storeItems[key];
            const itemHTML = `
                <div class="inv-item" draggable="true" ondragstart="drag(event)" data-item="${key}" style="display: flex; flex-direction: column; align-items: center; background: white; border: 3px solid #ffccd5; border-radius: 10px; padding: 10px; min-width: 85px;">
                    <img src="${itemData.image}" alt="${itemData.name}" style="width: 60px; height: 60px; object-fit: contain; pointer-events: none;">
                    <span style="font-weight: bold; color: #590d22; margin-top: 5px;">${inventory[key]}</span>
                </div>
            `;
            if (itemData.type === 'food') { foodBar.innerHTML += itemHTML; hasFood = true; } 
            else if (itemData.type === 'gift') { giftBar.innerHTML += itemHTML; hasGifts = true; }
        }
    }
    
    if (!hasFood) foodBar.innerHTML = '<p style="color: #590d22; font-size: 14px; margin: 0;">No tienes comida.</p>';
    if (!hasGifts) giftBar.innerHTML = '<p style="color: #590d22; font-size: 14px; margin: 0;">No tienes regalos.</p>';
}

/**
 * Evento que salta al agarrar (Drag) una ficha del inventario lateral.
 * Genera la ilusión del fantasma (Drag Ghost) flotante para seguir al ratón.
 */
function drag(ev) {
    const target = ev.target.closest('.inv-item');
    if (target) {
        // Anota temporalmente de qué ID se trata en el motor del navegador
        ev.dataTransfer.setData("text", target.dataset.item);
        
        // Recreación manual de la miniatura para un arrastre estético
        const img = target.querySelector('img');
        if (img) {
            const dragGhost = document.createElement('div');
            dragGhost.style.width = '70px';
            dragGhost.style.height = '70px';
            dragGhost.style.borderRadius = '50%';
            dragGhost.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            dragGhost.style.border = '4px dashed #ff4d6d';
            dragGhost.style.display = 'flex';
            dragGhost.style.justifyContent = 'center';
            dragGhost.style.alignItems = 'center';
            dragGhost.style.position = 'absolute';
            dragGhost.style.top = '-1000px'; // Escondido del viewport real
            dragGhost.style.boxShadow = '0 4px 15px rgba(89, 13, 34, 0.5)';
            
            const ghostImg = img.cloneNode(true);
            ghostImg.style.width = '50px';
            ghostImg.style.height = '50px';
            ghostImg.style.objectFit = 'contain';
            dragGhost.appendChild(ghostImg);
            
            document.body.appendChild(dragGhost);
            // Configura la visual del cursor
            ev.dataTransfer.setDragImage(dragGhost, 35, 35);
            
            // Destruye el vestigio del DOM
            setTimeout(() => { if (dragGhost.parentNode) dragGhost.parentNode.removeChild(dragGhost); }, 100);
        }
    }
}

// Autoriza expresamente a la zona de juego general a recibir caídas de objetos
function allowDropFood(ev) { ev.preventDefault(); }

/**
 * Evento clave cuando se suelta (Drop) exitosamente un regalo sobre el profesor.
 * Muta las estadísticas (hambre, felicidad) y desencadena devoluciones económicas (70% winrate).
 */
function dropFood(ev) {
    ev.preventDefault();
    const item = ev.dataTransfer.getData("text");
    
    if (item && inventory[item] !== undefined && inventory[item] > 0) {
        inventory[item]--;
        updateInventoryUI();
        
        const itemData = storeItems[item];
        // Algoritmo de preferencias: Hay un 70% de probabilidades de acierto
        const likesIt = Math.random() > 0.3;
        let rewardCoins = 0;
        
        if (likesIt) {
            // Reacción Placentera: Restituye el estado del profesor
            teachersData[currentTeacher].hunger = Math.max(0, teachersData[currentTeacher].hunger - itemData.hunger);
            teachersData[currentTeacher].happiness = Math.min(100, teachersData[currentTeacher].happiness + itemData.happiness);
            
            // Reintegro + Intereses de recompensa
            rewardCoins = Math.floor(itemData.price * 1.5);
            coins += rewardCoins;
            
            // Levanta una notificación de oro flotante
            const avatar = document.getElementById('teacher-avatar');
            const floatingMoney = document.createElement('div');
            floatingMoney.innerText = `+${rewardCoins} €`;
            floatingMoney.className = 'floating-money';
            floatingMoney.style.left = '50%';
            floatingMoney.style.top = '-20px';
            avatar.appendChild(floatingMoney);
            setTimeout(() => { if (floatingMoney.parentNode) floatingMoney.parentNode.removeChild(floatingMoney); }, 1500);
        } else {
            // Reacción Tóxica: El profesor castiga no comiendo casi nada y perdiendo 10 puntos de alegría
            teachersData[currentTeacher].hunger = Math.max(0, teachersData[currentTeacher].hunger - Math.floor(itemData.hunger / 2));
            teachersData[currentTeacher].happiness = Math.max(0, teachersData[currentTeacher].happiness - 10);
        }
        
        // Vincula el objeto a la lógica de presencia permanente en la clase (juguetes)
        if (itemData.type === 'gift') currentGift = item;
        updateTeacherUI();

        // Busca una frase de queja o alegría del modelo de datos e inyectala en el bocadillo
        const bubble = document.getElementById('teacher-bubble');
        const bubbleText = document.getElementById('teacher-bubble-text');
        if (bubble && bubbleText) {
            const phrases = likesIt ? itemData.msgLike : itemData.msgDislike;
            let phrase = phrases[Math.floor(Math.random() * phrases.length)];
            if (likesIt) phrase += ` (+${rewardCoins} €)`;
            bubbleText.innerText = phrase;
            bubble.style.opacity = "1";
            setTimeout(() => { if (bubble) bubble.style.opacity = "0"; }, 3000);
        }
    }
}

/**
 * Controla el Switch/Interruptor visual de las carpetas laterales del Aula (Comida y Regalos).
 */
function toggleInventory(type) {
    const foodContainer = document.getElementById('inventory-food-container');
    const giftContainer = document.getElementById('inventory-gift-container');
    const talkContainer = document.getElementById('talk-options-container');

    if (type === 'food') {
        if (foodContainer.style.display === 'block') {
            foodContainer.style.display = 'none';
        } else {
            foodContainer.style.display = 'block';
            giftContainer.style.display = 'none';
            if (talkContainer) talkContainer.style.display = 'none';
        }  
    } else {
        if (giftContainer.style.display === 'block') {
            giftContainer.style.display = 'none';
        } else {
            foodContainer.style.display = 'none';
            giftContainer.style.display = 'block';
            if (talkContainer) talkContainer.style.display = 'none';
        }
    }
}