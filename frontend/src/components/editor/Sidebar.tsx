"use client";

import { Diagram, DiagramNode, NodeTemplate } from "@/lib/schema/types";
import { Button, ToggleButton } from "@/components/ui/Button";
import { defaultNodeTemplates } from "@/themes/academic";

interface SidebarProps {
  diagram: Diagram;
  selectedNodeId: string | null;
  showGrid: boolean;
  snapToGrid: boolean;
  editable: boolean;
  hasUnsavedChanges?: boolean;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onToggleEditable: () => void;
  onAddNode: (templateId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<DiagramNode>) => void;
  onExport: (format: "png" | "svg" | "pdf") => void;
  onSave: () => void;
  onOpenProjects: () => void;
}

export function Sidebar({
  diagram,
  selectedNodeId,
  showGrid,
  snapToGrid,
  editable,
  hasUnsavedChanges = false,
  onToggleGrid,
  onToggleSnap,
  onToggleEditable,
  onAddNode,
  onDeleteNode,
  onUpdateNode,
  onExport,
  onSave,
  onOpenProjects,
}: SidebarProps) {
  // Get all available templates
  const templates: Record<string, NodeTemplate> = {
    ...defaultNodeTemplates,
    ...diagram.nodeTemplates,
  };

  // Get selected node
  const selectedNode = selectedNodeId
    ? diagram.nodes.find((n) => n.id === selectedNodeId)
    : null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
              RCDS
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Romans Cool Diagram Software
            </p>
          </div>
          <button
            onClick={onOpenProjects}
            className="
              p-2 rounded-lg
              text-gray-400 hover:text-gray-600
              hover:bg-gray-100
              transition-all
            "
            title="Projects"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="px-3 py-2 border-b border-gray-100">
        <Button
          variant={hasUnsavedChanges ? "primary" : "secondary"}
          size="sm"
          onClick={onSave}
          className="w-full"
        >
          {hasUnsavedChanges ? "Save Changes" : "Saved"}
        </Button>
      </div>

      {/* View Controls */}
      <div className="p-3 border-b border-gray-100">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          View
        </div>
        <div className="flex gap-2">
          <ToggleButton
            active={showGrid}
            onClick={onToggleGrid}
            size="sm"
            className="flex-1"
          >
            Grid
          </ToggleButton>
          <ToggleButton
            active={snapToGrid}
            onClick={onToggleSnap}
            size="sm"
            className="flex-1"
          >
            Snap
          </ToggleButton>
          <ToggleButton
            active={editable}
            onClick={onToggleEditable}
            size="sm"
            className="flex-1"
          >
            Edit
          </ToggleButton>
        </div>
      </div>

      {/* Node Palette */}
      <div className="p-3 border-b border-gray-100 flex-1 overflow-y-auto">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Add Node
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(templates).map(([id, template]) => (
            <button
              key={id}
              onClick={() => onAddNode(id)}
              disabled={!editable}
              className="
                p-2 rounded-lg text-left
                border border-gray-200
                hover:border-gray-300 hover:bg-gray-50
                active:bg-gray-100 active:scale-[0.98]
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <div
                className="w-full h-6 rounded mb-1.5"
                style={{
                  backgroundColor: getTemplateColor(template),
                  border: `1px solid ${template.style.stroke}`,
                }}
              />
              <div className="text-xs font-medium text-gray-700 truncate">
                {template.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="p-3 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Properties
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Title</label>
              <input
                type="text"
                value={selectedNode.content.title}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    content: { ...selectedNode.content, title: e.target.value },
                  })
                }
                disabled={!editable}
                className="
                  w-full px-2.5 py-1.5 text-sm
                  border border-gray-200 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300
                  disabled:bg-gray-50 disabled:text-gray-500
                  transition-all duration-150
                "
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Subtitle</label>
              <input
                type="text"
                value={selectedNode.content.subtitle || ""}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    content: { ...selectedNode.content, subtitle: e.target.value },
                  })
                }
                disabled={!editable}
                className="
                  w-full px-2.5 py-1.5 text-sm
                  border border-gray-200 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300
                  disabled:bg-gray-50 disabled:text-gray-500
                  transition-all duration-150
                "
              />
            </div>
            <div className="pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteNode(selectedNode.id)}
                disabled={!editable}
                className="w-full"
              >
                Delete Node
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="p-3 border-t border-gray-100 mt-auto">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Export
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport("png")}
            className="flex-1"
          >
            PNG
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport("svg")}
            className="flex-1"
          >
            SVG
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport("pdf")}
            className="flex-1"
          >
            PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{diagram.nodes.length} nodes</span>
          <span>{diagram.edges.length} edges</span>
          <span>{diagram.canvas.width}×{diagram.canvas.height}</span>
        </div>
      </div>
    </div>
  );
}

// Helper to get template preview color
function getTemplateColor(template: NodeTemplate): string {
  const colorMap: Record<string, string> = {
    primary: "#D8E5F3",
    secondary: "#E6E0EC",
    accent: "#FFE0B2",
    neutral: "#F5F5F5",
  };
  return colorMap[template.style.fill] || template.style.fill;
}
