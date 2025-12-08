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

  // Calculate line height
  const lineHeight = style.lineHeight || 1.4;
  const lineHeightPx = style.fontSize * lineHeight;

  // Word wrap text to fit within width
  const wrapText = (text: string, maxWidth: number): string[] => {
    const availableWidth = maxWidth - padding * 2;
    const avgCharWidth = style.fontSize * 0.55; // Approximate character width
    const charsPerLine = Math.floor(availableWidth / avgCharWidth);

    const lines: string[] = [];

    // First split by explicit newlines
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (paragraph === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= charsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          // If single word is too long, break it
          if (word.length > charsPerLine) {
            let remaining = word;
            while (remaining.length > charsPerLine) {
              lines.push(remaining.slice(0, charsPerLine));
              remaining = remaining.slice(charsPerLine);
            }
            currentLine = remaining;
          } else {
            currentLine = word;
          }
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  };

  const wrappedLines = wrapText(content, size.width);
  const totalTextHeight = wrappedLines.length * lineHeightPx;
  const startY = (size.height - totalTextHeight) / 2 + lineHeightPx / 2;

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

      {/* Text with wrapping */}
      <text
        x={textX}
        textAnchor={textAnchor}
        fontFamily={style.fontFamily}
        fontSize={style.fontSize}
        fontWeight={getFontWeight(style.fontWeight)}
        fill={style.color}
      >
        {wrappedLines.map((line, i) => (
          <tspan
            key={i}
            x={textX}
            y={startY + i * lineHeightPx}
            dominantBaseline="middle"
          >
            {line || '\u00A0'} {/* Non-breaking space for empty lines */}
          </tspan>
        ))}
      </text>
    </g>
  );
}
