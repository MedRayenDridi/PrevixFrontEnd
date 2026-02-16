import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function LineSegmentsMesh({ scene_3d }) {
  const { lines } = scene_3d || { lines: [] };
  const { positions, count } = useMemo(() => {
    const pos = [];
    (lines || []).forEach((seg) => {
      const pts = seg.points || [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        pos.push(a[0], a[1], a[2] ?? 0, b[0], b[1], b[2] ?? 0);
      }
    });
    return { positions: new Float32Array(pos), count: pos.length / 6 };
  }, [lines]);

  const geometry = useMemo(() => {
    if (count === 0) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setDrawRange(0, count * 2);
    return g;
  }, [positions, count]);

  if (!geometry || count === 0) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#0ea5e9" />
    </lineSegments>
  );
}

export function PlanViewer3D({ scene_3d }) {
  if (!scene_3d || !scene_3d.lines || scene_3d.lines.length === 0) {
    return (
      <div className="manus-plan-viewer-empty">
        Aucune géométrie à afficher pour ce plan.
      </div>
    );
  }

  return (
    <div className="manus-plan-viewer-3d">
      <Canvas
        camera={{ position: [15, 15, 15], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-10, -10, 5]} intensity={0.3} />
        <LineSegmentsMesh scene_3d={scene_3d} />
        <OrbitControls enableDamping dampingFactor={0.1} />
        <gridHelper args={[40, 40, '#444', '#2a2a2a']} position={[0, 0, -0.01]} />
      </Canvas>
    </div>
  );
}
