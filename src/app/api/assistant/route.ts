import { NextResponse } from "next/server";
import {
  answerAssistant,
  inferActions,
  mergeActions,
  parseModelJson,
  SYSTEM_PROMPT,
  type ChatTurn,
} from "@/lib/assistant";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  safeGroqModel,
  stripControls,
} from "@/lib/security";

export const runtime = "nodejs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  const originBlock = assertSameOrigin(req);
  if (originBlock) return originBlock;

  const limited = rateLimit(clientKey(req, "assistant"), 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        answer: "Çok hızlı soru geldi. Birkaç saniye sonra tekrar deneyin.",
        suggestions: ["Siteler listesi", "Teklif nasıl alınır?"],
        actions: inferActions("teklif"),
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      }
    );
  }

  try {
    const body = (await req.json()) as {
      message?: string;
      history?: ChatTurn[];
    };
    const message = stripControls(String(body.message || ""), 1200);
    if (!message.trim()) {
      return NextResponse.json(answerAssistant(""));
    }

    const inferred = inferActions(message);
    const apiKey = process.env.GROQ_API_KEY?.trim();
    const model = safeGroqModel(process.env.GROQ_MODEL);

    if (apiKey) {
      const history = Array.isArray(body.history)
        ? body.history
            .filter(
              (t) =>
                t &&
                (t.role === "user" || t.role === "assistant") &&
                typeof t.content === "string" &&
                t.content.trim()
            )
            .slice(-8)
            .map((t) => ({
              role: t.role as "user" | "assistant",
              content: stripControls(t.content, 1200),
            }))
        : [];

      const useJsonMode = /qwen/i.test(model);

      try {
        const payload: Record<string, unknown> = {
          model,
          temperature: 0.45,
          max_tokens: 480,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: message },
          ],
        };
        if (useJsonMode) {
          payload.response_format = { type: "json_object" };
        }

        const upstream = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
          // Hard timeout so hung upstream can't pin workers.
          signal: AbortSignal.timeout(20_000),
        });

        if (upstream.ok) {
          const data = (await upstream.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const raw = stripControls(
            String(data.choices?.[0]?.message?.content || ""),
            4000
          );
          const parsed = parseModelJson(raw);
          if (parsed) {
            return NextResponse.json({
              ...parsed,
              actions: mergeActions(parsed.actions, inferred),
              source: "groq",
            });
          }
          if (raw.trim()) {
            const local = answerAssistant(message);
            return NextResponse.json({
              answer: raw.trim().slice(0, 2000),
              suggestions: local.suggestions,
              actions: mergeActions(local.actions, inferred),
              source: "groq",
            });
          }
        } else {
          // Do not echo upstream body (may contain sensitive details).
          console.error("[assistant] groq status", upstream.status);
        }
      } catch (err) {
        console.error("[assistant] groq fetch failed");
        void err;
      }
    }

    const local = answerAssistant(message);
    return NextResponse.json({
      ...local,
      actions: mergeActions(local.actions, inferred),
      source: "local",
    });
  } catch {
    return NextResponse.json(
      {
        answer:
          "Bir sorun oluştu. Lütfen tekrar deneyin veya teklif formunu kullanın.",
        suggestions: [
          "Demolar gerçek mi?",
          "Siteler listesi",
          "Teklif nasıl alınır?",
        ],
        actions: inferActions("teklif"),
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
