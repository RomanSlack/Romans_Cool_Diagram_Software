"use client";

import { ImageElement } from "@/lib/schema/types";

interface ImageRendererProps {
  element: ImageElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ImageRenderer({ element, onMouseDown }: ImageRendererProps) {
  const { position, size, style, src } = element;

  // Generate unique IDs for filters and clip paths
  const shadowId = `image-shadow-${element.id}`;
  const clipId = `image-clip-${element.id}`;

  // Calculate border radius (max is half the smallest dimension for full rounding)
  const maxRadius = Math.min(size.width, size.height) / 2;
  const borderRadius = Math.min(style.borderRadius, maxRadius);

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onMouseDown}
      style={{ cursor: "move" }}
    >
      {/* Shadow filter */}
      {style.shadow && (
        <defs>
          <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx={style.shadow.x}
              dy={style.shadow.y}
              stdDeviation={style.shadow.blur / 2}
              floodColor={style.shadow.color}
            />
          </filter>
        </defs>
      )}

      {/* Clip path for rounded corners */}
      <defs>
        <clipPath id={clipId}>
          <rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            rx={borderRadius}
            ry={borderRadius}
          />
        </clipPath>
      </defs>

      {/* Shadow background (rendered behind the image) */}
      {style.shadow && (
        <rect
          x={0}
          y={0}
          width={size.width}
          height={size.height}
          rx={borderRadius}
          ry={borderRadius}
          fill="white"
          filter={`url(#${shadowId})`}
        />
      )}

      {/* Image with clip path for rounded corners */}
      <image
        href={src}
        x={0}
        y={0}
        width={size.width}
        height={size.height}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
        opacity={style.opacity}
      />

      {/* Border/stroke overlay */}
      {style.strokeWidth > 0 && style.stroke !== "transparent" && (
        <rect
          x={0}
          y={0}
          width={size.width}
          height={size.height}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
        />
      )}

      {/* Label (if present) */}
      {element.label && (
        <text
          x={size.width / 2}
          y={size.height + 16}
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize={11}
          fill="#666666"
        >
          {element.label}
        </text>
      )}
    </g>
  );
}
