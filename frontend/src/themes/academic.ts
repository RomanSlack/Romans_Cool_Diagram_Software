// Academic Modern theme - based on design_style_doc.txt
// "Publication-Ready Technical" aesthetic

export interface AcademicTheme {
  colors: {
    background: string;
    stroke: string;
    text: string;
    textMuted: string;
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    edgeDefault: string;
    edgeSecondary: string;
  };
  typography: {
    serifFont: string;
    sansFont: string;
  };
  shadows: {
    node: string;
    container: string;
  };
  borders: {
    radius: number;
    width: number;
  };
}

export const academicTheme: AcademicTheme = {
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

// Color presets for the inspector
export const colorPresets = {
  fills: [
    "#FFFFFF",   // White
    "#F5F5F5",   // Neutral Grey
    "#D8E5F3",   // Pale Blue
    "#E6E0EC",   // Lavender
    "#FFE0B2",   // Soft Peach
    "#E8F5E9",   // Light Green
    "#FFEBEE",   // Light Red
    "#FFF3E0",   // Light Orange
  ],
  strokes: [
    "#333333",   // Dark grey
    "#666666",   // Medium grey
    "#999999",   // Light grey
    "#1976D2",   // Blue
    "#7B1FA2",   // Purple
    "#388E3C",   // Green
    "#D32F2F",   // Red
    "#F57C00",   // Orange
  ],
};
