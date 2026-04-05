"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: Event) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = "ru-RU";
  r.continuous = false;
  r.interimResults = false;
  return r;
}

type Props = {
  onText: (text: string) => void;
  label?: string;
};

export function VoiceField({ onText, label = "Диктовка" }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(!!getRecognition());
  }, []);

  const start = useCallback(() => {
    const rec = getRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.onresult = (ev: Event) => {
      const e = ev as unknown as {
        results: { 0: { 0: { transcript: string } } };
      };
      const text = e.results?.[0]?.[0]?.transcript?.trim();
      if (text) onText(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [onText]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  if (supported === false) {
    return (
      <p className="text-xs text-[var(--muted)]">
        Голосовой ввод недоступен в этом браузере. Используйте Chrome или Edge.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--bg)]"
        onClick={listening ? stop : start}
        disabled={supported === null}
      >
        {listening ? "Стоп" : `🎤 ${label}`}
      </button>
      {listening && <span className="text-xs text-[var(--muted)]">Идёт запись…</span>}
    </div>
  );
}
