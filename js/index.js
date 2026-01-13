// SCROLL
  window.addEventListener("load", () => {
    const target = document.querySelector(".second_wrapper");
    if (!target) return;

    const headerOffset = 77; // ajustá a tu header
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  });

//COUNTDOWN
const calendarioF1 = [
  { nombre: "GRAN PREMIO DE AUSTRALIA", fecha: "8 de marzo", hora: "12:00 p.m.", circuito: "Albert Park Circuit", distancia: "307.574 km", year: 2026 },
  { nombre: "GRAN PREMIO DE CHINA", fecha: "15 de marzo", hora: "2:00 a.m.", circuito: "Shanghai International Circuit", distancia: "305.066 km", year: 2026 },
  { nombre: "GRAN PREMIO DE JAPÓN", fecha: "29 de marzo", hora: "1:00 a.m.", circuito: "Suzuka Circuit", distancia: "307.471 km", year: 2026 },
  { nombre: "GRAN PREMIO DE BAHRÉIN", fecha: "12 de abril", hora: "11:00 a.m.", circuito: "Bahrain International Circuit", distancia: "308.238 km", year: 2026 },
  { nombre: "GRAN PREMIO DE ARABIA SAUDITA", fecha: "19 de abril", hora: "12:00 p.m.", circuito: "Jeddah Corniche Circuit", distancia: "308.450 km", year: 2026 },
  { nombre: "GRAN PREMIO DE MIAMI", fecha: "3 de mayo", hora: "3:00 p.m.", circuito: "Miami International Autodrome", distancia: "308.326 km", year: 2026 },
  { nombre: "GRAN PREMIO DE CANADÁ", fecha: "24 de mayo", hora: "1:00 p.m.", circuito: "Circuit Gilles Villeneuve", distancia: "305.270 km", year: 2026 },
  { nombre: "GRAN PREMIO DE MÓNACO", fecha: "7 de junio", hora: "8:00 a.m.", circuito: "Circuit de Monaco", distancia: "260.286 km", year: 2026 },
  { nombre: "GRAN PREMIO DE ESPAÑA (BARCELONA-CATALUÑA)", fecha: "14 de junio", hora: "8:00 a.m.", circuito: "Circuit de Barcelona-Catalunya", distancia: "307.236 km", year: 2026 },
  { nombre: "GRAN PREMIO DE AUSTRIA", fecha: "28 de junio", hora: "8:00 a.m.", circuito: "Red Bull Ring", distancia: "306.452 km", year: 2026 },
  { nombre: "GRAN PREMIO DE GRAN BRETAÑA", fecha: "5 de julio", hora: "9:00 a.m.", circuito: "Silverstone Circuit", distancia: "306.198 km", year: 2026 },
  { nombre: "GRAN PREMIO DE BÉLGICA", fecha: "19 de julio", hora: "8:00 a.m.", circuito: "Circuit de Spa-Francorchamps", distancia: "308.052 km", year: 2026 },
  { nombre: "GRAN PREMIO DE HUNGRÍA", fecha: "26 de julio", hora: "8:00 a.m.", circuito: "Hungaroring", distancia: "306.630 km", year: 2026 },
  { nombre: "GRAN PREMIO DE PAÍSES BAJOS", fecha: "23 de agosto", hora: "8:00 a.m.", circuito: "Circuit Zandvoort", distancia: "306.648 km", year: 2026 },
  { nombre: "GRAN PREMIO DE ITALIA (MONZA)", fecha: "6 de septiembre", hora: "8:00 a.m.", circuito: "Autodromo Nazionale di Monza", distancia: "306.720 km", year: 2026 },
  { nombre: "GRAN PREMIO DE ESPAÑA (MADRID)", fecha: "13 de septiembre", hora: "8:00 a.m.", circuito: "Circuito de Madrid", distancia: "—", year: 2026 },
  { nombre: "GRAN PREMIO DE AZERBAIYÁN", fecha: "26 de septiembre", hora: "7:00 a.m.", circuito: "Baku City Circuit", distancia: "306.049 km", year: 2026 },
  { nombre: "GRAN PREMIO DE SINGAPUR", fecha: "11 de octubre", hora: "7:00 a.m.", circuito: "Marina Bay Street Circuit", distancia: "308.706 km", year: 2026 },
  { nombre: "GRAN PREMIO DE ESTADOS UNIDOS (AUSTIN)", fecha: "25 de octubre", hora: "2:00 p.m.", circuito: "Circuit of the Americas", distancia: "308.405 km", year: 2026 },
  { nombre: "GRAN PREMIO DE MÉXICO", fecha: "1 de noviembre", hora: "3:00 p.m.", circuito: "Autódromo Hermanos Rodríguez", distancia: "305.354 km", year: 2026 },
  { nombre: "GRAN PREMIO DE BRASIL", fecha: "8 de noviembre", hora: "1:00 p.m.", circuito: "Autódromo José Carlos Pace", distancia: "305.879 km", year: 2026 },
  { nombre: "GRAN PREMIO DE LAS VEGAS", fecha: "21 de noviembre", hora: "10:00 p.m.", circuito: "Las Vegas Strip Circuit", distancia: "310.000 km", year: 2026 },
  { nombre: "GRAN PREMIO DE QATAR", fecha: "29 de noviembre", hora: "12:00 p.m.", circuito: "Lusail International Circuit", distancia: "308.611 km", year: 2026 },
  { nombre: "GRAN PREMIO DE ABU DHABI", fecha: "6 de diciembre", hora: "8:00 a.m.", circuito: "Yas Marina Circuit", distancia: "306.183 km", year: 2026 }
];

// Convertir fecha en español a objeto Date
function parsearFechaHora(fecha, hora, year) {
  const meses = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
    'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
    'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
  };
  
  // Extraer día y mes de "8 de marzo"
  const partes = fecha.toLowerCase().split(' de ');
  const dia = parseInt(partes[0]);
  const mes = meses[partes[1]];
  
  // Convertir hora "12:00 p.m." a formato 24 horas
  let [horaNum, minutos] = hora.toLowerCase().replace(/\s/g, '').split(':');
  horaNum = parseInt(horaNum);
  const esPM = hora.toLowerCase().includes('p.m.');
  
  if (esPM && horaNum !== 12) {
    horaNum += 12;
  } else if (!esPM && horaNum === 12) {
    horaNum = 0;
  }
  
  minutos = parseInt(minutos);
  
  return new Date(year, mes, dia, horaNum, minutos, 0);
}

// Obtener la próxima carrera
function obtenerProximaCarrera() {
  const ahora = new Date();
  
  for (let carrera of calendarioF1) {
    const fechaCarrera = parsearFechaHora(carrera.fecha, carrera.hora, carrera.year);
    // Agregar 3 horas después de la carrera para cambiar a la siguiente
    const fechaLimite = new Date(fechaCarrera.getTime() + (3 * 60 * 60 * 1000));
    
    if (ahora < fechaLimite) {
      return {
        ...carrera,
        fechaCompleta: fechaCarrera
      };
    }
  }
  
  return null; // Temporada terminada
}

// Actualizar el contador
function actualizarContador() {
  const proximaCarrera = obtenerProximaCarrera();
  
  if (!proximaCarrera) {
    document.querySelector('.counter_container').innerHTML = '<p>¡Temporada 2026 finalizada!</p>';
    return;
  }
  
  const ahora = new Date();
  const diferencia = proximaCarrera.fechaCompleta - ahora;
  
  if (diferencia <= 0) {
    // Si la carrera ya comenzó, mostrar "EN CURSO" o esperar las 3 horas
    const dias = 0;
    const horas = 0;
    const minutos = 0;
    
    actualizarElementos(proximaCarrera, dias, horas, minutos);
    return;
  }
  
  // Calcular días, horas y minutos
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  
  actualizarElementos(proximaCarrera, dias, horas, minutos);
}

// Actualizar elementos del DOM
function actualizarElementos(carrera, dias, horas, minutos) {
  // Actualizar título de la carrera
  document.getElementById('circuit_name').textContent = carrera.nombre;
  
  // Actualizar ubicación del circuito (si existe el elemento)
  const circuitLocation = document.getElementById('circuit_location');
  if (circuitLocation) {
    circuitLocation.textContent = carrera.circuito;
  }
  
  // Actualizar contador
  const numberBoxes = document.querySelectorAll('.number_box');
  numberBoxes[0].textContent = String(dias).padStart(2, '0');
  numberBoxes[1].textContent = String(horas).padStart(2, '0');
  numberBoxes[2].textContent = String(minutos).padStart(2, '0');
  
  // Actualizar fecha
  const nextRaceDate = document.getElementById('nextrace_date');
  if (nextRaceDate) {
    nextRaceDate.textContent = `${carrera.fecha} ${carrera.year}`;
  }
  
  // Actualizar hora de salida
  const nextRaceTime = document.getElementById('nextrace_time');
  if (nextRaceTime) {
    nextRaceTime.textContent = `${carrera.hora} (ARG)`;
  }
  
  // Actualizar distancia
  const nextRaceDistance = document.getElementById('nextrace_distance');
  if (nextRaceDistance) {
    nextRaceDistance.textContent = carrera.distancia;
  }
}

// Iniciar el contador
actualizarContador();
setInterval(actualizarContador, 60000); // Actualizar cada minuto