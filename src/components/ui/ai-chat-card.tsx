"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { ArrowUp, MessageCircleDashed, Plus, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTypewriter } from "@/components/ui/ai-chat-card-utils/use-typewriter";

export interface AIChatCardProps {
  title?: string;
  subtitle?: string;
  greeting?: string;
  prompt?: string;
  prompts?: string[];
  autoType?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  onSend?: (message: string) => void;
  onReset?: () => void;
  onAttach?: () => void;
  className?: string;
  children?: React.ReactNode;
  footerHint?: string;
  hideEmptyState?: boolean;
}

const DEFAULT_PROMPTS = [
  "Villa sitesi için hangi demo uygun?",
  "Teklif formunu bulamıyorum",
  "Demolar gerçek mi, üretim nasıl olur?",
  "İnşaat perde sahnesini göster",
];

export function AIChatCard({
  title = "İzden Asistan",
  subtitle = "Demo ve teklif rehberi",
  greeting = "Merhaba",
  prompt = "Demolar, süreç veya teklif hakkında sorun — sizi ilgili bölüme götüreyim.",
  prompts = DEFAULT_PROMPTS,
  autoType = true,
  placeholder = "Sorun veya yön isteyin…",
  icon,
  onSend,
  onReset,
  onAttach,
  className,
  children,
  footerHint,
  hideEmptyState = false,
}: AIChatCardProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const inView = useInView(rootRef, { margin: "-10% 0px" });

  const [userActive, setUserActive] = React.useState(false);
  const [userMessage, setUserMessage] = React.useState("");
  const [spins, setSpins] = React.useState(0);

  const { text: typedMessage, phase } = useTypewriter(prompts, {
    typeMs: 48,
    deleteMs: 14,
    holdMs: 3400,
    gapMs: 900,
    enabled: autoType && inView && !userActive && !hideEmptyState,
  });

  const message = userActive || !autoType ? userMessage : typedMessage;

  const takeOver = () => {
    if (userActive || !autoType) return;
    setUserMessage(typedMessage);
    setUserActive(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const send = () => {
    const value = message.trim();
    if (!value) return;
    onSend?.(value);
    setUserMessage("");
    setUserActive(true);
  };

  return (
    <div
      ref={rootRef}
      data-ai-card
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white text-neutral-950",
        "shadow-[0_0_16.4px_1px_rgba(10,10,10,0.05),0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 pb-4 pt-5">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold leading-6 tracking-[-0.02em] text-neutral-950">
            {title}
          </h3>
          <p className="mt-0.5 text-sm leading-5 text-neutral-600">{subtitle}</p>
        </div>
        <motion.button
          type="button"
          onClick={() => {
            setSpins((count) => count + 1);
            setUserActive(false);
            setUserMessage("");
            onReset?.();
          }}
          whileTap={{ scale: 0.9 }}
          aria-label="Sohbeti sıfırla"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[18px] border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-950"
        >
          <motion.span
            animate={{ rotate: spins * 360 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.7 }}
            className="flex"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.span>
        </motion.button>
      </div>

      {children ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-neutral-50/80">
          {children}
        </div>
      ) : !hideEmptyState ? (
        <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50/80 px-8 py-10 text-center">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-neutral-200 bg-white text-neutral-900"
          >
            {icon ?? <MessageCircleDashed className="h-5 w-5" />}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="mt-4 text-[18px] font-semibold leading-7 tracking-[-0.45px] text-neutral-950"
          >
            {greeting}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="mt-1.5 max-w-[220px] text-sm leading-[22.75px] text-neutral-500"
          >
            {prompt}
          </motion.p>
        </div>
      ) : null}

      <div className="border-t border-neutral-200 bg-white px-5 pb-5 pt-3">
        <div className="rounded-[18px] border border-neutral-200 bg-neutral-100 p-3 transition-colors focus-within:border-neutral-300 focus-within:bg-neutral-50">
          {userActive || !autoType || hideEmptyState ? (
            <textarea
              ref={textareaRef}
              value={userMessage}
              onChange={(event) => {
                setUserActive(true);
                setUserMessage(event.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={placeholder}
              rows={2}
              className="w-full resize-none bg-transparent text-sm leading-5 text-neutral-950 outline-none placeholder:text-neutral-400"
            />
          ) : (
            <div
              onClick={takeOver}
              className="min-h-10 w-full cursor-text text-left text-sm leading-5 text-neutral-800"
            >
              {message}
              <motion.span
                aria-hidden
                className="ml-px inline-block h-3.5 w-px bg-neutral-900 align-middle"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  times: [0, 0.5, 0.5, 1],
                }}
              />
              {!message ? (
                <span className="text-neutral-400">{placeholder}</span>
              ) : null}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <motion.button
              type="button"
              onClick={onAttach}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
              aria-label="Önerileri göster"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[18px] border border-neutral-200 bg-white text-neutral-800"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              onClick={send}
              whileHover={{
                scale: 1.08,
                transition: { type: "spring", bounce: 0.5, duration: 0.4 },
              }}
              whileTap={{
                scale: 0.88,
                transition: { type: "spring", bounce: 0.5, duration: 0.4 },
              }}
              animate={
                phase === "holding" && !userActive
                  ? { scale: [1, 1.14, 1] }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.5,
                ease: "easeInOut",
                times: [0, 0.35, 1],
              }}
              aria-label="Gönder"
              className="group flex h-[30px] w-[30px] items-center justify-center rounded-[18px] bg-neutral-950 text-white"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-px" />
            </motion.button>
          </div>
        </div>
        {footerHint ? (
          <p className="mt-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            {footerHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default AIChatCard;
