"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
// import { EffectComposer } from "./three"
import * as THREE from "three";
import Cube from "./cube";

interface Cube {
  position: THREE.Vector3;
  scale: number;
  component: JSX.Element;
}

interface FloatingCubesConfig {
  speed: number;
  rotation: number;
  color: string;
  amount: number;
  range: number;
  minScale: number;
  maxScale: number;
}

const DefaultConfig: FloatingCubesConfig = {
  amount: 50,
  range: 25,
  minScale: 1,
  maxScale: 2,
  speed: 1,
  rotation: 1,
  color: "#550bc5",
};

// Helper function to validate an available position for a new cube
function isValidPosition(position: THREE.Vector3, cubes: Cube[]): boolean {
  return cubes.every((cube) => {
    const distance = cube.position.distanceTo(position);
    return distance > cube.scale;
  });
}

export default function FloatingCubes(props: {
  config?: Partial<FloatingCubesConfig>;
  camera?: number[];
  controls?: boolean;
  background?: string;
}) {
  const config = { ...DefaultConfig, ...props.config };
  const cubes: Cube[] = [];

  for (let i = 0; i < config.amount; i++) {
    let scale =
      Math.random() * (config.maxScale - config.minScale) + config.minScale;
    let position = new THREE.Vector3(
      Math.random() * (config.range - -config.range) + -config.range,
      Math.random() * (config.range - -config.range) + -config.range,
      Math.random() * (config.range - -config.range) + -config.range
    );

    if (isValidPosition(position, cubes)) {
      cubes.push({
        position: position,
        scale: scale,
        component: (
          <Cube
            key={i}
            config={{
              position: position,
              scale: scale,
              reverse: cubes.length % 2 == 0 ? true : false,
              rotation:
                Math.random() * (0.0025 - -0.0025) + -0.0025 * config.rotation,
              range: config.range,
              color: config.color,
              speed: config.speed,
            }}
          />
        ),
      });
    }
  }

  return (
    <Canvas color={props.background || "transparent"}>
      {cubes.map((cube) => {
        return cube.component;
      })}

      {props.controls ? (
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          position={
            props.camera
              ? new THREE.Vector3(
                  props.camera[0],
                  props.camera[1],
                  props.camera[2]
                )
              : [0, 0, 10]
          }
        />
      )}

      {/* <EffectComposer>
				<Bloom
					intensity={15.0}
					luminanceThreshold={0.03}
					luminanceSmoothing={0.20}
				/>
			</EffectComposer> */}
    </Canvas>
  );
}
