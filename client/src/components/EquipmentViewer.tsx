import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createTruck, type EquipmentKey, type TruckModel } from "./truckModels";

const AMBER = 0xff9f1c;
const FOV = 32;

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

export default function EquipmentViewer({ equipment }: { equipment: EquipmentKey }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const equipmentRef = useRef<EquipmentKey>(equipment);
  const swapRef = useRef<((key: EquipmentKey) => void) | null>(null);

  useEffect(() => {
    equipmentRef.current = equipment;
    swapRef.current?.(equipment);
  }, [equipment]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: window.innerWidth >= 720, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 720;
    let dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.9;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

    scene.add(new THREE.HemisphereLight(0x9fb8da, 0x1a2230, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(10, 14, 12);
    scene.add(key);
    const rim = new THREE.DirectionalLight(AMBER, 1.4);
    rim.position.set(-12, 6, -10);
    scene.add(rim);

    // turntable platform
    const staticDisposables: { dispose: () => void }[] = [envTexture, pmrem];
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x131b25, metalness: 0.7, roughness: 0.35 });
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(11, 11.4, 0.3, 64), platformMat);
    platform.position.y = -0.17;
    scene.add(platform);
    const ringMat = new THREE.MeshBasicMaterial({ color: AMBER });
    const ring = new THREE.Mesh(new THREE.RingGeometry(10.55, 10.75, 96), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.0;
    scene.add(ring);
    const shadowTex = radialTexture("rgba(0,0,0,.55)");
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    scene.add(shadow);
    staticDisposables.push(platformMat, platform.geometry, ringMat, ring.geometry, shadowTex, shadow.geometry, shadow.material as THREE.Material);

    // ---- model handling ----
    const turntable = new THREE.Group();
    scene.add(turntable);
    let model: TruckModel | null = null;
    let appear = 1;
    let fitRadius = 8;
    let fitHeight = 2;

    const fitCamera = () => {
      const aspect = camera.aspect;
      const tanV = Math.tan((FOV * Math.PI) / 360);
      const tanH = tanV * aspect;
      const dist = (fitRadius * 1.2) / Math.min(tanH, tanV * 1.9) + 1;
      camera.position.set(0, dist * 0.24 + fitHeight * 0.4, dist);
      camera.lookAt(0, fitHeight * 0.55, 0);
    };

    const swap = (next: EquipmentKey) => {
      if (model) {
        turntable.remove(model.group);
        model.dispose();
      }
      model = createTruck(next, small);
      const box = new THREE.Box3().setFromObject(model.group);
      const center = box.getCenter(new THREE.Vector3());
      model.group.position.x -= center.x;
      model.group.position.z -= center.z;
      const length = box.max.x - box.min.x;
      fitRadius = length / 2;
      fitHeight = box.max.y;
      shadow.scale.set(length * 1.35, length * 0.55, 1);
      turntable.add(model.group);
      appear = reduceMotion ? 1 : 0;
      fitCamera();
    };
    swapRef.current = swap;

    // ---- interaction (horizontal drag rotates; vertical scrolling stays native) ----
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let resumeAt = 0;
    turntable.rotation.y = -0.65;
    const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; velocity = 0; mount.setPointerCapture?.(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      velocity = dx * 0.008;
      turntable.rotation.y += velocity;
    };
    const onUp = () => { dragging = false; resumeAt = performance.now() + 1400; };
    mount.addEventListener("pointerdown", onDown);
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("pointerup", onUp);
    mount.addEventListener("pointercancel", onUp);

    // ---- loop ----
    let visible = false;
    let frame = 0;
    let slow = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) {
        velocity *= 0.94;
        turntable.rotation.y += velocity + (now > resumeAt && !reduceMotion ? 0.32 * dt : 0);
      }
      if (appear < 1) {
        appear = Math.min(appear + dt * 2.2, 1);
        const e = 1 - Math.pow(1 - appear, 3);
        turntable.scale.setScalar(0.82 + 0.18 * e);
        turntable.position.y = (1 - e) * -0.6;
      } else { turntable.scale.setScalar(1); turntable.position.y = 0; }
      renderer.render(scene, camera);
      slow = dt > 0.026 ? slow + 1 : Math.max(0, slow - 2);
      if (slow > 24 && dpr > 0.8) {
        dpr = Math.max(0.8, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(mount.clientWidth, mount.clientHeight, false);
        slow = 0;
      }
      if (visible && !reduceMotion) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitCamera();
      if (!visible || reduceMotion) renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    swap(equipmentRef.current);
    resize();

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) { last = performance.now(); frame = requestAnimationFrame(draw); }
    }, { threshold: 0.05 });
    observer.observe(mount);

    return () => {
      swapRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      mount.removeEventListener("pointerdown", onDown);
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("pointerup", onUp);
      mount.removeEventListener("pointercancel", onUp);
      model?.dispose();
      staticDisposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="equip-canvas" role="img" aria-label={`Interactive 3D model of a ${equipment.replace("-", " ")}`} />;
}
