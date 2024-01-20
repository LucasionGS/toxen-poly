import "./Slider.scss"; import React, { useState } from 'react';
import './Slider.scss';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  className?: string;
  step?: number;

  label?: React.ReactNode | ((value: number) => React.ReactNode);

  thumbSize?: number;
  size?: number;

  containerStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export default function Slider({
  containerStyle = {},
  inputStyle = {},
  label,
  className,
  thumbSize,
  size,
  min,
  max,
  step = 1,
  value,
  onChange,
  onChangeEnd
}: SliderProps) {

  return (
    <div
      className={"slider-container" + (className ? " " + className : "")}
      style={containerStyle}
    >
      <input
        type="range"
        min={min}
        max={max / step}
        value={value / step}
        className="slider"
        onChange={(e) => {
          e.stopPropagation();
          onChange(+e.target.value * step);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onChangeEnd?.(+e.currentTarget.value * step);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          onChangeEnd?.(+e.currentTarget.value * step);
        }}

        style={{
          "--thumb-size": thumbSize ?? 16,
          "--size": size ?? 4,
          ...(inputStyle),
        } as any}
      />
      {label ? (
        <div className="slider-label">
          {typeof label === "function" ? label(value) : label}
        </div>
      ) : null}
    </div>
  );
}