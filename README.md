# Romans Cool Diagram Software (RCDS)

A JSON-first diagram editor for creating publication-ready technical diagrams in the "Academic Modern" style.

## Features

- **JSON Schema**: Diagrams are defined as JSON, making them programmatically editable
- **Academic Modern Theme**: Muted pastels, clean typography, professional look
- **Visual Editor**: Drag-drop interface for building diagrams
- **Node Templates**: Pre-built and custom node types
- **Orthogonal Routing**: 90-degree edge turns for clean connections
- **Export**: PNG, SVG, PDF with exact visual fidelity
- **Project Management**: Save/load projects locally (IndexedDB)
- **Grid & Snap**: Toggle grid overlay and snap-to-grid

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Docker

```bash
docker-compose up --build
```

## JSON Schema

Diagrams follow this structure:

```typescript
interface Diagram {
  id: string;
  name: string;
  version: "1.0";
  canvas: { width, height, gridSize, snapToGrid };
  theme: string | Theme;
  nodeTemplates: Record<string, NodeTemplate>;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  containers: DiagramContainer[];
  legend?: Legend;
  title?: TitleBlock;
}
```

See `frontend/src/lib/schema/types.ts` for complete type definitions.

## Design System

Based on the "Academic Modern" / "Publication-Ready Technical" aesthetic:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #D8E5F3 | Core components, orchestrators |
| Secondary | #E6E0EC | Memory, AI components |
| Accent | #FFE0B2 | Message brokers, transit |
| Neutral | #F5F5F5 | External entities, users |

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/
│   │   ├── canvas/       # SVG rendering (DiagramCanvas, NodeRenderer, etc.)
│   │   ├── editor/       # UI components (Sidebar, ProjectsPanel)
│   │   └── ui/           # Shared components (Button)
│   ├── lib/
│   │   ├── schema/       # TypeScript types
│   │   ├── rendering/    # Edge routing algorithms
│   │   ├── export/       # PNG/SVG/PDF export
│   │   └── store/        # IndexedDB persistence
│   └── themes/           # Theme definitions
├── Dockerfile
└── package.json
```

## Tech Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- Zustand (state management)
- Dexie.js (IndexedDB)
- html-to-image + jsPDF (export)

## License

MIT
