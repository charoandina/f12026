// Toggle - Guia Items
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.guia_item_container');
  
  // Variables globales para Three.js (necesarias para el resize)
  let camera, renderer, controls;

  // 🚀 Inicializar el modelo 3D inmediatamente al cargar la página
  console.log('Inicializando modelo 3D al cargar página...');
  
  // Encontrar el contenedor de monoplazas y mostrarlo temporalmente
  const monoplazasContainer = document.querySelector('.monoplazas');
  const monoplazasContent = monoplazasContainer?.querySelector('.guia_item');
  
  if (monoplazasContent) {
    // Remover hidden temporalmente para que tenga dimensiones
    const wasHidden = monoplazasContent.classList.contains('hidden');
    monoplazasContent.classList.remove('hidden');
    monoplazasContent.style.display = 'block';
    
    initMonoplazas3D().then(result => {
      camera = result.camera;
      renderer = result.renderer;
      controls = result.controls;
      console.log('✅ Modelo 3D pre-cargado y listo');
      
      // Volver a ocultar si estaba oculto originalmente
      if (wasHidden) {
        monoplazasContent.classList.add('hidden');
        monoplazasContent.style.display = 'none';
      }
    }).catch(err => {
      console.error('❌ Error pre-cargando 3D:', err);
      
      // Volver a ocultar en caso de error
      if (wasHidden) {
        monoplazasContent.classList.add('hidden');
        monoplazasContent.style.display = 'none';
      }
    });
  }

  containers.forEach(container => {
    const title = container.querySelector('.guia_title');
    const content = container.querySelector('.guia_item'); // Este es el elemento que tiene 'hidden'
    const chevron = title.querySelector('svg:last-child');

    // Verificar que los elementos existan
    if (!title || !content || !chevron) {
      console.error('Elementos no encontrados:', { title, content, chevron });
      return;
    }

    // Hacer el título clickeable
    title.style.cursor = 'pointer';
    chevron.style.transition = 'transform 0.3s ease';

    title.addEventListener('click', () => {
      console.log('Click en título');
      
      // Toggle del contenido
      const isHidden = content.classList.contains('hidden');
      
      if (isHidden) {
        // Mostrar
        content.classList.remove('hidden');
        content.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
        console.log('Mostrando contenido');
        
        // Si es monoplazas y ya está cargado el 3D, reajustar dimensiones
        if (container.classList.contains('monoplazas') && camera && renderer) {
          setTimeout(() => {
            const canvasContent = document.getElementById('monoplazas-content');
            if (canvasContent) {
              camera.aspect = canvasContent.clientWidth / canvasContent.clientHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(canvasContent.clientWidth, canvasContent.clientHeight);
            }
          }, 300);
        }
      } else {
        // Ocultar
        content.classList.add('hidden');
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
        console.log('Ocultando contenido');
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
  try {
    // Importar Three.js dinámicamente
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

    // Contenedor
    const container = document.getElementById('monoplazas-content');
    
    if (!container) {
      throw new Error('Contenedor #monoplazas-content no encontrado');
    }

    // Forzar dimensiones del contenedor
    container.style.minHeight = '600px';
    container.style.width = '100%';
    container.style.position = 'relative';
    
    // Esperar un frame para que el navegador aplique los estilos
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    console.log('Dimensiones del contenedor:', container.clientWidth, 'x', container.clientHeight);
    
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      throw new Error('El contenedor sigue sin dimensiones después de asignar estilos');
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
    // Vista diagonal frente-DERECHA (X positivo en lugar de negativo)
    camera.position.set(6, 2.5, 8); // Cambié -6 a 6 para verlo desde la derecha
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0); // Mirar al centro del modelo
    controls.minDistance = 5; // Distancia mínima de zoom
    controls.maxDistance = 30; // Distancia máxima de zoom
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '1.4',
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
        backgroundColor: 'rgba(204, 0, 0, 0.9)',
        borderRadius: '4px',
        cursor: 'pointer',
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
        
        // NO rotar el modelo - dejarlo en su orientación original
        // model.rotation.y = Math.PI; // REMOVIDO
        
        // Escalar el modelo
        model.scale.set(0.8, 0.8, 0.8);
        
        // Centrar el modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Mover al centro (0,0,0)
        
        scene.add(model);
        
        // Actualizar controles para que miren al centro
        controls.target.set(0, 0, 0);
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
  } catch (error) {
    console.error('Error fatal en initMonoplazas3D:', error);
    throw error;
  }
}