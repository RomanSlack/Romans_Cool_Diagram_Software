"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DiagramCanvas } from "@/components/canvas/DiagramCanvas";
import { Sidebar } from "@/components/editor/Sidebar";
import { ProjectsPanel } from "@/components/editor/ProjectsPanel";
import { sampleDiagram } from "@/data/sample-diagram";
import { Diagram, DiagramNode } from "@/lib/schema/types";
import { exportToPng, exportToSvg, exportToPdf } from "@/lib/export";
import { v4 as uuid } from "uuid";
import { defaultNodeTemplates } from "@/themes/academic";
import {
  Project,
  createProject,
  updateProjectDiagram,
} from "@/lib/store/db";

// Create a blank diagram
function createBlankDiagram(): Diagram {
  return {
    id: uuid(),
    name: "Untitled Diagram",
    version: "1.0",
    canvas: {
      width: 1200,
      height: 800,
      background: "#FFFFFF",
      gridEnabled: false,
      gridSize: 20,
      snapToGrid: false,
    },
    theme: "academic",
    nodeTemplates: {},
    nodes: [],
    edges: [],
    containers: [],
  };
}

export default function Home() {
  const [diagram, setDiagram] = useState<Diagram>(sampleDiagram);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [editable, setEditable] = useState(true);
  const [showProjectsPanel, setShowProjectsPanel] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Mark changes as unsaved when diagram changes
  useEffect(() => {
    if (currentProjectId) {
      setHasUnsavedChanges(true);
    }
  }, [diagram, currentProjectId]);

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

  // Add new node
  const handleAddNode = useCallback(
    (templateId: string) => {
      const template =
        defaultNodeTemplates[templateId] || diagram.nodeTemplates[templateId];
      if (!template) return;

      const newNode: DiagramNode = {
        id: `node-${uuid().slice(0, 8)}`,
        templateId,
        position: {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
        content: {
          title: template.name,
          subtitle: "",
        },
      };

      setDiagram((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));

      setSelectedNodeId(newNode.id);
    },
    [diagram.nodeTemplates]
  );

  // Delete node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setDiagram((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter(
        (e) => e.source.nodeId !== nodeId && e.target.nodeId !== nodeId
      ),
    }));
    setSelectedNodeId(null);
  }, []);

  // Update node
  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<DiagramNode>) => {
      setDiagram((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        ),
      }));
    },
    []
  );

  // Export handlers
  const handleExport = useCallback(
    async (format: "png" | "svg" | "pdf") => {
      const element = canvasRef.current?.querySelector("svg");
      if (!element) return;

      const filename = `${diagram.name.replace(/\s+/g, "-").toLowerCase()}`;

      try {
        switch (format) {
          case "png":
            await exportToPng(
              element as unknown as HTMLElement,
              `${filename}.png`
            );
            break;
          case "svg":
            await exportToSvg(
              element as unknown as HTMLElement,
              `${filename}.svg`
            );
            break;
          case "pdf":
            await exportToPdf(
              element as unknown as HTMLElement,
              `${filename}.pdf`
            );
            break;
        }
      } catch (error) {
        console.error(`Export to ${format} failed:`, error);
      }
    },
    [diagram.name]
  );

  // Save project
  const handleSave = useCallback(async () => {
    try {
      if (currentProjectId) {
        await updateProjectDiagram(currentProjectId, diagram);
      } else {
        const project = await createProject(diagram);
        setCurrentProjectId(project.id);
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }, [currentProjectId, diagram]);

  // Select project
  const handleSelectProject = useCallback(async (project: Project) => {
    setDiagram(project.diagram);
    setCurrentProjectId(project.id);
    setHasUnsavedChanges(false);
    setShowProjectsPanel(false);
    setSelectedNodeId(null);
  }, []);

  // New project
  const handleNewProject = useCallback(() => {
    const newDiagram = createBlankDiagram();
    setDiagram(newDiagram);
    setCurrentProjectId(null);
    setHasUnsavedChanges(false);
    setShowProjectsPanel(false);
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        diagram={diagram}
        selectedNodeId={selectedNodeId}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        editable={editable}
        hasUnsavedChanges={hasUnsavedChanges}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleSnap={toggleSnapToGrid}
        onToggleEditable={() => setEditable(!editable)}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onUpdateNode={handleUpdateNode}
        onExport={handleExport}
        onSave={handleSave}
        onOpenProjects={() => setShowProjectsPanel(true)}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center">
          <div className="flex-1">
            <input
              type="text"
              value={diagram.name}
              onChange={(e) =>
                setDiagram((prev) => ({ ...prev, name: e.target.value }))
              }
              className="
                text-sm font-medium text-gray-800
                bg-transparent border-none
                focus:outline-none focus:ring-0
                hover:bg-gray-50 focus:bg-gray-50
                px-2 py-1 -ml-2 rounded
                transition-colors
              "
            />
          </div>
          {selectedNodeId && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Selected: {selectedNodeId}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div
            ref={canvasRef}
            className="bg-white rounded-xl overflow-hidden"
            style={{
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
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
      </div>

      {/* Projects Panel */}
      {showProjectsPanel && (
        <ProjectsPanel
          currentProjectId={currentProjectId}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onClose={() => setShowProjectsPanel(false)}
        />
      )}
    </div>
  );
}
