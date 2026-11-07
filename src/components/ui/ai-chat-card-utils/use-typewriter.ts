"use client";

import { useEffect, useMemo, useState } from "react";

export type TypewriterPhase = "typing" | "holding" | "deleting" | "gap";

type Options = {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  gapMs?: number;
  enabled?: boolean;
};

export function useTypewriter(
  prompts: string[],
  {
    typeMs = 48,
    deleteMs = 14,
    holdMs = 3400,
    gapMs = 900,
    enabled = true,
  }: Options = {}
) {
  const list = useMemo(
    () => (prompts.length ? prompts : [""]),
    [prompts]
  );
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<TypewriterPhase>("typing");

  useEffect(() => {
    if (!enabled) return;
    const full = list[index % list.length] || "";
    let timer: number;

    if (phase === "typing") {
      if (text.length < full.length) {
        timer = window.setTimeout(
          () => setText(full.slice(0, text.length + 1)),
          typeMs
        );
      } else {
        timer = window.setTimeout(() => setPhase("holding"), 0);
      }
    } else if (phase === "holding") {
      timer = window.setTimeout(() => setPhase("deleting"), holdMs);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timer = window.setTimeout(() => setText(text.slice(0, -1)), deleteMs);
      } else {
        timer = window.setTimeout(() => setPhase("gap"), 0);
      }
    } else {
      timer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % list.length);
        setPhase("typing");
      }, gapMs);
    }

    return () => window.clearTimeout(timer);
  }, [enabled, phase, text, index, list, typeMs, deleteMs, holdMs, gapMs]);

  useEffect(() => {
    if (!enabled) {
      setText("");
      setPhase("typing");
    }
  }, [enabled]);

  return { text, phase };
}
