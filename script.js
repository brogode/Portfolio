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
  // Muted, professional palette matching the site theme
  const baseColors = [0x6366f1, 0x0ea5e9, 0x22c55e, 0xf97316, 0xec4899, 0xeab308];

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
});
