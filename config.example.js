/*
 * The demo does not load a browser-side API key. Do not put a private Gnani
 * credential in a file served to visitors. Add a server-side proxy and store
 * the key as a runtime secret before enabling live transcription.
 */
window.GNANI_CONFIG = {
  model: 'prisma-v3.0',
  language: 'indic-auto',
  format: 'transcribe'
};
