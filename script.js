// 3D Spinner with sections controlled by scroll
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('three-bg');
  if (!container || !window.THREE) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0); // transparent
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Sections this spinner represents (use existing page sections)
  const sectionIds = ['hero', 'about', 'experience', 'education', 'skills', 'contact'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  // Spinner made of box segments arranged in a ring
  const spinnerGroup = new THREE.Group();
  scene.add(spinnerGroup);

  const segmentCount = sections.length || 6;
  const angleStep = (Math.PI * 2) / segmentCount;
  const radius = 1.3;
  // Palette aligned with black / white / light blue theme
  const baseColors = [
    0x020617, // near black
    0x0f172a, // dark slate
    0x1d4ed8, // medium blue
    0x38bdf8, // light blue
    0xe0f2fe, // very light blue
    0x1e293b, // slate
  ];

  // Simple "icons" for each section (emoji glyphs)
  const sectionGlyphs = ['⌂', '👤', '💼', '🎓', '⚙', '✉'];

  function createIconMesh(glyph, color) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);
    // Draw transparent background, glowing circle + glyph
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    ctx.font = `${size * 0.45}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.fillText(glyph, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(0.45, 0.45);
    return new THREE.Mesh(geometry, material);
  }

  for (let i = 0; i < segmentCount; i++) {
    const color = baseColors[i % baseColors.length];
    const segmentGeo = new THREE.BoxGeometry(0.35, 1.3, 0.4);
    const segmentMat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.5,
      roughness: 0.35,
      emissive: color,
      emissiveIntensity: 0.15,
    });
    const segment = new THREE.Mesh(segmentGeo, segmentMat);

    const angle = i * angleStep;
    segment.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    segment.lookAt(new THREE.Vector3(0, 0, 0));

    // Icon sitting just "in front" / above each segment
    const glyph = sectionGlyphs[i % sectionGlyphs.length];
    const iconMesh = createIconMesh(glyph, color);
    if (iconMesh) {
      iconMesh.position.set(0, segmentGeo.parameters.height / 2 + 0.25, 0.25);
      iconMesh.lookAt(new THREE.Vector3(0, segmentGeo.parameters.height / 2 + 0.25, 0));
      segment.add(iconMesh);
    }

    spinnerGroup.add(segment);
  }

  // Slight tilt so spinner feels 3D
  spinnerGroup.rotation.x = 0.35;

  // Responsive resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Scroll → figure out which section is "active"
  function getActiveSectionIndex() {
    if (!sections.length) return 0;

    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    sections.forEach((sectionEl, index) => {
      const rect = sectionEl.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  let targetRotationY = 0;

  function updateSpinnerTargetFromScroll() {
    const activeIndex = getActiveSectionIndex();
    // Rotate so the corresponding segment faces the camera
    targetRotationY = -activeIndex * angleStep;
  }

  window.addEventListener('scroll', updateSpinnerTargetFromScroll, { passive: true });
  updateSpinnerTargetFromScroll();

  // Animate with smooth rotation toward target
  function animate() {
    requestAnimationFrame(animate);
    spinnerGroup.rotation.y += (targetRotationY - spinnerGroup.rotation.y) * 0.1;
    renderer.render(scene, camera);
  }
  animate();

  // ===========================
  // Rubik's Cube in hero section
  // ===========================
  const cubeContainer = document.getElementById('rubiks-cube-canvas');
  if (!cubeContainer) return;

  const cubeScene = new THREE.Scene();
  const cubeCamera = new THREE.PerspectiveCamera(
    45,
    cubeContainer.clientWidth / cubeContainer.clientHeight,
    0.1,
    100
  );
  cubeCamera.position.set(4, 4, 6);
  cubeCamera.lookAt(0, 0, 0);

  const cubeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  cubeRenderer.setClearColor(0x000000, 0);
  cubeRenderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
  cubeContainer.appendChild(cubeRenderer.domElement);

  const cubeAmbient = new THREE.AmbientLight(0xffffff, 0.7);
  cubeScene.add(cubeAmbient);
  const cubeDir = new THREE.DirectionalLight(0xffffff, 0.9);
  cubeDir.position.set(5, 8, 4);
  cubeScene.add(cubeDir);

  // Create a simple 3x3x3 cube made of small cubes
  const cubeGroup = new THREE.Group();
  cubeScene.add(cubeGroup);

  const smallSize = 0.8;
  const gap = 0.02;

  const rubikColors = [
    0xffffff, // white
    0xff6b6b, // red
    0xffd93d, // yellow
    0x4ecdc4, // light teal
    0x1a535c, // dark teal
    0x38bdf8, // light blue
  ];

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.4,
    metalness: 0.3,
  });

  function createStickerMaterial(color) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.2,
      emissive: color,
      emissiveIntensity: 0.1,
    });
  }

  const stickerMaterials = rubikColors.map(createStickerMaterial);

  function createCubie(x, y, z) {
    const geo = new THREE.BoxGeometry(smallSize, smallSize, smallSize);
    const mats = [];

    for (let i = 0; i < 6; i++) {
      let mat = baseMaterial;
      if (i === 0 && y === 1) mat = stickerMaterials[0]; // top
      if (i === 1 && y === -1) mat = stickerMaterials[1]; // bottom
      if (i === 2 && x === 1) mat = stickerMaterials[2]; // right
      if (i === 3 && x === -1) mat = stickerMaterials[3]; // left
      if (i === 4 && z === 1) mat = stickerMaterials[4]; // front
      if (i === 5 && z === -1) mat = stickerMaterials[5]; // back
      mats.push(mat);
    }

    const mesh = new THREE.Mesh(geo, mats);
    mesh.position.set(
      x * (smallSize + gap),
      y * (smallSize + gap),
      z * (smallSize + gap)
    );
    return mesh;
  }

  const cubies = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cubie = createCubie(x, y, z);
        cubeGroup.add(cubie);
        cubies.push(cubie);
      }
    }
  }

  // Precompute positions for two modes:
  // 1) original 3x3x3 cube
  // 2) flattened grid formation
  const originalPositions = cubies.map(c => c.position.clone());

  const cols = 6; // grid columns
  const rows = Math.ceil(cubies.length / cols);
  const gridSpacing = smallSize + gap * 2;
  const gridPositions = cubies.map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * gridSpacing;
    const y = ((rows - 1) / 2 - row) * gridSpacing;
    const z = 0;
    return new THREE.Vector3(x, y, z);
  });

  let cubeMode = 'cube'; // 'cube' or 'grid'
  let transitionStart = 0;
  let transitionDuration = 600;
  let transitioning = false;
  let targetMode = 'cube';

  function startTransition(nextMode) {
    if (nextMode === cubeMode && !transitioning) return;
    targetMode = nextMode;
    transitionStart = performance.now();
    transitioning = true;
  }

  cubeContainer.addEventListener('mouseenter', () => {
    startTransition('grid');
  });

  cubeContainer.addEventListener('mouseleave', () => {
    startTransition('cube');
  });

  function renderCube() {
    requestAnimationFrame(renderCube);

    const now = performance.now();

    // Handle morph between cube and grid
    if (transitioning) {
      const elapsed = now - transitionStart;
      let t = Math.min(1, elapsed / transitionDuration);
      // ease in-out
      t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const goingToGrid = targetMode === 'grid';
      const a = goingToGrid ? t : 1 - t;
      const b = goingToGrid ? 1 - t : t;

      cubies.forEach((c, idx) => {
        const from = originalPositions[idx];
        const to = gridPositions[idx];
        c.position.set(
          from.x * b + to.x * a,
          from.y * b + to.y * a,
          from.z * b + to.z * a
        );
      });

      if (elapsed >= transitionDuration) {
        transitioning = false;
        cubeMode = targetMode;
        // Snap exactly to target positions
        cubies.forEach((c, idx) => {
          const finalPos =
            cubeMode === 'grid' ? gridPositions[idx] : originalPositions[idx];
          c.position.copy(finalPos);
        });
      }
    }

    // Smooth continuous motion
    const time = now * 0.001;
    if (cubeMode === 'cube' && !transitioning) {
      cubeGroup.rotation.y = time * 0.6;
      cubeGroup.rotation.x = Math.sin(time * 0.7) * 0.5;
      cubeGroup.rotation.z = Math.cos(time * 0.4) * 0.3;
    } else {
      // Keep orientation stable in grid mode
      cubeGroup.rotation.y = 0.4;
      cubeGroup.rotation.x = -0.3;
      cubeGroup.rotation.z = 0.1;
    }

    cubeRenderer.render(cubeScene, cubeCamera);
  }
  renderCube();

  window.addEventListener('resize', () => {
    const { clientWidth, clientHeight } = cubeContainer;
    cubeCamera.aspect = clientWidth / clientHeight;
    cubeCamera.updateProjectionMatrix();
    cubeRenderer.setSize(clientWidth, clientHeight);
  });
});
