import { Diagram } from "@/lib/schema/types";

// Sample diagram matching the VOS Multi-Agent Architecture reference image
export const sampleDiagram: Diagram = {
  id: "vos-architecture",
  name: "VOS Multi-Agent Architecture",
  version: "1.0",

  canvas: {
    width: 1200,
    height: 750,
    background: "#FFFFFF",
    gridEnabled: false,
    gridSize: 20,
    snapToGrid: false,
  },

  theme: "academic",

  nodeTemplates: {
    // Custom templates specific to this diagram
    "primary-orchestrator": {
      id: "primary-orchestrator",
      name: "Primary Orchestrator",
      style: {
        fill: "primary",
        stroke: "#1976D2",
        strokeWidth: 2.5,
        borderRadius: 6,
        shadow: true,
        width: 140,
        height: 60,
      },
      layout: {
        titlePosition: "center",
        subtitlePosition: "below-title",
      },
      typography: {
        titleFont: "sans-serif",
        titleSize: 12,
        titleWeight: "bold",
        subtitleFont: "sans-serif",
        subtitleSize: 10,
        subtitleWeight: "normal",
      },
    },
  },

  nodes: [
    // User
    {
      id: "user",
      templateId: "user",
      position: { x: 40, y: 180 },
      content: {
        title: "User",
        subtitle: "Flutter App",
      },
    },

    // API Gateway
    {
      id: "api-gateway",
      templateId: "service",
      position: { x: 160, y: 185 },
      content: {
        title: "API Gateway",
        subtitle: "FastAPI",
      },
    },

    // Primary Agent Orchestrator
    {
      id: "primary-agent",
      templateId: "primary-orchestrator",
      position: { x: 380, y: 100 },
      content: {
        title: "Primary Agent",
        subtitle: "Orchestrator",
      },
    },

    // Gemini API
    {
      id: "gemini-api",
      templateId: "external",
      position: { x: 620, y: 100 },
      content: {
        title: "Gemini API",
        subtitle: "gemini-3-pro",
      },
    },

    // RabbitMQ
    {
      id: "rabbitmq",
      templateId: "broker",
      position: { x: 180, y: 300 },
      content: {
        title: "RabbitMQ",
        subtitle: "Message Broker",
      },
    },

    // Specialized Agents
    {
      id: "agent-weather",
      templateId: "agent",
      position: { x: 150, y: 430 },
      content: {
        title: "Weather",
      },
    },
    {
      id: "agent-notes",
      templateId: "agent",
      position: { x: 230, y: 430 },
      content: {
        title: "Notes",
      },
    },
    {
      id: "agent-calendar",
      templateId: "agent",
      position: { x: 150, y: 480 },
      content: {
        title: "Calendar",
      },
    },
    {
      id: "agent-search",
      templateId: "agent",
      position: { x: 230, y: 480 },
      content: {
        title: "Search",
      },
    },

    // Memory Retriever
    {
      id: "memory-retriever",
      templateId: "memory",
      position: { x: 400, y: 280 },
      content: {
        title: "Memory Retriever",
        subtitle: "Before LLM call",
      },
    },

    // Memory Creator
    {
      id: "memory-creator",
      templateId: "memory",
      position: { x: 400, y: 360 },
      content: {
        title: "Memory Creator",
        subtitle: "After LLM call",
      },
    },

    // PostgreSQL
    {
      id: "postgresql",
      templateId: "database",
      position: { x: 620, y: 200 },
      content: {
        title: "PostgreSQL",
        subtitle: "State & History",
      },
    },

    // Weaviate
    {
      id: "weaviate",
      templateId: "database",
      position: { x: 620, y: 340 },
      content: {
        title: "Weaviate",
        subtitle: "Vector Store (768-dim)",
      },
    },

    // Embedding Service
    {
      id: "embedding-service",
      templateId: "external",
      position: { x: 620, y: 440 },
      content: {
        title: "Embedding Service",
        subtitle: "text-embedding-004",
      },
    },
  ],

  edges: [
    // User -> API Gateway
    {
      id: "e1",
      source: { nodeId: "user", port: "right" },
      target: { nodeId: "api-gateway", port: "left" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },

    // API Gateway -> Primary Agent
    {
      id: "e2",
      source: { nodeId: "api-gateway", port: "right" },
      target: { nodeId: "primary-agent", port: "left" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },

    // Primary Agent -> Gemini API
    {
      id: "e3",
      source: { nodeId: "primary-agent", port: "right" },
      target: { nodeId: "gemini-api", port: "left" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },

    // API Gateway -> RabbitMQ
    {
      id: "e4",
      source: { nodeId: "api-gateway", port: "bottom" },
      target: { nodeId: "rabbitmq", port: "top" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },

    // RabbitMQ -> Agents (results feedback)
    {
      id: "e5",
      source: { nodeId: "rabbitmq", port: "left" },
      target: { nodeId: "agent-weather", port: "left" },
      style: { stroke: "#666666", strokeWidth: 1, strokeDasharray: "5,3" },
      routing: "orthogonal",
      label: { text: "results", position: 0.3 },
      arrow: { start: true, end: false, type: "filled" },
    },

    // Primary Agent -> Memory Retriever
    {
      id: "e6",
      source: { nodeId: "primary-agent", port: "bottom" },
      target: { nodeId: "memory-retriever", port: "top" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },

    // Memory Retriever -> Memory Creator
    {
      id: "e7",
      source: { nodeId: "memory-retriever", port: "bottom" },
      target: { nodeId: "memory-creator", port: "top" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },

    // Primary Agent -> PostgreSQL (flash-lite)
    {
      id: "e8",
      source: { nodeId: "primary-agent", port: "right" },
      target: { nodeId: "postgresql", port: "top" },
      style: { stroke: "#666666", strokeWidth: 1, strokeDasharray: "5,3" },
      routing: "orthogonal",
      label: { text: "flash-lite", position: 0.5 },
      arrow: { start: false, end: true, type: "filled" },
    },

    // Memory Retriever -> Weaviate (semantic search)
    {
      id: "e9",
      source: { nodeId: "memory-retriever", port: "right" },
      target: { nodeId: "weaviate", port: "left" },
      style: { stroke: "#666666", strokeWidth: 1, strokeDasharray: "5,3" },
      routing: "orthogonal",
      label: { text: "semantic search", position: 0.5 },
      arrow: { start: false, end: true, type: "filled" },
    },

    // Memory Creator -> Weaviate
    {
      id: "e10",
      source: { nodeId: "memory-creator", port: "right" },
      target: { nodeId: "weaviate", port: "left" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },

    // Weaviate -> Embedding Service
    {
      id: "e11",
      source: { nodeId: "weaviate", port: "bottom" },
      target: { nodeId: "embedding-service", port: "top" },
      style: { stroke: "#333333", strokeWidth: 1.5 },
      routing: "orthogonal",
      arrow: { start: false, end: true, type: "filled" },
    },
  ],

  containers: [
    // Specialized Agents container
    {
      id: "specialized-agents",
      name: "Specialized Agents",
      bounds: { x: 135, y: 410, width: 180, height: 130 },
      style: {
        fill: "#F5F5F5",
        fillOpacity: 0.3,
        stroke: "#999999",
        strokeWidth: 1,
        strokeDasharray: "5,3",
        borderRadius: 6,
      },
      label: {
        text: "Specialized Agents",
        position: "bottom-center",
        font: "sans-serif",
        size: 11,
        weight: "bold",
      },
    },

    // Proactive Memory System container
    {
      id: "memory-system",
      name: "Proactive Memory System",
      bounds: { x: 380, y: 260, width: 170, height: 170 },
      style: {
        fill: "#E6E0EC",
        fillOpacity: 0.3,
        stroke: "#333333",
        strokeWidth: 1,
        strokeDasharray: "5,3",
        borderRadius: 6,
      },
      label: {
        text: "Proactive Memory System",
        position: "bottom-center",
        font: "sans-serif",
        size: 11,
        weight: "bold",
      },
    },
  ],

  legend: {
    position: { x: 40, y: 620 },
    orientation: "horizontal",
    items: [
      { type: "node", symbol: { fill: "#F5F5F5", stroke: "#333333" }, label: "User" },
      { type: "node", symbol: { fill: "#D8E5F3", stroke: "#333333" }, label: "API Gateway" },
      { type: "node", symbol: { fill: "#FFE0B2", stroke: "#333333" }, label: "Data-store" },
      { type: "node", symbol: { fill: "#E6E0EC", stroke: "#333333" }, label: "Memory Store" },
      { type: "edge", symbol: { stroke: "#666666", strokeDasharray: "5,3" }, label: "semantic search" },
      { type: "edge", symbol: { stroke: "#666666", strokeDasharray: "5,3" }, label: "flash-lite" },
    ],
  },

  title: {
    text: "VOS: Multi-Agent Architecture with Proactive Memory System - System Architecture Diagram",
    subtitle: "Based on the VOS System Architecture HTML source",
    position: "top-center",
    font: "serif",
    size: 16,
    subtitleSize: 12,
  },
};
