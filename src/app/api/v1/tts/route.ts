import { NextRequest } from "next/server";
import { synthesizeDeepgram } from "./providers/deepgram";
import { synthesizeSixtyDb } from "./providers/sixtydb";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Provider = "deepgram" | "sixtydb";

/**
 * The client sends the text as a JSON-encoded string (e.g. `"hello"`).
 * Unwrap it so providers receive clean text without literal quotes.
 */
function unwrap(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
  } catch {
    /* not JSON — use the raw body */
  }
  return raw;
}

/**
 * Unified text-to-speech endpoint. The active provider is selected by the
 * TTS_PROVIDER env var ("deepgram" | "sixtydb"), defaulting to Deepgram.
 * Both providers return identical audio/wav responses.
 */
export async function POST(req: NextRequest) {
  const provider = (
    process.env.TTS_PROVIDER || "deepgram"
  ).toLowerCase() as Provider;

  try {
    const text = unwrap(await req.text()).trim();
    if (!text) {
      return new Response("No text provided", { status: 400 });
    }

    switch (provider) {
      case "sixtydb":
        return await synthesizeSixtyDb(text);
      case "deepgram":
        return await synthesizeDeepgram(text);
      default:
        return new Response(`Unknown TTS_PROVIDER: ${provider}`, {
          status: 500,
        });
    }
  } catch (error) {
    console.error(`TTS error (provider=${provider}):`, error);
    return new Response("Text-to-speech failed", { status: 500 });
  }
}
