/**
 * Módulo reutilizable para manejar llamadas a la API de F1 con caché
 * Úsalo en cualquier página: <script src="js/f1-api-cache.js"></script>
 */

const F1Cache = {
    // Configuración
    CACHE_KEY_PREFIX: 'f1_',
    CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 días
    
    // Mapeo de nacionalidades
    nationalityFlags: {
        'British': 'british.webp',
        'Australian': 'australian.webp',
        'Italian': 'italian.webp',
        'Monegasque': 'monegasque.webp',
        'Dutch': 'dutch.webp',
        'French': 'french.webp',
        'Thai': 'thai.webp',
        'Spanish': 'spanish.webp',
        'New Zealander': 'newzealander.webp',
        'New Zealand': 'newzealander.webp',
        'Canadian': 'canadian.webp',
        'German': 'german.webp',
        'Brazilian': 'brazilian.webp',
        'Mexican': 'mexico.webp',
        'Finnish': 'finland.webp',
        'Argentine': 'argentine.webp'
    },
    
    nationalityTranslations: {
        'British': 'Gran Bretaña',
        'Australian': 'Australia',
        'Italian': 'Italia',
        'Monegasque': 'Monaco',
        'Dutch': 'Países Bajos',
        'French': 'Francia',
        'Thai': 'Tailandia',
        'Spanish': 'España',
        'New Zealander': 'Nueva Zelanda',
        'New Zealand': 'Nueva Zelanda',
        'Canadian': 'Canadá',
        'German': 'Alemania',
        'Brazilian': 'Brasil',
        'Mexican': 'Mexico',
        'Finnish': 'Finlandia',
        'Argentine': 'Argentino'
    },
    
    // Obtener fecha del próximo lunes
    getNextMonday() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        nextMonday.setHours(12, 0, 0, 0);
        return nextMonday.getTime();
    },
    
    // Verificar si el caché es válido
    isCacheValid(timestamp) {
        const now = Date.now();
        const nextMonday = this.getNextMonday();
        
        if (now < nextMonday) {
            const lastMonday = nextMonday - (7 * 24 * 60 * 60 * 1000);
            return timestamp > lastMonday;
        }
        
        return false;
    },
    
    // Guardar en caché
    saveToCache(key, data) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(this.CACHE_KEY_PREFIX + key, JSON.stringify(cacheData));
            console.log(`✓ Datos guardados en caché: ${key}`);
        } catch (error) {
            console.warn('No se pudo guardar en caché:', error);
        }
    },
    
    // Obtener desde caché
    getFromCache(key) {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY_PREFIX + key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            if (this.isCacheValid(cacheData.timestamp)) {
                console.log(`✓ Usando datos en caché: ${key}`);
                return cacheData.data;
            } else {
                console.log(`⚠ Caché expirado: ${key}`);
                localStorage.removeItem(this.CACHE_KEY_PREFIX + key);
                return null;
            }
        } catch (error) {
            console.warn('Error al leer caché:', error);
            return null;
        }
    },
    
    // Limpiar todo el caché de F1
    clearAllCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.CACHE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('🗑️ Todo el caché de F1 ha sido limpiado');
        } catch (error) {
            console.warn('Error al limpiar caché:', error);
        }
    },
    
    // Limpiar caché antiguo
    cleanOldCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.CACHE_KEY_PREFIX)) {
                    const cached = JSON.parse(localStorage.getItem(key));
                    if (!this.isCacheValid(cached.timestamp)) {
                        localStorage.removeItem(key);
                        console.log(`🗑️ Caché limpiado: ${key}`);
                    }
                }
            });
        } catch (error) {
            console.warn('Error al limpiar caché:', error);
        }
    },
    
    // Calcular edad
    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    },
    
    // Formatear fecha en español
    formatDateSpanish(dateString) {
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const date = new Date(dateString);
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} de ${month} de ${year}`;
    },
    
    // Obtener TODAS las carreras de un piloto
    async getAllRaces(ergastId) {
        let allRaces = [];
        let offset = 0;
        const limit = 100;
        let totalRaces = 0;
        
        try {
            const firstResponse = await fetch(
                `https://api.jolpi.ca/ergast/f1/drivers/${ergastId}/results.json?limit=${limit}&offset=0`
            );
            const firstData = await firstResponse.json();
            totalRaces = parseInt(firstData.MRData.total);
            
            console.log(`Total de carreras disponibles: ${totalRaces}`);
            
            allRaces = firstData.MRData.RaceTable.Races || [];
            
            while (allRaces.length < totalRaces) {
                offset += limit;
                const response = await fetch(
                    `https://api.jolpi.ca/ergast/f1/drivers/${ergastId}/results.json?limit=${limit}&offset=${offset}`
                );
                const data = await response.json();
                const races = data.MRData.RaceTable.Races || [];
                
                if (races.length === 0) break;
                
                allRaces = allRaces.concat(races);
                console.log(`Progreso: ${allRaces.length}/${totalRaces} carreras cargadas`);
            }
            
            return allRaces;
        } catch (error) {
            console.error('Error al obtener carreras:', error);
            return [];
        }
    },
    
    // Obtener TODAS las poles de un piloto
    async getAllQualifyings(ergastId) {
        let allQualifyings = [];
        let offset = 0;
        const limit = 100;
        let totalQualifyings = 0;
        
        try {
            const firstResponse = await fetch(
                `https://api.jolpi.ca/ergast/f1/drivers/${ergastId}/qualifying.json?limit=${limit}&offset=0`
            );
            const firstData = await firstResponse.json();
            totalQualifyings = parseInt(firstData.MRData.total);
            
            console.log(`Total de qualifyings disponibles: ${totalQualifyings}`);
            
            allQualifyings = firstData.MRData.RaceTable.Races || [];
            
            while (allQualifyings.length < totalQualifyings) {
                offset += limit;
                const response = await fetch(
                    `https://api.jolpi.ca/ergast/f1/drivers/${ergastId}/qualifying.json?limit=${limit}&offset=${offset}`
                );
                const data = await response.json();
                const races = data.MRData.RaceTable.Races || [];
                
                if (races.length === 0) break;
                
                allQualifyings = allQualifyings.concat(races);
                console.log(`Progreso: ${allQualifyings.length}/${totalQualifyings} qualifyings cargados`);
            }
            
            return allQualifyings;
        } catch (error) {
            console.error('Error al obtener qualifying:', error);
            return [];
        }
    },
    
    // Obtener datos completos de un piloto
    async getDriverData(ergastId) {
        const cacheKey = `driver_${ergastId}`;
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) return cachedData;
        
        console.log(`🌐 Obteniendo datos frescos de la API para: ${ergastId}`);
        
        try {
            const driverResponse = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${ergastId}.json`);
            const driverData = await driverResponse.json();
            const driver = driverData.MRData.DriverTable.Drivers[0];
            
            let currentPosition = '0';
            let currentPoints = '0';
            
            try {
                const standingsResponse = await fetch(
                    `https://api.jolpi.ca/ergast/f1/2026/drivers/${ergastId}/driverstandings.json`
                );
                const standingsData = await standingsResponse.json();
                
                if (standingsData.MRData.StandingsTable.StandingsLists.length > 0) {
                    const standings = standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                    if (standings.length > 0) {
                        currentPosition = standings[0].position;
                        currentPoints = standings[0].points;
                    }
                }
            } catch (error) {
                console.log('No hay datos de standings para 2026');
            }
            
            const [allRaces, allQualifyings] = await Promise.all([
                this.getAllRaces(ergastId),
                this.getAllQualifyings(ergastId)
            ]);
            
            let wins = 0;
            let podiums = 0;
            let poles = 0;

            allRaces.forEach(race => {
                if (race.Results && race.Results.length > 0) {
                    const result = race.Results[0];
                    const position = parseInt(result.position);
                    
                    if (position === 1) wins++;
                    if (position <= 3) podiums++;
                }
            });
            
            allQualifyings.forEach(race => {
                if (race.QualifyingResults && race.QualifyingResults.length > 0) {
                    const qualifying = race.QualifyingResults[0];
                    if (parseInt(qualifying.position) === 1) poles++;
                }
            });
            
            console.log(`Estadísticas - Victorias: ${wins}, Podios: ${podiums}, Poles: ${poles}`);

            const driverStats = {
                givenName: driver.givenName,
                familyName: driver.familyName,
                number: driver.permanentNumber || 'N/A',
                nationality: driver.nationality,
                dateOfBirth: driver.dateOfBirth,
                code: driver.code,
                age: this.calculateAge(driver.dateOfBirth),
                wins: wins,
                podiums: podiums,
                poles: poles,
                position: currentPosition,
                points: currentPoints
            };
            
            this.saveToCache(cacheKey, driverStats);
            
            return driverStats;
        } catch (error) {
            console.error('Error al obtener datos del piloto:', error);
            return null;
        }
    },
    
    // Obtener clasificación actual de pilotos
    async getCurrentStandings(year = 2026) {
        const cacheKey = `standings_${year}`;
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) return cachedData;
        
        console.log(`🌐 Obteniendo clasificación de ${year} desde la API`);
        
        try {
            const response = await fetch(
                `https://api.jolpi.ca/ergast/f1/${year}/driverstandings.json`
            );
            const data = await response.json();
            
            if (data.MRData.StandingsTable.StandingsLists.length > 0) {
                const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                this.saveToCache(cacheKey, standings);
                return standings;
            }
            
            return [];
        } catch (error) {
            console.error('Error al obtener clasificación:', error);
            return [];
        }
    },
    
    // Obtener calendario de carreras
    async getRaceCalendar(year = 2026) {
        const cacheKey = `calendar_${year}`;
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) return cachedData;
        
        console.log(`🌐 Obteniendo calendario de ${year} desde la API`);
        
        try {
            const response = await fetch(
                `https://api.jolpi.ca/ergast/f1/${year}.json`
            );
            const data = await response.json();
            const races = data.MRData.RaceTable.Races || [];
            
            this.saveToCache(cacheKey, races);
            return races;
        } catch (error) {
            console.error('Error al obtener calendario:', error);
            return [];
        }
    },
    
    // Obtener clasificación de constructores
    async getConstructorStandings(year = 2026) {
        const cacheKey = `constructor_standings_${year}`;
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) return cachedData;
        
        console.log(`🌐 Obteniendo clasificación de constructores de ${year}`);
        
        try {
            const response = await fetch(
                `https://api.jolpi.ca/ergast/f1/${year}/constructorstandings.json`
            );
            const data = await response.json();
            
            if (data.MRData.StandingsTable.StandingsLists.length > 0) {
                const standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
                this.saveToCache(cacheKey, standings);
                return standings;
            }
            
            return [];
        } catch (error) {
            console.error('Error al obtener clasificación de constructores:', error);
            return [];
        }
    }
};

// Limpiar caché antiguo al cargar el módulo
F1Cache.cleanOldCache();

// Hacer disponible globalmente
window.F1Cache = F1Cache;