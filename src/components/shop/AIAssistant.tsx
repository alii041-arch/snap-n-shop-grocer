import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { askAssistant, type AIReply } from "@/lib/ai";
import { byId } from "@/lib/data";
import { inr, useStore } from "@/lib/store";
import { Stepper, ProductTile } from "./ProductCard";

type Msg = { role: "user" | "ai"; text: string; reply?: AIReply };

function Reveal({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); const t = setInterval(() => setN((x) => { if (x >= text.length) { clearInterval(t); return x; } return x + 3; }), 18); return () => clearInterval(t); }, [text]);
  const shown = text.slice(0, n);
  return <p className="text-sm leading-6">{shown.split(/\*\*(.+?)\*\*/g).map((s, i) => (i % 2 ? <b key={i}>{s}</b> : s))}</p>;
}

export function AIAssistant() {
  const { aiOpen, aiPrompt, openAI, closeAI, add } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: "Hi! I'm your FreshDash AI Chef 👩‍🍳 Tell me what you want to cook or what you need — I'll build your cart.", reply: { text: "", items: [], chips: ["Biryani for 6 people", "Healthy breakfast", "Party snacks", "Weekly staples under ₹1500"] } }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const last = useRef("");

  const send = async (t: string) => {
    if (!t.trim() || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setBusy(true);
    const reply = await askAssistant(t);
    setMsgs((m) => [...m, { role: "ai", text: reply.text, reply }]);
    setBusy(false);
  };
  useEffect(() => { if (aiOpen && aiPrompt && aiPrompt !== last.current) { last.current = aiPrompt; send(aiPrompt); } }, [aiOpen, aiPrompt]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  return (
    <>
      {!aiOpen && (
        <button onClick={() => openAI()} aria-label="Open AI assistant" className="fixed bottom-6 right-6 z-40 hidden h-14 animate-gradient items-center gap-2 rounded-full bg-ai px-5 font-bold text-primary-foreground shadow-2xl transition hover:scale-105 md:flex">
          <Sparkles className="h-5 w-5 animate-pulse" />Ask AI Chef
        </button>
      )}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-foreground/20 backdrop-blur-sm md:inset-auto md:bottom-6 md:right-6 md:bg-transparent md:backdrop-blur-none" onClick={closeAI}>
          <div onClick={(e) => e.stopPropagation()} className="h-[88vh] w-full animate-fade-up rounded-t-3xl bg-ai p-[2px] shadow-2xl animate-gradient md:h-[640px] md:w-[420px] md:rounded-3xl">
            <div className="flex h-full flex-col overflow-hidden rounded-t-[22px] bg-card md:rounded-[22px]">
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ai text-primary-foreground"><ChefHat className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1"><p className="font-extrabold">AI Chef</p><p className="text-xs text-muted-foreground">Recipes · smart lists · deals</p></div>
                <button aria-label="Close" onClick={closeAI} className="grid h-9 w-9 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {msgs.map((m, i) => m.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[80%] animate-fade-up rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">{m.text}</div>
                ) : (
                  <div key={i} className="animate-fade-up space-y-2">
                    <Reveal text={m.text} />
                    {!!m.reply?.items.length && (
                      <div className="rounded-2xl border bg-background p-2">
                        {m.reply.items.map(({ id, qty }) => { const p = byId(id); if (!p) return null; return (
                          <div key={id} className="flex items-center gap-2 p-1.5">
                            <ProductTile p={p} className="h-11 w-11 shrink-0 text-2xl" />
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.variants[0].label} × {qty} · {inr(p.variants[0].price * qty)}</p></div>
                            <div className="w-20 shrink-0"><Stepper p={p} v={0} /></div>
                          </div>
                        ); })}
                        <button onClick={() => { m.reply!.items.forEach(({ id, qty }) => { for (let k = 0; k < qty; k++) add(id); }); toast.success("All items added to cart"); }} className="mt-1 h-10 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground active:scale-95">
                          Add all to cart · {inr(m.reply.items.reduce((a, { id, qty }) => a + (byId(id)?.variants[0].price ?? 0) * qty, 0))}
                        </button>
                      </div>
                    )}
                    {i === msgs.length - 1 && !busy && m.reply && (
                      <div className="flex flex-wrap gap-2">{m.reply.chips.map((c) => <button key={c} onClick={() => send(c)} className="rounded-full border border-ai-from/40 px-3 py-1 text-xs font-semibold text-ai-from hover:bg-muted">{c}</button>)}</div>
                    )}
                  </div>
                ))}
                {busy && <div className="flex w-16 gap-1 rounded-2xl bg-muted p-3">{[0, 1, 2].map((k) => <span key={k} className="h-2 w-2 animate-bounce rounded-full bg-ai-from" style={{ animationDelay: `${k * 0.15}s` }} />)}</div>}
                <div ref={end} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t p-3">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. biryani for 6 people" className="h-11 min-w-0 flex-1 rounded-xl border bg-muted px-3 text-sm outline-none focus:border-ai-from" />
                <button aria-label="Send" disabled={busy} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ai text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
