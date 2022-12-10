import { Project } from "./model";

const api =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8787/api/"
    : "https://worker.dce.workers.dev/api/";

export async function search(q: string): Promise<Project[]> {
  const resp = await fetch(api + `search?q=${q}`);
  return await resp.json();
}

export async function loadProject(id: string): Promise<Project> {
  const resp = await fetch(api + `project/${id}`);
  return await resp.json();
}
