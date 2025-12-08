"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, Trash2, Clock, FileText } from "lucide-react";
import { useProjectsStore } from "@/lib/store/projectsStore";
import { useDiagramStore } from "@/lib/store/diagramStore";

interface ProjectSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSpotlight({ isOpen, onClose }: ProjectSpotlightProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { getProjectList, loadProject, deleteProject, saveProject } = useProjectsStore();
  const { diagram, setDiagram } = useDiagramStore();

  const projects = getProjectList();
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleNewProject = useCallback(() => {
    // Save current project first
    if (diagram.elements.length > 0) {
      saveProject(diagram);
    }

    const newDiagram = {
      id: crypto.randomUUID(),
      name: "Untitled Diagram",
      version: "1.0" as const,
      canvas: {
        width: 1920,
        height: 1080,
        background: "#ffffff",
        gridSize: 20,
        snapToGrid: false,
        showGrid: false,
      },
      elements: [],
    };
    setDiagram(newDiagram);
    saveProject(newDiagram);
    onClose();
  }, [diagram, saveProject, setDiagram, onClose]);

  const handleSelectProject = useCallback((id: string) => {
    // Save current project first
    if (diagram.elements.length > 0) {
      saveProject(diagram);
    }

    const loadedDiagram = loadProject(id);
    if (loadedDiagram) {
      setDiagram(loadedDiagram);
    }
    onClose();
  }, [diagram, saveProject, loadProject, setDiagram, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredProjects.length) // +1 for "New Project" option
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex === 0) {
            handleNewProject();
          } else if (filteredProjects[selectedIndex - 1]) {
            handleSelectProject(filteredProjects[selectedIndex - 1].id);
          }
          break;
      }
    },
    [isOpen, filteredProjects, selectedIndex, onClose, handleNewProject, handleSelectProject]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll("[data-project-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this project? This cannot be undone.")) {
      deleteProject(id);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Spotlight container */}
      <div className="relative w-full max-w-xl mx-4 animate-scale-in">
        <div
          className="
            bg-white rounded-2xl shadow-2xl shadow-black/20
            border border-gray-200/50
            overflow-hidden
          "
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search projects or create new..."
              className="flex-1 text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
            {/* New Project option */}
            <button
              data-project-item
              onClick={handleNewProject}
              onMouseEnter={() => setSelectedIndex(0)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                transition-colors duration-75
                ${selectedIndex === 0 ? "bg-blue-50" : "hover:bg-gray-50"}
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${selectedIndex === 0 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}
                `}
              >
                <Plus size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${selectedIndex === 0 ? "text-blue-600" : "text-gray-900"}`}>
                  New Project
                </p>
                <p className="text-xs text-gray-500">Create a blank diagram</p>
              </div>
              <kbd className="hidden sm:flex px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
                enter
              </kbd>
            </button>

            {/* Divider */}
            {filteredProjects.length > 0 && (
              <div className="mx-4 my-2 border-t border-gray-100" />
            )}

            {/* Project list */}
            {filteredProjects.length > 0 && (
              <div className="px-2">
                <p className="px-2 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Recent Projects
                </p>
                {filteredProjects.map((project, index) => {
                  const itemIndex = index + 1;
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <button
                      key={project.id}
                      data-project-item
                      onClick={() => handleSelectProject(project.id)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`
                        w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left
                        transition-colors duration-75 group
                        ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                      `}
                    >
                      <div
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          ${isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}
                        `}
                      >
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? "text-blue-600" : "text-gray-900"}`}>
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(project.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {filteredProjects.length === 0 && searchQuery && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No projects found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Press Enter to create &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-500 mr-1">↑↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-500 mr-1">Enter</kbd>
              Select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
