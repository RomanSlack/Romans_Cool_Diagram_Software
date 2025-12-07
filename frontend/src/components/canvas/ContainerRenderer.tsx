"use client";

import { DiagramContainer, Theme } from "@/lib/schema/types";
import { resolveColor, resolveFont } from "@/themes/academic";

interface ContainerRendererProps {
  container: DiagramContainer;
  theme: Theme;
  selected?: boolean;
  onSelect?: (containerId: string) => void;
}

export function ContainerRenderer({
  container,
  theme,
  selected = false,
  onSelect,
}: ContainerRendererProps) {
  const { bounds, style, label } = container;

  // Resolve colors
  const fillColor = resolveColor(style.fill, theme);
  const strokeColor = resolveColor(style.stroke, theme);

  // Label position calculations
  let labelX: number;
  let labelY: number;
  let textAnchor: "start" | "middle" | "end" = "middle";

  switch (label.position) {
    case "top-left":
      labelX = bounds.x + 10;
      labelY = bounds.y + bounds.height + label.size + 4;
      textAnchor = "start";
      break;
    case "top-center":
      labelX = bounds.x + bounds.width / 2;
      labelY = bounds.y - 8;
      textAnchor = "middle";
      break;
    case "bottom-center":
    default:
      labelX = bounds.x + bounds.width / 2;
      labelY = bounds.y + bounds.height + label.size + 4;
      textAnchor = "middle";
      break;
  }

  const fontFamily = resolveFont(label.font, theme);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(container.id);
  };

  return (
    <g onClick={handleClick} style={{ cursor: "pointer" }}>
      {/* Container rectangle */}
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        rx={style.borderRadius}
        ry={style.borderRadius}
        fill={fillColor}
        fillOpacity={style.fillOpacity}
        stroke={selected ? "#2196F3" : strokeColor}
        strokeWidth={selected ? style.strokeWidth + 1 : style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
      />

      {/* Selection indicator */}
      {selected && (
        <rect
          x={bounds.x - 2}
          y={bounds.y - 2}
          width={bounds.width + 4}
          height={bounds.height + 4}
          rx={style.borderRadius + 2}
          ry={style.borderRadius + 2}
          fill="none"
          stroke="#2196F3"
          strokeWidth={1}
          strokeDasharray="4,2"
        />
      )}

      {/* Container label */}
      <text
        x={labelX}
        y={labelY}
        textAnchor={textAnchor}
        fontFamily={fontFamily}
        fontSize={label.size}
        fontWeight={label.weight || "bold"}
        fill={theme.colors.text}
      >
        {label.text}
      </text>
    </g>
  );
}
