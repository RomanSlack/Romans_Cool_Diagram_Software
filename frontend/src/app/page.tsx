"use client";

import { useState, useCallback } from "react";
import { DiagramCanvas } from "@/components/canvas/DiagramCanvas";
import { sampleDiagram } from "@/data/sample-diagram";
import { Diagram } from "@/lib/schema/types";

export default function Home() {
  const [diagram, setDiagram] = useState<Diagram>(sampleDiagram);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [editable, setEditable] = useState(true);

  // Handle node movement
  const handleNodeMove = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      setDiagram((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) =>
          node.id === nodeId ? { ...node, position } : node
        ),
      }));
    },
    []
  );

  // Toggle snap to grid
  const toggleSnapToGrid = useCallback(() => {
    setSnapToGrid((prev) => !prev);
    setDiagram((prev) => ({
      ...prev,
      canvas: { ...prev.canvas, snapToGrid: !prev.canvas.snapToGrid },
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">
          Diagram Editor
        </h1>

        <div className="h-6 w-px bg-gray-300" />

        {/* Grid toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            showGrid
              ? "bg-blue-100 text-blue-700 shadow-inner"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={{
            boxShadow: showGrid
              ? "inset 1px 1px 2px rgba(0,0,0,0.1)"
              : "1px 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          Grid
        </button>

        {/* Snap toggle */}
        <button
          onClick={toggleSnapToGrid}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            snapToGrid
              ? "bg-blue-100 text-blue-700 shadow-inner"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={{
            boxShadow: snapToGrid
              ? "inset 1px 1px 2px rgba(0,0,0,0.1)"
              : "1px 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          Snap
        </button>

        {/* Edit toggle */}
        <button
          onClick={() => setEditable(!editable)}
          className={`px-3 py-1.5 text-sm rounded transition-all ${
            editable
              ? "bg-green-100 text-green-700 shadow-inner"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={{
            boxShadow: editable
              ? "inset 1px 1px 2px rgba(0,0,0,0.1)"
              : "1px 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {editable ? "Editing" : "View Only"}
        </button>

        <div className="flex-1" />

        {/* Selection info */}
        {selectedNodeId && (
          <div className="text-sm text-gray-500">
            Selected: <span className="font-medium text-gray-700">{selectedNodeId}</span>
          </div>
        )}

        {/* Export button placeholder */}
        <button
          className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          style={{ boxShadow: "1px 1px 3px rgba(0,0,0,0.2)" }}
          onClick={() => alert("Export functionality coming in Phase 2!")}
        >
          Export
        </button>
      </div>

      {/* Canvas area */}
      <div className="p-6 flex justify-center">
        <div
          className="bg-white rounded-lg overflow-hidden"
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <DiagramCanvas
            diagram={diagram}
            editable={editable}
            showGrid={showGrid}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onNodeSelect={setSelectedNodeId}
            onEdgeSelect={setSelectedEdgeId}
            onNodeMove={handleNodeMove}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center gap-4 text-xs text-gray-500">
        <span>
          Canvas: {diagram.canvas.width} × {diagram.canvas.height}
        </span>
        <span className="text-gray-300">|</span>
        <span>{diagram.nodes.length} nodes</span>
        <span className="text-gray-300">|</span>
        <span>{diagram.edges.length} edges</span>
        <span className="text-gray-300">|</span>
        <span>{diagram.containers.length} containers</span>
        <div className="flex-1" />
        <span className="text-gray-400">
          {diagram.name}
        </span>
      </div>
    </div>
  );
}
