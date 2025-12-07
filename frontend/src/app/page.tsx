"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { Inspector } from "@/components/editor/Inspector";
import { LeftSidebar } from "@/components/editor/LeftSidebar";
import { useDiagramStore } from "@/lib/store/diagramStore";
import { createNode, createContainer, createEdge, createText } from "@/lib/schema/types";

export default function Home() {
  const { setDiagram, diagram } = useDiagramStore();
  const initialized = useRef(false);

  // Initialize with a sample diagram on first load
  useEffect(() => {
    if (!initialized.current && diagram.elements.length === 0) {
      initialized.current = true;
      // Create a sample diagram
      const userNode = createNode({
        id: "user",
        position: { x: 50, y: 200 },
        size: { width: 80, height: 60 },
        content: { title: "User", subtitle: "Flutter App" },
        style: {
          fill: "#F5F5F5",
          fillOpacity: 1,
          stroke: "#333333",
          strokeWidth: 1,
          borderRadius: 6,
          shadow: { x: 2, y: 2, blur: 4, color: "rgba(0,0,0,0.1)" },
        },
      });

      const apiGateway = createNode({
        id: "api-gateway",
        position: { x: 180, y: 195 },
        size: { width: 120, height: 50 },
        content: { title: "API Gateway", subtitle: "FastAPI" },
        style: {
          fill: "#D8E5F3",
          fillOpacity: 1,
          stroke: "#333333",
          strokeWidth: 1.5,
          borderRadius: 6,
          shadow: { x: 2, y: 2, blur: 4, color: "rgba(0,0,0,0.1)" },
        },
      });

      const primaryAgent = createNode({
        id: "primary-agent",
        position: { x: 380, y: 100 },
        size: { width: 140, height: 60 },
        content: { title: "Primary Agent", subtitle: "Orchestrator" },
        style: {
          fill: "#D8E5F3",
          fillOpacity: 1,
          stroke: "#1976D2",
          strokeWidth: 2.5,
          borderRadius: 6,
          shadow: { x: 2, y: 2, blur: 4, color: "rgba(0,0,0,0.1)" },
        },
      });

      const geminiApi = createNode({
        id: "gemini-api",
        position: { x: 600, y: 100 },
        size: { width: 100, height: 50 },
        content: { title: "Gemini API", subtitle: "gemini-3-pro" },
        style: {
          fill: "#F5F5F5",
          fillOpacity: 1,
          stroke: "#333333",
          strokeWidth: 1,
          borderRadius: 6,
          shadow: { x: 2, y: 2, blur: 4, color: "rgba(0,0,0,0.1)" },
        },
      });

      const memoryRetriever = createNode({
        id: "memory-retriever",
        position: { x: 400, y: 260 },
        size: { width: 130, height: 55 },
        content: { title: "Memory Retriever", subtitle: "Before LLM call" },
        style: {
          fill: "#E6E0EC",
          fillOpacity: 1,
          stroke: "#333333",
          strokeWidth: 1,
          borderRadius: 6,
          shadow: { x: 2, y: 2, blur: 4, color: "rgba(0,0,0,0.1)" },
        },
      });

      const memoryCreator = createNode({
        id: "memory-creator",
        position: { x: 400, y: 340 },
        size: { width: 130, height: 55 },
        content: { title: "Memory Creator", subtitle: "After LLM call" },
        style: {
          fill: "#E6E0EC",
          fillOpacity: 1,
          stroke: "#333333",
          strokeWidth: 1,
          borderRadius: 6,
          shadow: { x: 2, y: 2, blur: 4, color: "rgba(0,0,0,0.1)" },
        },
      });

      const memoryContainer = createContainer({
        id: "memory-container",
        position: { x: 380, y: 240 },
        size: { width: 170, height: 180 },
        label: {
          text: "Proactive Memory System",
          position: "bottom-center",
          style: {
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
            fontWeight: "semibold",
            color: "#333333",
            textAlign: "center",
          },
        },
      });

      const titleText = createText({
        id: "title",
        position: { x: 200, y: 30 },
        size: { width: 500, height: 40 },
        content: "VOS: Multi-Agent Architecture",
        style: {
          fontFamily: "Georgia, serif",
          fontSize: 18,
          fontWeight: "bold",
          color: "#1a1a1a",
          textAlign: "center",
        },
      });

      const edge1 = createEdge("user", "api-gateway", {
        id: "edge-1",
        routing: "orthogonal",
      });

      const edge2 = createEdge("api-gateway", "primary-agent", {
        id: "edge-2",
        routing: "orthogonal",
      });

      const edge3 = createEdge("primary-agent", "gemini-api", {
        id: "edge-3",
        routing: "orthogonal",
      });

      const edge4 = createEdge("primary-agent", "memory-retriever", {
        id: "edge-4",
        routing: "orthogonal",
      });

      const edge5 = createEdge("memory-retriever", "memory-creator", {
        id: "edge-5",
        routing: "orthogonal",
      });

      setDiagram({
        id: "sample",
        name: "VOS Multi-Agent Architecture",
        version: "1.0",
        canvas: {
          width: 1920,
          height: 1080,
          background: "#ffffff",
          gridSize: 20,
          snapToGrid: false,
          showGrid: false,
        },
        elements: [
          memoryContainer,
          titleText,
          userNode,
          apiGateway,
          primaryAgent,
          geminiApi,
          memoryRetriever,
          memoryCreator,
          edge1,
          edge2,
          edge3,
          edge4,
          edge5,
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
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
  );
}
