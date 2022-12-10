import { Router, Request } from "itty-router";
import { Project, ProjectHeader } from "./model";

export interface Env {
  DB: D1Database;
}

const router = Router();

router.get("/api", async (req: Request, env: Env) => {
  if (req.method === "options") return respCors();
  const stmt = env.DB.prepare("select count(*) as n from projects");
  const { n } = await stmt.first<{ n: number }>();
  return new Response(`Hello World! Loaded ${n} projects`);
});

router.get("/api/projects", async (req: Request, env: Env) => {
  if (req.method === "options") return respCors();
  const stmt = env.DB.prepare(
    `select * from projects 
	 where n_units>0
	 order by n_units desc`
  );
  const { results } = await stmt.all<Project>();
  return respJson(results);
});

router.get("/api/project/:id", async (req: Request, env: Env) => {
  if (req.method === "options") return respCors();
  const { id } = req.params!;
  const stmt = env.DB.prepare("select * from projects where id=?");
  const proj = await stmt.bind(id).first<Project>();
  if (proj == null) return resp404(`project not found: ${id}`);
  return respJson(proj);
});

router.get("/api/search", async (req: Request, env: Env) => {
  if (req.method === "options") return respCors();
  if (req.query?.q == null) return resp400("query ?q= required");
  const q = req.query.q.toLowerCase();
  const stmt = env.DB.prepare(
    `select id, name, addr, n_units from projects
  	 where instr(lower(name), ?)>0 or instr(lower(addr), ?)> 0
	 order by n_units desc
	 limit 10`
  ).bind(q, q);
  const { results } = await stmt.all<ProjectHeader>();
  return respJson(results);
});

router.all("*", () => resp404());

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

function respJson(obj: unknown): Response {
  return new Response(JSON.stringify(obj), { headers });
}

function resp404(message?: string): Response {
  return new Response(message || "not found", { status: 404 });
}

function resp400(message: string): Response {
  return new Response(message, { status: 400 });
}

function respCors(): Response {
  return new Response("{}", { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return router.handle(request, env);
  },
};
