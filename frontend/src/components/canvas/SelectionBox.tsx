"use client";

import { DiagramElement } from "@/lib/schema/types";
import { useDiagramStore } from "@/lib/store/diagramStore";
import { useCallback, useState } from "react";

interface SelectionBoxProps {
  element: DiagramElement;
  zoom: number;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export function SelectionBox({ element, zoom }: SelectionBoxProps) {
  const { resizeElement, pushHistory } = useDiagramStore();
  const [, setResizing] = useState<ResizeHandle | null>(null);

  const handleSize = 8 / zoom; // Consistent handle size regardless of zoom
  const strokeWidth = 1 / zoom;

  const handles: { position: ResizeHandle; x: number; y: number; cursor: string }[] = [
    { position: "nw", x: 0, y: 0, cursor: "nw-resize" },
    { position: "n", x: element.size.width / 2, y: 0, cursor: "n-resize" },
    { position: "ne", x: element.size.width, y: 0, cursor: "ne-resize" },
    { position: "e", x: element.size.width, y: element.size.height / 2, cursor: "e-resize" },
    { position: "se", x: element.size.width, y: element.size.height, cursor: "se-resize" },
    { position: "s", x: element.size.width / 2, y: element.size.height, cursor: "s-resize" },
    { position: "sw", x: 0, y: element.size.height, cursor: "sw-resize" },
    { position: "w", x: 0, y: element.size.height / 2, cursor: "w-resize" },
  ];

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      pushHistory();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = element.size.width;
      const startHeight = element.size.height;
      const startPosX = element.position.x;
      const startPosY = element.position.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / zoom;
        const dy = (moveEvent.clientY - startY) / zoom;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startPosX;
        let newY = startPosY;

        // Resize based on handle
        if (handle.includes("e")) {
          newWidth = Math.max(40, startWidth + dx);
        }
        if (handle.includes("w")) {
          const delta = Math.min(dx, startWidth - 40);
          newWidth = startWidth - delta;
          newX = startPosX + delta;
        }
        if (handle.includes("s")) {
          newHeight = Math.max(30, startHeight + dy);
        }
        if (handle.includes("n")) {
          const delta = Math.min(dy, startHeight - 30);
          newHeight = startHeight - delta;
          newY = startPosY + delta;
        }

        resizeElement(
          element.id,
          { width: newWidth, height: newHeight },
          { x: newX, y: newY }
        );
      };

      const handleMouseUp = () => {
        setResizing(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      setResizing(handle);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [element, zoom, resizeElement, pushHistory]
  );

  return (
    <g transform={`translate(${element.position.x}, ${element.position.y})`}>
      {/* Selection outline */}
      <rect
        x={-2 / zoom}
        y={-2 / zoom}
        width={element.size.width + 4 / zoom}
        height={element.size.height + 4 / zoom}
        fill="none"
        stroke="#2563eb"
        strokeWidth={strokeWidth}
        rx={2 / zoom}
      />

      {/* Resize handles */}
      {handles.map(({ position, x, y, cursor }) => (
        <rect
          key={position}
          x={x - handleSize / 2}
          y={y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke="#2563eb"
          strokeWidth={strokeWidth}
          rx={1 / zoom}
          style={{ cursor }}
          onMouseDown={(e) => handleMouseDown(e, position)}
        />
      ))}
    </g>
  );
}
