/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const stmt = env.DB.prepare("select count(*) as n from projects");
    const res = (await env.DB.batch<{ n: number }>([stmt]))[0];
    console.log("RESULTS");
    console.log(`Props ${res.success} ${res.results} ${res.error} ${res.meta}`);
    console.log(`JSON ${JSON.stringify(res)}`);

    if (res.results == null) throw new Error(res.error);
    const { n } = res.results[0];
    return new Response(`Hello World! Loaded ${n} projects`);
  },
};
