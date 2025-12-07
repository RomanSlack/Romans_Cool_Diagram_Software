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

  const strokeColor = isSelected ? "#2563eb" : style.stroke;

  return (
    <g onMouseDown={onMouseDown} style={{ cursor: "pointer" }}>
      {/* Arrow markers */}
      <defs>
        {startArrow && (
          <marker
            id={startMarkerId}
            markerWidth={10}
            markerHeight={10}
            refX={0}
            refY={5}
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <ArrowHead type={startArrow.type} size={10} color={strokeColor} />
          </marker>
        )}
        {endArrow && (
          <marker
            id={endMarkerId}
            markerWidth={10}
            markerHeight={10}
            refX={10}
            refY={5}
            orient="auto"
            markerUnits="strokeWidth"
          >
            <ArrowHead type={endArrow.type} size={10} color={strokeColor} />
          </marker>
        )}
      </defs>

      {/* Hit area for easier selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(12, style.strokeWidth + 10)}
        strokeLinecap="round"
      />

      {/* Actual edge */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
        strokeOpacity={style.opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerStart={startArrow ? `url(#${startMarkerId})` : undefined}
        markerEnd={endArrow ? `url(#${endMarkerId})` : undefined}
      />

      {/* Selection highlight */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke="#2563eb"
          strokeWidth={style.strokeWidth + 4}
          strokeOpacity={0.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

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
  const half = size / 2;

  switch (type) {
    case "filled":
      return (
        <polygon
          points={`0,0 ${size},${half} 0,${size}`}
          fill={color}
        />
      );
    case "open":
      return (
        <polyline
          points={`0,0 ${size},${half} 0,${size}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "diamond":
      return (
        <polygon
          points={`0,${half} ${half},0 ${size},${half} ${half},${size}`}
          fill={color}
        />
      );
    case "diamond-open":
      return (
        <polygon
          points={`0,${half} ${half},0 ${size},${half} ${half},${size}`}
          fill="white"
          stroke={color}
          strokeWidth={1.5}
        />
      );
    case "circle":
      return (
        <circle
          cx={half}
          cy={half}
          r={half * 0.6}
          fill={color}
        />
      );
    case "circle-open":
      return (
        <circle
          cx={half}
          cy={half}
          r={half * 0.6}
          fill="white"
          stroke={color}
          strokeWidth={1.5}
        />
      );
    default:
      return null;
  }
}

function EdgeLabel({ path, label, position }: { path: string; label: EdgeElement["label"]; position: number }) {
  if (!label) return null;

  // Get path points for label positioning
  const points = extractPathPoints(path);
  if (points.length < 2) return null;

  // Interpolate position along path
  const { x, y } = interpolateAlongPath(points, position);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {label.background && (
        <rect
          x={-label.text.length * 3.5 - (label.padding || 4)}
          y={-10}
          width={label.text.length * 7 + (label.padding || 4) * 2}
          height={20}
          rx={3}
          fill={label.background}
        />
      )}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={label.style.fontFamily}
        fontSize={label.style.fontSize}
        fill={label.style.color}
      >
        {label.text}
      </text>
    </g>
  );
}

function extractPathPoints(path: string): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  // Match M and L commands
  const regex = /([ML])\s*([\d.-]+)[,\s]+([\d.-]+)/g;
  let match;

  while ((match = regex.exec(path)) !== null) {
    points.push({
      x: parseFloat(match[2]),
      y: parseFloat(match[3]),
    });
  }

  // Handle curved paths (C command) - just use endpoints
  const curveMatch = path.match(/C\s*[\d.-]+[,\s]+[\d.-]+[,\s]+[\d.-]+[,\s]+[\d.-]+[,\s]+([\d.-]+)[,\s]+([\d.-]+)/);
  if (curveMatch) {
    points.push({
      x: parseFloat(curveMatch[1]),
      y: parseFloat(curveMatch[2]),
    });
  }

  return points;
}

function interpolateAlongPath(points: { x: number; y: number }[], t: number): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  // Calculate total path length
  let totalLength = 0;
  const segments: { start: { x: number; y: number }; end: { x: number; y: number }; length: number }[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const length = Math.sqrt(dx * dx + dy * dy);
    segments.push({ start: points[i], end: points[i + 1], length });
    totalLength += length;
  }

  // Find position at t
  const targetLength = t * totalLength;
  let currentLength = 0;

  for (const segment of segments) {
    if (currentLength + segment.length >= targetLength) {
      const segmentT = (targetLength - currentLength) / segment.length;
      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * segmentT,
        y: segment.start.y + (segment.end.y - segment.start.y) * segmentT,
      };
    }
    currentLength += segment.length;
  }

  return points[points.length - 1];
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
    const dy = target.y - source.y;

    // Smart bezier control points based on direction
    let cx1, cy1, cx2, cy2;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal dominant - curve horizontally
      cx1 = source.x + dx * 0.4;
      cy1 = source.y;
      cx2 = source.x + dx * 0.6;
      cy2 = target.y;
    } else {
      // Vertical dominant - curve vertically
      cx1 = source.x;
      cy1 = source.y + dy * 0.4;
      cx2 = target.x;
      cy2 = source.y + dy * 0.6;
    }

    return `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;
  }

  // Orthogonal routing
  const padding = 25;

  // Determine anchor directions
  const sourceIsHorizontal = sourceAnchor === "left" || sourceAnchor === "right" ||
    (sourceAnchor === "auto" && Math.abs(target.x - source.x) > Math.abs(target.y - source.y));
  const targetIsHorizontal = targetAnchor === "left" || targetAnchor === "right" ||
    (targetAnchor === "auto" && Math.abs(source.x - target.x) > Math.abs(source.y - target.y));

  // Offset from anchors
  const sourceDir = getAnchorDirection(sourceAnchor, source, target);
  const targetDir = getAnchorDirection(targetAnchor, target, source);

  const p1 = {
    x: source.x + sourceDir.x * padding,
    y: source.y + sourceDir.y * padding,
  };
  const p2 = {
    x: target.x + targetDir.x * padding,
    y: target.y + targetDir.y * padding,
  };

  // Build path with right angles
  let path = `M ${source.x} ${source.y} L ${p1.x} ${p1.y}`;

  if (sourceIsHorizontal && targetIsHorizontal) {
    const midX = (p1.x + p2.x) / 2;
    path += ` L ${midX} ${p1.y} L ${midX} ${p2.y}`;
  } else if (!sourceIsHorizontal && !targetIsHorizontal) {
    const midY = (p1.y + p2.y) / 2;
    path += ` L ${p1.x} ${midY} L ${p2.x} ${midY}`;
  } else if (sourceIsHorizontal) {
    path += ` L ${p2.x} ${p1.y}`;
  } else {
    path += ` L ${p1.x} ${p2.y}`;
  }

  path += ` L ${p2.x} ${p2.y} L ${target.x} ${target.y}`;

  return path;
}

function getAnchorDirection(
  anchor: string,
  from: { x: number; y: number },
  to: { x: number; y: number }
): { x: number; y: number } {
  switch (anchor) {
    case "top":
      return { x: 0, y: -1 };
    case "bottom":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
    case "auto":
    default:
      // Auto direction based on target
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        return { x: dx > 0 ? 1 : -1, y: 0 };
      } else {
        return { x: 0, y: dy > 0 ? 1 : -1 };
      }
  }
}
