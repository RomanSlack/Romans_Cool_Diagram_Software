"use client";

import { DiagramElement } from "@/lib/schema/types";

interface ConnectionHandlesProps {
  element: DiagramElement;
  onStartConnection: (elementId: string, anchor: string, e: React.MouseEvent) => void;
  zoom: number;
}

export function ConnectionHandles({ element, onStartConnection, zoom }: ConnectionHandlesProps) {
  const { position, size } = element;
  const handleSize = 10 / zoom;
  const offset = handleSize / 2;

  const handles = [
    { anchor: "top", x: size.width / 2, y: 0 },
    { anchor: "right", x: size.width, y: size.height / 2 },
    { anchor: "bottom", x: size.width / 2, y: size.height },
    { anchor: "left", x: 0, y: size.height / 2 },
  ];

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {handles.map(({ anchor, x, y }) => (
        <g key={anchor}>
          {/* Invisible larger hit area */}
          <circle
            cx={x}
            cy={y}
            r={handleSize}
            fill="transparent"
            style={{ cursor: "crosshair" }}
            onMouseDown={(e) => onStartConnection(element.id, anchor, e)}
          />
          {/* Visible handle */}
          <circle
            cx={x}
            cy={y}
            r={offset}
            fill="#2563eb"
            stroke="white"
            strokeWidth={2 / zoom}
            style={{ cursor: "crosshair", pointerEvents: "none" }}
          />
        </g>
      ))}
    </g>
  );
}
