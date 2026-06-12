import { createClient } from "@deepgram/sdk";

const API_KEY = process.env.DEEPGRAM_API_KEY;

// Shared CORS / streaming headers so every TTS provider responds identically.
export const AUDIO_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "audio/wav",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

/**
 * Synthesize speech with Deepgram Aura and stream the WAV bytes to the client.
 */
export async function synthesizeDeepgram(text: string): Promise<Response> {
  if (!API_KEY) {
    throw new Error("Missing DEEPGRAM_API_KEY");
  }

  const deepgram = createClient(API_KEY);
  const { readable, writable } = new TransformStream();

  const response = await deepgram.speak.request(
    { text },
    {
      model: "aura-perseus-en",
      encoding: "linear16",
      container: "wav",
    }
  );

  const stream = await response.getStream();
  if (!stream) {
    return new Response("No stream available", { status: 502 });
  }

  // Pipe the Deepgram audio stream straight through to the client.
  stream.pipeTo(writable);

  return new Response(readable, { status: 200, headers: AUDIO_HEADERS });
}
