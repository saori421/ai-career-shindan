// Cloudflare Pages Functions: /api/* を収集Worker（levance-shindan-collect）へ中継する
// 目的: 診断ページ・レポート管理ページから同一ドメインで呼び出せるようにし、
//       公開URL上にWorkerのアカウント名（workers.devサブドメイン）を出さない
// 例: POST /api/collect → Worker "/collect" ／ GET /api/rows → Worker "/rows"
const WORKER = "https://levance-shindan-collect.saori421work.workers.dev";

export async function onRequest(context) {
  const req = context.request;
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "") || "/";
  const target = WORKER + path + url.search;

  const headers = new Headers();
  const ct = req.headers.get("Content-Type");
  const key = req.headers.get("X-Report-Key");
  if (ct) headers.set("Content-Type", ct);
  if (key) headers.set("X-Report-Key", key);

  const init = { method: req.method, headers: headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const res = await fetch(target, init);
  const out = new Headers();
  out.set("Content-Type", res.headers.get("Content-Type") || "application/json");
  out.set("Cache-Control", "no-store");
  return new Response(await res.text(), { status: res.status, headers: out });
}
