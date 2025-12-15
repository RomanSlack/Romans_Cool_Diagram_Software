"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { Inspector } from "@/components/editor/Inspector";
import { LeftSidebar } from "@/components/editor/LeftSidebar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { BuyMeCoffee, GithubLink } from "@/components/ui/BuyMeCoffee";
import { useDiagramStore } from "@/lib/store/diagramStore";
import { useProjectsStore } from "@/lib/store/projectsStore";

export default function Home() {
  const { setDiagram, diagram } = useDiagramStore();
  const { currentProjectId, loadProject, saveProject, _hasHydrated } = useProjectsStore();
  const initialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  // Save current project callback
  const saveCurrentProject = useCallback(() => {
    if (diagram.elements.length > 0 || diagram.id !== "new-diagram") {
      saveProject(diagram);
    }
  }, [diagram, saveProject]);

  // Auto-save on tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Synchronously save to localStorage via zustand persist
      saveCurrentProject();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveCurrentProject]);

  // Load last project or initialize with default intro project
  // Wait for hydration to complete before checking currentProjectId
  useEffect(() => {
    if (!_hasHydrated || initialized.current) return;
    initialized.current = true;

    // Try to load the last project
    if (currentProjectId) {
      const lastDiagram = loadProject(currentProjectId);
      if (lastDiagram) {
        setDiagram(lastDiagram);
        return;
      }
    }

    // No last project - load the default intro project
    if (diagram.elements.length === 0) {
      fetch("/default-project.json")
        .then((res) => res.json())
        .then((data) => {
          // Give it a new ID so it doesn't conflict with saved projects
          setDiagram({ ...data, id: "intro-project" });
        })
        .catch((err) => {
          console.error("Failed to load default project:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  // Hide loading screen after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}

      <div className={`h-screen flex bg-gray-100 overflow-hidden transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}>
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
          <FloatingToolbar />
        </div>

        {/* Inspector */}
        <Inspector />
      </div>

      {/* Support links */}
      {!isLoading && (
        <>
          <GithubLink />
          <BuyMeCoffee />
        </>
      )}
    </>
  );
}
