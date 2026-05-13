// ==========================================
// PASILLO DE APARTAMENTOS / MEDAC
// ==========================================

/**
 * Construye la interfaz interior del edificio MEDAC (El pasillo con las puertas).
 */
function setupApartmentScreen() {
    // Configura el papel tapiz del pasillo a pantalla completa
    apartmentScreen.style.backgroundImage = "url('assets/images/pared.png')"; 
    apartmentScreen.style.backgroundSize = "cover";
    apartmentScreen.style.backgroundPosition = "center";
    apartmentScreen.style.minHeight = "100vh";
    apartmentScreen.style.width = "100vw";
    apartmentScreen.style.padding = "0"; 
    apartmentScreen.style.position = "relative"; 
    
    const doorsContainer = document.getElementById('doors-container');
    // Organiza las puertas en un contenedor Flexbox (para que se alineen en fila en la parte baja)
    if (doorsContainer) {
        doorsContainer.style.display = "flex";
        doorsContainer.style.justifyContent = "center";
        doorsContainer.style.alignItems = "flex-end"; 
        doorsContainer.style.gap = "80px"; 
        doorsContainer.style.position = "absolute"; 
        doorsContainer.style.bottom = "3%"; 
        doorsContainer.style.width = "100%"; 
        doorsContainer.style.flexWrap = "wrap"; 
    }

    const doorWrappers = document.querySelectorAll('.door-wrapper');
    doorWrappers.forEach(wrapper => {
        // Configura cada marco de puerta individualmente
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.position = "relative"; 
        
        const img = wrapper.querySelector('.door-img');
        const className = img.alt; // Extrae el nombre de la asignatura del 'alt' de la imagen
        
        // Diseña y construye un Tooltip (cartelito) para mostrar quién está dentro
        const tooltip = document.createElement('div');
        tooltip.innerText = className;
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
        // Colita del globo
        tooltip.innerHTML += `<div style="position: absolute; bottom: -11px; left: 50%; transform: translateX(-50%); border-width: 8px 8px 0; border-style: solid; border-color: #ff4d6d transparent transparent transparent;"></div><div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); border-width: 6px 6px 0; border-style: solid; border-color: #fff0f3 transparent transparent transparent;"></div>`;
        
        wrapper.appendChild(tooltip);
        
        // Efecto flotante al pasar el ratón por la puerta
        wrapper.onmouseover = () => { tooltip.style.opacity = "1"; tooltip.style.transform = "translateX(-50%) translateY(-15px)"; };
        wrapper.onmouseout = () => { tooltip.style.opacity = "0"; tooltip.style.transform = "translateX(-50%) translateY(0px)"; };
    });
    
    // Forzar un tamaño de imagen unificado para que todas las puertas midan igual
    document.querySelectorAll('.door-img').forEach(img => { img.style.width = "220px"; });
}
setupApartmentScreen();