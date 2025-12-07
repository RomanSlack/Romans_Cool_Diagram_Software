"use client";

import { Legend, Theme } from "@/lib/schema/types";
import { resolveColor } from "@/themes/academic";

interface LegendRendererProps {
  legend: Legend;
  theme: Theme;
}

export function LegendRenderer({ legend, theme }: LegendRendererProps) {
  const isHorizontal = legend.orientation !== "vertical";
  const itemSpacing = isHorizontal ? 120 : 24;

  return (
    <g transform={`translate(${legend.position.x}, ${legend.position.y})`}>
      {legend.items.map((item, index) => {
        const xOffset = isHorizontal ? index * itemSpacing : 0;
        const yOffset = isHorizontal ? 0 : index * itemSpacing;

        const symbolFill = item.symbol.fill
          ? resolveColor(item.symbol.fill, theme)
          : "none";
        const symbolStroke = item.symbol.stroke
          ? resolveColor(item.symbol.stroke, theme)
          : theme.colors.stroke;

        return (
          <g key={index} transform={`translate(${xOffset}, ${yOffset})`}>
            {/* Symbol */}
            {item.type === "node" ? (
              <rect
                x={0}
                y={-8}
                width={20}
                height={16}
                rx={3}
                fill={symbolFill}
                stroke={symbolStroke}
                strokeWidth={1}
              />
            ) : (
              <line
                x1={0}
                y1={0}
                x2={20}
                y2={0}
                stroke={symbolStroke}
                strokeWidth={1.5}
                strokeDasharray={item.symbol.strokeDasharray}
                markerEnd={item.symbol.strokeDasharray ? undefined : "url(#legend-arrow)"}
              />
            )}

            {/* Label */}
            <text
              x={28}
              y={0}
              dominantBaseline="middle"
              fontFamily={theme.typography.sansFont}
              fontSize={11}
              fill={theme.colors.text}
            >
              {item.label}
            </text>
          </g>
        );
      })}

      {/* Arrow marker for edge symbols */}
      <defs>
        <marker
          id="legend-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill={theme.colors.stroke} />
        </marker>
      </defs>
    </g>
  );
}
