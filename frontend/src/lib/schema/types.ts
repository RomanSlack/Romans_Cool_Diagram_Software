// Core Diagram Schema Types
// Everything is customizable - Figma-style control

// ============ BASE ELEMENT ============
// All elements share these properties

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  rotation?: number;
  locked?: boolean;
  visible?: boolean;
}

export type ElementType = "node" | "edge" | "text" | "container" | "image";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// ============ DIAGRAM ============

export interface Diagram {
  id: string;
  name: string;
  version: "1.0";
  canvas: CanvasSettings;
  elements: DiagramElement[];
  // Selection state (not persisted, but useful)
  selectedIds?: string[];
}

export type DiagramElement = NodeElement | EdgeElement | TextElement | ContainerElement;

export interface CanvasSettings {
  width: number;
  height: number;
  background: string;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
}

// ============ NODE ELEMENT ============
// A box/shape with fully customizable properties

export interface NodeElement extends BaseElement {
  type: "node";

  // Shape
  shape: NodeShape;

  // Style - all directly editable
  style: NodeStyle;

  // Outer band - optional colored frame around the node
  outerBand?: OuterBandStyle;

  // Content
  content: {
    title: string;
    subtitle?: string;
  };

  // Text styling
  titleStyle: TextStyle;
  subtitleStyle?: TextStyle;

  // Text vertical offset from center (-30 to 30 pixels)
  textVerticalOffset?: number;
}

export type NodeShape = "rectangle" | "rounded" | "pill" | "diamond" | "cylinder" | "circle";

export interface NodeStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  borderRadius: number;
  shadow: ShadowStyle | null;
}

export interface ShadowStyle {
  x: number;
  y: number;
  blur: number;
  color: string;
}

export interface OuterBandStyle {
  enabled: boolean;
  fill: string;
  width: number; // Thickness of the band
  borderRadius: number;
  padding: number; // Space between band and inner node
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "medium" | "semibold" | "bold";
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight?: number;
}

// ============ EDGE ELEMENT ============

export interface EdgeElement extends BaseElement {
  type: "edge";

  // Connection points
  source: ConnectionPoint;
  target: ConnectionPoint;

  // Routing
  routing: "orthogonal" | "straight" | "curved";
  waypoints?: Position[]; // Manual control points
  roundedCorners?: boolean; // Rounded corners for orthogonal routing (default: true)

  // Style
  style: EdgeStyle;

  // Label
  label?: EdgeLabel;

  // Arrows
  startArrow: ArrowStyle | null;
  endArrow: ArrowStyle | null;
}

export interface ConnectionPoint {
  elementId: string;
  anchor: "top" | "bottom" | "left" | "right" | "center" | "auto" | "dynamic";
  offset?: number; // Offset from center of anchor (percentage -0.5 to 0.5)
  // For dynamic anchors - position as percentage (0-1) along perimeter
  // Perimeter goes: top (0-0.25), right (0.25-0.5), bottom (0.5-0.75), left (0.75-1)
  dynamicPosition?: number;
}

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
}

export interface EdgeLabel {
  text: string;
  position: number; // 0-1 along the edge
  style: TextStyle;
  background?: string;
  padding?: number;
}

export interface ArrowStyle {
  type: "filled" | "barbed" | "open" | "diamond" | "diamond-open" | "circle" | "circle-open";
  size: number;
}

// ============ TEXT ELEMENT ============
// Freeform text that can be placed anywhere

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  style: TextStyle;
  background?: string;
  padding?: number;
  borderRadius?: number;
}

// ============ CONTAINER ELEMENT ============
// Groups/frames that can contain other elements

export interface ContainerElement extends BaseElement {
  type: "container";

  // Style
  style: ContainerStyle;

  // Label
  label?: ContainerLabel;

  // Contained elements (by ID)
  childIds?: string[];
}

export interface ContainerStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  borderRadius: number;
}

export interface ContainerLabel {
  text: string;
  position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  style: TextStyle;
}

// ============ FONT OPTIONS ============

export const FONT_OPTIONS = [
  { value: "Inter, system-ui, sans-serif", label: "Inter (Sans)" },
  { value: "Georgia, serif", label: "Georgia (Serif)" },
  { value: "ui-monospace, monospace", label: "Monospace" },
  { value: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "system-ui, sans-serif", label: "System UI" },
];

// ============ DEFAULTS ============

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 12,
  fontWeight: "normal",
  color: "#1a1a1a",
  textAlign: "center",
  lineHeight: 1.4,
};

export const DEFAULT_NODE_STYLE: NodeStyle = {
  fill: "#ffffff",
  fillOpacity: 1,
  stroke: "#333333",
  strokeWidth: 1,
  borderRadius: 6,
  shadow: {
    x: 2,
    y: 2,
    blur: 4,
    color: "rgba(0,0,0,0.1)",
  },
};

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  stroke: "#333333",
  strokeWidth: 1.5,
  opacity: 1,
};

export const DEFAULT_CONTAINER_STYLE: ContainerStyle = {
  fill: "#f5f5f5",
  fillOpacity: 0.3,
  stroke: "#999999",
  strokeWidth: 1,
  strokeDasharray: "5,3",
  borderRadius: 6,
};

// ============ PRESETS ============
// Quick-start styles users can apply

export interface StylePreset {
  id: string;
  name: string;
  category: "node" | "edge" | "text" | "container";
  style: Partial<NodeStyle | EdgeStyle | TextStyle | ContainerStyle>;
}

export const NODE_PRESETS: StylePreset[] = [
  {
    id: "default",
    name: "Default",
    category: "node",
    style: { fill: "#ffffff", stroke: "#333333" },
  },
  {
    id: "primary",
    name: "Primary (Blue)",
    category: "node",
    style: { fill: "#D8E5F3", stroke: "#333333" },
  },
  {
    id: "secondary",
    name: "Secondary (Purple)",
    category: "node",
    style: { fill: "#E6E0EC", stroke: "#333333" },
  },
  {
    id: "accent",
    name: "Accent (Orange)",
    category: "node",
    style: { fill: "#FFE0B2", stroke: "#333333" },
  },
  {
    id: "neutral",
    name: "Neutral (Gray)",
    category: "node",
    style: { fill: "#F5F5F5", stroke: "#333333" },
  },
  {
    id: "outline",
    name: "Outline Only",
    category: "node",
    style: { fill: "#ffffff", fillOpacity: 0, stroke: "#333333", strokeWidth: 2 },
  },
];

// ============ UTILITY FUNCTIONS ============

export function createNode(partial: Partial<NodeElement> = {}): NodeElement {
  return {
    id: `node-${Date.now()}`,
    type: "node",
    position: { x: 100, y: 100 },
    size: { width: 120, height: 60 },
    shape: "rounded",
    style: { ...DEFAULT_NODE_STYLE },
    content: { title: "Node", subtitle: "" },
    titleStyle: { ...DEFAULT_TEXT_STYLE, fontWeight: "semibold" },
    subtitleStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 10, color: "#1a1a1a" },
    textVerticalOffset: 0,
    ...partial,
  };
}

export function createText(partial: Partial<TextElement> = {}): TextElement {
  return {
    id: `text-${Date.now()}`,
    type: "text",
    position: { x: 100, y: 100 },
    size: { width: 200, height: 30 },
    content: "Text",
    style: { ...DEFAULT_TEXT_STYLE },
    ...partial,
  };
}

export function createContainer(partial: Partial<ContainerElement> = {}): ContainerElement {
  return {
    id: `container-${Date.now()}`,
    type: "container",
    position: { x: 100, y: 100 },
    size: { width: 200, height: 150 },
    style: { ...DEFAULT_CONTAINER_STYLE },
    label: {
      text: "Container",
      position: "bottom-center",
      style: { ...DEFAULT_TEXT_STYLE, fontWeight: "semibold" },
    },
    ...partial,
  };
}

export function createEdge(
  sourceId: string,
  targetId: string,
  partial: Partial<EdgeElement> = {}
): EdgeElement {
  return {
    id: `edge-${Date.now()}`,
    type: "edge",
    position: { x: 0, y: 0 }, // Computed from source/target
    size: { width: 0, height: 0 }, // Computed
    source: { elementId: sourceId, anchor: "auto" },
    target: { elementId: targetId, anchor: "auto" },
    routing: "orthogonal",
    style: { ...DEFAULT_EDGE_STYLE },
    startArrow: null,
    endArrow: { type: "barbed", size: 8 },
    ...partial,
  };
}
