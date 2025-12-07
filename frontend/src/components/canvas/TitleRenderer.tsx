"use client";

import { TitleBlock, Theme } from "@/lib/schema/types";
import { resolveFont } from "@/themes/academic";

interface TitleRendererProps {
  title: TitleBlock;
  canvasWidth: number;
  theme: Theme;
}

export function TitleRenderer({ title, canvasWidth, theme }: TitleRendererProps) {
  const fontFamily = resolveFont(title.font, theme);

  const xPos = title.position === "top-center" ? canvasWidth / 2 : 20;
  const textAnchor = title.position === "top-center" ? "middle" : "start";

  return (
    <g>
      {/* Main title */}
      <text
        x={xPos}
        y={30}
        textAnchor={textAnchor}
        fontFamily={fontFamily}
        fontSize={title.size}
        fontWeight="bold"
        fill={theme.colors.text}
      >
        {title.text}
      </text>

      {/* Subtitle */}
      {title.subtitle && (
        <text
          x={xPos}
          y={30 + title.size + 4}
          textAnchor={textAnchor}
          fontFamily={fontFamily}
          fontSize={title.subtitleSize || title.size - 4}
          fontWeight="normal"
          fill={theme.colors.textMuted}
        >
          {title.subtitle}
        </text>
      )}
    </g>
  );
}
