import Dexie, { Table } from "dexie";
import { Diagram } from "@/lib/schema/types";

// Project metadata
export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  diagram: Diagram;
}

// Dexie database
class RCDSDatabase extends Dexie {
  projects!: Table<Project>;

  constructor() {
    super("rcds-db");
    this.version(1).stores({
      projects: "id, name, createdAt, updatedAt",
    });
  }
}

export const db = new RCDSDatabase();

// Project operations
export async function saveProject(project: Project): Promise<void> {
  await db.projects.put({
    ...project,
    updatedAt: new Date(),
  });
}

export async function createProject(diagram: Diagram): Promise<Project> {
  const project: Project = {
    id: diagram.id,
    name: diagram.name,
    createdAt: new Date(),
    updatedAt: new Date(),
    diagram,
  };
  await db.projects.add(project);
  return project;
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.orderBy("updatedAt").reverse().toArray();
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function updateProjectDiagram(
  id: string,
  diagram: Diagram
): Promise<void> {
  await db.projects.update(id, {
    diagram,
    name: diagram.name,
    updatedAt: new Date(),
  });
}
