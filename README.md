# CrowdFix

Voice-first civic issue reporting and municipal operations demo for Dehradun.

## Run locally

```bash
export GNANI_API_KEY="your-key"
node server.js
```

Then open `http://localhost:3000`. Reports, voice confirmations, and officer updates are saved in the browser's local storage. Use **Reset demo data** from the profile menu to restore the seed examples.

## Demo capabilities

- Hindi, Hinglish, and English test prompts with a clearly labelled word-by-word local demo transcript.
- Real microphone capture, 16 kHz WAV encoding, and a server-side proxy to Gnani Prisma v3.0 REST transcription using `indic-auto`.
- Local civic category, landmark, severity, and spam heuristics.
- Duplicate clustering, neighborhood-level map markers, filters, resident corroboration, officer status updates, sharing, and print-to-PDF evidence export.
- Guest, resident, and municipal officer demo personas.

Audio is sent to Gnani only after the user taps **Finish**. CrowdFix does not store the audio. The API key must be supplied as `GNANI_API_KEY` in the local server environment or configured as a Site runtime secret; it is never included in browser assets or source control. The Site Worker serves the app and proxies `/api/transcribe` to Gnani. The map and fonts load from their public providers and require a network connection.
