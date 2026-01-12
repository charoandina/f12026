// Toggle - Guia Items
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.guia-item');
  let monoplazasInitialized = false;
  
  // Variables globales para Three.js (necesarias para el resize)
  let camera, renderer, controls;

  items.forEach(item => {
    const header = item.querySelector('.guia-item-header');
    const icon = item.querySelector('.toggle-icon');

    header.addEventListener('click', () => {
      icon.textContent = '+'; // nunca cambia, solo rotás con CSS
      item.classList.toggle('abierto');

      // 🔧 Inicializar modelo 3D solo la primera vez que se abre
      if (item.id === 'monoplazas' && !monoplazasInitialized && item.classList.contains('abierto')) {
        monoplazasInitialized = true;
        
        // Esperar a que la animación del toggle termine
        setTimeout(() => {
          const result = initMonoplazas3D();
          camera = result.camera;
          renderer = result.renderer;
          controls = result.controls;
        }, 300);
      }

      // Reajustar dimensiones si ya existe el canvas
      if (item.id === 'monoplazas' && monoplazasInitialized && item.classList.contains('abierto')) {
        const canvasContent = item.querySelector('#monoplazas-content');
        if (canvasContent && canvasContent.querySelector('canvas')) {
          setTimeout(() => {
            camera.aspect = canvasContent.clientWidth / canvasContent.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContent.clientWidth, canvasContent.clientHeight);
          }, 300);
        }
      }
    });
  });

  // Responsive global (solo si ya se inicializó)
  window.addEventListener('resize', () => {
    if (monoplazasInitialized && camera && renderer) {
      const container = document.getElementById('monoplazas-content');
      if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    }
  });
});


// Función para inicializar el modelo 3D
async function initMonoplazas3D() {
  // Importar Three.js dinámicamente
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

  // Contenedor
  const container = document.getElementById('monoplazas-content');
  
  // Verificar que tenga dimensiones
  if (container.clientWidth === 0 || container.clientHeight === 0) {
    console.warn('⚠️ El contenedor aún no tiene dimensiones. Esperando...');
    container.style.minHeight = '500px';
  }

  // Escena
  const scene = new THREE.Scene();
  scene.background = null;

  // Cámara
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(8, 1.5, 0);
  camera.lookAt(0, 1.2, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Controles
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1.2, 0);
  controls.update();

  // Luces
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight2.position.set(0, 20, 0);
  scene.add(dirLight2);

  // Hotspots
  const hotspots = [
    { name: "Alerón delantero", desc: "Genera carga aerodinámica y dirige el aire para dar mayor agarre y estabilidad al auto. Además, canaliza el flujo de aire hacia el resto del coche, siendo clave para el rendimiento aerodinámico", position: new THREE.Vector3(0, -0.4, 4) },
    { name: "Alerón trasero", desc: "Genera carga aerodinámica para mantener la parte trasera del auto pegada al suelo, especialmente en curvas y frenadas. También ayuda a reducir el arrastre (drag) en línea recta con sistemas como el DRS para ganar velocidad", position: new THREE.Vector3(0, 0.4, -4) },
    { name: "Halo", desc: "Protege la cabeza del piloto de impactos directos, como objetos sueltos o choques con otros autos. Está hecho de titanio y soporta enormes fuerzas sin bloquear la visión del conductor", position: new THREE.Vector3(0.1, 0.65, 1) },
    { name: "Frenos", desc: "Permiten desacelerar el auto rápidamente antes de curvas, convirtiendo la energía cinética en calor. Usan discos de carbono que alcanzan hasta 1000 °C y son clave para el rendimiento y la estrategia de carrera", position: new THREE.Vector3(-0.85, 0.35, 2.5) },
    { name: "Pontón", desc: "Alberga radiadores que enfrían el motor y otros sistemas críticos del auto. Además, su forma aerodinámica guía el flujo de aire hacia la parte trasera para mejorar la eficiencia y el rendimiento general", position: new THREE.Vector3(1, -0.3, -1) },
  ];

  // Tooltip global
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  Object.assign(tooltip.style, {
    position: 'absolute',
    padding: '6px 10px',
    maxWidth: '200px',
    display: 'none',
    pointerEvents: 'none',
    zIndex: '10',
    whiteSpace: 'normal',
    cursor: 'default',
  });
  container.appendChild(tooltip);

  // Crear hotspots
  hotspots.forEach(h => {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.innerHTML = `<strong>${h.name}</strong>`;
    Object.assign(el.style, {
      position: 'absolute',
      pointerEvents: 'auto',
      padding: '6px 10px',
      color: 'white',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      transform: 'translate(-50%, -50%)',
      display: 'none',
    });

    el.addEventListener('mouseenter', () => {
      tooltip.innerText = h.desc;
      tooltip.style.display = 'block';
    });

    el.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      tooltip.style.left = `${offsetX + 10}px`;
      tooltip.style.top = `${offsetY + 10}px`;
    });

    el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    container.appendChild(el);
    h.element = el;
  });

  // ----- Draco + GLTFLoader -----
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  // Modelo
  loader.load(
    '../models/f1_2026_release_car.glb',
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      model.position.set(0, 0, 0);
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      controls.update();

      console.log('✅ Modelo 3D cargado correctamente');
      animate();
    },
    (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`📦 Cargando modelo: ${percent.toFixed(0)}%`);
    },
    (error) => {
      console.error('❌ Error al cargar modelo:', error);
    }
  );

  // Loop de animación
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    hotspots.forEach(h => {
      const screenPos = h.position.clone().project(camera);
      const x = (screenPos.x * 0.5 + 0.5) * container.clientWidth;
      const y = (1 - (screenPos.y * 0.5 + 0.5)) * container.clientHeight;

      if (screenPos.z < 1) {
        h.element.style.left = `${x}px`;
        h.element.style.top = `${y}px`;
        h.element.style.display = 'block';
      } else {
        h.element.style.display = 'none';
      }
    });
  }

  // Retornar referencias para el resize
  return { camera, renderer, controls };
}