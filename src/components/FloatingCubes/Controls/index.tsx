import { useState, useEffect } from "react";
import style from "./style.module.scss";
import Slider from "./Slider";
import { Canvas } from "@react-three/fiber";
import Cube from "../cube";

export default function Controls(props: {
  className?: string;
  config: any;
  onChange: (config: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(props.config.amount);
  const [range, setRange] = useState(25);
  const [minScale, setMinScale] = useState(1);
  const [maxScale, setMaxScale] = useState(2);
  const [speed, setSpeed] = useState(1);
  const [rotation, setRotation] = useState(1);

  function toggleMenu() {
    setOpen(!open);
  }

  useEffect(() => {
    props.onChange({
      amount,
      range,
      minScale,
      maxScale,
      speed,
      rotation,
    });
  }, [amount, range, minScale, maxScale, speed, rotation]);

  return (
    <div className={`${style.container} ${props.className}`}>
      <div className={style.header} onClick={toggleMenu}>
        <Canvas color="#FFF" className={style.canvas}>
          <ambientLight />
          <Cube
            config={{
              scale: 0.55,
              color: "#550bc5",
              rotation: 0.01,
              reverse: false,
              position: [0, 0.8, 3],
              range: 1,
              speed: 0,
            }}
          />
        </Canvas>
      </div>

      <span className={style.open}>Open</span>

      <div
        className={style.menu}
        style={
          open ? { height: "auto" } : { height: "0", width: "0", padding: "0" }
        }
      >
        <Slider label="Speed" value={speed} onChange={setSpeed} />
        <Slider label="Rotation" value={rotation} onChange={setRotation} />
        <Slider label="Amount" value={amount} max={1000} onChange={setAmount} />
        <Slider label="Range" value={range} onChange={setRange} />
        <Slider label="Min Scale" value={minScale} onChange={setMinScale} />
        <Slider label="Max Scale" value={maxScale} onChange={setMaxScale} />
      </div>
    </div>
  );
}
