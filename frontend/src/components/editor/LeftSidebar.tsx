"use client";

import { useState } from "react";
import Image from "next/image";
import { useDiagramStore } from "@/lib/store/diagramStore";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  FolderOpen,
  FilePlus,
  Save,
  Upload,
  Image as ImageIcon,
  FileText,
  FileCode,
  Settings,
  ChevronDown,
  ChevronRight,
  Layers,
  Box,
  Type,
  Square,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

export function LeftSidebar() {
  const { diagram, setDiagram } = useDiagramStore();
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [elementsOpen, setElementsOpen] = useState(true);

  const elements = diagram.elements;
  const nodes = elements.filter((e) => e.type === "node");
  const edges = elements.filter((e) => e.type === "edge");
  const texts = elements.filter((e) => e.type === "text");
  const containers = elements.filter((e) => e.type === "container");

  const handleExportPNG = async () => {
    const { toPng } = await import("html-to-image");
    const canvas = document.querySelector("#diagram-canvas") as HTMLElement;
    if (canvas) {
      const dataUrl = await toPng(canvas, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${diagram.name || "diagram"}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleExportSVG = async () => {
    const { toSvg } = await import("html-to-image");
    const canvas = document.querySelector("#diagram-canvas") as HTMLElement;
    if (canvas) {
      const dataUrl = await toSvg(canvas);
      const link = document.createElement("a");
      link.download = `${diagram.name || "diagram"}.svg`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(diagram, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${diagram.name || "diagram"}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const imported = JSON.parse(text);
          setDiagram(imported);
        } catch {
          alert("Invalid JSON file");
        }
      }
    };
    input.click();
  };

  const handleNewProject = () => {
    if (confirm("Create a new project? Unsaved changes will be lost.")) {
      setDiagram({
        id: crypto.randomUUID(),
        name: "Untitled Diagram",
        version: "1.0",
        canvas: {
          width: 1200,
          height: 800,
          background: "#ffffff",
          gridSize: 20,
          snapToGrid: false,
          showGrid: false,
        },
        elements: [],
      });
    }
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full animate-fade-in">
      {/* Project Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2.5 mb-3">
          <Image
            src="/logo.png"
            alt="RCDS Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900">RCDS</h1>
            <Tooltip content={diagram.name} position="bottom">
              <p className="text-xs text-gray-500 truncate max-w-[140px]">
                {diagram.name}
              </p>
            </Tooltip>
          </div>
        </div>

        {/* Project Menu Toggle */}
        <button
          onClick={() => setProjectMenuOpen(!projectMenuOpen)}
          className={`
            w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium
            rounded-lg transition-all duration-150
            ${projectMenuOpen
              ? "bg-gray-100 text-gray-900"
              : "text-gray-700 bg-gray-50 hover:bg-gray-100"
            }
          `}
        >
          <span className="flex items-center gap-2">
            <FolderOpen size={14} />
            Project
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${projectMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Project Menu Dropdown */}
        <div
          className={`
            overflow-hidden transition-all duration-200 ease-out
            ${projectMenuOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}
          `}
        >
          <div className="space-y-0.5">
            <MenuItem icon={FilePlus} label="New Project" onClick={handleNewProject} />
            <MenuItem icon={Upload} label="Import JSON" onClick={handleImportJSON} />
            <MenuItem icon={Save} label="Save to Browser" onClick={() => {}} disabled />
            <div className="border-t border-gray-100 my-1.5" />
            <p className="px-2.5 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Export
            </p>
            <MenuItem icon={ImageIcon} label="Export PNG" onClick={handleExportPNG} />
            <MenuItem icon={FileCode} label="Export SVG" onClick={handleExportSVG} />
            <MenuItem icon={FileText} label="Export JSON" onClick={handleExportJSON} />
          </div>
        </div>
      </div>

      {/* Elements Panel */}
      <div className="flex-1 overflow-auto">
        <button
          onClick={() => setElementsOpen(!elementsOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers size={14} />
            Elements
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${elementsOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`
            overflow-hidden transition-all duration-200 ease-out
            ${elementsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="px-2 pb-2">
            {containers.length > 0 && (
              <ElementGroup
                icon={Square}
                label="Containers"
                count={containers.length}
                elements={containers}
              />
            )}

            {nodes.length > 0 && (
              <ElementGroup
                icon={Box}
                label="Nodes"
                count={nodes.length}
                elements={nodes}
              />
            )}

            {texts.length > 0 && (
              <ElementGroup
                icon={Type}
                label="Text"
                count={texts.length}
                elements={texts}
              />
            )}

            {edges.length > 0 && (
              <ElementGroup
                icon={ArrowRight}
                label="Connections"
                count={edges.length}
                elements={edges}
              />
            )}

            {elements.length === 0 && (
              <p className="px-2 py-6 text-xs text-gray-400 text-center">
                No elements yet.
                <br />
                <span className="text-gray-300">Use the toolbar to add elements.</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <button className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings size={14} />
          Settings
        </button>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md
        transition-all duration-150
        ${disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]"
        }
      `}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ElementGroup({
  icon: Icon,
  label,
  count,
  elements,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  elements: { id: string; type: string }[];
}) {
  const { selectedIds, select, diagram } = useDiagramStore();
  const [expanded, setExpanded] = useState(false);

  // Get display name for element
  const getElementName = (el: { id: string; type: string }) => {
    const element = diagram.elements.find((e) => e.id === el.id);
    if (!element) return el.id;

    if (element.type === "node" && "content" in element) {
      return element.content.title || el.id;
    }
    if (element.type === "text" && "content" in element) {
      return element.content || el.id;
    }
    if (element.type === "container" && "label" in element && element.label) {
      return element.label.text || el.id;
    }
    return el.id;
  };

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <ChevronRight
            size={12}
            className={`transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
          />
          <Icon size={12} />
          {label}
        </span>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          {count}
        </span>
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-150 ease-out
          ${expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-100 pl-2">
          {elements.map((el) => {
            const name = getElementName(el);
            return (
              <Tooltip key={el.id} content={name} position="right" delay={300}>
                <button
                  onClick={() => select([el.id])}
                  className={`
                    w-full text-left px-2 py-1 text-xs rounded-md
                    transition-all duration-100
                    ${selectedIds.includes(el.id)
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }
                  `}
                >
                  <span className="block truncate max-w-[130px]">{name}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
