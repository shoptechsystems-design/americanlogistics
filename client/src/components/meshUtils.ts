import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Merging needs identical attribute sets, so use plain non-indexed position/normal/uv copies. */
function normalise(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = source.index ? source.toNonIndexed() : source.clone();
  for (const name of Object.keys(geo.attributes)) {
    if (name !== "position" && name !== "normal" && name !== "uv") geo.deleteAttribute(name);
  }
  if (!geo.attributes.uv) geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  return geo;
}

/**
 * Collapses the static direct-child meshes of a group into one mesh per material.
 * This turns hundreds of tiny draw calls into a handful without changing the picture.
 * Only direct `Mesh` children are touched; nested groups (e.g. spinning wheels) are left alone.
 */
export function mergeStaticMeshes(group: THREE.Object3D): THREE.BufferGeometry[] {
  const created: THREE.BufferGeometry[] = [];
  const buckets = new Map<THREE.Material, THREE.Mesh[]>();
  for (const child of [...group.children]) {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh || Array.isArray(mesh.material)) continue;
    const list = buckets.get(mesh.material) ?? [];
    list.push(mesh);
    buckets.set(mesh.material, list);
  }
  buckets.forEach((meshes, material) => {
    if (meshes.length < 2) return;
    const geometries = meshes.map((mesh) => {
      mesh.updateMatrix();
      const geo = normalise(mesh.geometry);
      geo.applyMatrix4(mesh.matrix);
      return geo;
    });
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((g) => g.dispose());
    if (!merged) return;
    meshes.forEach((mesh) => { group.remove(mesh); mesh.geometry.dispose(); });
    group.add(new THREE.Mesh(merged, material));
    created.push(merged);
  });
  return created;
}

/** Merge many geometries that already carry their own transform into one. */
export function mergeTransformed(parts: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[]): THREE.BufferGeometry | null {
  const geos = parts.map(({ geometry, matrix }) => {
    const g = normalise(geometry);
    g.applyMatrix4(matrix);
    return g;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  return merged;
}
