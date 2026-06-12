import { NextRequest } from "next/server";
import { synthesizeDeepgram } from "../tts/providers/deepgram";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Kept for backwards compatibility. New code should POST to /api/v1/tts, which
 * dispatches to the provider chosen by TTS_PROVIDER. This route always uses
 * Deepgram and shares the same implementation.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  let text = raw;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") text = parsed;
  } catch {
    /* not JSON — use the raw body */
  }

  try {
    return await synthesizeDeepgram(text);
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response("Text-to-speech failed", { status: 500 });
  }
}
