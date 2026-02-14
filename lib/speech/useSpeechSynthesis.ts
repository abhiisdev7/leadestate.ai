"use client";

import { useCallback, useRef } from "react";

export function useSpeechSynthesis() {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;

    const s = window.speechSynthesis;
    if (!s) return;

    s.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    s.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}
