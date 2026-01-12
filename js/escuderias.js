/**
 * escuderias.js - Maneja los datos de equipos y pilotos
 * Requiere: f1-api-cache.js
 */

// Mapeo de nombres de equipos a sus IDs en la API
const teamMapping = {
    'MCLAREN': 'mclaren',
    'MERCEDES': 'mercedes',
    'FERRARI': 'ferrari',
    'RED BULL': 'red_bull',
    'WILLIAMS': 'williams',
    'RACING BULLS': 'rb',
    'ASTON MARTIN': 'aston_martin',
    'HAAS': 'haas',
    'AUDI': 'sauber', // Audi era Sauber antes
    'ALPINE': 'alpine',
    'CADILLAC': 'cadillac'
};

// Mapeo de nombres de pilotos a sus IDs en Ergast
const driverMapping = {
    'Lando NORRIS': 'norris',
    'Oscar PIASTRI': 'piastri',
    'George RUSSELL': 'russell',
    'Kimi ANTONELLI': 'antonelli',
    'Charles LECLERC': 'leclerc',
    'Lewis HAMILTON': 'hamilton',
    'Max VERSTAPPEN': 'max_verstappen',
    'Isack HADJAR': 'hadjar',
    'Alex ALBON': 'albon',
    'Carlos SAINZ': 'sainz',
    'Liam LAWSON': 'lawson',
    'Arvid LINDBLAND': 'arvid_lindblad',
    'Lance STROLL': 'stroll',
    'Fernando ALONSO': 'alonso',
    'Nico HÜLKENBERG': 'hulkenberg',
    'Gabriel BORTOLETO': 'bortoleto',
    'Esteban OCON': 'ocon',
    'Oliver BEARMAN': 'bearman',
    'Pierre GASLY': 'gasly',
    'Franco COLAPINTO': 'colapinto',
    'Checo PÉREZ': 'perez',
    'Vallteri BOTTAS': 'bottas'
};

// Función para obtener datos de un piloto específico con caché
async function getDriverStandings(driverId) {
    const cacheKey = `driver_standings_${driverId}`;
    const cachedData = F1Cache.getFromCache(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    try {
        const response = await fetch(
            `https://api.jolpi.ca/ergast/f1/2026/drivers/${driverId}/driverstandings.json`
        );
        const data = await response.json();
        
        let result = { position: '-', points: '0' };
        
        if (data.MRData.StandingsTable.StandingsLists.length > 0) {
            const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
            if (standings.length > 0) {
                result = {
                    position: standings[0].position,
                    points: standings[0].points
                };
            }
        }
        
        // Guardar en caché
        F1Cache.saveToCache(cacheKey, result);
        
        return result;
    } catch (error) {
        console.error(`Error al obtener datos de ${driverId}:`, error);
        return { position: '-', points: '0' };
    }
}

// Función para actualizar datos de un equipo
async function updateTeamData(teamElement) {
    const teamNameEl = teamElement.querySelector('.team_name h3');
    const teamName = teamNameEl.textContent.trim();
    
    console.log(`Actualizando datos de: ${teamName}`);
    
    // Obtener todos los pilotos de este equipo
    const driverElements = teamElement.querySelectorAll('.driver');
    
    let totalTeamPoints = 0;
    
    // Actualizar datos de cada piloto
    for (const driverEl of driverElements) {
        const driverNameEl = driverEl.querySelector('.driver_name h3');
        const driverName = driverNameEl.textContent.trim();
        const driverId = driverMapping[driverName];
        
        if (driverId) {
            console.log(`  - Obteniendo datos de ${driverName} (${driverId})`);
            
            const driverData = await getDriverStandings(driverId);
            
            // Actualizar posición y puntos del piloto
            const positionEl = driverEl.querySelector('.driver_position span');
            const pointsEl = driverEl.querySelector('.driver_points span');
            
            if (positionEl) positionEl.textContent = driverData.position;
            if (pointsEl) pointsEl.textContent = driverData.points;
            
            // Sumar puntos del piloto al total del equipo
            totalTeamPoints += parseInt(driverData.points) || 0;
        } else {
            console.warn(`  - No se encontró ID para el piloto: ${driverName}`);
        }
    }
    
    // Actualizar puntos totales del equipo
    const teamPointsEl = teamElement.querySelector('.team_points span');
    if (teamPointsEl) {
        teamPointsEl.textContent = totalTeamPoints;
    }
    
    console.log(`  ✓ Total de puntos ${teamName}: ${totalTeamPoints}`);
}

// Función para cargar todos los datos
async function loadAllTeamsData() {
    console.log('🏁 Iniciando carga de datos de escuderías...');
    
    const teamElements = document.querySelectorAll('.team');
    
    // Mostrar indicador de carga en todos los equipos
    teamElements.forEach(team => {
        const pointsSpans = team.querySelectorAll('span[id="position"], span[id="points"], span[id="team_points"]');
        pointsSpans.forEach(span => {
            span.textContent = '...';
            span.style.opacity = '0.5';
        });
    });
    
    // Actualizar cada equipo
    for (const teamElement of teamElements) {
        await updateTeamData(teamElement);
    }
    
    // Restaurar opacidad
    teamElements.forEach(team => {
        const pointsSpans = team.querySelectorAll('span[id="position"], span[id="points"], span[id="team_points"]');
        pointsSpans.forEach(span => {
            span.style.opacity = '1';
        });
    });
    
    console.log('✅ Carga de datos completada');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que el módulo F1Cache esté disponible
    if (typeof F1Cache === 'undefined') {
        console.error('❌ Error: f1-api-cache.js no está cargado');
        return;
    }
    
    console.log('✓ Módulo F1Cache disponible');
    
    // Cargar todos los datos
    loadAllTeamsData();
});