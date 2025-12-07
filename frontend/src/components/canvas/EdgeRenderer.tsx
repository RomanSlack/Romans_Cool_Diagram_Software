"use client";

import { EdgeElement, DiagramElement, NodeElement, ContainerElement } from "@/lib/schema/types";

interface EdgeRendererProps {
  element: EdgeElement;
  elements: DiagramElement[];
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function EdgeRenderer({ element, elements, isSelected, onMouseDown }: EdgeRendererProps) {
  const { source, target, style, routing, label, startArrow, endArrow } = element;

  // Find source and target elements
  const sourceEl = elements.find((e) => e.id === source.elementId) as NodeElement | ContainerElement | undefined;
  const targetEl = elements.find((e) => e.id === target.elementId) as NodeElement | ContainerElement | undefined;

  if (!sourceEl || !targetEl) return null;

  // Get connection points
  const sourcePoint = getConnectionPoint(sourceEl, source.anchor, targetEl);
  const targetPoint = getConnectionPoint(targetEl, target.anchor, sourceEl);

  // Calculate path
  const path = calculatePath(sourcePoint, targetPoint, source.anchor, target.anchor, routing);

  // Marker IDs
  const startMarkerId = `arrow-start-${element.id}`;
  const endMarkerId = `arrow-end-${element.id}`;

  return (
    <g onMouseDown={onMouseDown} style={{ cursor: "pointer" }}>
      {/* Arrow markers */}
      <defs>
        {startArrow && (
          <marker
            id={startMarkerId}
            markerWidth={startArrow.size}
            markerHeight={startArrow.size}
            refX={startArrow.type === "filled" ? 0 : 0}
            refY={startArrow.size / 2}
            orient="auto-start-reverse"
          >
            <ArrowHead type={startArrow.type} size={startArrow.size} color={style.stroke} />
          </marker>
        )}
        {endArrow && (
          <marker
            id={endMarkerId}
            markerWidth={endArrow.size}
            markerHeight={endArrow.size}
            refX={endArrow.type === "filled" ? endArrow.size : endArrow.size}
            refY={endArrow.size / 2}
            orient="auto"
          >
            <ArrowHead type={endArrow.type} size={endArrow.size} color={style.stroke} />
          </marker>
        )}
      </defs>

      {/* Hit area for easier selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />

      {/* Actual edge */}
      <path
        d={path}
        fill="none"
        stroke={isSelected ? "#2563eb" : style.stroke}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
        strokeOpacity={style.opacity}
        markerStart={startArrow ? `url(#${startMarkerId})` : undefined}
        markerEnd={endArrow ? `url(#${endMarkerId})` : undefined}
      />

      {/* Label */}
      {label && (
        <EdgeLabel
          path={path}
          label={label}
          position={label.position}
        />
      )}
    </g>
  );
}

function ArrowHead({ type, size, color }: { type: string; size: number; color: string }) {
  switch (type) {
    case "filled":
      return <path d={`M0,0 L${size},${size / 2} L0,${size} Z`} fill={color} />;
    case "open":
      return (
        <path
          d={`M0,0 L${size},${size / 2} L0,${size}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
      );
    case "diamond":
      return (
        <path
          d={`M0,${size / 2} L${size / 2},0 L${size},${size / 2} L${size / 2},${size} Z`}
          fill={color}
        />
      );
    case "circle":
      return <circle cx={size / 2} cy={size / 2} r={size / 3} fill={color} />;
    default:
      return null;
  }
}

function EdgeLabel({ path, label, position }: { path: string; label: EdgeElement["label"]; position: number }) {
  if (!label) return null;

  // Simple midpoint calculation (could be improved with proper path interpolation)
  const match = path.match(/M\s*([\d.]+)[,\s]*([\d.]+)/);
  const endMatch = path.match(/L\s*([\d.]+)[,\s]*([\d.]+)(?!.*L)/);

  if (!match || !endMatch) return null;

  const x1 = parseFloat(match[1]);
  const y1 = parseFloat(match[2]);
  const x2 = parseFloat(endMatch[1]);
  const y2 = parseFloat(endMatch[2]);

  const x = x1 + (x2 - x1) * position;
  const y = y1 + (y2 - y1) * position;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {label.background && (
        <rect
          x={-label.text.length * 3.5 - (label.padding || 4)}
          y={-10}
          width={label.text.length * 7 + (label.padding || 4) * 2}
          height={20}
          rx={2}
          fill={label.background}
        />
      )}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={label.style.fontFamily}
        fontSize={label.style.fontSize}
        fill={label.style.color}
        fontStyle="italic"
      >
        {label.text}
      </text>
    </g>
  );
}

function getConnectionPoint(
  element: NodeElement | ContainerElement,
  anchor: string,
  otherElement: NodeElement | ContainerElement
): { x: number; y: number } {
  const { position, size } = element;
  const centerX = position.x + size.width / 2;
  const centerY = position.y + size.height / 2;

  if (anchor === "auto") {
    // Determine best anchor based on relative position
    const otherCenterX = otherElement.position.x + otherElement.size.width / 2;
    const otherCenterY = otherElement.position.y + otherElement.size.height / 2;

    const dx = otherCenterX - centerX;
    const dy = otherCenterY - centerY;

    if (Math.abs(dx) > Math.abs(dy)) {
      anchor = dx > 0 ? "right" : "left";
    } else {
      anchor = dy > 0 ? "bottom" : "top";
    }
  }

  switch (anchor) {
    case "top":
      return { x: centerX, y: position.y };
    case "bottom":
      return { x: centerX, y: position.y + size.height };
    case "left":
      return { x: position.x, y: centerY };
    case "right":
      return { x: position.x + size.width, y: centerY };
    case "center":
    default:
      return { x: centerX, y: centerY };
  }
}

function calculatePath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  sourceAnchor: string,
  targetAnchor: string,
  routing: string
): string {
  if (routing === "straight") {
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  }

  if (routing === "curved") {
    const dx = target.x - source.x;
    const cx1 = source.x + dx * 0.5;
    const cy1 = source.y;
    const cx2 = source.x + dx * 0.5;
    const cy2 = target.y;
    return `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;
  }

  // Orthogonal routing
  const padding = 20;
  const isSourceHorizontal = sourceAnchor === "left" || sourceAnchor === "right";
  const isTargetHorizontal = targetAnchor === "left" || targetAnchor === "right";

  // Offset from anchors
  const sourceOffset = isSourceHorizontal
    ? { x: sourceAnchor === "right" ? padding : -padding, y: 0 }
    : { x: 0, y: sourceAnchor === "bottom" ? padding : -padding };
  const targetOffset = isTargetHorizontal
    ? { x: targetAnchor === "right" ? padding : -padding, y: 0 }
    : { x: 0, y: targetAnchor === "bottom" ? padding : -padding };

  const p1 = { x: source.x + sourceOffset.x, y: source.y + sourceOffset.y };
  const p2 = { x: target.x + targetOffset.x, y: target.y + targetOffset.y };

  // Build path with right angles
  let path = `M ${source.x} ${source.y} L ${p1.x} ${p1.y}`;

  if (isSourceHorizontal && isTargetHorizontal) {
    const midX = (p1.x + p2.x) / 2;
    path += ` L ${midX} ${p1.y} L ${midX} ${p2.y}`;
  } else if (!isSourceHorizontal && !isTargetHorizontal) {
    const midY = (p1.y + p2.y) / 2;
    path += ` L ${p1.x} ${midY} L ${p2.x} ${midY}`;
  } else if (isSourceHorizontal) {
    path += ` L ${p2.x} ${p1.y}`;
  } else {
    path += ` L ${p1.x} ${p2.y}`;
  }

  path += ` L ${p2.x} ${p2.y} L ${target.x} ${target.y}`;

  return path;
}
