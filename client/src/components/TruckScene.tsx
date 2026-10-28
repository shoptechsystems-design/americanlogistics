import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createTruck } from "./truckModels";
import { mergeTransformed } from "./meshUtils";

type ViewKey = "front" | "side" | "chase";

const VIEWS: Record<ViewKey, { label: string; pos: [number, number, number]; target: [number, number, number] }> = {
  front: { label: "Front", pos: [14, 3.4, 15], target: [-1.2, 1.9, 0] },
  side: { label: "Side", pos: [-3, 3.0, 29], target: [-3, 1.9, 0] },
  chase: { label: "Chase", pos: [-25, 5.8, 12], target: [-2, 2.1, 0] },
};

const AMBER = 0xff9f1c;
const ROAD_LEN = 300;
const DASH_PERIOD = 12;
const LAMP_SPACING = 15.7;
const SKY_PERIOD = 160;

function radialTexture(inner: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Lane markings + edge lines painted once on a repeating texture. Scrolling its offset = a moving road. */
function roadMarkingTexture() {
  const W = 256, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const laneV = [0.5 - 1.35 / 9, 0.5 + 1.35 / 9];
  g.fillStyle = "#ff9f1c";
  for (const v of laneV) g.fillRect(0, v * H - 4, W * 0.25, 8);
  g.fillStyle = "#aab8c8";
  for (const v of [0.5 - 4.1 / 9, 0.5 + 4.1 / 9]) g.fillRect(0, v * H - 3, W, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(ROAD_LEN / DASH_PERIOD, 1);
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
    let cancelled = false;
    const cleanups: Array<() => void> = [];
    // Yield between heavy steps so scrolling and painting stay smooth while the scene is built.
    const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    void (async () => {
    const small = window.innerWidth < 720;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: false, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxDpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
    let dpr = maxDpr;
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);
    const perfMode = location.search.includes("perf");

    const scene = new THREE.Scene();
    const NIGHT = 0x060a10;
    scene.background = new THREE.Color(NIGHT);
    scene.fog = new THREE.Fog(NIGHT, 28, 120);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(d: T): T => { disposables.push(d); return d; };
    cleanups.push(() => { disposables.forEach((d) => d.dispose()); renderer.dispose(); renderer.domElement.remove(); });
    await yieldToBrowser();
    if (cancelled) return;

    const pmrem = track(new THREE.PMREMGenerator(renderer));
    const envTexture = track(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
    scene.environment = envTexture;
    scene.environmentIntensity = 0.7;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);

    scene.add(new THREE.HemisphereLight(0x7f9fca, 0x121a26, 1.0));
    const moon = new THREE.DirectionalLight(0xb4cdf2, 1.7);
    moon.position.set(-14, 20, 18);
    scene.add(moon);
    const rim = new THREE.DirectionalLight(AMBER, 1.1);
    rim.position.set(14, 6, -16);
    scene.add(rim);

    await yieldToBrowser();
    if (cancelled) return;

    // ---------- truck (shared model, merged into a handful of draw calls) ----------
    const model = createTruck("dry-van", small);
    track(model);
    const truck = model.group;
    scene.add(truck);

    // headlight beams + glow (additive, cheap)
    const beamMat = track(new THREE.MeshBasicMaterial({ color: 0xffe9b8, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    const beamGeo = track(new THREE.ConeGeometry(2.4, 16, 20, 1, true));
    for (const z of [-0.82, 0.82]) {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(12, 1.5, z * 1.4);
      truck.add(beam);
    }
    const glowTex = track(radialTexture("rgba(255,236,190,.7)"));
    const headGlow = track(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    for (const z of [-0.82, 0.82]) {
      const s = new THREE.Sprite(headGlow);
      s.scale.set(1.5, 1.5, 1);
      s.position.set(4.15, 2.0, z);
      truck.add(s);
    }
    const redGlow = track(new THREE.SpriteMaterial({ map: track(radialTexture("rgba(255,50,40,.9)")), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    for (const z of [-1.0, 1.0]) {
      const s = new THREE.Sprite(redGlow);
      s.scale.set(1.8, 1.8, 1);
      s.position.set(-10.5, 1.4, z);
      truck.add(s);
    }
    // light pool on the road ahead of the truck (replaces an expensive spotlight)
    const poolAhead = new THREE.Mesh(track(new THREE.PlaneGeometry(26, 7)), track(new THREE.MeshBasicMaterial({ map: track(radialTexture("rgba(255,226,170,.34)")), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
    poolAhead.rotation.x = -Math.PI / 2;
    poolAhead.position.set(15, 0.03, 0);
    scene.add(poolAhead);

    // ---------- road: one plane for asphalt, one scrolling texture for every marking ----------
    const roadMat = track(new THREE.MeshStandardMaterial({ color: 0x0b1017, metalness: 0.35, roughness: 0.3 }));
    const groundMat = track(new THREE.MeshStandardMaterial({ color: 0x070b10, roughness: 1 }));
    const road = new THREE.Mesh(track(new THREE.PlaneGeometry(ROAD_LEN, 9)), roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);
    const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(ROAD_LEN, 120)), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);
    const markingTex = track(roadMarkingTexture());
    const markings = new THREE.Mesh(road.geometry, track(new THREE.MeshBasicMaterial({ map: markingTex, transparent: true, depthWrite: false })));
    markings.rotation.x = -Math.PI / 2;
    markings.position.y = 0.012;
    scene.add(markings);

    // guard rail (far side only)
    const chrome = track(new THREE.MeshStandardMaterial({ color: 0xcfd6de, metalness: 1, roughness: 0.18 }));
    const rail = new THREE.Mesh(track(new THREE.BoxGeometry(ROAD_LEN, 0.16, 0.08)), chrome);
    rail.position.set(0, 0.7, -6.5);
    scene.add(rail);

    await yieldToBrowser();
    if (cancelled) return;

    // ---------- street lamps: a static, periodic row merged into 4 draw calls, slid along the road ----------
    const darkMat = track(new THREE.MeshStandardMaterial({ color: 0x151b23, metalness: 0.4, roughness: 0.65 }));
    const lampMat = track(new THREE.MeshBasicMaterial({ color: 0xfff1cf }));
    const poolTex = track(radialTexture("rgba(255,214,150,.38)"));
    const poolMat = track(new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const poleGeo = track(new THREE.CylinderGeometry(0.07, 0.1, 7.2, 8));
    const armGeo = track(new THREE.BoxGeometry(0.1, 0.1, 1.9));
    const headGeo = track(new THREE.BoxGeometry(0.5, 0.1, 0.34));
    const poolGeo = track(new THREE.PlaneGeometry(10, 8).rotateX(-Math.PI / 2));
    const lampCount = Math.ceil((ROAD_LEN * 0.6) / LAMP_SPACING);
    type Part = { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 };
    const darkParts: Part[] = [];
    const headParts: Part[] = [];
    const poolParts: Part[] = [];
    const glowPositions: number[] = [];
    for (let i = 0; i < lampCount; i++) {
      const x = (i - lampCount / 2) * LAMP_SPACING;
      darkParts.push({ geometry: poleGeo, matrix: new THREE.Matrix4().makeTranslation(x, 3.6, -5.6) });
      darkParts.push({ geometry: armGeo, matrix: new THREE.Matrix4().makeTranslation(x, 7.1, -4.7) });
      headParts.push({ geometry: headGeo, matrix: new THREE.Matrix4().makeTranslation(x, 7.04, -3.9) });
      poolParts.push({ geometry: poolGeo, matrix: new THREE.Matrix4().makeTranslation(x, 0.02, -2.4) });
      glowPositions.push(x, 7.0, -3.9);
    }
    const lamps = new THREE.Group();
    for (const [parts, material] of [[darkParts, darkMat], [headParts, lampMat], [poolParts, poolMat]] as [Part[], THREE.Material][]) {
      const geo = mergeTransformed(parts);
      if (geo) { track(geo); lamps.add(new THREE.Mesh(geo, material)); }
    }
    const glowGeo = track(new THREE.BufferGeometry());
    glowGeo.setAttribute("position", new THREE.Float32BufferAttribute(glowPositions, 3));
    lamps.add(new THREE.Points(glowGeo, track(new THREE.PointsMaterial({ map: track(radialTexture("rgba(255,214,150,.8)")), size: 4.2, sizeAttenuation: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))));
    scene.add(lamps);

    // ---------- skyline: one period of buildings merged, tiled three times, slid slowly ----------
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const bldBox = track(new THREE.BoxGeometry(1, 1, 1));
    const winQuad = track(new THREE.PlaneGeometry(0.14, 0.2));
    const bldParts: Part[] = [];
    const winParts: Part[] = [];
    const buildings = small ? 22 : 36;
    for (let i = 0; i < buildings; i++) {
      const w = 3 + rnd() * 6, h = 4 + rnd() * 26, d = 3 + rnd() * 5;
      const x = (i / buildings) * SKY_PERIOD;
      const z = -34 - rnd() * 22;
      bldParts.push({ geometry: bldBox, matrix: new THREE.Matrix4().compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)) });
      const lit = Math.floor(rnd() * 7);
      for (let k = 0; k < lit; k++) winParts.push({ geometry: winQuad, matrix: new THREE.Matrix4().makeTranslation(x + (rnd() - 0.5) * (w - 1), 1.5 + rnd() * (h - 2), z + d / 2 + 0.02) });
    }
    const bldGeo = track(mergeTransformed(bldParts)!);
    const winGeo = track(mergeTransformed(winParts)!);
    const bldMat = track(new THREE.MeshStandardMaterial({ color: 0x0b121b, roughness: 0.9 }));
    const winMat = track(new THREE.MeshBasicMaterial({ color: 0xffc45e }));
    const skyline = new THREE.Group();
    for (let k = -1; k <= 1; k++) {
      const tile = new THREE.Group();
      tile.position.x = k * SKY_PERIOD;
      tile.add(new THREE.Mesh(bldGeo, bldMat), new THREE.Mesh(winGeo, winMat));
      skyline.add(tile);
    }
    scene.add(skyline);

    // ---------- stars + horizon glow ----------
    const starPos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const a = rnd() * Math.PI * 2, r = 120 + rnd() * 60;
      starPos.set([Math.cos(a) * r, 25 + rnd() * 80, Math.sin(a) * r - 30], i * 3);
    }
    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = track(new THREE.PointsMaterial({ color: 0xcfe0ff, size: 0.7, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
    scene.add(new THREE.Points(starGeo, starMat));
    const horizonTex = track((() => {
      const c = document.createElement("canvas");
      c.width = 4; c.height = 256;
      const g = c.getContext("2d")!;
      const grad = g.createLinearGradient(0, 256, 0, 0);
      grad.addColorStop(0, "rgba(255,140,40,.55)");
      grad.addColorStop(0.35, "rgba(255,120,30,.14)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
      return new THREE.CanvasTexture(c);
    })());
    const horizon = new THREE.Mesh(track(new THREE.PlaneGeometry(500, 70)), track(new THREE.MeshBasicMaterial({ map: horizonTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
    horizon.position.set(0, 33, -70);
    scene.add(horizon);

    await yieldToBrowser();
    if (cancelled) return;

    // ---------- interaction ----------
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointer, { passive: true });

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
    const orbit = new THREE.Vector3();
    let speed = 15;
    let distance = 0;
    let wheelAngle = 0;
    let t = 0;
    let last = performance.now();
    let frame = 0;
    let visible = false;
    let ready = false;
    let hudTick = 0;
    let slowFrames = 0;
    let disposed = false;

    const render = (dt: number) => {
      const v = VIEWS[viewRef.current];
      wantPos.set(...v.pos);
      wantTarget.set(...v.target);
      if (camera.aspect < 1.4) {
        const pull = 1 + (1.4 - camera.aspect) * 0.95;
        wantPos.sub(wantTarget).multiplyScalar(pull).add(wantTarget);
      }
      const k = 1 - Math.exp(-dt * 2.6);
      camPos.lerp(wantPos, k);
      camTarget.lerp(wantTarget, k);
      orbit.copy(camPos).sub(camTarget).applyAxisAngle(THREE.Object3D.DEFAULT_UP, Math.sin(t * 0.22) * 0.1 + pointer.x * -0.08);
      camera.position.copy(camTarget).add(orbit);
      camera.position.y += pointer.y * -0.35;
      camera.lookAt(camTarget);
      renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      scrollBoost *= Math.exp(-dt * 2.2);
      speed += ((15 + scrollBoost) - speed) * (1 - Math.exp(-dt * 3));
      distance += speed * dt;

      markingTex.offset.x = (distance / DASH_PERIOD) % 1;
      lamps.position.x = -(distance % LAMP_SPACING);
      skyline.position.x = -((distance * 0.05) % SKY_PERIOD);
      wheelAngle -= (speed / 0.58) * dt;
      model.setWheelAngle(wheelAngle);

      truck.position.y = Math.sin(t * 11) * 0.012 * (speed / 15);
      truck.rotation.z = Math.sin(t * 2.1) * 0.003;
      truck.rotation.x = Math.sin(t * 1.3) * 0.002;

      render(dt);
      if (perfMode) (window as unknown as Record<string, unknown>).__calls = renderer.info.render.calls;

      // adaptive quality: if the device can't hold ~40fps, quietly lower the resolution
      slowFrames = dt > 0.026 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
      if (slowFrames > 24 && dpr > 0.8) {
        dpr = Math.max(0.8, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(mount.clientWidth, mount.clientHeight, false);
        slowFrames = 0;
      }
      if (speedRef.current && ++hudTick % 8 === 0) speedRef.current.textContent = String(Math.round(speed * 4.1));
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
      if (ready && (!visible || reduceMotion)) render(0.016);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && ready) { last = performance.now(); frame = requestAnimationFrame(tick); }
    }, { threshold: 0.02 });
    observer.observe(mount);

    // Compile every shader off the critical path, then fade the canvas in over the poster image.
    const start = async () => {
      try { await renderer.compileAsync(scene, camera); } catch { /* fall through: first render compiles */ }
      if (disposed) return;
      render(0.016);
      ready = true;
      mount.parentElement?.classList.add("is-ready");
      if (visible && !reduceMotion) { last = performance.now(); frame = requestAnimationFrame(tick); }
    };
    void start();

    cleanups.push(() => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      mount.removeEventListener("pointermove", onPointer);
    });
    })();

    return () => { cancelled = true; cleanups.forEach((fn) => fn()); };
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
