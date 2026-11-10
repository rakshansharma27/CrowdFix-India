import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const files = [
  ['/', 'index.html', 'text/html; charset=utf-8'],
  ['/index.html', 'index.html', 'text/html; charset=utf-8'],
  ['/styles.css', 'styles.css', 'text/css; charset=utf-8'],
  ['/app.js', 'app.js', 'text/javascript; charset=utf-8'],
  ['/sw.js', 'sw.js', 'text/javascript; charset=utf-8']
];
const assets = {};
for (const [route, file, contentType] of files) assets[route] = { contentType, body: await readFile(resolve(root, file), 'utf8') };

const worker = `const ASSETS = ${JSON.stringify(assets)};
const API_URL = "https://api.vachana.ai/stt/v3";
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const KEYTERMS = ["Dehradun", "Rajpur Road", "Clock Tower", "Ghanta Ghar", "Ballupur Chowk", "Paltan Bazaar", "Saharanpur Road", "Prem Nagar", "ISBT"];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

async function health(request, env) {
  if (request.method !== "GET") return json({ success: false, message: "Method not allowed." }, 405);
  return json({ success: true, configured: Boolean(env.GNANI_API_KEY), model: "prisma-v3.0" });
}

async function transcribe(request, env, url) {
  if (request.method !== "POST") return json({ success: false, message: "Method not allowed." }, 405);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return json({ success: false, message: "Cross-origin requests are not allowed." }, 403);
  if (!env.GNANI_API_KEY) return json({ success: false, message: "Gnani API secret is not configured." }, 503);
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("multipart/form-data")) return json({ success: false, message: "Upload a WAV audio file using multipart form data." }, 415);

  let incoming;
  try { incoming = await request.formData(); }
  catch (_) { return json({ success: false, message: "The audio upload could not be read." }, 400); }
  const audio = incoming.get("audio_file");
  if (!audio || typeof audio.arrayBuffer !== "function") return json({ success: false, message: "Audio file is required." }, 400);
  if (audio.size === 0) return json({ success: false, message: "The recording is empty." }, 400);
  if (audio.size > MAX_AUDIO_BYTES) return json({ success: false, message: "Recording is too large. Keep it under 25 seconds." }, 413);

  const upstreamForm = new FormData();
  upstreamForm.append("audio_file", audio, "crowdfix-report.wav");
  upstreamForm.append("model", "prisma-v3.0");
  upstreamForm.append("language_code", "indic-auto");
  upstreamForm.append("format", "transcribe");
  upstreamForm.append("topic", "Civic issue report for Dehradun, Uttarakhand");
  upstreamForm.append("keyterms", JSON.stringify(KEYTERMS));

  let upstream;
  try {
    upstream = await fetch(API_URL, { method: "POST", headers: { "X-API-Key-ID": env.GNANI_API_KEY }, body: upstreamForm });
  } catch (_) {
    return json({ success: false, message: "Gnani's transcription service could not be reached. Try again shortly." }, 502);
  }
  let result;
  try { result = await upstream.json(); }
  catch (_) { return json({ success: false, message: "Gnani returned an unreadable response." }, 502); }
  if (!upstream.ok || result?.success === false) {
    const providerMessage = result?.error?.message || result?.detail?.message || result?.message;
    const message = typeof providerMessage === "string" ? providerMessage.slice(0, 240) : "Gnani could not transcribe this clip.";
    return json({ success: false, message, providerStatus: upstream.status }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502);
  }
  return json({
    success: true,
    transcript: typeof result.transcript === "string" ? result.transcript : "",
    model: result.model || "prisma-v3.0",
    detectedLanguage: result.detected_language_code || null,
    latencyMs: Number.isFinite(Number(result.end_to_end_latency)) ? Math.round(Number(result.end_to_end_latency) * 1000) : null,
    requestId: result.request_id || null
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") return health(request, env);
    if (url.pathname === "/api/transcribe") return transcribe(request, env, url);
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    const asset = ASSETS[url.pathname] || (url.pathname === "/" ? ASSETS["/"] : null);
    if (!asset) return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    const headers = { "content-type": asset.contentType, "cache-control": "no-cache", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin" };
    return new Response(request.method === "HEAD" ? null : asset.body, { headers });
  }
};
`;

await mkdir(resolve(root, 'worker'), { recursive: true });
await writeFile(resolve(root, 'worker/index.js'), worker, 'utf8');
console.log('Generated Worker bundle from the CrowdFix interface files.');
