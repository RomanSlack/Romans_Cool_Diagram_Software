"use client";

import { ContainerElement } from "@/lib/schema/types";

interface ContainerRendererProps {
  element: ContainerElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ContainerRenderer({ element, onMouseDown }: ContainerRendererProps) {
  const { position, size, style, label } = element;

  const getFontWeight = (weight: string): number => {
    const weights: { [key: string]: number } = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };
    return weights[weight] || 400;
  };

  // Calculate label position
  const getLabelPosition = () => {
    if (!label) return { x: 0, y: 0, anchor: "middle" as const };

    const padding = 8;
    let x = size.width / 2;
    let y = 0;
    let anchor: "start" | "middle" | "end" = "middle";

    switch (label.position) {
      case "top-left":
        x = padding;
        y = -8;
        anchor = "start";
        break;
      case "top-center":
        x = size.width / 2;
        y = -8;
        anchor = "middle";
        break;
      case "top-right":
        x = size.width - padding;
        y = -8;
        anchor = "end";
        break;
      case "bottom-left":
        x = padding;
        y = size.height + 16;
        anchor = "start";
        break;
      case "bottom-center":
        x = size.width / 2;
        y = size.height + 16;
        anchor = "middle";
        break;
      case "bottom-right":
        x = size.width - padding;
        y = size.height + 16;
        anchor = "end";
        break;
    }

    return { x, y, anchor };
  };

  const labelPos = getLabelPosition();

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onMouseDown}
      style={{ cursor: "move" }}
    >
      {/* Container rectangle */}
      <rect
        x={0}
        y={0}
        width={size.width}
        height={size.height}
        rx={style.borderRadius}
        ry={style.borderRadius}
        fill={style.fill}
        fillOpacity={style.fillOpacity}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
      />

      {/* Label */}
      {label && (
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor={labelPos.anchor}
          dominantBaseline="middle"
          fontFamily={label.style.fontFamily}
          fontSize={label.style.fontSize}
          fontWeight={getFontWeight(label.style.fontWeight)}
          fill={label.style.color}
        >
          {label.text}
        </text>
      )}
    </g>
  );
}
