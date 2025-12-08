"use client";

import { EdgeElement, DiagramElement, NodeElement, ContainerElement, Position } from "@/lib/schema/types";

interface EdgeRendererProps {
  element: EdgeElement;
  elements: DiagramElement[];
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onEdgeUpdate?: (updates: Partial<EdgeElement>) => void;
  zoom?: number;
}

export function EdgeRenderer({ element, elements, isSelected, onMouseDown, onEdgeUpdate, zoom = 1 }: EdgeRendererProps) {
  const { source, target, style, routing, label, startArrow, endArrow, roundedCorners = true } = element;

  // Find source and target elements
  const sourceEl = elements.find((e) => e.id === source.elementId) as NodeElement | ContainerElement | undefined;
  const targetEl = elements.find((e) => e.id === target.elementId) as NodeElement | ContainerElement | undefined;

  if (!sourceEl || !targetEl) return null;

  // Get connection points with offset support
  const sourcePoint = getConnectionPoint(sourceEl, source.anchor, targetEl, source.offset);
  const targetPoint = getConnectionPoint(targetEl, target.anchor, sourceEl, target.offset);

  // Calculate path with adjustable midpoint
  const midpointOffset = element.waypoints?.[0]?.x ?? 0.5; // Store midpoint as ratio 0-1
  const cornerRadius = roundedCorners ? 8 : 0;
  const { path, segments } = calculateOrthogonalPath(sourcePoint, targetPoint, source.anchor, target.anchor, routing, midpointOffset, cornerRadius);

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
            refX={10}
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

      {/* Edge editing handles - show when selected */}
      {isSelected && onEdgeUpdate && (
        <>
          {/* Draggable segment handles - for moving the middle section of orthogonal edges */}
          {segments && segments.map((segment, i) => {
            if (!segment.draggable) return null;
            const midX = (segment.start.x + segment.end.x) / 2;
            const midY = (segment.start.y + segment.end.y) / 2;
            const isHorizontal = segment.direction === "horizontal";

            return (
              <g key={`segment-${i}`}>
                {/* Invisible wider hit area */}
                <line
                  x1={segment.start.x}
                  y1={segment.start.y}
                  x2={segment.end.x}
                  y2={segment.end.y}
                  stroke="transparent"
                  strokeWidth={12 / zoom}
                  style={{ cursor: isHorizontal ? "ns-resize" : "ew-resize" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const startPos = getSvgPoint(e.nativeEvent, zoom);
                    if (!startPos) return;

                    const startMidpoint = element.waypoints?.[0]?.x ?? 0.5;

                    const handleDrag = (moveEvent: MouseEvent) => {
                      const currentPos = getSvgPoint(moveEvent, zoom);
                      if (!currentPos) return;

                      // Calculate extension allowance (same as in calculateOrthogonalPath)
                      // For vertical segments (isHorizontal=false), we drag left/right (X)
                      // For horizontal segments (isHorizontal=true), we drag up/down (Y)
                      const range = isHorizontal
                        ? Math.abs(targetPoint.y - sourcePoint.y)
                        : Math.abs(targetPoint.x - sourcePoint.x);
                      const extensionAllowance = Math.max(range, 100);

                      // Calculate drag delta - vertical segment moves horizontally, horizontal segment moves vertically
                      const dragDelta = isHorizontal
                        ? currentPos.y - startPos.y
                        : currentPos.x - startPos.x;

                      // Convert drag distance to ratio (extensionAllowance * 2 is full range for 0-1)
                      const ratioChange = dragDelta / (extensionAllowance * 2);

                      // Allow full range 0-1 for maximum flexibility
                      const newMid = Math.max(0, Math.min(1, startMidpoint + ratioChange));

                      onEdgeUpdate({ waypoints: [{ x: newMid, y: 0 }] });
                    };

                    const handleUp = () => {
                      window.removeEventListener("mousemove", handleDrag);
                      window.removeEventListener("mouseup", handleUp);
                    };

                    window.addEventListener("mousemove", handleDrag);
                    window.addEventListener("mouseup", handleUp);
                  }}
                />
                {/* Visual handle */}
                <rect
                  x={midX - 4 / zoom}
                  y={midY - 4 / zoom}
                  width={8 / zoom}
                  height={8 / zoom}
                  rx={2 / zoom}
                  fill="#2563eb"
                  stroke="white"
                  strokeWidth={1.5 / zoom}
                  style={{ cursor: isHorizontal ? "ns-resize" : "ew-resize", pointerEvents: "none" }}
                />
              </g>
            );
          })}

          {/* Connection point handles - positioned at middle of entry/exit segments */}
          {segments && segments.length >= 2 && (
            <>
              {/* Source connection handle - middle of first segment */}
              <ConnectionPointHandle
                point={{
                  x: (segments[0].start.x + segments[0].end.x) / 2,
                  y: (segments[0].start.y + segments[0].end.y) / 2,
                }}
                element={sourceEl}
                anchor={source.anchor}
                offset={source.offset || 0}
                zoom={zoom}
                onOffsetChange={(newOffset) => {
                  onEdgeUpdate({ source: { ...source, offset: newOffset } });
                }}
              />
              {/* Target connection handle - middle of last segment */}
              <ConnectionPointHandle
                point={{
                  x: (segments[segments.length - 1].start.x + segments[segments.length - 1].end.x) / 2,
                  y: (segments[segments.length - 1].start.y + segments[segments.length - 1].end.y) / 2,
                }}
                element={targetEl}
                anchor={target.anchor}
                offset={target.offset || 0}
                zoom={zoom}
                onOffsetChange={(newOffset) => {
                  onEdgeUpdate({ target: { ...target, offset: newOffset } });
                }}
              />
            </>
          )}
        </>
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

// Helper to get SVG coordinates from mouse event
function getSvgPoint(e: MouseEvent, zoom: number): Position | null {
  const canvas = document.getElementById("diagram-canvas");
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const svg = canvas.querySelector("svg");
  if (!svg) return null;
  const g = svg.querySelector("g");
  if (!g) return null;

  // Get the transform from the g element
  const transform = g.getAttribute("transform") || "";
  const translateMatch = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
  const tx = translateMatch ? parseFloat(translateMatch[1]) : 0;
  const ty = translateMatch ? parseFloat(translateMatch[2]) : 0;

  return {
    x: (e.clientX - rect.left - tx) / zoom,
    y: (e.clientY - rect.top - ty) / zoom,
  };
}

// Connection point handle for sliding along node edge
interface ConnectionPointHandleProps {
  point: Position;
  element: NodeElement | ContainerElement;
  anchor: string;
  offset: number;
  zoom: number;
  onOffsetChange: (offset: number) => void;
}

function ConnectionPointHandle({ point, element, anchor, offset, zoom, onOffsetChange }: ConnectionPointHandleProps) {
  const isHorizontalEdge = anchor === "top" || anchor === "bottom" || anchor === "auto";
  const isVerticalEdge = anchor === "left" || anchor === "right";

  // Determine drag direction based on which edge we're on
  const cursor = isHorizontalEdge ? "ew-resize" : isVerticalEdge ? "ns-resize" : "move";

  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={5 / zoom}
      fill="#10b981"
      stroke="white"
      strokeWidth={2 / zoom}
      style={{ cursor }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();

        const startPos = getSvgPoint(e.nativeEvent, zoom);
        if (!startPos) return;

        const handleDrag = (moveEvent: MouseEvent) => {
          const currentPos = getSvgPoint(moveEvent, zoom);
          if (!currentPos) return;

          let newOffset = offset;

          if (anchor === "top" || anchor === "bottom") {
            // Horizontal sliding along top/bottom edge
            const delta = currentPos.x - startPos.x;
            newOffset = Math.max(-0.45, Math.min(0.45, offset + delta / element.size.width));
          } else if (anchor === "left" || anchor === "right") {
            // Vertical sliding along left/right edge
            const delta = currentPos.y - startPos.y;
            newOffset = Math.max(-0.45, Math.min(0.45, offset + delta / element.size.height));
          }

          onOffsetChange(newOffset);
        };

        const handleUp = () => {
          window.removeEventListener("mousemove", handleDrag);
          window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", handleDrag);
        window.addEventListener("mouseup", handleUp);
      }}
    />
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
  otherElement: NodeElement | ContainerElement,
  offset?: number
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

  // Apply offset (percentage from -0.5 to 0.5)
  const off = offset || 0;

  switch (anchor) {
    case "top":
      return { x: centerX + off * size.width, y: position.y };
    case "bottom":
      return { x: centerX + off * size.width, y: position.y + size.height };
    case "left":
      return { x: position.x, y: centerY + off * size.height };
    case "right":
      return { x: position.x + size.width, y: centerY + off * size.height };
    case "center":
    default:
      return { x: centerX, y: centerY };
  }
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

// Segment info for draggable segments
interface Segment {
  start: Position;
  end: Position;
  direction: "horizontal" | "vertical";
  draggable: boolean;
}

// Helper to create a rounded corner path segment
// Uses quadratic bezier curve to round the corner
function roundedCorner(from: Position, corner: Position, to: Position, radius: number): string {
  // Calculate vectors
  const v1 = { x: corner.x - from.x, y: corner.y - from.y };
  const v2 = { x: to.x - corner.x, y: to.y - corner.y };

  // Normalize and get lengths
  const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  // Limit radius to half the shortest segment
  const maxRadius = Math.min(len1, len2) / 2;
  const r = Math.min(radius, maxRadius);

  if (r < 1) {
    // Too small for rounding, just use straight lines
    return `L ${corner.x} ${corner.y}`;
  }

  // Calculate start and end points of the curve
  const startPoint = {
    x: corner.x - (v1.x / len1) * r,
    y: corner.y - (v1.y / len1) * r,
  };
  const endPoint = {
    x: corner.x + (v2.x / len2) * r,
    y: corner.y + (v2.y / len2) * r,
  };

  // Use quadratic bezier with corner as control point
  return `L ${startPoint.x} ${startPoint.y} Q ${corner.x} ${corner.y} ${endPoint.x} ${endPoint.y}`;
}

// Calculate orthogonal path with adjustable midpoint and return segment info
function calculateOrthogonalPath(
  source: Position,
  target: Position,
  sourceAnchor: string,
  targetAnchor: string,
  routing: string,
  midpointRatio: number = 0.5,
  cornerRadius: number = 8
): { path: string; pathPoints: Position[]; segments: Segment[] } {
  // For straight routing
  if (routing === "straight") {
    return {
      path: `M ${source.x} ${source.y} L ${target.x} ${target.y}`,
      pathPoints: [source, target],
      segments: [{
        start: source,
        end: target,
        direction: Math.abs(target.x - source.x) > Math.abs(target.y - source.y) ? "horizontal" : "vertical",
        draggable: false
      }]
    };
  }

  // For curved routing
  if (routing === "curved") {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    let cx1, cy1, cx2, cy2;

    if (Math.abs(dx) > Math.abs(dy)) {
      cx1 = source.x + dx * 0.4;
      cy1 = source.y;
      cx2 = source.x + dx * 0.6;
      cy2 = target.y;
    } else {
      cx1 = source.x;
      cy1 = source.y + dy * 0.4;
      cx2 = target.x;
      cy2 = source.y + dy * 0.6;
    }

    return {
      path: `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`,
      pathPoints: [source, target],
      segments: []
    };
  }

  // Orthogonal routing with adjustable midpoint
  const padding = 20;
  const segments: Segment[] = [];

  // Determine anchor directions
  const sourceDir = getAnchorDirection(sourceAnchor, source, target);
  const targetDir = getAnchorDirection(targetAnchor, target, source);

  const sourceIsHorizontal = sourceDir.x !== 0;
  const targetIsHorizontal = targetDir.x !== 0;

  // First padding point from source
  const p1: Position = {
    x: source.x + sourceDir.x * padding,
    y: source.y + sourceDir.y * padding,
  };

  // Last padding point before target
  const p2: Position = {
    x: target.x + targetDir.x * padding,
    y: target.y + targetDir.y * padding,
  };

  const pathPoints: Position[] = [source, p1];
  let path = `M ${source.x} ${source.y} L ${p1.x} ${p1.y}`;

  // First segment (from source to p1)
  segments.push({
    start: source,
    end: p1,
    direction: sourceIsHorizontal ? "horizontal" : "vertical",
    draggable: false
  });

  if (sourceIsHorizontal && targetIsHorizontal) {
    // Both horizontal - need vertical middle segment
    // Allow midpoint to extend beyond p1/p2 range for proper routing around nodes
    // midpointRatio of 0.5 = halfway, <0.5 = closer to source, >0.5 = closer to target
    // We use a wider range to allow extending past the nodes when needed
    const range = Math.abs(p2.x - p1.x);
    const extensionAllowance = Math.max(range, 100); // Allow extending at least 100px or the full range
    const centerX = (p1.x + p2.x) / 2;
    // Map ratio 0-1 to full extension range (ratio 0.5 = center)
    const midX = centerX + (midpointRatio - 0.5) * 2 * extensionAllowance;
    const corner1: Position = { x: midX, y: p1.y };
    const corner2: Position = { x: midX, y: p2.y };

    // Build path with rounded corners
    path += ` ${roundedCorner(p1, corner1, corner2, cornerRadius)}`;
    path += ` ${roundedCorner(corner1, corner2, p2, cornerRadius)}`;
    pathPoints.push(corner1, corner2);

    // Segment from p1 to corner1 (horizontal)
    segments.push({ start: p1, end: corner1, direction: "horizontal", draggable: false });
    // Middle segment (vertical) - THIS IS DRAGGABLE
    segments.push({ start: corner1, end: corner2, direction: "vertical", draggable: true });
    // Segment from corner2 to p2 (horizontal)
    segments.push({ start: corner2, end: p2, direction: "horizontal", draggable: false });

  } else if (!sourceIsHorizontal && !targetIsHorizontal) {
    // Both vertical - need horizontal middle segment
    // Allow midpoint to extend beyond p1/p2 range for proper routing around nodes
    const range = Math.abs(p2.y - p1.y);
    const extensionAllowance = Math.max(range, 100); // Allow extending at least 100px or the full range
    const centerY = (p1.y + p2.y) / 2;
    // Map ratio 0-1 to full extension range (ratio 0.5 = center)
    const midY = centerY + (midpointRatio - 0.5) * 2 * extensionAllowance;
    const corner1: Position = { x: p1.x, y: midY };
    const corner2: Position = { x: p2.x, y: midY };

    // Build path with rounded corners
    path += ` ${roundedCorner(p1, corner1, corner2, cornerRadius)}`;
    path += ` ${roundedCorner(corner1, corner2, p2, cornerRadius)}`;
    pathPoints.push(corner1, corner2);

    // Segment from p1 to corner1 (vertical)
    segments.push({ start: p1, end: corner1, direction: "vertical", draggable: false });
    // Middle segment (horizontal) - THIS IS DRAGGABLE
    segments.push({ start: corner1, end: corner2, direction: "horizontal", draggable: true });
    // Segment from corner2 to p2 (vertical)
    segments.push({ start: corner2, end: p2, direction: "vertical", draggable: false });

  } else if (sourceIsHorizontal) {
    // Source horizontal, target vertical - single corner
    const corner: Position = { x: p2.x, y: p1.y };
    path += ` ${roundedCorner(p1, corner, p2, cornerRadius)}`;
    pathPoints.push(corner);

    segments.push({ start: p1, end: corner, direction: "horizontal", draggable: false });
    segments.push({ start: corner, end: p2, direction: "vertical", draggable: false });
  } else {
    // Source vertical, target horizontal - single corner
    const corner: Position = { x: p1.x, y: p2.y };
    path += ` ${roundedCorner(p1, corner, p2, cornerRadius)}`;
    pathPoints.push(corner);

    segments.push({ start: p1, end: corner, direction: "vertical", draggable: false });
    segments.push({ start: corner, end: p2, direction: "horizontal", draggable: false });
  }

  path += ` L ${p2.x} ${p2.y} L ${target.x} ${target.y}`;
  pathPoints.push(p2, target);

  // Last segment (p2 to target)
  segments.push({
    start: p2,
    end: target,
    direction: targetIsHorizontal ? "horizontal" : "vertical",
    draggable: false
  });

  return { path, pathPoints, segments };
}
