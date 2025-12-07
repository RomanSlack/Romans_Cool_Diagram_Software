"use client";

import { DiagramNode, NodeTemplate, Theme } from "@/lib/schema/types";
import { resolveColor, resolveFont } from "@/themes/academic";

interface NodeRendererProps {
  node: DiagramNode;
  template: NodeTemplate;
  theme: Theme;
  selected?: boolean;
  onSelect?: (nodeId: string) => void;
  onDragStart?: (nodeId: string, e: React.MouseEvent) => void;
}

export function NodeRenderer({
  node,
  template,
  theme,
  selected = false,
  onSelect,
  onDragStart,
}: NodeRendererProps) {
  // Merge template style with node overrides
  const style = {
    ...template.style,
    ...node.styleOverrides,
  };

  // Resolve colors from theme tokens
  const fillColor = resolveColor(style.fill, theme);
  const strokeColor = resolveColor(style.stroke, theme);

  // Get dimensions
  const width = node.size?.width ?? style.width;
  const height = node.size?.height ?? style.height;

  // Calculate text positions
  const centerX = width / 2;
  const centerY = height / 2;

  const titleY =
    template.layout.titlePosition === "center"
      ? centerY - (node.content.subtitle ? 6 : 0)
      : 20;

  const subtitleY =
    template.layout.subtitlePosition === "below-title"
      ? titleY + template.typography.titleSize + 4
      : height - 12;

  // Font families
  const titleFont = resolveFont(template.typography.titleFont, theme);
  const subtitleFont = resolveFont(template.typography.subtitleFont, theme);

  // Shadow filter ID
  const shadowId = `shadow-${node.id}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(node.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart?.(node.id, e);
  };

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{ cursor: "pointer" }}
    >
      {/* Shadow filter definition */}
      {style.shadow && (
        <defs>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="2"
              floodColor="rgba(0,0,0,0.1)"
            />
          </filter>
        </defs>
      )}

      {/* Main rectangle */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={style.borderRadius}
        ry={style.borderRadius}
        fill={fillColor}
        stroke={selected ? "#2196F3" : strokeColor}
        strokeWidth={selected ? 2 : style.strokeWidth}
        filter={style.shadow ? `url(#${shadowId})` : undefined}
      />

      {/* Selection indicator */}
      {selected && (
        <rect
          x={-2}
          y={-2}
          width={width + 4}
          height={height + 4}
          rx={style.borderRadius + 2}
          ry={style.borderRadius + 2}
          fill="none"
          stroke="#2196F3"
          strokeWidth={1}
          strokeDasharray="4,2"
        />
      )}

      {/* Title text */}
      <text
        x={centerX}
        y={titleY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={titleFont}
        fontSize={template.typography.titleSize}
        fontWeight={template.typography.titleWeight}
        fill={theme.colors.text}
      >
        {node.content.title}
      </text>

      {/* Subtitle text */}
      {node.content.subtitle && (
        <text
          x={centerX}
          y={subtitleY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={subtitleFont}
          fontSize={template.typography.subtitleSize}
          fontWeight={template.typography.subtitleWeight}
          fill={theme.colors.textMuted}
        >
          {node.content.subtitle}
        </text>
      )}
    </g>
  );
}

// Cylinder shape for database nodes
export function CylinderNodeRenderer({
  node,
  template,
  theme,
  selected = false,
  onSelect,
  onDragStart,
}: NodeRendererProps) {
  const style = {
    ...template.style,
    ...node.styleOverrides,
  };

  const fillColor = resolveColor(style.fill, theme);
  const strokeColor = resolveColor(style.stroke, theme);

  const width = node.size?.width ?? style.width;
  const height = node.size?.height ?? style.height;

  const ellipseRy = 10; // Height of the ellipse curve

  const centerX = width / 2;
  const centerY = height / 2;

  const titleFont = resolveFont(template.typography.titleFont, theme);
  const subtitleFont = resolveFont(template.typography.subtitleFont, theme);

  const shadowId = `shadow-cyl-${node.id}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(node.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart?.(node.id, e);
  };

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{ cursor: "pointer" }}
    >
      {style.shadow && (
        <defs>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="2"
              floodColor="rgba(0,0,0,0.1)"
            />
          </filter>
        </defs>
      )}

      {/* Cylinder body */}
      <path
        d={`
          M 0 ${ellipseRy}
          L 0 ${height - ellipseRy}
          A ${width / 2} ${ellipseRy} 0 0 0 ${width} ${height - ellipseRy}
          L ${width} ${ellipseRy}
          A ${width / 2} ${ellipseRy} 0 0 0 0 ${ellipseRy}
        `}
        fill={fillColor}
        stroke={selected ? "#2196F3" : strokeColor}
        strokeWidth={selected ? 2 : style.strokeWidth}
        filter={style.shadow ? `url(#${shadowId})` : undefined}
      />

      {/* Top ellipse */}
      <ellipse
        cx={centerX}
        cy={ellipseRy}
        rx={width / 2}
        ry={ellipseRy}
        fill={fillColor}
        stroke={selected ? "#2196F3" : strokeColor}
        strokeWidth={selected ? 2 : style.strokeWidth}
      />

      {/* Title */}
      <text
        x={centerX}
        y={centerY - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={titleFont}
        fontSize={template.typography.titleSize}
        fontWeight={template.typography.titleWeight}
        fill={theme.colors.text}
      >
        {node.content.title}
      </text>

      {/* Subtitle */}
      {node.content.subtitle && (
        <text
          x={centerX}
          y={centerY + template.typography.titleSize + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={subtitleFont}
          fontSize={template.typography.subtitleSize}
          fontWeight={template.typography.subtitleWeight}
          fill={theme.colors.textMuted}
        >
          {node.content.subtitle}
        </text>
      )}
    </g>
  );
}
