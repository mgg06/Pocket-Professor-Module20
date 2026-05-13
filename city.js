// ==========================================
// MAPA DE LA CIUDAD Y EDIFICIOS
// ==========================================

/**
 * Configura y dibuja dinámicamente la pantalla principal del mapa de la ciudad.
 */
function setupCityMap() {
    // Fuerza los estilos CSS del fondo usando JavaScript para garantizar que cubra toda la pantalla
    cityScreen.style.backgroundImage = "url('assets/images/fondo.png')"; 
    cityScreen.style.backgroundSize = "cover";
    cityScreen.style.backgroundPosition = "center";
    cityScreen.style.position = "relative";
    cityScreen.style.width = "100vw";
    cityScreen.style.minHeight = "100vh";
    cityScreen.style.padding = "0"; 
    
    // Base de datos local con la posición absoluta (X, Y) y el tamaño de cada edificio en la pantalla
    const buildings = [
        { id: 'img-medac', src: 'assets/images/medac.png', name: 'MEDAC', top: '35%', left: '67%', width: '450px', zIndex: 10 },
        { id: 'img-mercadona', src: 'assets/images/mercadona.png', name: 'MERCADONA', top: '35%', left: '0%', width: '500px', zIndex: 20 },
        { id: 'img-palacio', src: 'assets/images/palacio-congresos.png', name: 'PALACIO DE CONGRESOS', top: '28%', left: '28%', width: '320px', zIndex: 5 },
        { id: 'img-tranvibus', src: 'assets/images/tranvibus.png', name: 'TRANVIBUS', top: '55%', left: '-150px', width: '500px', zIndex: 20 },
        { id: 'img-plaza', src: 'assets/images/plaza.png', name: 'PLAZA', top: '66%', left: '30%', width: '600px', zIndex: 15 },
        { id: 'img-zona-este', src: 'assets/images/zona-este.png', name: 'ZONA ESTE', top: '35%', left: '49%', width: '350px', zIndex: 3 }
    ];

    // Recorre la lista de edificios para inyectarlos en el HTML uno por uno
    buildings.forEach(building => {
        let wrapper = document.getElementById(building.id + '-wrapper');
        if (!wrapper) { 
            wrapper = document.createElement('div');
            // Configura el contenedor invisible que envuelve al edificio para poder hacerle clic
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
            
            // Evento al hacer clic en el edificio
            wrapper.onclick = () => {
                if (building.name === 'MEDAC') {
                    // Si es el instituto MEDAC, nos lleva directamente al pasillo de los profes
                    hideAllScreens();
                    apartmentScreen.classList.remove('hidden');
                } else {
                    // Para cualquier otro edificio, lanza el motor de tiendas/interiores genéricos
                    openBuilding(building.name);
                }
            };

            // Crea un globo de texto (Tooltip) emergente con el nombre del edificio
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
            
            // Dibuja la colita del globo usando bordes CSS transparentes
            tooltip.innerHTML += `
            <div style="position: absolute; bottom: -11px; left: 50%; transform: translateX(-50%); border-width: 8px 8px 0; border-style: solid; border-color: #ff4d6d transparent transparent transparent;"></div>
            <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); border-width: 6px 6px 0; border-style: solid; border-color: #fff0f3 transparent transparent transparent;"></div>`;
            
            // Ensambla los elementos dentro del div padre
            wrapper.appendChild(tooltip);
            wrapper.appendChild(img);
            
            // Efectos de Animación: Al pasar el ratón (hover) agranda el edificio y hace visible el globo
            wrapper.onmouseover = () => { img.style.transform = "scale(1.03)"; tooltip.style.opacity = "1"; tooltip.style.transform = "translateX(-50%) translateY(-15px)"; };
            wrapper.onmouseout = () => { img.style.transform = "scale(1)"; tooltip.style.opacity = "0"; tooltip.style.transform = "translateX(-50%) translateY(0px)"; };
            img.style.transition = "transform 0.2s ease-in-out";

            cityScreen.appendChild(wrapper);
        }
    });
}
setupCityMap();