import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, ChevronDown, Bot, User, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { findAnswer, KNOWLEDGE } from "@/lib/stunting-knowledge";

type Msg = { role: "user" | "assistant"; content: string };

// Tampilkan beberapa topik populer sebagai tombol saran.
const SUGGESTIONS = ["cegah", "mpasi", "asi", "gizi-seimbang", "jarak-hamil", "gizi-ibu"]
  .map((id) => KNOWLEDGE.find((k) => k.id === id))
  .filter(Boolean)
  .map((k) => ({ q: k!.title, full: k!.keywords[0] }));

export function StuntingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function ask(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setTyping(true);
    const { answer } = findAnswer(q);
    // Jeda singkat agar terasa natural (berjalan di perangkat, instan).
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      setTyping(false);
      inputRef.current?.focus();
    }, 350);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white card-shadow">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-brand-50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold text-brand-800">
              Asisten Edukasi Stunting
            </span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
              Gratis · di perangkat
            </span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            Tanya tips cegah stunting & gizi anak sebelum mengisi data
          </span>
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-brand-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-brand-100 px-4 pb-4 pt-3 animate-fade-up">
          {/* Messages */}
          <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">
                Halo! Saya asisten edukasi gizi. Tanyakan apa saja tentang{" "}
                <strong>cara mencegah stunting</strong> dan gizi balita, atau pilih topik di bawah.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex gap-2.5", m.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                    m.role === "user" ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700"
                  )}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div
                  className={cn(
                    "max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-brand-600 text-white"
                      : "border border-border bg-white text-foreground"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <Bot className="h-4 w-4" />
                </span>
                <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                Mengetik…
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.q}
                  onClick={() => ask(s.full)}
                  className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {s.q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="mt-3 flex items-end gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan tentang gizi & stunting…"
              className="h-11 flex-1 rounded-xl border border-input bg-white px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20"
              maxLength={500}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={typing || !input.trim()}>
              {typing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>

          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              Berbasis informasi terkurasi (WHO/Kemenkes), berjalan <strong>di perangkat</strong> —
              gratis &amp; tanpa internet. Bersifat edukasi, bukan diagnosis. Untuk kondisi khusus,
              konsultasikan ke posyandu/dokter.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
