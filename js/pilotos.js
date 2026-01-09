/**
 * pilotos.js - Maneja el modal de pilotos
 * Requiere: f1-api-cache.js
 */

// Función para abrir el modal y cargar datos
async function openDriverModal(driverCard) {
    const ergastId = driverCard.dataset.ergastId;
    const teamName = driverCard.querySelector('.team').textContent;
    const modal = document.getElementById('driverModal');
    const modalDialog = modal.querySelector('.driver-modal__dialog');
    
    // Obtener la clase del equipo de la tarjeta del piloto
    const teamClass = Array.from(driverCard.classList).find(cls => 
        ['mclaren', 'mercedes', 'ferrari', 'redbull', 'williams', 
         'racingbulls', 'astonmartin', 'audi', 'haas', 'alpine', 'cadillac'].includes(cls)
    );
    
    // Limpiar clases de equipo anteriores y agregar la nueva
    modalDialog.classList.remove('mclaren', 'mercedes', 'ferrari', 'redbull', 
                                 'williams', 'racingbulls', 'astonmartin', 
                                 'audi', 'haas', 'alpine', 'cadillac');
    if (teamClass) {
        modalDialog.classList.add(teamClass);
    }
    
    // Mostrar modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Mostrar loading spinner
    const driverNameEl = document.getElementById('driver_name');
    
    // Agregar clase de loading al modal
    modalDialog.classList.add('loading');
    
    // Crear y mostrar spinner
    let spinner = modalDialog.querySelector('.loading-spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-ring"></div>
            <p>Cargando datos...</p>
        `;
        modalDialog.appendChild(spinner);
    }
    spinner.style.display = 'flex';
    
    driverNameEl.textContent = '';
    
    // Resetear estadísticas mientras carga
    document.getElementById('driver_wins').textContent = '';
    document.getElementById('driver_podiums').textContent = '';
    document.getElementById('driver_poles').textContent = '';
    
    // Obtener datos del piloto usando el módulo F1Cache
    const driverData = await F1Cache.getDriverData(ergastId);
    
    // Ocultar spinner (reutilizando la variable ya declarada)
    if (spinner) {
        spinner.style.display = 'none';
    }
    modalDialog.classList.remove('loading');
    
    if (driverData) {
        // Actualizar información básica
        document.getElementById('driver_name').textContent = 
            `${driverData.givenName} ${driverData.familyName}`;
        document.getElementById('driver_team').textContent = teamName;
        document.getElementById('driver_number').textContent = driverData.number;
        document.getElementById('driver_age').textContent = driverData.age;
        document.getElementById('driver_position').textContent = driverData.position;
        document.getElementById('driver_points').textContent = driverData.points;
        
        // Actualizar nacionalidad y bandera
        const nationalityText = F1Cache.nationalityTranslations[driverData.nationality] || 
                               driverData.nationality.toUpperCase();
        document.getElementById('driver_nationality').textContent = nationalityText;
        
        const flagFile = F1Cache.nationalityFlags[driverData.nationality] || 'british.webp';
        document.getElementById('driver_flag').src = `img/rounded-flags/${flagFile}`;
        document.getElementById('driver_flag').alt = `Bandera ${nationalityText}`;
        
        // Actualizar fecha de nacimiento
        document.getElementById('driver_birth').textContent = 
            F1Cache.formatDateSpanish(driverData.dateOfBirth);
        
        // Actualizar estadísticas
        document.getElementById('driver_wins').textContent = driverData.wins;
        document.getElementById('driver_podiums').textContent = driverData.podiums;
        document.getElementById('driver_poles').textContent = driverData.poles;
    } else {
        driverNameEl.textContent = 'Error al cargar datos';
    }
}

// Función para cerrar el modal
function closeDriverModal() {
    const modal = document.getElementById('driverModal');
    const modalDialog = modal.querySelector('.driver-modal__dialog');
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Limpiar clases de equipo al cerrar
    modalDialog.classList.remove('mclaren', 'mercedes', 'ferrari', 'redbull', 
                                 'williams', 'racingbulls', 'astonmartin', 
                                 'audi', 'haas', 'alpine', 'cadillac');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Agregar click a todas las tarjetas de pilotos
    const driverCards = document.querySelectorAll('.driver');
    driverCards.forEach(card => {
        card.addEventListener('click', () => {
            openDriverModal(card);
        });
        
        // Hacer las tarjetas accesibles por teclado
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDriverModal(card);
            }
        });
    });
    
    // Cerrar modal con botón X
    const closeBtn = document.querySelector('.driver-modal__close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDriverModal);
    }
    
    // Cerrar modal al hacer click en el overlay
    const overlay = document.querySelector('.driver-modal__overlay');
    if (overlay) {
        overlay.addEventListener('click', closeDriverModal);
    }
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('driverModal');
            if (modal.classList.contains('active')) {
                closeDriverModal();
            }
        }
    });
});