/**
 * ANVIL — photoreal-ish layered 3D smash, scrubbed by scroll.
 * Independent of AI video APIs.
 */
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ACTS = [
  { at: 0.0, act: "01 — Rest", title: "The beef waits", body: "On the wood. Cold. Ready for the steel." },
  { at: 0.12, act: "02 — Lift", title: "Off the table", body: "The smash rises into the air." },
  { at: 0.28, act: "03 — Split", title: "It opens", body: "Layers begin to breathe apart." },
  { at: 0.48, act: "04 — Explode", title: "Every layer", body: "Bun, pickle, cheddar, beef — alone." },
  { at: 0.66, act: "05 — Gather", title: "Pulling back", body: "The build remembers itself." },
  { at: 0.82, act: "06 — Land", title: "Back on wood", body: "Rebuilt. Still hot." },
  { at: 0.93, act: "07 — Menu", title: "The line-up", body: "Bright table. Quiet type." },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

const canvas = document.getElementById("c");
const loaderEl = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");
const progressEl = document.getElementById("progress");
const track = document.getElementById("track");
const nav = document.getElementById("nav");
const hint = document.getElementById("hint");
const actEl = document.getElementById("act");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");

let targetP = 0;
let currentP = 0;
let activeAct = -1;
let parts = []; // { mesh, homeY, homeX, homeZ, homeRot, explodeY, explodeX, explodeZ, explodeRot }

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050506);
scene.fog = new THREE.Fog(0x050506, 6, 14);

const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 40);
camera.position.set(0, 1.15, 3.55);
camera.lookAt(0, 0.55, 0);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// Lights
const key = new THREE.DirectionalLight(0xfff2e0, 2.4);
key.position.set(2.4, 5.2, 2.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 16;
key.shadow.camera.left = -3;
key.shadow.camera.right = 3;
key.shadow.camera.top = 3;
key.shadow.camera.bottom = -3;
key.shadow.bias = -0.0002;
scene.add(key);

const fill = new THREE.DirectionalLight(0xb8c8ff, 0.55);
fill.position.set(-3, 2, -1);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffd4a8, 0.85);
rim.position.set(0, 1.5, -3);
scene.add(rim);

scene.add(new THREE.AmbientLight(0xffffff, 0.18));

const texLoader = new THREE.TextureLoader();
function loadTex(url) {
  return new Promise((resolve, reject) => {
    texLoader.load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        resolve(t);
      },
      undefined,
      reject
    );
  });
}

function disk(radius, height, topMat, sideColor = 0x333333, segs = 96) {
  // Caps get the food texture; side gets a solid rim color (UVs otherwise stretch badly).
  const sideMat = new THREE.MeshStandardMaterial({
    color: sideColor,
    roughness: 0.7,
    metalness: 0.02,
  });
  const g = new THREE.CylinderGeometry(radius, radius, height, segs);
  const m = new THREE.Mesh(g, [sideMat, topMat, topMat]);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function bunTop(mat, radius = 0.62) {
  // Domed bun via lathe
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = Math.sin(t * Math.PI * 0.5) * radius;
    const y = Math.cos(t * Math.PI * 0.5) * 0.28 + (1 - t) * 0.02;
    pts.push(new THREE.Vector2(x, y));
  }
  const g = new THREE.LatheGeometry(pts, 96);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function wavyLettuce(mat) {
  const g = new THREE.CircleGeometry(0.68, 64);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, y);
    const edge = Math.min(1, r / 0.68);
    pos.setZ(i, Math.sin(x * 18) * 0.012 * edge + Math.cos(y * 16) * 0.01 * edge);
  }
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function addPart(mesh, opts) {
  scene.add(mesh);
  mesh.position.set(opts.x || 0, opts.y, opts.z || 0);
  if (opts.rx) mesh.rotation.x = opts.rx;
  if (opts.rz) mesh.rotation.z = opts.rz;
  parts.push({
    mesh,
    homeY: opts.y,
    homeX: opts.x || 0,
    homeZ: opts.z || 0,
    homeRotX: mesh.rotation.x,
    homeRotZ: mesh.rotation.z,
    explodeY: opts.ey,
    explodeX: opts.ex || 0,
    explodeZ: opts.ez || 0,
    explodeRotX: opts.erx || 0,
    explodeRotZ: opts.erz || 0,
  });
  return mesh;
}

async function buildBurger() {
  const [
    bunTopMap,
    bunBotMap,
    pattyMap,
    cheeseMap,
    lettuceMap,
    tomatoMap,
    woodDiff,
    woodNor,
    woodRough,
  ] = await Promise.all([
    loadTex("./public/textures/bun-top.jpg"),
    loadTex("./public/textures/bun-bot.jpg"),
    loadTex("./public/textures/patty.jpg"),
    loadTex("./public/textures/cheese.jpg"),
    loadTex("./public/textures/lettuce.jpg"),
    loadTex("./public/textures/tomato.jpg"),
    loadTex("./public/textures/wood_diff.jpg"),
    loadTex("./public/textures/wood_nor.jpg"),
    loadTex("./public/textures/wood_rough.jpg"),
  ]);

  // Try HDRI (optional upgrade over RoomEnvironment)
  try {
    const hdr = await new Promise((resolve, reject) => {
      new RGBELoader().load("./public/hdr/studio.hdr", resolve, undefined, reject);
    });
    const env = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = env;
    hdr.dispose();
  } catch (_) {
    /* RoomEnvironment already set */
  }

  woodDiff.repeat.set(2, 2);
  woodNor.repeat.set(2, 2);
  woodRough.repeat.set(2, 2);

  // Table
  const tableMat = new THREE.MeshStandardMaterial({
    map: woodDiff,
    normalMap: woodNor,
    roughnessMap: woodRough,
    roughness: 0.72,
    metalness: 0.02,
  });
  const table = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.08, 64), tableMat);
  table.position.y = 0;
  table.receiveShadow = true;
  scene.add(table);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshStandardMaterial({ color: 0x080809, roughness: 1, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  scene.add(floor);

  tableMat.color = new THREE.Color(0x2a1c14);
  tableMat.roughness = 0.85;

  const bunTopMat = new THREE.MeshPhysicalMaterial({
    map: bunTopMap,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.7,
  });
  const bunBotMat = new THREE.MeshPhysicalMaterial({
    map: bunBotMap,
    roughness: 0.7,
    metalness: 0,
  });
  const pattyMat = new THREE.MeshStandardMaterial({
    map: pattyMap,
    roughness: 0.78,
    metalness: 0.05,
  });
  const cheeseMat = new THREE.MeshPhysicalMaterial({
    map: cheeseMap,
    roughness: 0.28,
    metalness: 0.05,
    clearcoat: 0.55,
    clearcoatRoughness: 0.35,
    transmission: 0.04,
    thickness: 0.15,
  });
  const lettuceMat = new THREE.MeshPhysicalMaterial({
    map: lettuceMap,
    roughness: 0.55,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
  });
  const tomatoMat = new THREE.MeshPhysicalMaterial({
    map: tomatoMap,
    roughness: 0.35,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.4,
  });
  const pickleMat = new THREE.MeshPhysicalMaterial({
    color: 0x6f9a3a,
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.35,
  });
  const onionMat = new THREE.MeshPhysicalMaterial({
    color: 0xc47aa0,
    roughness: 0.45,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });

  // Tight assembled stack (home). Explode offsets are EXTRA separation.
  let y = 0.045;
  const stack = (mesh, h, explode) => {
    y += h / 2;
    addPart(mesh, { y, ...explode });
    y += h / 2 + 0.004;
  };

  stack(disk(0.58, 0.12, bunBotMat, 0xc4a06a), 0.12, {
    ey: 0.02, ex: -0.04, ez: 0.06, erz: 0.12,
  });
  stack(disk(0.6, 0.055, pattyMat, 0x3a2218, 128), 0.055, {
    ey: 0.32, ex: 0.1, ez: -0.08, erx: 0.18,
  });
  stack(disk(0.63, 0.028, cheeseMat, 0xe8a83a, 64), 0.028, {
    ey: 0.58, ex: -0.16, ez: 0.1, erz: -0.3,
  });
  stack(disk(0.6, 0.055, pattyMat, 0x3a2218, 128), 0.055, {
    ey: 0.9, ex: 0.07, ez: 0.14, erx: -0.12,
  });
  stack(disk(0.63, 0.028, cheeseMat, 0xe8a83a, 64), 0.028, {
    ey: 1.2, ex: -0.09, ez: -0.16, erz: 0.35,
  });

  const pickleA = disk(0.17, 0.025, pickleMat, 0x5f8a32, 32);
  addPart(pickleA, { y: y + 0.02, x: -0.17, z: 0.1, ey: 1.48, ex: -0.5, ez: 0.32, erx: 0.55 });
  const pickleB = disk(0.16, 0.025, pickleMat, 0x5f8a32, 32);
  addPart(pickleB, { y: y + 0.02, x: 0.18, z: -0.08, ey: 1.55, ex: 0.55, ez: -0.35, erz: -0.45 });
  y += 0.04;

  const onionGeo = new THREE.TorusGeometry(0.26, 0.022, 12, 48);
  const onion = new THREE.Mesh(onionGeo, onionMat);
  onion.rotation.x = Math.PI / 2;
  onion.castShadow = true;
  addPart(onion, { y: y + 0.02, ey: 1.82, ex: 0.32, ez: 0.22, erx: 0.7 });
  y += 0.04;

  stack(disk(0.54, 0.04, tomatoMat, 0xb83a32, 64), 0.04, {
    ey: 2.1, ex: -0.22, ez: 0.18, erx: 0.2,
  });
  stack(disk(0.5, 0.04, tomatoMat, 0xb83a32, 64), 0.04, {
    ey: 2.3, ex: 0.28, ez: -0.12, erz: -0.18,
  });

  addPart(wavyLettuce(lettuceMat), {
    y: y + 0.01, ey: 2.65, ex: -0.12, ez: 0.18, erx: 0.3,
  });
  y += 0.03;

  addPart(bunTop(bunTopMat), {
    y: y + 0.02, ey: 3.05, ex: 0.06, ez: -0.1, erx: -0.15, erz: 0.12,
  });

  // Sesame on dome (local space)
  const seedMat = new THREE.MeshStandardMaterial({ color: 0xf2e2b6, roughness: 0.5 });
  const seedGeo = new THREE.SphereGeometry(0.011, 8, 8);
  const bun = parts[parts.length - 1].mesh;
  for (let i = 0; i < 48; i++) {
    const s = new THREE.Mesh(seedGeo, seedMat);
    const a = Math.random() * Math.PI * 2;
    const elev = 0.35 + Math.random() * 0.55;
    const r = Math.sin(elev) * 0.48 * (0.55 + Math.random() * 0.45);
    s.position.set(Math.cos(a) * r, Math.cos(elev) * 0.26 + 0.02, Math.sin(a) * r);
    bun.add(s);
  }
}

function explodeAmount(p) {
  // 0 rest → lift → peak explode ~0.48 → gather → land ~0.85
  if (p < 0.1) return 0;
  if (p < 0.22) return smooth((p - 0.1) / 0.12) * 0.18; // lift mostly as group later
  if (p < 0.48) return 0.18 + smooth((p - 0.22) / 0.26) * 0.82;
  if (p < 0.66) return 1;
  if (p < 0.85) return 1 - smooth((p - 0.66) / 0.19);
  return 0;
}

function liftAmount(p) {
  if (p < 0.08) return 0;
  if (p < 0.22) return smooth((p - 0.08) / 0.14);
  if (p < 0.85) return 1;
  if (p < 0.95) return 1 - smooth((p - 0.85) / 0.1);
  return 0;
}

function applyPose(p) {
  const e = explodeAmount(p);
  const lift = liftAmount(p) * 0.55;

  for (const part of parts) {
    const y = lerp(part.homeY, part.homeY + part.explodeY, e) + lift;
    const x = lerp(part.homeX, part.homeX + part.explodeX, e);
    const z = lerp(part.homeZ, part.homeZ + part.explodeZ, e);
    part.mesh.position.set(x, y, z);
    part.mesh.rotation.x = lerp(part.homeRotX, part.homeRotX + part.explodeRotX, e);
    part.mesh.rotation.z = lerp(part.homeRotZ, part.homeRotZ + part.explodeRotZ, e);
  }

  // Camera push-in / slight orbit
  const orbit = p * Math.PI * 0.35;
  const radius = lerp(3.55, 3.15, smooth(Math.min(1, p * 1.2)));
  const camY = lerp(1.15, 1.55, explodeAmount(p) * 0.85);
  camera.position.set(Math.sin(orbit) * radius * 0.15, camY, radius);
  camera.lookAt(0, 0.55 + lift * 0.35 + explodeAmount(p) * 0.7, 0);

  // Background brightens near end (menu world)
  const bright = smooth(clamp((p - 0.9) / 0.08));
  const bg = new THREE.Color().setHSL(0.08, 0.05, lerp(0.02, 0.92, bright));
  scene.background = bg;
  scene.fog.color.copy(bg);
  scene.fog.near = lerp(6, 20, bright);
  scene.fog.far = lerp(14, 40, bright);
  key.intensity = lerp(2.4, 1.4, bright);
}

function setAct(i) {
  if (i === activeAct) return;
  activeAct = i;
  const a = ACTS[i];
  actEl.textContent = a.act;
  titleEl.textContent = a.title;
  bodyEl.textContent = a.body;
}

function actFromP(p) {
  let idx = 0;
  for (let i = 0; i < ACTS.length; i++) if (p >= ACTS[i].at) idx = i;
  return idx;
}

function readProgress() {
  const vh = window.innerHeight || 1;
  const total = Math.max(1, track.offsetHeight - vh);
  return clamp(-track.getBoundingClientRect().top / total);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}

function tick() {
  currentP = lerp(currentP, targetP, 0.14);
  if (Math.abs(currentP - targetP) < 0.0005) currentP = targetP;
  applyPose(currentP);
  setAct(actFromP(currentP));
  progressEl.style.width = `${currentP * 100}%`;
  hint.style.opacity = currentP > 0.04 && currentP < 0.88 ? "0.45" : "0";
  const onMenu = document.getElementById("menu").getBoundingClientRect().top < window.innerHeight * 0.55;
  nav.classList.toggle("is-light", currentP > 0.92 || onMenu);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

async function boot() {
  resize();
  let prog = 0;
  const timer = setInterval(() => {
    prog = Math.min(0.9, prog + 0.04);
    loaderBar.style.width = `${Math.round(prog * 100)}%`;
  }, 80);

  await buildBurger();
  clearInterval(timer);
  loaderBar.style.width = "100%";
  applyPose(0);
  loaderEl.classList.add("is-done");

  const lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.35 });
  window.__anvilLenis = lenis;
  lenis.on("scroll", () => {
    targetP = readProgress();
  });
  function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  window.addEventListener("resize", resize);
  targetP = readProgress();
  requestAnimationFrame(tick);
}

boot().catch((err) => {
  console.error(err);
  loaderEl.classList.add("is-done");
});
