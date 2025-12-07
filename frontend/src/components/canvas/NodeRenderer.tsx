"use client";

import { NodeElement } from "@/lib/schema/types";

interface NodeRendererProps {
  element: NodeElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function NodeRenderer({ element, onMouseDown }: NodeRendererProps) {
  const { position, size, style, content, titleStyle, subtitleStyle, shape } = element;

  // Generate shadow filter ID
  const shadowId = `shadow-${element.id}`;

  // Calculate border radius based on shape
  const getBorderRadius = () => {
    switch (shape) {
      case "rectangle":
        return 0;
      case "rounded":
        return style.borderRadius;
      case "pill":
        return Math.min(size.width, size.height) / 2;
      case "circle":
        return Math.min(size.width, size.height) / 2;
      default:
        return style.borderRadius;
    }
  };

  const borderRadius = getBorderRadius();

  // Text positioning
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  const hasSubtitle = content.subtitle && content.subtitle.trim() !== "";
  const titleY = hasSubtitle ? centerY - 8 : centerY;
  const subtitleY = titleY + titleStyle.fontSize + 4;

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

      {/* Main shape */}
      {shape === "cylinder" ? (
        <CylinderShape
          width={size.width}
          height={size.height}
          style={style}
          shadowId={shadowId}
        />
      ) : shape === "diamond" ? (
        <DiamondShape
          width={size.width}
          height={size.height}
          style={style}
          shadowId={shadowId}
        />
      ) : (
        <rect
          x={0}
          y={0}
          width={size.width}
          height={size.height}
          rx={borderRadius}
          ry={borderRadius}
          fill={style.fill}
          fillOpacity={style.fillOpacity}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
          strokeDasharray={style.strokeDasharray}
          filter={style.shadow ? `url(#${shadowId})` : undefined}
        />
      )}

      {/* Title */}
      <text
        x={centerX}
        y={titleY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={titleStyle.fontFamily}
        fontSize={titleStyle.fontSize}
        fontWeight={getFontWeight(titleStyle.fontWeight)}
        fill={titleStyle.color}
      >
        {content.title}
      </text>

      {/* Subtitle */}
      {hasSubtitle && subtitleStyle && (
        <text
          x={centerX}
          y={subtitleY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={subtitleStyle.fontFamily}
          fontSize={subtitleStyle.fontSize}
          fontWeight={getFontWeight(subtitleStyle.fontWeight)}
          fill={subtitleStyle.color}
        >
          {content.subtitle}
        </text>
      )}
    </g>
  );
}

// Cylinder shape component
function CylinderShape({
  width,
  height,
  style,
  shadowId,
}: {
  width: number;
  height: number;
  style: NodeElement["style"];
  shadowId: string;
}) {
  const ellipseRy = Math.min(12, height * 0.15);

  return (
    <g filter={style.shadow ? `url(#${shadowId})` : undefined}>
      {/* Body */}
      <path
        d={`
          M 0 ${ellipseRy}
          L 0 ${height - ellipseRy}
          A ${width / 2} ${ellipseRy} 0 0 0 ${width} ${height - ellipseRy}
          L ${width} ${ellipseRy}
          A ${width / 2} ${ellipseRy} 0 0 0 0 ${ellipseRy}
        `}
        fill={style.fill}
        fillOpacity={style.fillOpacity}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
      {/* Top ellipse */}
      <ellipse
        cx={width / 2}
        cy={ellipseRy}
        rx={width / 2}
        ry={ellipseRy}
        fill={style.fill}
        fillOpacity={style.fillOpacity}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </g>
  );
}

// Diamond shape component
function DiamondShape({
  width,
  height,
  style,
  shadowId,
}: {
  width: number;
  height: number;
  style: NodeElement["style"];
  shadowId: string;
}) {
  const points = `
    ${width / 2},0
    ${width},${height / 2}
    ${width / 2},${height}
    0,${height / 2}
  `;

  return (
    <polygon
      points={points}
      fill={style.fill}
      fillOpacity={style.fillOpacity}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      filter={style.shadow ? `url(#${shadowId})` : undefined}
    />
  );
}

function getFontWeight(weight: string): number {
  const weights: { [key: string]: number } = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  };
  return weights[weight] || 400;
}
