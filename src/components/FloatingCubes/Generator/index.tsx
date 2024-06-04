"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Cube from "../cube";

export default function Generator(props: { className?: string }) {
  const cubeRef = useRef();

  const saveScreenshot = () => {
    // @ts-ignore
    const dataUrl = cubeRef.current.takeScreenshot();
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "cube.png";
    link.click();
  };

  return (
    <div className={``}>
      <Canvas color="#FFF" className={`w-20 h-20 bg-red-500`}>
        <ambientLight />
        <Cube
          ref={cubeRef}
          config={{
            scale: 1,
            color: "#550bc5",
            rotation: 0.01,
            reverse: false,
            position: [0, 0, 3],
            range: 1,
            speed: 0,
          }}
        />
      </Canvas>
      <button className="" onClick={saveScreenshot}>
        Save
      </button>
    </div>
  );
}
