import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type EquipmentKey = "box-truck" | "dry-van" | "reefer" | "flatbed";

type Disposable = { dispose: () => void };

const AMBER = 0xff9f1c;

/** Side panel artwork (branding) drawn to a canvas whose aspect matches the panel. */
function bodyTexture(aspect: number, sub: string, snowflake = false) {
  const H = 560;
  const W = Math.round(H * aspect);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#f4f7fb");
  bg.addColorStop(1, "#cfd8e2");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#ff9f1c";
  g.fillRect(0, 430, W, 46);
  g.fillStyle = "#0c1219";
  g.fillRect(0, 476, W, 84);
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
  g.fillStyle = "#0c1219";
  g.font = "900 150px Arial Black, Helvetica, Arial, sans-serif";
  g.fillText("AMERICAN", 440, 235);
  g.fillStyle = "#ff8a00";
  g.fillText("LOGISTICS", 440, 380);
  g.fillStyle = "#44525f";
  g.font = "700 44px Helvetica, Arial, sans-serif";
  g.fillText(sub, 444, 426);
  if (snowflake) {
    g.save();
    g.translate(W - 170, 215);
    g.strokeStyle = "#1f9bf0";
    g.lineWidth = 12;
    g.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      g.rotate(Math.PI / 3);
      g.beginPath(); g.moveTo(-82, 0); g.lineTo(82, 0); g.stroke();
      for (const s of [-1, 1]) {
        g.beginPath(); g.moveTo(s * 56, 0); g.lineTo(s * 74, -20); g.moveTo(s * 56, 0); g.lineTo(s * 74, 20); g.stroke();
      }
    }
    g.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export interface TruckModel {
  group: THREE.Group;
  spinners: THREE.Group[];
  dispose: () => void;
}

export function createTruck(type: EquipmentKey, small = false): TruckModel {
  const group = new THREE.Group();
  const spinners: THREE.Group[] = [];
  const disposables: Disposable[] = [];
  const seg = small ? 2 : 4;

  const mat = (m: THREE.Material) => { disposables.push(m); return m; };
  const cabPaint = mat(new THREE.MeshStandardMaterial({ color: 0x33465e, metalness: 0.55, roughness: 0.32 }));
  const chrome = mat(new THREE.MeshStandardMaterial({ color: 0xcfd6de, metalness: 1, roughness: 0.18 }));
  const dark = mat(new THREE.MeshStandardMaterial({ color: 0x151b23, metalness: 0.4, roughness: 0.65 }));
  const glass = mat(new THREE.MeshStandardMaterial({ color: 0x1d3a5a, metalness: 0.9, roughness: 0.06 }));
  const tire = mat(new THREE.MeshStandardMaterial({ color: 0x0a0c0f, metalness: 0.1, roughness: 0.9 }));
  const paintWhite = mat(new THREE.MeshStandardMaterial({ color: 0xdfe6ee, metalness: 0.35, roughness: 0.45 }));
  const accent = mat(new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.4 }));
  const headlightMat = mat(new THREE.MeshBasicMaterial({ color: 0xfff3d6 }));
  const tailMat = mat(new THREE.MeshBasicMaterial({ color: 0xff2a1f }));
  const markerMat = mat(new THREE.MeshBasicMaterial({ color: 0xffb347 }));

  const add = (geo: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = group) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    parent.add(m);
    disposables.push(geo);
    return m;
  };
  const rbox = (w: number, h: number, d: number, r = 0.12) => new RoundedBoxGeometry(w, h, d, seg, r);

  const makeWheel = (x: number, z: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0.58, z);
    const spin = new THREE.Group();
    g.add(spin);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.4, small ? 18 : 28), tire);
    t.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.43, 20), chrome);
    rim.rotation.x = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.46, 10), accent);
    hub.rotation.x = Math.PI / 2;
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.46), dark);
    spin.add(t, rim, hub, lug);
    group.add(g);
    spinners.push(spin);
    disposables.push(t.geometry, rim.geometry, hub.geometry, lug.geometry);
  };

  const brandPlane = (width: number, height: number, x: number, y: number, zOffset: number, sub: string, snow = false) => {
    const tex = bodyTexture(width / height, sub, snow);
    const m = mat(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    disposables.push(tex);
    for (const sign of [1, -1]) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), m);
      plane.position.set(x, y, sign * zOffset);
      plane.rotation.y = sign === 1 ? 0 : Math.PI;
      group.add(plane);
      disposables.push(plane.geometry);
    }
  };

  // ---------------- Box truck (straight truck) ----------------
  if (type === "box-truck") {
    add(new THREE.BoxGeometry(9.6, 0.3, 1.05), dark, -1.9, 0.78, 0);
    add(rbox(1.7, 1.35, 2.0, 0.18), cabPaint, 2.05, 1.7, 0);
    add(new THREE.BoxGeometry(0.06, 0.9, 1.4), chrome, 2.9, 1.7, 0);
    add(rbox(0.3, 0.42, 2.25, 0.1), chrome, 2.95, 0.98, 0);
    for (const z of [-0.74, 0.74]) add(new THREE.BoxGeometry(0.08, 0.28, 0.44), headlightMat, 2.9, 1.9, z);
    add(rbox(1.85, 2.15, 2.3, 0.2), cabPaint, 0.3, 2.15, 0);
    const ws = add(new THREE.BoxGeometry(0.06, 1.0, 2.0), glass, 1.22, 2.65, 0);
    ws.rotation.z = -0.16;
    for (const z of [-1.16, 1.16]) add(new THREE.BoxGeometry(1.1, 0.9, 0.04), glass, 0.55, 2.65, z);
    add(new THREE.BoxGeometry(1.9, 0.07, 2.12), accent, 0.3, 3.24, 0);
    add(rbox(6.4, 2.95, 2.4, 0.08), paintWhite, -3.65, 2.55, 0);
    add(new THREE.BoxGeometry(6.5, 0.34, 2.2), dark, -3.65, 1.02, 0);
    brandPlane(6.2, 2.54, -3.65, 2.58, 1.205, "FREIGHT DISPATCH  ·  24/7");
    for (const z of [-0.95, 0.95]) add(new THREE.BoxGeometry(0.06, 0.26, 0.38), tailMat, -6.87, 1.35, z);
    for (const z of [-1.12, 1.12]) add(new THREE.BoxGeometry(0.1, 0.65, 0.18), dark, 1.1, 2.85, z * 1.28);
    for (const z of [-1.05, 1.05]) makeWheel(2.0, z);
    for (const z of [-0.95, -1.45, 0.95, 1.45]) makeWheel(-4.6, z);
    return { group, spinners, dispose: () => disposables.forEach((d) => d.dispose()) };
  }

  // ---------------- Semi tractor (shared) ----------------
  add(new THREE.BoxGeometry(14, 0.32, 1.15), dark, -3.2, 0.78, 0);
  add(rbox(2.0, 1.5, 2.15, 0.2), cabPaint, 2.95, 1.78, 0);
  add(new THREE.BoxGeometry(0.06, 1.0, 1.55), chrome, 3.97, 1.78, 0);
  add(rbox(0.34, 0.46, 2.45, 0.1), chrome, 4.02, 0.98, 0);
  for (const z of [-0.82, 0.82]) add(new THREE.BoxGeometry(0.08, 0.3, 0.5), headlightMat, 3.96, 2.0, z);
  add(rbox(2.15, 2.4, 2.5, 0.22), cabPaint, 1.0, 2.42, 0);
  const windshield = add(new THREE.BoxGeometry(0.06, 1.05, 2.15), glass, 2.06, 2.95, 0);
  windshield.rotation.z = -0.18;
  for (const z of [-1.26, 1.26]) add(new THREE.BoxGeometry(1.2, 0.95, 0.04), glass, 1.35, 2.95, z);
  add(rbox(1.8, 2.7, 2.5, 0.18), cabPaint, -0.95, 2.55, 0);
  const deflector = add(rbox(1.5, 0.7, 2.25, 0.18), cabPaint, 0.45, 4.05, 0);
  deflector.rotation.z = -0.28;
  add(new THREE.BoxGeometry(2.0, 0.07, 2.32), accent, 1.0, 3.64, 0);
  for (const z of [-1.27, 1.27]) add(new THREE.BoxGeometry(3.6, 0.1, 0.03), accent, 0.1, 1.95, z);
  for (const z of [-1.4, 1.4]) {
    add(new THREE.CylinderGeometry(0.09, 0.09, 2.7, 12), chrome, -1.9, 3.1, z);
    const tank = add(new THREE.CylinderGeometry(0.42, 0.42, 1.7, 20), chrome, 1.2, 1.0, z * 0.95);
    tank.rotation.z = Math.PI / 2;
  }
  for (const z of [-1.55, 1.55]) add(new THREE.BoxGeometry(0.1, 0.65, 0.18), dark, 1.9, 3.1, z);
  add(new THREE.BoxGeometry(1.1, 0.14, 1.6), dark, -0.55, 1.05, 0);

  for (const z of [-1.18, 1.18]) makeWheel(3.0, z);
  for (const x of [-0.2, -1.5]) for (const z of [-1.0, -1.5, 1.0, 1.5]) makeWheel(x, z);

  // ---------------- Trailers ----------------
  if (type === "dry-van" || type === "reefer") {
    const reefer = type === "reefer";
    add(rbox(9.8, 3.1, 2.55, 0.08), paintWhite, -5.5, 2.75, 0);
    add(new THREE.BoxGeometry(9.9, 0.38, 2.3), dark, -5.5, 1.0, 0);
    brandPlane(9.6, 2.64, -5.5, 2.78, 1.285, reefer ? "TEMPERATURE CONTROLLED  ·  24/7" : "FREIGHT DISPATCH  ·  24/7  ·  CARRIER FIRST", reefer);
    if (reefer) {
      // refrigeration unit on the nose of the trailer
      const unitMat = mat(new THREE.MeshStandardMaterial({ color: 0xe9eef4, metalness: 0.5, roughness: 0.35 }));
      add(rbox(0.7, 1.0, 1.7, 0.1), unitMat, -0.28, 4.18, 0);
      add(new THREE.BoxGeometry(0.04, 0.7, 1.3), dark, 0.09, 4.18, 0);
      const fan = add(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 20), chrome, 0.11, 4.18, 0);
      fan.rotation.z = Math.PI / 2;
    }
    for (const z of [-1.0, 1.0]) add(new THREE.BoxGeometry(0.06, 0.28, 0.4), tailMat, -10.42, 1.4, z);
    for (let i = 0; i < 8; i++) for (const z of [-1.29, 1.29]) add(new THREE.BoxGeometry(0.22, 0.09, 0.04), markerMat, -1.2 - i * 1.2, 1.25, z);
    for (const x of [-8.6, -9.8]) for (const z of [-1.0, -1.5, 1.0, 1.5]) makeWheel(x, z);
  } else {
    // flatbed: open deck, headache rack, lumber load with straps
    const deckMat = mat(new THREE.MeshStandardMaterial({ color: 0x3a4452, metalness: 0.6, roughness: 0.45 }));
    add(new THREE.BoxGeometry(10.6, 0.26, 2.55), deckMat, -5.9, 1.3, 0);
    for (const z of [-1.27, 1.27]) add(new THREE.BoxGeometry(10.6, 0.16, 0.1), accent, -5.9, 1.46, z);
    add(new THREE.BoxGeometry(10.5, 0.3, 1.2), dark, -5.9, 1.0, 0);
    add(new THREE.BoxGeometry(0.12, 2.0, 2.5), dark, -0.55, 2.4, 0);
    for (const z of [-0.8, 0, 0.8]) add(new THREE.BoxGeometry(0.1, 1.9, 0.08), chrome, -0.62, 2.35, z);
    const wood = mat(new THREE.MeshStandardMaterial({ color: 0xb98a50, roughness: 0.85, metalness: 0 }));
    const strap = mat(new THREE.MeshStandardMaterial({ color: AMBER, roughness: 0.6 }));
    const bundle = (x: number, y: number, len: number, h: number) => {
      add(new THREE.BoxGeometry(len, h, 2.1), wood, x, y, 0);
      for (const dx of [-len * 0.32, len * 0.32]) add(new THREE.BoxGeometry(0.14, h + 0.04, 2.14), strap, x + dx, y, 0);
    };
    bundle(-3.9, 2.05, 5.0, 1.2);
    bundle(-3.9, 3.2, 5.0, 1.0);
    bundle(-8.8, 1.95, 3.6, 1.0);
    for (const z of [-1.27, 1.27]) add(new THREE.BoxGeometry(0.06, 0.28, 0.06), tailMat, -11.15, 1.45, z * 0.8);
    add(new THREE.BoxGeometry(0.05, 0.3, 1.6), tailMat, -11.22, 1.4, 0);
    for (const x of [-8.9, -10.1]) for (const z of [-1.0, -1.5, 1.0, 1.5]) makeWheel(x, z);
  }

  return { group, spinners, dispose: () => disposables.forEach((d) => d.dispose()) };
}
