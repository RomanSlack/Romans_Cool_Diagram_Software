"use client";

import { useState, useEffect } from "react";
import { Project, getAllProjects, deleteProject } from "@/lib/store/db";
import { Button } from "@/components/ui/Button";

interface ProjectsPanelProps {
  currentProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onClose: () => void;
}

export function ProjectsPanel({
  currentProjectId,
  onSelectProject,
  onNewProject,
  onClose,
}: ProjectsPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const allProjects = await getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Delete this project?")) {
      await deleteProject(id);
      loadProjects();
    }
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Projects</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Project Button */}
        <div className="p-3 border-b border-gray-100">
          <Button
            variant="primary"
            size="md"
            onClick={onNewProject}
            className="w-full"
          >
            + New Project
          </Button>
        </div>

        {/* Project List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No projects yet. Create your first one!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`
                    w-full px-4 py-3 text-left
                    hover:bg-gray-50
                    transition-colors
                    flex items-center justify-between group
                    ${currentProjectId === project.id ? "bg-blue-50" : ""}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {currentProjectId === project.id && (
                      <span className="text-xs text-blue-600 font-medium">
                        Current
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="
                        opacity-0 group-hover:opacity-100
                        text-gray-400 hover:text-red-500
                        transition-all p-1 rounded
                        hover:bg-red-50
                      "
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Projects are saved locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
