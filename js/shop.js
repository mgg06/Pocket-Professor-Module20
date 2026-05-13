// ==========================================
// SISTEMA DE TIENDAS Y CARRITO DE COMPRA
// ==========================================

/**
 * Inyecta el catálogo de objetos HTML de una tienda o la interfaz del Tranvibús.
 * Genera la vista visual de la compra y actualiza el subtotal del carrito.
 */
function updateBuildingContent(buildingName) {
    const contentDiv = document.getElementById('building-content');
    const coinsDisplay = document.getElementById('coins-display');
    
    if (coinsDisplay) coinsDisplay.innerText = `Saldo: ${coins} €`;
    contentDiv.innerHTML = ''; 

    if (buildingName === 'MERCADONA' || buildingName === 'ZONA ESTE') {
        const isMercadona = buildingName === 'MERCADONA';
        const itemType = isMercadona ? 'food' : 'gift';
        const shopTitle = isMercadona ? '¡Bienvenido al Mercadona!' : '¡Tienda de Regalos!';

        // Construcción interactiva de los divs de cada producto (Añadir)
        let itemsHTML = '';
        for (const key in storeItems) {
            const item = storeItems[key];
            if (item.type !== itemType) continue; 
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
        
        // Re-cálculo y dibujo del menú lateral derecho (Carrito y Total)
        let cartHTML = '';
        let total = 0;
        let cartEmpty = true;
        for (const key in cart) {
            if (cart[key] > 0) {
                cartEmpty = false;
                const subtotal = storeItems[key].price * cart[key];
                total += subtotal;
                cartHTML += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dashed #ffccd5; padding-bottom: 8px;"><span style="font-size: 14px; color: #590d22; text-align: left; flex: 1;">${storeItems[key].name} (x${cart[key]})</span><span style="font-size: 14px; font-weight: bold; color: #800f2f; margin-right: 10px;">${subtotal} €</span><button onclick="removeFromCart('${key}')" style="background: transparent; border: none; color: #ff4d6d; padding: 0; margin: 0; box-shadow: none; font-size: 16px;">❌</button></div>`;
            }
        }

        if (cartEmpty) { cartHTML = `<p style="font-size: 14px; color: #590d22;">El carrito está vacío.</p>`; } 
        else { cartHTML += `<div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 16px; color: #800f2f;"><span>TOTAL:</span><span>${total} €</span></div><button onclick="checkoutCart()" style="width: 100%; margin-top: 15px; font-size: 16px; background-color: #8bc34a; border-color: #689f38;">Comprar Todo</button>`; }
        
        // Unir todo y mostrarlo en el viewport
        contentDiv.innerHTML = `<div style="display: flex; gap: 30px; width: 100%; max-width: 1100px; justify-content: center; align-items: flex-start; text-align: left; margin-top: 10px;"><div style="flex: 1; min-width: 60%;"><h3 style="margin-top: 0; text-align: center; color: #ff4d6d; background: rgba(255, 240, 243, 0.9); padding: 10px; border-radius: 15px; border: 3px solid #ffccd5;">${shopTitle}</h3><div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; max-height: 55vh; overflow-y: auto; padding: 10px; background: rgba(255, 255, 255, 0.5); border-radius: 20px;">${itemsHTML}</div></div><div style="width: 320px; background: white; border: 4px solid #ff4d6d; border-radius: 20px; padding: 20px; position: sticky; top: 20px; box-shadow: 0 8px 20px rgba(89, 13, 34, 0.2);"><h3 style="margin-top: 0; text-align: center; color: #ff4d6d; border-bottom: 2px dashed #ffb3c1; padding-bottom: 10px;">🛒 Carrito</h3>${cartHTML}</div></div>`;
    } else if (buildingName === 'TRANVIBUS') {
        // Interfaz exclusiva para organizar el viaje escolar
        let characterSelectionHTML = '';
        for (const teacher in teachersData) {
            const data = teachersData[teacher];
            characterSelectionHTML += `
                <div class="char-select-card" data-teacher="${teacher}" onclick="toggleCharacterSelect(this)" style="border: 3px solid #ffccd5; padding: 10px; border-radius: 15px; background: white; width: 140px; text-align: center; transition: transform 0.2s;">
                    <img src="${data.image}" alt="${data.name}" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 5px;">
                    <h4 style="margin: 0; font-size: 14px; color: #800f2f;">${data.name}</h4>
                    <p style="margin: 5px 0 0 0; font-size: 10px; color: #ff4d6d;">${teacher}</p>
                </div>
            `;
        }
        
        contentDiv.innerHTML = `
            <div style="background: rgba(255, 255, 255, 0.95); padding: 30px; border-radius: 20px; border: 4px solid #ff4d6d; text-align: center; max-width: 800px; width: 100%; box-shadow: 0 8px 20px rgba(89, 13, 34, 0.3); margin-top: 6vh;">
                <h3 style="color: #ff4d6d; margin-top: 0; font-size: 24px;">¿A quién quieres llevar de viaje?</h3>
                <p style="color: #590d22; font-weight: bold; margin-bottom: 20px;">Elige de 1 a 4 profesores.</p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 30px;">
                    ${characterSelectionHTML}
                </div>
                <h3 style="color: #ff4d6d; font-size: 20px; margin-bottom: 15px;">¿A dónde queréis ir?</h3>
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button onclick="startTravel('PALACIO DE CONGRESOS')" style="font-size: 18px; padding: 12px 30px; box-shadow: 0 4px 6px rgba(89,13,34,0.3);">Palacio de Congresos</button>
                    <button onclick="startTravel('PLAZA')" style="font-size: 18px; padding: 12px 30px; box-shadow: 0 4px 6px rgba(89,13,34,0.3);">La Plaza</button>
                </div>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `<p style="color: #590d22; font-weight: bold; font-size: 18px; background: rgba(255,255,255,0.8); padding: 10px 20px; border-radius: 10px;">Actualmente no hay nada que hacer aquí. Dirígete al tranvibús si quieres que los profesores se desplacen.</p>`;
    }
}

/**
 * Registra las unidades pedidas de un ítem y las suma a la variable 'cart'.
 */
function addToCart(itemId) {
    const qtyInput = document.getElementById(`qty-${itemId}`);
    let qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
    if (qty < 1) qty = 1;
    if (!cart[itemId]) cart[itemId] = 0;
    cart[itemId] += qty;
    updateBuildingContent(currentBuilding);
}

/**
 * Elimina un objeto completamente del ticket virtual de la compra temporal.
 */
function removeFromCart(itemId) {
    delete cart[itemId];
    updateBuildingContent(currentBuilding);
}

/**
 * Transacción final: Valida que el jugador disponga de las divisas necesarias.
 * Resta el dinero, traspasa la compra a la mochila (inventory) y limpia la sesión.
 */
function checkoutCart() {
    let total = 0;
    for (const key in cart) total += storeItems[key].price * cart[key];
    if (total === 0) return showCustomAlert("El carrito está vacío.");
    if (coins >= total) {
        coins -= total;
        for (const key in cart) inventory[key] += cart[key];
        cart = {}; 
        updateBuildingContent(currentBuilding);
        showCustomAlert(`¡Compra realizada con éxito por ${total} €!`);
    } else { showCustomAlert(`No tienes suficientes euros. Te faltan ${total - coins} €.`); }
}

/**
 * Realza visualmente la ficha de un profesor para indicar que subirá al autobús.
 */
function toggleCharacterSelect(element) {
    element.classList.toggle('selected');
    if (element.classList.contains('selected')) {
        element.style.borderColor = '#8bc34a';
        element.style.backgroundColor = '#e8f5e9';
        element.style.transform = 'scale(1.05)';
    } else {
        element.style.borderColor = '#ffccd5';
        element.style.backgroundColor = 'white';
        element.style.transform = 'scale(1)';
    }
}

/**
 * Despacha la excursión comprobando restricciones (mínimo 1, máximo 4 acompañantes) 
 * y desencadena la animación de la furgoneta escolar.
 */
function startTravel(destination) {
    const selectedCards = document.querySelectorAll('.char-select-card.selected');
    if (selectedCards.length === 0) return showCustomAlert('¡Tienes que elegir al menos a un acompañante!');
    if (selectedCards.length > 4) return showCustomAlert('Solo puedes llevar hasta 4 personas en el Tranvibus.');
    
    const selectedTeachers = Array.from(selectedCards).map(card => card.dataset.teacher);
    
    const transition = document.getElementById('travel-transition');
    transition.classList.remove('hidden');
    
    setTimeout(() => {
        transition.classList.add('hidden');
        openHangout(selectedTeachers, destination);
    }, 2500);
}