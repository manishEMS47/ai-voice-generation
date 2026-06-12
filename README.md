# AI Powered Voice Chat Demo

<img src="https://tyingshoelaces.com/_next/image?url=https%3A%2F%2Ftyingshoelaces.com%2Flipstickonapigtyingshoes.jpg&w=3840&q=75" alt="logo" width="360"/> By [tyingshoelaces.com](tyingshoelaces.com)
[![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT) [![Contributors](https://img.shields.io/badge/contributors-1-orange)](https://github.com/Ejb503)

## Overview

This is a simple version of OpenAI's voice functionality using free APIs. This demo lets you talk, listen, and converse with LLMs. 

Original blog post is here: - **Blog:** [Blog Post](https://tyingshoelaces.com/blog/ai-voice-generation)
Youtube video explainer is here: [YouTube Video](https://youtu.be/3zPeOpOEmyQ)

Feel free to play around!

## Tech Stack

- **LLM Host:** Groq
- **LLM:** LLAMA 3
- **TTS:** DeepGram or 60db (switchable)
- **STT:** SpeechRecognition API
- **Web Framework:** NextJS (React front-end, Express API)

## How to use

1. download the repo
2. npm i
3. setup .env.local (see below)
4. npm run dev

### Environment variables

```bash
GROQ_API_KEY=...          # required, LLM
DEEPGRAM_API_KEY=...       # required if TTS_PROVIDER=deepgram
SIXTYDB_API_KEY=...        # required if TTS_PROVIDER=sixtydb

# TTS provider switch: "deepgram" (default) or "sixtydb"
TTS_PROVIDER=deepgram

# Optional 60db overrides
SIXTYDB_VOICE_ID=fbb75ed2-975a-40c7-9e06-38e30524a9a1
SIXTYDB_BASE_URL=https://api.60db.ai
```

### Switching TTS provider

The browser always POSTs the LLM text to a single endpoint, `/api/v1/tts`, which
dispatches to the provider named in `TTS_PROVIDER`. Both providers return an
identical `audio/wav` response, so nothing on the client changes. Flip
`TTS_PROVIDER` in `.env.local` and restart `npm run dev` to swap between
Deepgram (Aura) and 60db (`/tts-synthesize`). The legacy `/api/v1/deepgram`
route still works and always uses Deepgram.

You might want to edit all the prompts to change the tone of the response.

The architecture is simple, Voice -> Text -> LLM -> Text -> Voice. Rag and all sorts of fun creative things can be used to spice up the LLM.

## TTS Providers (Deepgram + 60db)

The text-to-speech layer is provider-agnostic. The browser always POSTs the LLM
text to one endpoint and gets back `audio/wav`; the server decides which engine
produces it.

```
client (utils.ts) --POST text--> /api/v1/tts --dispatch by TTS_PROVIDER-->
                                      ├─ providers/deepgram.ts  (Aura, streams WAV)
                                      └─ providers/sixtydb.ts   (/tts-synthesize, base64 -> WAV)
```

| File | Role |
| --- | --- |
| `src/app/api/v1/tts/route.ts` | Dispatcher. Reads `TTS_PROVIDER`, unwraps the request body, calls the chosen provider. |
| `src/app/api/v1/tts/providers/deepgram.ts` | Deepgram Aura (`aura-perseus-en`), streams `linear16`/`wav`. Exports the shared `AUDIO_HEADERS`. |
| `src/app/api/v1/tts/providers/sixtydb.ts` | Calls 60db `POST /tts-synthesize` with `Authorization: Bearer`, decodes the base64 audio, returns WAV. |
| `src/app/api/v1/deepgram/route.ts` | Legacy route, kept for back-compat; delegates to the Deepgram provider. |

Both providers return the **same** `audio/wav` response (identical headers), so
the React client (`processAudioStream` -> `response.blob()` -> `URL.createObjectURL`)
needs no changes when you switch engines.

**60db request sent** (from `sixtydb.ts`):

```json
{
  "text": "<llm reply, truncated to 1000 chars>",
  "voice_id": "fbb75ed2-975a-40c7-9e06-38e30524a9a1",
  "output_format": "wav",
  "enhance": true,
  "speed": 1,
  "stability": 50,
  "similarity": 75
}
```

> Note: 60db returns base64 audio inside a JSON payload. The exact key isn't
> guaranteed across versions, so `sixtydb.ts` probes the common locations
> (`audioContent`, `audio`, `result.audioContent`, `data.audioContent`).

## Hints and tricks

You'll probably want to switch out SpeechRecognition for Whisper AI if you want non-chrome APIs or something more stable.

There is a lot of investment needed in handling state in the AudioPlayer, not necessary for this demo.

Playing with the prompts and context going to Groq is the key for personalisation.

Contact me for feedback!

## What I Did

I built a demo where you can:

1. Talk into the browser using the WebSpeechRecognitionAPI.
2. Stream the transcribed text to Groq for processing.
3. Send the response from Groq to a TTS provider (DeepGram or 60db) for text-to-speech conversion.
4. Play the generated audio response in the browser.

- **NextJS:** ★★★★★ - Wonderful technology, simplifies client and server-side development.
- **Groq:** ★★★★★ - New benchmarks in speed and cost.
- **Llama3:** ★★★★☆ - Noticeable difference from GPT-io, great for cheap requests and demos.
- **DeepGram:** ★★★☆☆ - Generous starting credits, good latency. Still green as a tech.

## Links

- **Demo:** [AI Voice Generation Demo](https://tyingshoelaces.com/demo/ai-voice-generation)
- **GitHub Repository:** [GitHub](https://github.com/Ejb503/ai-voice-generation)
- **Video:** [YouTube Video](https://youtu.be/3zPeOpOEmyQ)
- **Blog:** [Blog Post](https://tyingshoelaces.com/blog/ai-voice-generation)

---

Edward Ejb503, [Tying Shoelaces Blog](https://tyingshoelaces.com)
