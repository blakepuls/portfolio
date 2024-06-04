import { useState } from "react"
import style from './slider.module.scss'

interface SliderProps {
    className?: string,
    label?: string,
    value: number,
    min?: number,
    max?: number,
    onChange: (value: number) => void
}

export default function Slider(props: SliderProps) {
    return (
        <div>
            <label className={`${style.label} ${props.className}`}>{props.label}</label>
            
            <div className={style.container}>
                <input
                    className={style.slider}
                    type="range"
                    min={props.min || 0}
                    max={props.max || 100}
                    value={props.value}
                    onChange={e => props.onChange(parseInt(e.target.value))}
                />
                <span className={style.value}>{props.value}</span>
            </div>
        </div>
    )
}