"use client";

import { DiagramEdge, DiagramNode, NodeTemplate, Theme } from "@/lib/schema/types";
import { resolveColor } from "@/themes/academic";
import {
  getPortPosition,
  determineBestPorts,
  calculateOrthogonalPath,
  calculateStraightPath,
  calculateCurvedPath,
  getLabelPosition,
} from "@/lib/rendering/edges";

interface EdgeRendererProps {
  edge: DiagramEdge;
  sourceNode: DiagramNode;
  sourceTemplate: NodeTemplate;
  targetNode: DiagramNode;
  targetTemplate: NodeTemplate;
  theme: Theme;
  selected?: boolean;
  onSelect?: (edgeId: string) => void;
}

export function EdgeRenderer({
  edge,
  sourceNode,
  sourceTemplate,
  targetNode,
  targetTemplate,
  theme,
  selected = false,
  onSelect,
}: EdgeRendererProps) {
  // Resolve colors
  const strokeColor = resolveColor(edge.style.stroke, theme);

  // Determine ports
  const { sourcePort, targetPort } =
    edge.source.port && edge.target.port
      ? { sourcePort: edge.source.port, targetPort: edge.target.port }
      : determineBestPorts(sourceNode, sourceTemplate, targetNode, targetTemplate);

  // Get connection points
  const sourcePoint = getPortPosition(sourceNode, sourceTemplate, sourcePort);
  const targetPoint = getPortPosition(targetNode, targetTemplate, targetPort);

  // Calculate path based on routing type
  let pathD: string;
  switch (edge.routing) {
    case "straight":
      pathD = calculateStraightPath(sourcePoint, targetPoint);
      break;
    case "curved":
      pathD = calculateCurvedPath(sourcePoint, sourcePort, targetPoint, targetPort);
      break;
    case "orthogonal":
    default:
      pathD = calculateOrthogonalPath(sourcePoint, sourcePort, targetPoint, targetPort);
      break;
  }

  // Arrow marker ID
  const markerId = `arrow-${edge.id}`;

  // Label position
  const labelPos = edge.label ? getLabelPosition(pathD, edge.label.position) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(edge.id);
  };

  return (
    <g onClick={handleClick}>
      {/* Arrow marker definition */}
      {edge.arrow.end && (
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            {edge.arrow.type === "filled" ? (
              <path d="M0,0 L0,6 L9,3 z" fill={strokeColor} />
            ) : (
              <path
                d="M0,0 L9,3 L0,6"
                fill="none"
                stroke={strokeColor}
                strokeWidth="1"
              />
            )}
          </marker>
        </defs>
      )}

      {/* Invisible hit area for easier selection */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        style={{ cursor: "pointer" }}
      />

      {/* Main edge path */}
      <path
        d={pathD}
        fill="none"
        stroke={selected ? "#2196F3" : strokeColor}
        strokeWidth={selected ? edge.style.strokeWidth + 1 : edge.style.strokeWidth}
        strokeDasharray={edge.style.strokeDasharray}
        markerEnd={edge.arrow.end ? `url(#${markerId})` : undefined}
        markerStart={edge.arrow.start ? `url(#${markerId}-start)` : undefined}
        style={{ cursor: "pointer" }}
      />

      {/* Edge label */}
      {edge.label && labelPos && (
        <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
          {/* Background for label */}
          <rect
            x={-edge.label.text.length * 3.5}
            y={-8}
            width={edge.label.text.length * 7}
            height={16}
            fill={theme.colors.background}
            rx={2}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={theme.typography.sansFont}
            fontSize={10}
            fill={theme.colors.textMuted}
            fontStyle="italic"
          >
            {edge.label.text}
          </text>
        </g>
      )}
    </g>
  );
}
