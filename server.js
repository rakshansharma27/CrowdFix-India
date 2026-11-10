const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const maxAudioBytes = 8 * 1024 * 1024;
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon'
};
const sendJson = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(JSON.stringify(body));
};

async function handleTranscription(request, response) {
  const key = process.env.GNANI_API_KEY;
  if (!key) return sendJson(response, 503, { success: false, message: 'Set GNANI_API_KEY in the server environment to enable live transcription.' });
  if (request.headers.origin && request.headers.origin !== `http://localhost:${port}`) return sendJson(response, 403, { success: false, message: 'Cross-origin requests are not allowed.' });
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) if (value) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  let incoming;
  try { incoming = await new Request(`http://localhost:${port}/api/transcribe`, { method: 'POST', headers, body: request, duplex: 'half' }).formData(); }
  catch (_) { return sendJson(response, 400, { success: false, message: 'The audio upload could not be read.' }); }
  const audio = incoming.get('audio_file');
  if (!audio || typeof audio.arrayBuffer !== 'function') return sendJson(response, 400, { success: false, message: 'Audio file is required.' });
  if (audio.size === 0) return sendJson(response, 400, { success: false, message: 'The recording is empty.' });
  if (audio.size > maxAudioBytes) return sendJson(response, 413, { success: false, message: 'Recording is too large. Keep it under 25 seconds.' });

  const form = new FormData();
  form.append('audio_file', audio, 'crowdfix-report.wav');
  form.append('model', 'prisma-v3.0');
  form.append('language_code', 'indic-auto');
  form.append('format', 'transcribe');
  form.append('topic', 'Civic issue report for Dehradun, Uttarakhand');
  form.append('keyterms', JSON.stringify(['Dehradun', 'Rajpur Road', 'Clock Tower', 'Ghanta Ghar', 'Ballupur Chowk', 'Paltan Bazaar', 'Saharanpur Road', 'Prem Nagar', 'ISBT']));
  let upstream;
  try { upstream = await fetch('https://api.vachana.ai/stt/v3', { method: 'POST', headers: { 'X-API-Key-ID': key }, body: form }); }
  catch (_) { return sendJson(response, 502, { success: false, message: 'Gnani transcription service could not be reached. Try again shortly.' }); }
  const result = await upstream.json().catch(() => null);
  if (!upstream.ok || result?.success === false) {
    const message = result?.error?.message || result?.detail?.message || result?.message || 'Gnani could not transcribe this clip.';
    return sendJson(response, upstream.status || 502, { success: false, message: String(message).slice(0, 240) });
  }
  return sendJson(response, 200, {
    success: true,
    transcript: typeof result.transcript === 'string' ? result.transcript : '',
    model: result.model || 'prisma-v3.0',
    detectedLanguage: result.detected_language_code || null,
    latencyMs: Number.isFinite(Number(result.end_to_end_latency)) ? Math.round(Number(result.end_to_end_latency) * 1000) : null,
    requestId: result.request_id || null
  });
}

http.createServer(async (request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch (_) { response.writeHead(400); response.end('Bad request'); return; }
  if (pathname === '/api/health') {
    if (request.method !== 'GET') return sendJson(response, 405, { success: false, message: 'Method not allowed.' });
    return sendJson(response, 200, { success: true, configured: Boolean(process.env.GNANI_API_KEY), model: 'prisma-v3.0' });
  }
  if (pathname === '/api/transcribe') {
    if (request.method !== 'POST') return sendJson(response, 405, { success: false, message: 'Method not allowed.' });
    return handleTranscription(request, response);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405); response.end('Method not allowed'); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  fs.readFile(file, (error, bytes) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  });
}).listen(port, '127.0.0.1', () => console.log(`CrowdFix is ready at http://localhost:${port}`));
