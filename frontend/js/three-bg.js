/* Ambient 3D showroom background for Ramalinga Enterprises.
   Builds a handful of low-poly appliance silhouettes (fridge, washer, fan,
   AC unit) out of primitives and lets them drift/rotate slowly behind the
   page content. Purely decorative — respects prefers-reduced-motion. */

(function () {
  const canvasHost = document.getElementById("appliance-bg");
  if (!canvasHost || typeof THREE === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 14);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvasHost,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // --- lighting: warm copper key + cool teal fill, like a showroom floor ---
  const ambient = new THREE.AmbientLight(0x1c2f39, 1.4);
  scene.add(ambient);

  const key = new THREE.PointLight(0xc97a3d, 90, 40);
  key.position.set(6, 8, 8);
  scene.add(key);

  const fill = new THREE.PointLight(0x6fa8ae, 60, 40);
  fill.position.set(-8, -4, 6);
  scene.add(fill);

  const matBody = new THREE.MeshStandardMaterial({
    color: 0x223642,
    roughness: 0.45,
    metalness: 0.75,
  });
  const matAccent = new THREE.MeshStandardMaterial({
    color: 0xc97a3d,
    roughness: 0.3,
    metalness: 0.6,
  });
  const matTeal = new THREE.MeshStandardMaterial({
    color: 0x6fa8ae,
    roughness: 0.35,
    metalness: 0.5,
  });

  const rig = new THREE.Group();
  scene.add(rig);

  function addToRig(mesh, x, y, z, speed) {
    mesh.position.set(x, y, z);
    mesh.userData.speed = speed;
    rig.add(mesh);
    return mesh;
  }

  // --- Refrigerator: tall box + handle + accent line ---
  function makeFridge() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.4, 1.4), matBody);
    g.add(body);
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
      matAccent
    );
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0.95, 0.4, 0.4);
    g.add(handle);
    const line = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.04, 1.42), matAccent);
    line.position.y = 0.6;
    g.add(line);
    return g;
  }

  // --- Washing machine: box body + rotating drum (torus) ---
  function makeWasher() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 1.8), matBody);
    g.add(body);
    const drum = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.16, 12, 28),
      matTeal
    );
    drum.position.z = 0.92;
    g.add(drum);
    g.userData.drum = drum;
    return g;
  }

  // --- Pedestal / tower fan: base + pole + blade ring ---
  function makeFan() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.65, 0.25, 20),
      matBody
    );
    base.position.y = -1.6;
    g.add(base);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10),
      matBody
    );
    pole.position.y = -0.4;
    g.add(pole);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 10, 24), matAccent);
    ring.position.y = 1.1;
    g.add(ring);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matTeal);
    hub.position.y = 1.1;
    g.add(hub);
    g.userData.ring = ring;
    return g;
  }

  // --- Split AC unit: long rounded box ---
  function makeAC() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 0.7), matBody);
    g.add(body);
    const vent = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.5), matTeal);
    vent.position.y = -0.32;
    g.add(vent);
    return g;
  }

  const fridge = makeFridge();
  addToRig(fridge, -6.5, 1.2, -2, 0.05);

  const washer = makeWasher();
  addToRig(washer, 6.5, -1.4, -3, -0.07);

  const fan = makeFan();
  addToRig(fan, -4.2, -2.6, 2, 0.09);

  const ac = makeAC();
  addToRig(ac, 5, 2.6, 1, -0.04);

  const shapes = [fridge, washer, fan, ac];

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!reduceMotion) {
      shapes.forEach((s, i) => {
        s.rotation.y = t * 0.15 + i;
        s.position.y += Math.sin(t * 0.5 + i) * 0.0015;
      });
      if (washer.userData.drum) washer.userData.drum.rotation.z = t * 0.6;
      if (fan.userData.ring) fan.userData.ring.rotation.z = t * 1.4;
      rig.rotation.y = Math.sin(t * 0.05) * 0.15;
    }

    renderer.render(scene, camera);
  }

  animate();
})();
