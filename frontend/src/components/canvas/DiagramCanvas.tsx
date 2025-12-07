"use client";

import { useRef, useState, useCallback } from "react";
import { Diagram, Theme, NodeTemplate } from "@/lib/schema/types";
import { NodeRenderer, CylinderNodeRenderer } from "./NodeRenderer";
import { EdgeRenderer } from "./EdgeRenderer";
import { ContainerRenderer } from "./ContainerRenderer";
import { LegendRenderer } from "./LegendRenderer";
import { TitleRenderer } from "./TitleRenderer";
import { academicTheme, defaultNodeTemplates } from "@/themes/academic";

interface DiagramCanvasProps {
  diagram: Diagram;
  editable?: boolean;
  showGrid?: boolean;
  onNodeSelect?: (nodeId: string | null) => void;
  onEdgeSelect?: (edgeId: string | null) => void;
  onContainerSelect?: (containerId: string | null) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  selectedContainerId?: string | null;
}

export function DiagramCanvas({
  diagram,
  editable = false,
  showGrid = false,
  onNodeSelect,
  onEdgeSelect,
  onContainerSelect,
  onNodeMove,
  selectedNodeId,
  selectedEdgeId,
  selectedContainerId,
}: DiagramCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
  } | null>(null);

  // Resolve theme
  const theme: Theme =
    typeof diagram.theme === "string" ? academicTheme : diagram.theme;

  // Merge default templates with diagram templates
  const templates: Record<string, NodeTemplate> = {
    ...defaultNodeTemplates,
    ...diagram.nodeTemplates,
  };

  // Grid pattern
  const gridSize = diagram.canvas.gridSize || 20;

  // Handle background click to deselect
  const handleBackgroundClick = useCallback(() => {
    onNodeSelect?.(null);
    onEdgeSelect?.(null);
    onContainerSelect?.(null);
  }, [onNodeSelect, onEdgeSelect, onContainerSelect]);

  // Drag handling
  const handleDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      if (!editable) return;

      const node = diagram.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setDragState({
        nodeId,
        startX: e.clientX,
        startY: e.clientY,
        nodeStartX: node.position.x,
        nodeStartY: node.position.y,
      });

      onNodeSelect?.(nodeId);
    },
    [editable, diagram.nodes, onNodeSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState || !editable) return;

      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;

      let newX = dragState.nodeStartX + dx;
      let newY = dragState.nodeStartY + dy;

      // Snap to grid if enabled
      if (diagram.canvas.snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      onNodeMove?.(dragState.nodeId, { x: newX, y: newY });
    },
    [dragState, editable, diagram.canvas.snapToGrid, gridSize, onNodeMove]
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  return (
    <svg
      ref={svgRef}
      width={diagram.canvas.width}
      height={diagram.canvas.height}
      viewBox={`0 0 ${diagram.canvas.width} ${diagram.canvas.height}`}
      style={{
        background: diagram.canvas.background || theme.colors.background,
        cursor: dragState ? "grabbing" : "default",
      }}
      onClick={handleBackgroundClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid pattern */}
      {(showGrid || diagram.canvas.gridEnabled) && (
        <>
          <defs>
            <pattern
              id="grid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
            pointerEvents="none"
          />
        </>
      )}

      {/* Title */}
      {diagram.title && (
        <TitleRenderer
          title={diagram.title}
          canvasWidth={diagram.canvas.width}
          theme={theme}
        />
      )}

      {/* Containers (render first, behind nodes) */}
      {diagram.containers.map((container) => (
        <ContainerRenderer
          key={container.id}
          container={container}
          theme={theme}
          selected={selectedContainerId === container.id}
          onSelect={onContainerSelect}
        />
      ))}

      {/* Edges (render before nodes so they appear behind) */}
      {diagram.edges.map((edge) => {
        const sourceNode = diagram.nodes.find((n) => n.id === edge.source.nodeId);
        const targetNode = diagram.nodes.find((n) => n.id === edge.target.nodeId);

        if (!sourceNode || !targetNode) return null;

        const sourceTemplate = templates[sourceNode.templateId];
        const targetTemplate = templates[targetNode.templateId];

        if (!sourceTemplate || !targetTemplate) return null;

        return (
          <EdgeRenderer
            key={edge.id}
            edge={edge}
            sourceNode={sourceNode}
            sourceTemplate={sourceTemplate}
            targetNode={targetNode}
            targetTemplate={targetTemplate}
            theme={theme}
            selected={selectedEdgeId === edge.id}
            onSelect={onEdgeSelect}
          />
        );
      })}

      {/* Nodes */}
      {diagram.nodes.map((node) => {
        const template = templates[node.templateId];
        if (!template) return null;

        // Use cylinder renderer for database nodes
        const isCylinder = node.templateId === "database";
        const Renderer = isCylinder ? CylinderNodeRenderer : NodeRenderer;

        return (
          <Renderer
            key={node.id}
            node={node}
            template={template}
            theme={theme}
            selected={selectedNodeId === node.id}
            onSelect={onNodeSelect}
            onDragStart={editable ? handleDragStart : undefined}
          />
        );
      })}

      {/* Legend */}
      {diagram.legend && <LegendRenderer legend={diagram.legend} theme={theme} />}
    </svg>
  );
}
