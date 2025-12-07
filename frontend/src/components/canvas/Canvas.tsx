"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useDiagramStore } from "@/lib/store/diagramStore";
import { NodeRenderer } from "./NodeRenderer";
import { TextRenderer } from "./TextRenderer";
import { ContainerRenderer } from "./ContainerRenderer";
import { EdgeRenderer } from "./EdgeRenderer";
import { SelectionBox } from "./SelectionBox";
import { ConnectionHandles } from "./ConnectionHandles";
import { DiagramElement, NodeElement, TextElement, ContainerElement, EdgeElement } from "@/lib/schema/types";

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    diagram,
    selectedIds,
    viewport,
    activeTool,
    select,
    selectAdd,
    clearSelection,
    setViewport,
    updateElement,
    deleteElements,
    copy,
    paste,
    undo,
    redo,
    pushHistory,
    addEdge,
    setActiveTool,
  } = useDiagramStore();

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementStart, setDragElementStart] = useState<{ [key: string]: { x: number; y: number } }>({});

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ elementId: string; anchor: string } | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Convert screen coords to canvas coords
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (screenX - rect.left - viewport.x) / viewport.zoom,
        y: (screenY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Handle wheel for zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.1), 5);

        // Zoom toward mouse position
        const scale = newZoom / viewport.zoom;
        setViewport({
          zoom: newZoom,
          x: mouseX - (mouseX - viewport.x) * scale,
          y: mouseY - (mouseY - viewport.y) * scale,
        });
      } else {
        // Pan
        setViewport({
          x: viewport.x - e.deltaX,
          y: viewport.y - e.deltaY,
        });
      }
    },
    [viewport, setViewport]
  );

  // Set up wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focused on input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isMod = e.metaKey || e.ctrlKey;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteElements(selectedIds);
        }
      } else if (isMod && e.key === "c") {
        e.preventDefault();
        copy();
      } else if (isMod && e.key === "v") {
        e.preventDefault();
        paste();
      } else if (isMod && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (isMod && e.key === "a") {
        e.preventDefault();
        select(diagram.elements.map((el) => el.id));
      } else if (e.key === "Escape") {
        clearSelection();
        setIsConnecting(false);
        setConnectionStart(null);
        setConnectionEnd(null);
      } else if (e.key === "v" || e.key === "V") {
        setActiveTool("select");
      } else if (e.key === "e" || e.key === "E") {
        setActiveTool("connect");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, deleteElements, copy, paste, undo, redo, select, clearSelection, diagram.elements, setActiveTool]);

  // Mouse down on canvas (for panning or selection)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        // Middle mouse or alt+left = pan
        setIsPanning(true);
        setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      } else if (e.target === svgRef.current || e.target === containerRef.current) {
        // Click on empty canvas = clear selection
        clearSelection();
      }
    },
    [viewport, clearSelection]
  );

  // Mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setViewport({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      } else if (isConnecting && connectionStart) {
        // Update connection preview
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setConnectionEnd(canvasPos);
      } else if (isDragging && selectedIds.length > 0) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const dx = canvasPos.x - dragStart.x;
        const dy = canvasPos.y - dragStart.y;

        // Update all selected elements
        selectedIds.forEach((id) => {
          const startPos = dragElementStart[id];
          if (startPos) {
            let newX = startPos.x + dx;
            let newY = startPos.y + dy;

            // Snap to grid
            if (diagram.canvas.snapToGrid) {
              newX = Math.round(newX / diagram.canvas.gridSize) * diagram.canvas.gridSize;
              newY = Math.round(newY / diagram.canvas.gridSize) * diagram.canvas.gridSize;
            }

            updateElement(id, { position: { x: newX, y: newY } });
          }
        });
      }
    },
    [isPanning, isDragging, isConnecting, connectionStart, dragStart, selectedIds, dragElementStart, screenToCanvas, setViewport, updateElement, diagram.canvas]
  );

  // Mouse up
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isConnecting && connectionStart) {
        // Check if we're over an element to connect to
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const targetElement = diagram.elements.find((el) => {
          if (el.type === "edge" || el.id === connectionStart.elementId) return false;
          return (
            canvasPos.x >= el.position.x &&
            canvasPos.x <= el.position.x + el.size.width &&
            canvasPos.y >= el.position.y &&
            canvasPos.y <= el.position.y + el.size.height
          );
        });

        if (targetElement) {
          // Determine target anchor based on where we dropped
          const relX = (canvasPos.x - targetElement.position.x) / targetElement.size.width;
          const relY = (canvasPos.y - targetElement.position.y) / targetElement.size.height;
          let targetAnchor = "auto";

          if (relX < 0.3) targetAnchor = "left";
          else if (relX > 0.7) targetAnchor = "right";
          else if (relY < 0.3) targetAnchor = "top";
          else if (relY > 0.7) targetAnchor = "bottom";

          addEdge(connectionStart.elementId, targetElement.id, connectionStart.anchor, targetAnchor);
        }

        setIsConnecting(false);
        setConnectionStart(null);
        setConnectionEnd(null);
      }

      if (isDragging) {
        pushHistory();
      }
      setIsDragging(false);
      setIsPanning(false);
    },
    [isConnecting, connectionStart, isDragging, pushHistory, screenToCanvas, diagram.elements, addEdge]
  );

  // Start connection from handle
  const handleConnectionStart = useCallback((elementId: string, anchor: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);
    setConnectionStart({ elementId, anchor });
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setConnectionEnd(canvasPos);
  }, [screenToCanvas]);

  // Element click handler
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, element: DiagramElement) => {
      e.stopPropagation();

      // If in connect mode, start connection
      if (activeTool === "connect" && element.type !== "edge") {
        handleConnectionStart(element.id, "auto", e);
        return;
      }

      if (e.shiftKey) {
        selectAdd(element.id);
      } else if (!selectedIds.includes(element.id)) {
        select([element.id]);
      }

      // Start drag
      setIsDragging(true);
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setDragStart(canvasPos);

      // Store starting positions of all selected elements
      const elementsToMove = selectedIds.includes(element.id)
        ? selectedIds
        : [element.id];
      const starts: { [key: string]: { x: number; y: number } } = {};
      elementsToMove.forEach((id) => {
        const el = diagram.elements.find((e) => e.id === id);
        if (el) {
          starts[id] = { x: el.position.x, y: el.position.y };
        }
      });
      setDragElementStart(starts);

      if (!selectedIds.includes(element.id)) {
        select([element.id]);
      }
    },
    [selectedIds, select, selectAdd, screenToCanvas, diagram.elements, activeTool, handleConnectionStart]
  );

  // Get connection point for preview line
  const getElementConnectionPoint = (elementId: string, anchor: string) => {
    const el = diagram.elements.find((e) => e.id === elementId);
    if (!el) return { x: 0, y: 0 };

    const cx = el.position.x + el.size.width / 2;
    const cy = el.position.y + el.size.height / 2;

    switch (anchor) {
      case "top":
        return { x: cx, y: el.position.y };
      case "bottom":
        return { x: cx, y: el.position.y + el.size.height };
      case "left":
        return { x: el.position.x, y: cy };
      case "right":
        return { x: el.position.x + el.size.width, y: cy };
      default:
        return { x: cx, y: cy };
    }
  };

  // Render elements by type
  const renderElement = (element: DiagramElement) => {
    const isSelected = selectedIds.includes(element.id);
    const isHovered = hoveredElement === element.id;

    switch (element.type) {
      case "node":
        return (
          <g
            key={element.id}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <NodeRenderer
              element={element as NodeElement}
              isSelected={isSelected}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
            />
            {(isHovered || isSelected || activeTool === "connect") && (
              <ConnectionHandles
                element={element}
                onStartConnection={handleConnectionStart}
                zoom={viewport.zoom}
              />
            )}
          </g>
        );
      case "text":
        return (
          <TextRenderer
            key={element.id}
            element={element as TextElement}
            isSelected={isSelected}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          />
        );
      case "container":
        return (
          <g
            key={element.id}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <ContainerRenderer
              element={element as ContainerElement}
              isSelected={isSelected}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
            />
            {(isHovered || isSelected || activeTool === "connect") && (
              <ConnectionHandles
                element={element}
                onStartConnection={handleConnectionStart}
                zoom={viewport.zoom}
              />
            )}
          </g>
        );
      case "edge":
        return (
          <EdgeRenderer
            key={element.id}
            element={element as EdgeElement}
            elements={diagram.elements}
            isSelected={isSelected}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          />
        );
      default:
        return null;
    }
  };

  // Sort elements: containers first, then edges, then nodes/text
  const sortedElements = [...diagram.elements].sort((a, b) => {
    const order = { container: 0, edge: 1, node: 2, text: 3, image: 4 };
    return (order[a.type] || 0) - (order[b.type] || 0);
  });

  return (
    <div
      ref={containerRef}
      id="diagram-canvas"
      className={`flex-1 overflow-hidden bg-gray-50 relative ${
        activeTool === "connect" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          background: diagram.canvas.background,
        }}
      >
        {/* Transform group for zoom/pan */}
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          {/* Grid */}
          {diagram.canvas.showGrid && (
            <g>
              <defs>
                <pattern
                  id="grid"
                  width={diagram.canvas.gridSize}
                  height={diagram.canvas.gridSize}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${diagram.canvas.gridSize} 0 L 0 0 0 ${diagram.canvas.gridSize}`}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={1 / viewport.zoom}
                  />
                </pattern>
              </defs>
              <rect
                x={-5000}
                y={-5000}
                width={10000}
                height={10000}
                fill="url(#grid)"
              />
            </g>
          )}

          {/* Elements */}
          {sortedElements.map(renderElement)}

          {/* Selection boxes */}
          {selectedIds.map((id) => {
            const element = diagram.elements.find((e) => e.id === id);
            if (!element || element.type === "edge") return null;
            return (
              <SelectionBox
                key={`selection-${id}`}
                element={element}
                zoom={viewport.zoom}
              />
            );
          })}

          {/* Connection preview line */}
          {isConnecting && connectionStart && connectionEnd && (
            <g>
              <line
                x1={getElementConnectionPoint(connectionStart.elementId, connectionStart.anchor).x}
                y1={getElementConnectionPoint(connectionStart.elementId, connectionStart.anchor).y}
                x2={connectionEnd.x}
                y2={connectionEnd.y}
                stroke="#2563eb"
                strokeWidth={2 / viewport.zoom}
                strokeDasharray={`${4 / viewport.zoom},${4 / viewport.zoom}`}
              />
              <circle
                cx={connectionEnd.x}
                cy={connectionEnd.y}
                r={4 / viewport.zoom}
                fill="#2563eb"
              />
            </g>
          )}
        </g>
      </svg>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 font-medium shadow-sm">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
