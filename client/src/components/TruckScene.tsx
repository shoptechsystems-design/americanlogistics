import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type ViewKey = "front" | "side" | "chase";

const VIEWS: Record<ViewKey, { label: string; pos: [number, number, number]; target: [number, number, number] }> = {
  front: { label: "Front", pos: [14, 3.4, 15], target: [-1.2, 1.9, 0] },
  side: { label: "Side", pos: [-3, 3.0, 29], target: [-3, 1.9, 0] },
  chase: { label: "Chase", pos: [-25, 5.8, 12], target: [-2, 2.1, 0] },
};

const AMBER = 0xff9f1c;
const WRAP = 110; // environment loops across [-WRAP, WRAP]

function radialTexture(inner: string, outer = "rgba(0,0,0,0)") {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function trailerTexture() {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 560;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, 560);
  bg.addColorStop(0, "#f4f7fb");
  bg.addColorStop(1, "#cfd8e2");
  g.fillStyle = bg;
  g.fillRect(0, 0, 2048, 560);
  g.fillStyle = "#ff9f1c";
  g.fillRect(0, 430, 2048, 46);
  g.fillStyle = "#0c1219";
  g.fillRect(0, 476, 2048, 84);
  // mark
  g.save();
  g.translate(250, 215);
  g.rotate(Math.PI / 4);
  g.strokeStyle = "#ff9f1c";
  g.lineWidth = 16;
  g.strokeRect(-70, -70, 140, 140);
  g.restore();
  g.fillStyle = "#ff9f1c";
  g.beginPath(); g.arc(205, 245, 17, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(300, 185, 17, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#ff9f1c"; g.lineWidth = 11;
  g.beginPath(); g.moveTo(205, 245); g.lineTo(300, 185); g.stroke();
  g.textBaseline = "alphabetic";
  g.fillStyle = "#0c1219";
  g.font = "900 150px Arial Black, Helvetica, Arial, sans-serif";
  g.fillText("AMERICAN", 440, 235);
  g.fillStyle = "#ff8a00";
  g.fillText("LOGISTICS", 440, 380);
  g.fillStyle = "#44525f";
  g.font = "700 46px Helvetica, Arial, sans-serif";
  g.fillText("FREIGHT DISPATCH  ·  24/7  ·  CARRIER FIRST", 444, 428 - 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export default function TruckScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLSpanElement>(null);
  const viewRef = useRef<ViewKey>("front");
  const [view, setView] = useState<ViewKey>("front");

  useEffect(() => { viewRef.current = view; }, [view]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 720;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const NIGHT = 0x060a10;
    scene.background = new THREE.Color(NIGHT);
    scene.fog = new THREE.Fog(NIGHT, 28, 120);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.7;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);

    // ---------- lights ----------
    scene.add(new THREE.HemisphereLight(0x7f9fca, 0x121a26, 1.0));
    const moon = new THREE.DirectionalLight(0xb4cdf2, 1.7);
    moon.position.set(-14, 20, 18);
    scene.add(moon);
    const rim = new THREE.DirectionalLight(0xff9f1c, 1.1);
    rim.position.set(14, 6, -16);
    scene.add(rim);

    // ---------- materials ----------
    const cabPaint = new THREE.MeshStandardMaterial({ color: 0x33465e, metalness: 0.55, roughness: 0.32 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xcfd6de, metalness: 1, roughness: 0.18 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x151b23, metalness: 0.4, roughness: 0.65 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x1d3a5a, metalness: 0.9, roughness: 0.06 });
    const tire = new THREE.MeshStandardMaterial({ color: 0x0a0c0f, metalness: 0.1, roughness: 0.9 });
    const trailerBody = new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 0.35, roughness: 0.45 });
    const accent = new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.4 });
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a1f });
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });

    const disposables: { dispose: () => void }[] = [cabPaint, chrome, dark, glass, tire, trailerBody, accent, headlightMat, tailMat, markerMat, envTexture, pmrem];

    const truck = new THREE.Group();
    scene.add(truck);
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = truck) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      parent.add(m);
      disposables.push(geo);
      return m;
    };
    const rbox = (w: number, h: number, d: number, r = 0.12) => new RoundedBoxGeometry(w, h, d, small ? 2 : 4, r);

    // chassis
    add(new THREE.BoxGeometry(14, 0.32, 1.15), dark, -3.2, 0.78, 0);
    // hood + grille + bumper + lights
    add(rbox(2.0, 1.5, 2.15, 0.2), cabPaint, 2.95, 1.78, 0);
    add(new THREE.BoxGeometry(0.06, 1.0, 1.55), chrome, 3.97, 1.78, 0);
    add(rbox(0.34, 0.46, 2.45, 0.1), chrome, 4.02, 0.98, 0);
    for (const z of [-0.82, 0.82]) add(new THREE.BoxGeometry(0.08, 0.3, 0.5), headlightMat, 3.96, 2.0, z);
    for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.02, 0.92, 0.02), dark, 3.99, 1.78, -0.6 + i * 0.24);
    // cab
    add(rbox(2.15, 2.4, 2.5, 0.22), cabPaint, 1.0, 2.42, 0);
    const windshield = add(new THREE.BoxGeometry(0.06, 1.05, 2.15), glass, 2.06, 2.95, 0);
    windshield.rotation.z = -0.18;
    for (const z of [-1.26, 1.26]) add(new THREE.BoxGeometry(1.2, 0.95, 0.04), glass, 1.35, 2.95, z);
    // sleeper + roof deflector
    add(rbox(1.8, 2.7, 2.5, 0.18), cabPaint, -0.95, 2.55, 0);
    const deflector = add(rbox(1.5, 0.7, 2.25, 0.18), cabPaint, 0.45, 4.05, 0);
    deflector.rotation.z = -0.28;
    add(new THREE.BoxGeometry(2.0, 0.07, 2.32), accent, 1.0, 3.64, 0);
    // door accent stripe
    for (const z of [-1.27, 1.27]) add(new THREE.BoxGeometry(3.6, 0.1, 0.03), accent, 0.1, 1.95, z);
    // stacks + tanks
    for (const z of [-1.4, 1.4]) {
      add(new THREE.CylinderGeometry(0.09, 0.09, 2.7, 12), chrome, -1.9, 3.1, z);
      const tank = add(new THREE.CylinderGeometry(0.42, 0.42, 1.7, 20), chrome, 1.2, 1.0, z * 0.95);
      tank.rotation.z = Math.PI / 2;
    }
    // mirrors
    for (const z of [-1.55, 1.55]) {
      add(new THREE.BoxGeometry(0.1, 0.65, 0.18), dark, 1.9, 3.1, z);
    }
    // trailer
    add(rbox(9.8, 3.1, 2.55, 0.08), trailerBody, -5.5, 2.75, 0);
    add(new THREE.BoxGeometry(9.9, 0.38, 2.3), dark, -5.5, 1.0, 0);
    const logoTex = trailerTexture();
    disposables.push(logoTex);
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false });
    disposables.push(logoMat);
    for (const sign of [1, -1]) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 2.64), logoMat);
      plane.position.set(-5.5, 2.78, sign * 1.285);
      plane.rotation.y = sign === 1 ? 0 : Math.PI;
      truck.add(plane);
      disposables.push(plane.geometry);
    }
    // trailer lights
    for (const z of [-1.0, 1.0]) add(new THREE.BoxGeometry(0.06, 0.28, 0.4), tailMat, -10.42, 1.4, z);
    for (let i = 0; i < 8; i++) for (const z of [-1.29, 1.29]) add(new THREE.BoxGeometry(0.22, 0.09, 0.04), markerMat, -1.2 - i * 1.2, 1.25, z);
    // landing gear + fifth wheel
    add(new THREE.BoxGeometry(1.1, 0.14, 1.6), dark, -0.55, 1.05, 0);

    // wheels (axle along Z, spinning around Z)
    const spinners: THREE.Group[] = [];
    const makeWheel = (x: number, z: number) => {
      const g = new THREE.Group();
      g.position.set(x, 0.58, z);
      const spin = new THREE.Group();
      g.add(spin);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.4, small ? 18 : 28), tire);
      t.rotation.x = Math.PI / 2;
      const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.43, 20), chrome);
      rimMesh.rotation.x = Math.PI / 2;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.46, 10), accent);
      hub.rotation.x = Math.PI / 2;
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.46), dark); // visible spin cue
      spin.add(t, rimMesh, hub, lug);
      truck.add(g);
      spinners.push(spin);
      disposables.push(t.geometry, rimMesh.geometry, hub.geometry, lug.geometry);
    };
    for (const z of [-1.18, 1.18]) makeWheel(3.0, z);
    for (const x of [-0.2, -1.5]) for (const z of [-1.0, -1.5, 1.0, 1.5]) makeWheel(x, z);
    for (const x of [-8.6, -9.8]) for (const z of [-1.0, -1.5, 1.0, 1.5]) makeWheel(x, z);

    // headlight beams
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffe9b8, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    disposables.push(beamMat);
    for (const z of [-0.82, 0.82]) {
      const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 16, 24, 1, true), beamMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(4.0 + 8, 1.5, z * 1.4);
      beam.rotation.x = z > 0 ? -0.04 : 0.04;
      truck.add(beam);
      disposables.push(beam.geometry);
    }
    const spot = new THREE.SpotLight(0xffe2a8, 120, 60, 0.5, 0.6, 1.4);
    spot.position.set(4.1, 1.9, 0);
    spot.target.position.set(24, 0, 0);
    truck.add(spot, spot.target);
    // headlight glow sprite
    const glowTex = radialTexture("rgba(255,236,190,.7)");
    disposables.push(glowTex);
    const lightSprite = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
    disposables.push(lightSprite);
    for (const z of [-0.82, 0.82]) {
      const s = new THREE.Sprite(lightSprite);
      s.scale.set(1.5, 1.5, 1);
      s.position.set(4.15, 2.0, z);
      truck.add(s);
    }
    const redGlow = new THREE.SpriteMaterial({ map: radialTexture("rgba(255,50,40,.9)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
    disposables.push(redGlow);
    for (const z of [-1.0, 1.0]) {
      const s = new THREE.Sprite(redGlow);
      s.scale.set(1.8, 1.8, 1);
      s.position.set(-10.5, 1.4, z);
      truck.add(s);
    }

    // ---------- world ----------
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x0b1017, metalness: 0.35, roughness: 0.3 });
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x070b10, roughness: 1 });
    disposables.push(roadMat, groundMat);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(WRAP * 2.4, 9), roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(WRAP * 2.4, 120), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);
    disposables.push(road.geometry, ground.geometry);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xaab8c8 });
    disposables.push(edgeMat);
    for (const z of [-4.1, 4.1]) {
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(WRAP * 2.4, 0.14), edgeMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(0, 0.012, z);
      scene.add(edge);
      disposables.push(edge.geometry);
    }

    const looping: THREE.Object3D[] = [];
    const dashGeo = new THREE.PlaneGeometry(3, 0.2);
    const dashMat = new THREE.MeshBasicMaterial({ color: AMBER });
    disposables.push(dashGeo, dashMat);
    for (let i = 0; i < 40; i++) {
      for (const z of [-1.35, 1.35]) {
        const d = new THREE.Mesh(dashGeo, dashMat);
        d.rotation.x = -Math.PI / 2;
        d.position.set(-WRAP + (i / 40) * WRAP * 2, 0.014, z);
        scene.add(d);
        looping.push(d);
      }
    }

    // lamp posts
    const poleGeo = new THREE.CylinderGeometry(0.07, 0.1, 7.2, 8);
    const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.9);
    const headGeo = new THREE.BoxGeometry(0.5, 0.1, 0.34);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff1cf });
    const poolTex = radialTexture("rgba(255,214,150,.38)");
    const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const poolGeo = new THREE.PlaneGeometry(10, 8);
    const lampGlow = new THREE.SpriteMaterial({ map: radialTexture("rgba(255,214,150,.8)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    disposables.push(poleGeo, armGeo, headGeo, lampMat, poolTex, poolMat, poolGeo, lampGlow);
    const lampCount = small ? 8 : 14;
    for (let i = 0; i < lampCount; i++) {
      for (const side of [-1]) {
        const post = new THREE.Group();
        const pole = new THREE.Mesh(poleGeo, dark);
        pole.position.y = 3.6;
        const arm = new THREE.Mesh(armGeo, dark);
        arm.position.set(0, 7.1, -side * 0.9);
        const head = new THREE.Mesh(headGeo, lampMat);
        head.position.set(0, 7.04, -side * 1.7);
        const glowSprite = new THREE.Sprite(lampGlow);
        glowSprite.scale.set(4, 4, 1);
        glowSprite.position.set(0, 7.0, -side * 1.7);
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(0, 0.02, -side * 3.2);
        post.add(pole, arm, head, glowSprite, pool);
        post.position.set(-WRAP + (i / lampCount) * WRAP * 2 + (side > 0 ? 7 : 0), 0, side * 5.6);
        scene.add(post);
        looping.push(post);
      }
    }

    // guard rail
    for (const z of [-6.5]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(WRAP * 2.4, 0.16, 0.08), chrome);
      rail.position.set(0, 0.7, z);
      scene.add(rail);
      disposables.push(rail.geometry);
    }

    // skyline (slow parallax)
    const skylineGroup = new THREE.Group();
    const bldGeo = new THREE.BoxGeometry(1, 1, 1);
    const bldMat = new THREE.MeshStandardMaterial({ color: 0x0b121b, roughness: 0.9 });
    const winGeo = new THREE.PlaneGeometry(0.14, 0.2);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffc45e });
    disposables.push(bldGeo, bldMat, winGeo, winMat);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const buildings = small ? 34 : 60;
    for (let i = 0; i < buildings; i++) {
      const w = 3 + rnd() * 6, h = 4 + rnd() * 26, d = 3 + rnd() * 5;
      const b = new THREE.Mesh(bldGeo, bldMat);
      b.scale.set(w, h, d);
      const x = -WRAP * 1.2 + (i / buildings) * WRAP * 2.4;
      b.position.set(x, h / 2, -34 - rnd() * 22);
      skylineGroup.add(b);
      const lit = Math.floor(rnd() * 7);
      for (let k = 0; k < lit; k++) {
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(x + (rnd() - 0.5) * (w - 1), 1.5 + rnd() * (h - 2), b.position.z + d / 2 + 0.02);
        skylineGroup.add(win);
      }
    }
    scene.add(skylineGroup);

    // stars + horizon glow
    const starPos = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const a = rnd() * Math.PI * 2, r = 120 + rnd() * 60;
      starPos.set([Math.cos(a) * r, 25 + rnd() * 80, Math.sin(a) * r - 30], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcfe0ff, size: 0.7, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
    scene.add(stars);
    disposables.push(starGeo, stars.material as THREE.Material);
    const horizonTex = (() => {
      const c = document.createElement("canvas");
      c.width = 4; c.height = 256;
      const g = c.getContext("2d")!;
      const grad = g.createLinearGradient(0, 256, 0, 0);
      grad.addColorStop(0, "rgba(255,140,40,.55)");
      grad.addColorStop(0.35, "rgba(255,120,30,.14)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
      return new THREE.CanvasTexture(c);
    })();
    const horizon = new THREE.Mesh(new THREE.PlaneGeometry(500, 70), new THREE.MeshBasicMaterial({ map: horizonTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    horizon.position.set(0, 33, -70);
    scene.add(horizon);
    disposables.push(horizonTex, horizon.geometry, horizon.material as THREE.Material);

    // ---------- interaction ----------
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointer);

    let scrollBoost = 0;
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastScrollY);
      const dt = Math.max(now - lastScrollT, 1);
      scrollBoost = Math.min(scrollBoost + (dy / dt) * 6, 34);
      lastScrollY = window.scrollY;
      lastScrollT = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ---------- loop ----------
    const camPos = new THREE.Vector3(...VIEWS.front.pos);
    const camTarget = new THREE.Vector3(...VIEWS.front.target);
    const wantPos = new THREE.Vector3();
    const wantTarget = new THREE.Vector3();
    const look = new THREE.Vector3();
    let speed = 15;
    let t = 0;
    let last = performance.now();
    let frame = 0;
    let visible = false;
    let hudTick = 0;

    const render = (dt: number) => {
      const v = VIEWS[viewRef.current];
      wantPos.set(...v.pos);
      wantTarget.set(...v.target);
      const aspect = camera.aspect;
      if (aspect < 1.4) {
        const pull = 1 + (1.4 - aspect) * 0.95;
        wantPos.sub(wantTarget).multiplyScalar(pull).add(wantTarget);
      }
      const k = 1 - Math.exp(-dt * 2.6);
      camPos.lerp(wantPos, k);
      camTarget.lerp(wantTarget, k);
      const drift = Math.sin(t * 0.22) * 0.1;
      const orbit = new THREE.Vector3().copy(camPos).sub(camTarget);
      orbit.applyAxisAngle(THREE.Object3D.DEFAULT_UP, drift + pointer.x * -0.08);
      camera.position.copy(camTarget).add(orbit);
      camera.position.y += pointer.y * -0.35;
      look.copy(camTarget);
      camera.lookAt(look);
      renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      scrollBoost *= Math.exp(-dt * 2.2);
      speed += ((15 + scrollBoost) - speed) * (1 - Math.exp(-dt * 3));
      const dx = speed * dt;

      looping.forEach((o) => { o.position.x -= dx; if (o.position.x < -WRAP) o.position.x += WRAP * 2; });
      skylineGroup.position.x -= dx * 0.05;
      if (skylineGroup.position.x < -WRAP * 0.4) skylineGroup.position.x += WRAP * 0.4;
      const spin = (speed / 0.58) * dt;
      spinners.forEach((s) => { s.rotation.z -= spin; });

      const bob = Math.sin(t * 11) * 0.012 * (speed / 15);
      truck.position.y = bob;
      truck.rotation.z = Math.sin(t * 2.1) * 0.003;
      truck.rotation.x = Math.sin(t * 1.3) * 0.002;

      render(dt);

      if (speedRef.current && ++hudTick % 6 === 0) speedRef.current.textContent = String(Math.round(speed * 4.1));
      if (visible && !reduceMotion) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      if (w / h > 1.15) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
      else camera.setViewOffset(w, h, 0, -h * 0.17, w, h);
      camera.updateProjectionMatrix();
      if (!visible || reduceMotion) render(0.016);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) { last = performance.now(); frame = requestAnimationFrame(tick); }
    }, { threshold: 0.02 });
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      mount.removeEventListener("pointermove", onPointer);
      disposables.forEach((d) => d.dispose?.());
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="truck-stage">
      <div ref={mountRef} className="truck-canvas" role="img" aria-label="Interactive 3D truck driving down a night highway" />
      <div className="truck-hud">
        <div className="truck-speed"><span ref={speedRef}>62</span><small>MPH</small></div>
        <div className="truck-views" role="group" aria-label="Camera view">
          {(Object.keys(VIEWS) as ViewKey[]).map((key) => (
            <button key={key} type="button" className={view === key ? "is-active" : ""} aria-pressed={view === key} onClick={() => setView(key)}>{VIEWS[key].label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
