import { useEffect, useRef } from "react";
import * as THREE from "three";

// [name, latitude, longitude]
const CITIES: [string, number, number][] = [
  ["Dallas", 32.78, -96.8],
  ["Houston", 29.76, -95.37],
  ["Atlanta", 33.75, -84.39],
  ["Chicago", 41.88, -87.63],
  ["Phoenix", 33.45, -112.07],
  ["Denver", 39.74, -104.99],
  ["Los Angeles", 34.05, -118.24],
  ["New York", 40.71, -74.0],
  ["Oklahoma City", 35.47, -97.52],
];

// Freight lanes as pairs of CITIES indexes
const LANES: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [1, 2], [3, 7], [5, 0], [6, 4], [8, 3], [2, 7], [4, 5], [1, 6],
];

const RADIUS = 1;
const AMBER = 0xff9f1c;

function toVector(lat: number, lon: number, radius = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export default function NetworkGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // WebGL unavailable: the section's static copy still reads fine
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 3.4);

    const globe = new THREE.Group();
    scene.add(globe);

    // Core sphere that hides the far side of the dots
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 0.985, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x0a1016 }),
    ));

    // Dot-matrix surface (fibonacci sphere)
    const dotCount = 3200;
    const dotPositions = new Float32Array(dotCount * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < dotCount; i++) {
      const y = 1 - (i / (dotCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      dotPositions.set([Math.cos(t) * r * RADIUS, y * RADIUS, Math.sin(t) * r * RADIUS], i * 3);
    }
    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    globe.add(new THREE.Points(dotGeometry, new THREE.PointsMaterial({ color: 0x8fb0b6, size: 0.015, transparent: true, opacity: 0.95, sizeAttenuation: true })));

    // Faint graticule (latitude / longitude lines)
    const graticule: number[] = [];
    const pushLine = (points: THREE.Vector3[]) => { for (let i = 0; i < points.length - 1; i++) graticule.push(points[i].x, points[i].y, points[i].z, points[i + 1].x, points[i + 1].y, points[i + 1].z); };
    for (let lat = -60; lat <= 60; lat += 30) pushLine(Array.from({ length: 73 }, (_, i) => toVector(lat, -180 + i * 5, RADIUS * 1.002)));
    for (let lon = -180; lon < 180; lon += 30) pushLine(Array.from({ length: 37 }, (_, i) => toVector(-90 + i * 5, lon, RADIUS * 1.002)));
    const graticuleGeometry = new THREE.BufferGeometry();
    graticuleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(graticule, 3));
    globe.add(new THREE.LineSegments(graticuleGeometry, new THREE.LineBasicMaterial({ color: 0x2c4047, transparent: true, opacity: 0.7 })));

    // Soft atmosphere
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.09, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(1.0,0.62,0.11,1.0) * i * 0.9; }",
      }),
    );
    scene.add(glow);

    // City markers
    const cityVectors = CITIES.map(([, lat, lon]) => toVector(lat, lon));
    const markerGeometry = new THREE.SphereGeometry(0.02, 12, 12);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: AMBER });
    const pulses: THREE.Mesh[] = [];
    cityVectors.forEach((v) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(v);
      globe.add(marker);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.025, 0.032, 32),
        new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
      );
      ring.position.copy(v);
      ring.lookAt(v.clone().multiplyScalar(2));
      globe.add(ring);
      pulses.push(ring);
    });

    // Lanes: arcs lifted above the surface, with a runner dot on each
    const runners: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number; speed: number }[] = [];
    const runnerGeometry = new THREE.SphereGeometry(0.014, 10, 10);
    const runnerMaterial = new THREE.MeshBasicMaterial({ color: 0xfff1d0 });
    LANES.forEach(([a, b], index) => {
      const start = cityVectors[a];
      const end = cityVectors[b];
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const lift = 1 + start.distanceTo(end) * 0.42;
      mid.normalize().multiplyScalar(RADIUS * lift);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
        new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.5 }),
      );
      globe.add(line);

      const mesh = new THREE.Mesh(runnerGeometry, runnerMaterial);
      globe.add(mesh);
      runners.push({ mesh, curve, offset: index / LANES.length, speed: 0.07 + (index % 4) * 0.012 });
    });

    // Face the U.S. to begin with
    const homeRotation = { x: 0.6, y: 0.1 };
    globe.rotation.set(homeRotation.x, homeRotation.y, 0);

    // Resize
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 420 ? 4.0 : 3.4;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    // Drag to rotate. Touch keeps native vertical scrolling (touch-action: pan-y in CSS).
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let idleSince = 0;
    const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; velocity = 0; mount.setPointerCapture?.(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      velocity = dx * 0.006;
      globe.rotation.y += velocity;
    };
    const onUp = () => { dragging = false; idleSince = performance.now(); };
    mount.addEventListener("pointerdown", onDown);
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("pointerup", onUp);
    mount.addEventListener("pointercancel", onUp);

    // Only animate while visible
    let visible = false;
    let frame = 0;
    let last = performance.now();
    const clock = { t: 0 };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock.t += dt;

      if (!dragging) {
        velocity *= 0.95;
        globe.rotation.y += velocity + (now - idleSince > 1200 ? 0.07 * dt : 0);
        globe.rotation.x += (homeRotation.x - globe.rotation.x) * 0.02;
      }

      runners.forEach((runner) => {
        const progress = (clock.t * runner.speed + runner.offset) % 1;
        runner.curve.getPoint(progress, runner.mesh.position);
      });
      pulses.forEach((ring, i) => {
        const s = 1 + ((clock.t * 0.8 + i * 0.37) % 1) * 1.8;
        ring.scale.setScalar(s);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - (s - 1) / 1.8);
      });

      renderer.render(scene, camera);
      if (visible && !reduceMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) { last = performance.now(); frame = requestAnimationFrame(draw); }
    }, { threshold: 0.05 });
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      mount.removeEventListener("pointerdown", onDown);
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("pointerup", onUp);
      mount.removeEventListener("pointercancel", onUp);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(material) ? material : material ? [material] : []).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="network-globe" role="img" aria-label="3D globe showing freight lanes across the United States" />;
}
