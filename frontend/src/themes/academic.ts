import { Theme, NodeTemplate } from "@/lib/schema/types";

// Academic Modern theme - based on design_style_doc.txt
// "Publication-Ready Technical" aesthetic

export const academicTheme: Theme = {
  id: "academic",
  name: "Academic Modern",

  colors: {
    background: "#FFFFFF",
    stroke: "#333333",
    text: "#333333",
    textMuted: "#666666",

    // Functional colors (from design doc)
    primary: "#D8E5F3",    // Pale Blue - orchestrator/core system
    secondary: "#E6E0EC",  // Lavender - memory/AI logic
    accent: "#FFE0B2",     // Soft Peach - message broker/transit
    neutral: "#F5F5F5",    // Neutral Grey - external entities

    edgeDefault: "#333333",
    edgeSecondary: "#666666",
  },

  typography: {
    serifFont: "Georgia, 'Times New Roman', serif",
    sansFont: "Helvetica, Arial, sans-serif",
  },

  shadows: {
    node: "2px 2px 5px rgba(0,0,0,0.1)",
    container: "none",
  },

  borders: {
    radius: 6,
    width: 1,
  },
};

// Default node templates matching the design doc
export const defaultNodeTemplates: Record<string, NodeTemplate> = {
  // User/External entity - grey, rounded
  user: {
    id: "user",
    name: "User",
    style: {
      fill: "neutral",
      stroke: "#333333",
      strokeWidth: 1,
      borderRadius: 6,
      shadow: true,
      width: 80,
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

  // Service/API - blue, rectangular
  service: {
    id: "service",
    name: "Service",
    style: {
      fill: "primary",
      stroke: "#333333",
      strokeWidth: 1.5,
      borderRadius: 6,
      shadow: true,
      width: 120,
      height: 50,
    },
    layout: {
      titlePosition: "center",
      subtitlePosition: "below-title",
    },
    typography: {
      titleFont: "sans-serif",
      titleSize: 11,
      titleWeight: "bold",
      subtitleFont: "sans-serif",
      subtitleSize: 9,
      subtitleWeight: "normal",
    },
  },

  // Primary/Core component - blue with thicker border
  primary: {
    id: "primary",
    name: "Primary Component",
    style: {
      fill: "primary",
      stroke: "#1976D2",
      strokeWidth: 2,
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

  // Memory/AI component - lavender
  memory: {
    id: "memory",
    name: "Memory Component",
    style: {
      fill: "secondary",
      stroke: "#333333",
      strokeWidth: 1,
      borderRadius: 6,
      shadow: true,
      width: 130,
      height: 55,
    },
    layout: {
      titlePosition: "center",
      subtitlePosition: "below-title",
    },
    typography: {
      titleFont: "sans-serif",
      titleSize: 11,
      titleWeight: "bold",
      subtitleFont: "sans-serif",
      subtitleSize: 9,
      subtitleWeight: "normal",
    },
  },

  // Message broker - peach/orange, rounded
  broker: {
    id: "broker",
    name: "Message Broker",
    style: {
      fill: "accent",
      stroke: "#333333",
      strokeWidth: 1,
      borderRadius: 12,
      shadow: true,
      width: 110,
      height: 55,
    },
    layout: {
      titlePosition: "center",
      subtitlePosition: "below-title",
    },
    typography: {
      titleFont: "sans-serif",
      titleSize: 11,
      titleWeight: "bold",
      subtitleFont: "sans-serif",
      subtitleSize: 9,
      subtitleWeight: "normal",
    },
  },

  // Database/Store - cylinder shape (rendered as rectangle with cylinder effect)
  database: {
    id: "database",
    name: "Database",
    style: {
      fill: "secondary",
      stroke: "#333333",
      strokeWidth: 1,
      borderRadius: 4,
      shadow: true,
      width: 100,
      height: 60,
    },
    layout: {
      titlePosition: "center",
      subtitlePosition: "below-title",
    },
    typography: {
      titleFont: "sans-serif",
      titleSize: 11,
      titleWeight: "bold",
      subtitleFont: "sans-serif",
      subtitleSize: 9,
      subtitleWeight: "normal",
    },
  },

  // External API - grey
  external: {
    id: "external",
    name: "External API",
    style: {
      fill: "neutral",
      stroke: "#333333",
      strokeWidth: 1,
      borderRadius: 6,
      shadow: true,
      width: 100,
      height: 50,
    },
    layout: {
      titlePosition: "center",
      subtitlePosition: "below-title",
    },
    typography: {
      titleFont: "sans-serif",
      titleSize: 11,
      titleWeight: "bold",
      subtitleFont: "sans-serif",
      subtitleSize: 9,
      subtitleWeight: "normal",
    },
  },

  // Small agent box (for grid layouts like Specialized Agents)
  agent: {
    id: "agent",
    name: "Agent",
    style: {
      fill: "neutral",
      stroke: "#999999",
      strokeWidth: 1,
      borderRadius: 4,
      shadow: false,
      width: 70,
      height: 40,
    },
    layout: {
      titlePosition: "center",
      subtitlePosition: "below-title",
    },
    typography: {
      titleFont: "sans-serif",
      titleSize: 10,
      titleWeight: "normal",
      subtitleFont: "sans-serif",
      subtitleSize: 8,
      subtitleWeight: "normal",
    },
  },
};

// Helper to resolve color tokens to actual hex values
export function resolveColor(color: string, theme: Theme): string {
  const colorMap: Record<string, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    neutral: theme.colors.neutral,
    stroke: theme.colors.stroke,
    background: theme.colors.background,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
  };

  return colorMap[color] || color;
}

// Helper to get font family from font type
export function resolveFont(fontType: "serif" | "sans-serif", theme: Theme): string {
  return fontType === "serif" ? theme.typography.serifFont : theme.typography.sansFont;
}
