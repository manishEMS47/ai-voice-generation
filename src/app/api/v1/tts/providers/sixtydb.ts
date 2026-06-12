import { AUDIO_HEADERS } from "./deepgram";

const API_KEY = process.env.SIXTYDB_API_KEY;
const BASE_URL = process.env.SIXTYDB_BASE_URL || "https://api.60db.ai";
// Default native voice from the 60db docs; override with SIXTYDB_VOICE_ID.
const VOICE_ID =
  process.env.SIXTYDB_VOICE_ID || "fbb75ed2-975a-40c7-9e06-38e30524a9a1";

/**
 * 60db returns base64-encoded audio inside a JSON payload. The exact key isn't
 * guaranteed across versions, so probe the common locations.
 */
function extractAudio(payload: any): string | undefined {
  return (
    payload?.audioContent ??
    payload?.audio ??
    payload?.result?.audioContent ??
    payload?.data?.audioContent ??
    payload?.data?.audio
  );
}

/**
 * Synthesize speech with 60db's non-streaming /tts-synthesize endpoint,
 * decode the base64 audio, and return WAV bytes — same contract as Deepgram.
 */
export async function synthesizeSixtyDb(text: string): Promise<Response> {
  if (!API_KEY) {
    throw new Error("Missing SIXTYDB_API_KEY");
  }

  const res = await fetch(`${BASE_URL}/tts-synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      text, // max 5000 chars (client already truncates to 1000)
      voice_id: VOICE_ID,
      output_format: "wav", // match Deepgram's audio/wav response
      enhance: true,
      speed: 1,
      stability: 50,
      similarity: 75,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`60db TTS failed: ${res.status} ${detail}`);
  }

  const payload = await res.json();
  const base64 = extractAudio(payload);
  if (!base64) {
    throw new Error("60db response did not contain audio content");
  }

  const audio = Buffer.from(base64, "base64");
  return new Response(new Uint8Array(audio), {
    status: 200,
    headers: AUDIO_HEADERS,
  });
}
