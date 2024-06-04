// Cube.tsx
import { useRef, forwardRef, useImperativeHandle } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

interface Cube {
  position?: THREE.Vector3 | [number, number, number];
  rotation: number;
  reverse: boolean;
  range: number;
  scale: number;
  color: string;
  speed: number;
}

function Cube(props: { config: Cube; onClick?: () => void }, ref: any) {
  const config = props.config;
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    meshRef.current.rotation.x = meshRef.current.rotation.y +=
      config.rotation || 0.0025;

    if (config.reverse) {
      if (meshRef.current.position.y < -config.range)
        meshRef.current.position.y = config.range;

      meshRef.current.position.y -= 0.01 * config.speed;
    }

    if (!config.reverse) {
      if (meshRef.current.position.y > config.range)
        meshRef.current.position.y = -config.range;

      meshRef.current.position.y += 0.01 * config.speed;
    }
  });

  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    },
  }));

  return (
    <mesh
      ref={meshRef}
      position={config.position || [0, 0, 0]}
      onClick={props.onClick}
    >
      <boxGeometry args={[config.scale, config.scale, config.scale]} />
      <meshBasicMaterial color={config.color} />
      <Edges threshold={15} scale={1.25} color={config.color} />
    </mesh>
  );
}

export default forwardRef(Cube);
