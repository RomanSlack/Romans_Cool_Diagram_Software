"use client";

import { TextElement } from "@/lib/schema/types";

interface TextRendererProps {
  element: TextElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function TextRenderer({ element, onMouseDown }: TextRendererProps) {
  const { position, size, content, style, background, padding = 4, borderRadius = 2 } = element;

  const getFontWeight = (weight: string): number => {
    const weights: { [key: string]: number } = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    };
    return weights[weight] || 400;
  };

  // Text anchor based on alignment
  const textAnchor = style.textAlign === "left" ? "start" : style.textAlign === "right" ? "end" : "middle";
  const textX = style.textAlign === "left" ? padding : style.textAlign === "right" ? size.width - padding : size.width / 2;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onMouseDown}
      style={{ cursor: "move" }}
    >
      {/* Background */}
      {background && (
        <rect
          x={0}
          y={0}
          width={size.width}
          height={size.height}
          rx={borderRadius}
          ry={borderRadius}
          fill={background}
        />
      )}

      {/* Text */}
      <text
        x={textX}
        y={size.height / 2}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fontFamily={style.fontFamily}
        fontSize={style.fontSize}
        fontWeight={getFontWeight(style.fontWeight)}
        fill={style.color}
      >
        {content}
      </text>
    </g>
  );
}
