import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Diagram } from "@/lib/schema/types";

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

interface ProjectsState {
  projects: { [id: string]: { meta: ProjectMeta; diagram: Diagram } };
  currentProjectId: string | null;
  lastAutoSave: number | null;

  // Actions
  saveProject: (diagram: Diagram) => string;
  loadProject: (id: string) => Diagram | null;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  getProjectList: () => ProjectMeta[];
  setCurrentProject: (id: string | null) => void;
  autoSave: (diagram: Diagram) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: {},
      currentProjectId: null,
      lastAutoSave: null,

      saveProject: (diagram) => {
        const id = diagram.id || crypto.randomUUID();
        const now = Date.now();
        const existingMeta = get().projects[id]?.meta;

        set((state) => ({
          projects: {
            ...state.projects,
            [id]: {
              meta: {
                id,
                name: diagram.name,
                createdAt: existingMeta?.createdAt || now,
                updatedAt: now,
              },
              diagram: { ...diagram, id },
            },
          },
          currentProjectId: id,
          lastAutoSave: now,
        }));

        return id;
      },

      loadProject: (id) => {
        const project = get().projects[id];
        if (project) {
          set({ currentProjectId: id });
          return project.diagram;
        }
        return null;
      },

      deleteProject: (id) => {
        set((state) => {
          const { [id]: _deleted, ...rest } = state.projects;
          void _deleted; // Acknowledge unused variable
          return {
            projects: rest,
            currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
          };
        });
      },

      renameProject: (id, name) => {
        set((state) => {
          const project = state.projects[id];
          if (!project) return state;
          return {
            projects: {
              ...state.projects,
              [id]: {
                ...project,
                meta: { ...project.meta, name, updatedAt: Date.now() },
                diagram: { ...project.diagram, name },
              },
            },
          };
        });
      },

      getProjectList: () => {
        return Object.values(get().projects)
          .map((p) => p.meta)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },

      setCurrentProject: (id) => set({ currentProjectId: id }),

      autoSave: (diagram) => {
        const currentId = get().currentProjectId;
        if (currentId) {
          get().saveProject({ ...diagram, id: currentId });
        }
      },
    }),
    {
      name: "rcds-projects",
    }
  )
);
