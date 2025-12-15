import { create } from "zustand";
import {
  Diagram,
  DiagramElement,
  Position,
  Size,
  ConnectionPoint,
  createNode,
  createText,
  createContainer,
  createEdge,
  createImage,
} from "@/lib/schema/types";

export type ActiveTool = "select" | "connect";

interface DiagramState {
  // Current diagram
  diagram: Diagram;

  // Selection
  selectedIds: string[];

  // Clipboard
  clipboard: DiagramElement[];

  // Viewport
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };

  // History for undo/redo
  history: Diagram[];
  historyIndex: number;

  // Active tool
  activeTool: ActiveTool;

  // Actions
  setDiagram: (diagram: Diagram) => void;
  updateCanvas: (updates: Partial<Diagram["canvas"]>) => void;

  // Selection
  select: (ids: string[]) => void;
  selectAdd: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Element CRUD
  addElement: (element: DiagramElement) => void;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;

  // Transform
  moveElements: (ids: string[], delta: Position) => void;
  resizeElement: (id: string, size: Size, position?: Position) => void;

  // Clipboard
  copy: () => void;
  paste: (position?: Position) => void;

  // Viewport
  setViewport: (viewport: Partial<DiagramState["viewport"]>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Quick add
  addNode: (position?: Position) => void;
  addText: (position?: Position) => void;
  addContainer: (position?: Position) => void;
  addEdge: (sourceId: string, targetId: string, sourceAnchor?: string, targetAnchor?: string) => void;
  addImage: (src: string, naturalWidth: number, naturalHeight: number, position?: Position) => void;

  // Tool
  setActiveTool: (tool: ActiveTool) => void;

  // Alignment & Distribution
  alignElements: (direction: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  distributeElements: (direction: "horizontal" | "vertical") => void;
  distributeAsGrid: () => void;

  // Edge waypoint manipulation
  setEdgeWaypoints: (edgeId: string, waypoints: Position[]) => void;
}

const INITIAL_DIAGRAM: Diagram = {
  id: "new-diagram",
  name: "Untitled",
  version: "1.0",
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

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagram: INITIAL_DIAGRAM,
  selectedIds: [],
  clipboard: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [],
  historyIndex: -1,
  activeTool: "select",

  setDiagram: (diagram) => {
    set({ diagram, selectedIds: [], history: [], historyIndex: -1 });
  },

  updateCanvas: (updates) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        canvas: { ...state.diagram.canvas, ...updates },
      },
    }));
  },

  // Selection
  select: (ids) => set({ selectedIds: ids }),

  selectAdd: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),

  selectAll: () =>
    set((state) => ({
      selectedIds: state.diagram.elements.map((e) => e.id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  // Element CRUD
  addElement: (element) => {
    get().pushHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        elements: [...state.diagram.elements, element],
      },
      selectedIds: [element.id],
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        elements: state.diagram.elements.map((el) =>
          el.id === id ? ({ ...el, ...updates } as DiagramElement) : el
        ),
      },
    }));
  },

  deleteElements: (ids) => {
    get().pushHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        elements: state.diagram.elements.filter((el) => !ids.includes(el.id)),
      },
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    }));
  },

  duplicateElements: (ids) => {
    get().pushHistory();
    const state = get();
    const elements = state.diagram.elements.filter((el) => ids.includes(el.id));
    const newElements = elements.map((el) => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      position: { x: el.position.x + 20, y: el.position.y + 20 },
    }));

    set((s) => ({
      diagram: {
        ...s.diagram,
        elements: [...s.diagram.elements, ...newElements],
      },
      selectedIds: newElements.map((el) => el.id),
    }));
  },

  // Transform
  moveElements: (ids, delta) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        elements: state.diagram.elements.map((el) =>
          ids.includes(el.id)
            ? {
                ...el,
                position: {
                  x: el.position.x + delta.x,
                  y: el.position.y + delta.y,
                },
              }
            : el
        ),
      },
    }));
  },

  resizeElement: (id, size, position) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        elements: state.diagram.elements.map((el) =>
          el.id === id
            ? {
                ...el,
                size,
                ...(position && { position }),
              }
            : el
        ),
      },
    }));
  },

  // Clipboard
  copy: () => {
    const state = get();
    const elements = state.diagram.elements.filter((el) =>
      state.selectedIds.includes(el.id)
    );
    set({ clipboard: elements });
  },

  paste: (position) => {
    const state = get();
    if (state.clipboard.length === 0) return;

    get().pushHistory();

    // Calculate offset from original position
    const minX = Math.min(...state.clipboard.map((el) => el.position.x));
    const minY = Math.min(...state.clipboard.map((el) => el.position.y));
    const offsetX = position ? position.x - minX : 20;
    const offsetY = position ? position.y - minY : 20;

    const newElements = state.clipboard.map((el) => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      position: {
        x: el.position.x + offsetX,
        y: el.position.y + offsetY,
      },
    }));

    set((s) => ({
      diagram: {
        ...s.diagram,
        elements: [...s.diagram.elements, ...newElements],
      },
      selectedIds: newElements.map((el) => el.id),
    }));
  },

  // Viewport
  setViewport: (updates) =>
    set((state) => ({
      viewport: { ...state.viewport, ...updates },
    })),

  zoomIn: () =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.min(state.viewport.zoom * 1.2, 5),
      },
    })),

  zoomOut: () =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.max(state.viewport.zoom / 1.2, 0.1),
      },
    })),

  zoomToFit: () => {
    // Calculate bounds and set zoom to fit
    const state = get();
    if (state.diagram.elements.length === 0) {
      set({ viewport: { x: 0, y: 0, zoom: 1 } });
      return;
    }

    const bounds = state.diagram.elements.reduce(
      (acc, el) => ({
        minX: Math.min(acc.minX, el.position.x),
        minY: Math.min(acc.minY, el.position.y),
        maxX: Math.max(acc.maxX, el.position.x + el.size.width),
        maxY: Math.max(acc.maxY, el.position.y + el.size.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const padding = 100;
    const contentWidth = bounds.maxX - bounds.minX + padding * 2;
    const contentHeight = bounds.maxY - bounds.minY + padding * 2;

    // Assume viewport is 1000x600 for now
    const zoom = Math.min(1000 / contentWidth, 600 / contentHeight, 1);

    set({
      viewport: {
        x: -bounds.minX + padding,
        y: -bounds.minY + padding,
        zoom: Math.max(zoom, 0.1),
      },
    });
  },

  resetZoom: () => set({ viewport: { x: 0, y: 0, zoom: 1 } }),

  // History
  pushHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state.diagram)));
      return {
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex < 0) return state;
      const newIndex = state.historyIndex - 1;
      if (newIndex < 0) return state;
      return {
        diagram: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        diagram: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      };
    });
  },

  // Quick add
  addNode: (position) => {
    const viewport = get().viewport;
    const pos = position || {
      x: (-viewport.x + 500) / viewport.zoom,
      y: (-viewport.y + 300) / viewport.zoom,
    };
    get().addElement(createNode({ position: pos }));
  },

  addText: (position) => {
    const viewport = get().viewport;
    const pos = position || {
      x: (-viewport.x + 500) / viewport.zoom,
      y: (-viewport.y + 300) / viewport.zoom,
    };
    get().addElement(createText({ position: pos }));
  },

  addContainer: (position) => {
    const viewport = get().viewport;
    const pos = position || {
      x: (-viewport.x + 400) / viewport.zoom,
      y: (-viewport.y + 250) / viewport.zoom,
    };
    get().addElement(createContainer({ position: pos }));
  },

  addEdge: (sourceId, targetId, sourceAnchor = "auto", targetAnchor = "auto") => {
    get().pushHistory();
    const anchor1 = sourceAnchor as ConnectionPoint["anchor"];
    const anchor2 = targetAnchor as ConnectionPoint["anchor"];
    const edge = createEdge(sourceId, targetId, {
      source: { elementId: sourceId, anchor: anchor1 },
      target: { elementId: targetId, anchor: anchor2 },
    });
    set((state) => ({
      diagram: {
        ...state.diagram,
        elements: [...state.diagram.elements, edge],
      },
      selectedIds: [edge.id],
    }));
  },

  addImage: (src, naturalWidth, naturalHeight, position) => {
    const viewport = get().viewport;
    const pos = position || {
      x: (-viewport.x + 400) / viewport.zoom,
      y: (-viewport.y + 250) / viewport.zoom,
    };
    get().addElement(createImage(src, naturalWidth, naturalHeight, { position: pos }));
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  // Alignment
  alignElements: (direction) => {
    const state = get();
    const selectedElements = state.diagram.elements.filter(
      (el) => state.selectedIds.includes(el.id) && el.type !== "edge"
    );
    if (selectedElements.length < 2) return;

    get().pushHistory();

    // Calculate bounds
    const bounds = selectedElements.reduce(
      (acc, el) => ({
        minX: Math.min(acc.minX, el.position.x),
        minY: Math.min(acc.minY, el.position.y),
        maxX: Math.max(acc.maxX, el.position.x + el.size.width),
        maxY: Math.max(acc.maxY, el.position.y + el.size.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    set((s) => ({
      diagram: {
        ...s.diagram,
        elements: s.diagram.elements.map((el) => {
          if (!state.selectedIds.includes(el.id) || el.type === "edge") return el;

          let newX = el.position.x;
          let newY = el.position.y;

          switch (direction) {
            case "left":
              newX = bounds.minX;
              break;
            case "center":
              newX = centerX - el.size.width / 2;
              break;
            case "right":
              newX = bounds.maxX - el.size.width;
              break;
            case "top":
              newY = bounds.minY;
              break;
            case "middle":
              newY = centerY - el.size.height / 2;
              break;
            case "bottom":
              newY = bounds.maxY - el.size.height;
              break;
          }

          return { ...el, position: { x: newX, y: newY } };
        }),
      },
    }));
  },

  // Distribution
  distributeElements: (direction) => {
    const state = get();
    const selectedElements = state.diagram.elements.filter(
      (el) => state.selectedIds.includes(el.id) && el.type !== "edge"
    );
    if (selectedElements.length < 3) return;

    get().pushHistory();

    // Sort elements by position
    const sorted = [...selectedElements].sort((a, b) =>
      direction === "horizontal"
        ? a.position.x - b.position.x
        : a.position.y - b.position.y
    );

    // Calculate total space and gaps
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (direction === "horizontal") {
      const totalWidth = sorted.reduce((sum, el) => sum + el.size.width, 0);
      const totalSpace = last.position.x + last.size.width - first.position.x;
      const gap = (totalSpace - totalWidth) / (sorted.length - 1);

      let currentX = first.position.x;
      const newPositions: { [id: string]: number } = {};

      sorted.forEach((el) => {
        newPositions[el.id] = currentX;
        currentX += el.size.width + gap;
      });

      set((s) => ({
        diagram: {
          ...s.diagram,
          elements: s.diagram.elements.map((el) =>
            newPositions[el.id] !== undefined
              ? { ...el, position: { ...el.position, x: newPositions[el.id] } }
              : el
          ),
        },
      }));
    } else {
      const totalHeight = sorted.reduce((sum, el) => sum + el.size.height, 0);
      const totalSpace = last.position.y + last.size.height - first.position.y;
      const gap = (totalSpace - totalHeight) / (sorted.length - 1);

      let currentY = first.position.y;
      const newPositions: { [id: string]: number } = {};

      sorted.forEach((el) => {
        newPositions[el.id] = currentY;
        currentY += el.size.height + gap;
      });

      set((s) => ({
        diagram: {
          ...s.diagram,
          elements: s.diagram.elements.map((el) =>
            newPositions[el.id] !== undefined
              ? { ...el, position: { ...el.position, y: newPositions[el.id] } }
              : el
          ),
        },
      }));
    }
  },

  // Grid distribution - arrange selected elements in a grid
  distributeAsGrid: () => {
    const state = get();
    const selectedElements = state.diagram.elements.filter(
      (el) => state.selectedIds.includes(el.id) && el.type !== "edge"
    );
    if (selectedElements.length < 2) return;

    get().pushHistory();

    const count = selectedElements.length;
    // Calculate optimal grid dimensions (prefer wider grids)
    const cols = Math.ceil(Math.sqrt(count));

    // Calculate average size and spacing
    const avgWidth = selectedElements.reduce((sum, el) => sum + el.size.width, 0) / count;
    const avgHeight = selectedElements.reduce((sum, el) => sum + el.size.height, 0) / count;
    const gapX = avgWidth * 0.5;
    const gapY = avgHeight * 0.5;

    // Get top-left corner of selection
    const minX = Math.min(...selectedElements.map((el) => el.position.x));
    const minY = Math.min(...selectedElements.map((el) => el.position.y));

    // Sort elements by their current position (left-to-right, top-to-bottom)
    const sorted = [...selectedElements].sort((a, b) => {
      const rowA = Math.floor((a.position.y - minY) / (avgHeight + gapY));
      const rowB = Math.floor((b.position.y - minY) / (avgHeight + gapY));
      if (rowA !== rowB) return rowA - rowB;
      return a.position.x - b.position.x;
    });

    // Assign grid positions
    const newPositions: { [id: string]: { x: number; y: number } } = {};
    sorted.forEach((el, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      newPositions[el.id] = {
        x: minX + col * (avgWidth + gapX) + (avgWidth - el.size.width) / 2,
        y: minY + row * (avgHeight + gapY) + (avgHeight - el.size.height) / 2,
      };
    });

    set((s) => ({
      diagram: {
        ...s.diagram,
        elements: s.diagram.elements.map((el) =>
          newPositions[el.id]
            ? { ...el, position: newPositions[el.id] }
            : el
        ),
      },
    }));
  },

  // Edge waypoint manipulation
  setEdgeWaypoints: (edgeId, waypoints) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        elements: state.diagram.elements.map((el) => {
          if (el.id !== edgeId || el.type !== "edge") return el;
          const edge = el as import("@/lib/schema/types").EdgeElement;
          return { ...edge, waypoints };
        }),
      },
    }));
  },
}));
