"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, MessageCircleDashed, Sparkles } from "lucide-react";
import {
  ASSISTANT_STARTERS,
  ACTION_CATALOG,
  answerAssistant,
  type AssistantAction,
} from "@/lib/assistant";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { AIChatCard } from "@/components/ui/ai-chat-card";
import { cn } from "@/lib/utils";

type Msg = {
  role: "user" | "assistant";
  text: string;
  actions?: AssistantAction[];
};

const WELCOME =
  "Selam — buradayım. Demoları gezebilir, kafana takılanı sorabilirsin; işe gelince teklif formuna bağlarız. Neyle başlayalım?";

const WELCOME_ACTIONS: AssistantAction[] = [
  ACTION_CATALOG.siteler,
  ACTION_CATALOG.nasil,
  ACTION_CATALOG.teklif,
];

const PROMPTS = [
  "Villa sitesi için hangi demo uygun?",
  "Teklif formunu bulamıyorum",
  "Demolar gerçek mi?",
  "İnşaat perde sahnesini göster",
];

function goToHref(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("mailto:") || href.startsWith("http")) {
    window.location.href = href;
    return;
  }
  if (href.startsWith("/incele/")) {
    router.push(href);
    return;
  }
  if (href.startsWith("#")) {
    const id = href.slice(1) === "anket" ? "teklif" : href.slice(1);
    const hash = `#${id}`;
    const onHome = window.location.pathname === "/";
    if (!onHome) {
      sessionStorage.setItem("izden-scroll-to", id);
      router.push(`/${hash}`);
      return;
    }
    history.replaceState(null, "", hash);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.hash = hash;
  }
}

export function AiAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chips, setChips] = useState<string[]>(ASSISTANT_STARTERS);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: WELCOME, actions: WELCOME_ACTIONS },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const started = messages.length > 1;

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, busy]);

  function navigate(action: AssistantAction) {
    goToHref(action.href, router);
    window.setTimeout(() => setOpen(false), 180);
  }

  function resetChat() {
    setMessages([{ role: "assistant", text: WELCOME, actions: WELCOME_ACTIONS }]);
    setChips(ASSISTANT_STARTERS);
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    const nextUser: Msg = { role: "user", text: q };
    setMessages((m) => [...m, nextUser]);

    const history = [...messages, nextUser]
      .filter((m) => m.text !== WELCOME)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: history.slice(0, -1) }),
      });
      const data = res.ok ? await res.json() : null;
      const local = answerAssistant(q);
      const text =
        (data && typeof data.answer === "string" && data.answer) || local.answer;
      const actions =
        (Array.isArray(data?.actions) && data.actions.length
          ? (data.actions as AssistantAction[])
          : local.actions) || WELCOME_ACTIONS;
      setMessages((m) => [...m, { role: "assistant", text, actions }]);
      setChips(
        (Array.isArray(data?.suggestions) && data.suggestions.length
          ? data.suggestions
          : local.suggestions) || ASSISTANT_STARTERS
      );
    } catch {
      const local = answerAssistant(q);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: local.answer,
          actions: local.actions || WELCOME_ACTIONS,
        },
      ]);
      setChips(local.suggestions || ASSISTANT_STARTERS);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("ai-assist", open && "is-open")}>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="ai-assist__card"
        >
          <AIChatCard
            className="min-h-[min(520px,70svh)] max-h-[min(74svh,640px)]"
            title="İzden Asistan"
            subtitle="Demo ve teklif rehberi"
            greeting="Merhaba"
            prompt="Demolar, süreç veya teklif — sizi ilgili bölüme götüreyim."
            prompts={PROMPTS}
            autoType={!started}
            hideEmptyState={started}
            placeholder="Örn. Teklif formunu bulamıyorum…"
            footerHint="Butonlarla ilgili bölüme gidin"
            icon={<Sparkles className="h-5 w-5 text-neutral-900" />}
            onSend={(msg) => void ask(msg)}
            onReset={resetChat}
            onAttach={() => {
              const first = chips[0] || ASSISTANT_STARTERS[0];
              if (first) void ask(first);
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col text-neutral-950">
              <div
                className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
                role="log"
                aria-live="polite"
              >
                {messages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={cn(
                      "flex gap-2",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {m.role === "assistant" && (
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-950">
                        İ
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[88%] space-y-2",
                        m.role === "user" && "items-end"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-[18px] px-3.5 py-2.5 text-sm leading-5 shadow-sm",
                          m.role === "user"
                            ? "rounded-br-[6px] bg-neutral-950 text-white"
                            : "rounded-bl-[6px] border border-neutral-200 bg-white text-neutral-900"
                        )}
                      >
                        {m.text}
                      </div>
                      {m.role === "assistant" && m.actions && m.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.actions.map((action) => (
                            <button
                              key={`${i}-${action.href}`}
                              type="button"
                              onClick={() => navigate(action)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                action.primary
                                  ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800"
                                  : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500"
                              )}
                            >
                              {action.label}
                              <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-neutral-200 bg-white text-neutral-700">
                      <MessageCircleDashed className="h-3.5 w-3.5" />
                    </span>
                    <span className="inline-flex gap-1 px-1">
                      <span className="ai-dot" />
                      <span className="ai-dot" style={{ animationDelay: "0.15s" }} />
                      <span className="ai-dot" style={{ animationDelay: "0.3s" }} />
                    </span>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="flex gap-1.5 overflow-x-auto border-t border-neutral-200/80 bg-white px-5 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {chips.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={busy}
                    onClick={() => void ask(c)}
                    className="shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:border-neutral-500 hover:text-neutral-950 disabled:opacity-40"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </AIChatCard>
        </motion.div>
      )}

      <LiquidMetalButton
        viewMode="icon"
        label="İzden Asistan"
        aria-label={open ? "Asistanı kapat" : "İzden asistanı aç"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
    </div>
  );
}
