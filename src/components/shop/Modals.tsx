import { useEffect, useRef, useState } from "react";
import { Crosshair, Home, Briefcase, MapPin, Mic, Upload, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore, inr } from "@/lib/store";
import { matchList } from "@/lib/ai";
import type { Product } from "@/lib/data";

export function LocationModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { set } = useStore();
  const [q, setQ] = useState("");
  const pick = (l: string) => { set({ location: l }); onOpenChange(false); toast.success("Delivery location updated"); };
  const saved = [{ icon: Home, name: "Home", addr: "HSR Layout, Bengaluru" }, { icon: Briefcase, name: "Work", addr: "Koramangala 5th Block, Bengaluru" }];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogTitle className="text-xl font-extrabold">Choose delivery location</DialogTitle>
        <div className="grid h-32 place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-muted"><MapPin className="h-10 w-10 animate-float text-primary" /></div>
        <button onClick={() => pick("Current location · Indiranagar, Bengaluru")} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground active:scale-95"><Crosshair className="h-4 w-4" />Use current location</button>
        <form onSubmit={(e) => { e.preventDefault(); if (q) pick(q); }}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search area, street…" className="h-12 w-full rounded-xl border bg-muted px-4 text-sm outline-none focus:border-primary" /></form>
        <div className="space-y-2">
          {saved.map((s) => (
            <button key={s.name} onClick={() => pick(s.addr)} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:border-primary">
              <s.icon className="h-5 w-5 text-primary" /><div><div className="text-sm font-bold">{s.name}</div><div className="text-xs text-muted-foreground">{s.addr}</div></div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { set } = useStore();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { if (step !== "otp" || timer <= 0) return; const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }, [step, timer]);
  const setDigit = (i: number, val: string) => {
    const digits = val.replace(/\D/g, "");
    const next = [...otp];
    if (digits.length > 1) { digits.slice(0, 6).split("").forEach((d, k) => { if (i + k < 6) next[i + k] = d; }); setOtp(next); refs.current[Math.min(5, i + digits.length)]?.focus(); }
    else { next[i] = digits; setOtp(next); if (digits && i < 5) refs.current[i + 1]?.focus(); }
    if (next.every(Boolean)) { set({ user: phone }); toast.success("Logged in successfully"); onOpenChange(false); setStep("phone"); setOtp(Array(6).fill("")); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-2xl font-black text-accent-foreground">F</div>
        <DialogTitle className="text-center text-xl font-extrabold">{step === "phone" ? "India's last-minute app" : "Enter verification code"}</DialogTitle>
        <DialogDescription className="text-center">{step === "phone" ? "Log in or sign up" : `Sent to +91 ${phone}`}</DialogDescription>
        {step === "phone" ? (
          <form onSubmit={(e) => { e.preventDefault(); if (phone.length === 10) { setStep("otp"); setTimer(30); setTimeout(() => refs.current[0]?.focus(), 50); } }} className="space-y-3">
            <div className="flex h-12 items-center rounded-xl border px-3 focus-within:border-primary"><span className="mr-2 font-semibold">+91</span><input inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter mobile number" className="flex-1 bg-transparent outline-none" /></div>
            <button disabled={phone.length !== 10} className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground transition disabled:opacity-40 active:scale-95">Continue</button>
            <div className="grid grid-cols-2 gap-2">
              {["Google", "Apple"].map((s) => <button type="button" key={s} onClick={() => { set({ user: s }); onOpenChange(false); toast.success(`Signed in with ${s}`); }} className="h-11 rounded-xl border text-sm font-semibold hover:bg-muted">{s}</button>)}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {otp.map((d, i) => (
                <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" aria-label={`Digit ${i + 1}`} onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => { if (e.key === "Backspace" && !d && i) refs.current[i - 1]?.focus(); }} className="h-12 w-11 rounded-xl border-2 text-center text-lg font-bold outline-none focus:border-primary" />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">{timer > 0 ? `Resend code in ${timer}s` : <button onClick={() => setTimer(30)} className="font-bold text-primary">Resend code</button>}</p>
            <p className="text-center text-xs text-muted-foreground">Demo: enter any 6 digits</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VoiceModal({ open, onOpenChange, onResult }: { open: boolean; onOpenChange: (b: boolean) => void; onResult: (t: string) => void }) {
  const [heard, setHeard] = useState("");
  useEffect(() => {
    if (!open) return;
    setHeard("");
    const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
    if (!SR) { const t = setTimeout(() => { onOpenChange(false); onResult("milk"); }, 2200); return () => clearTimeout(t); }
    const r = new SR();
    r.lang = "en-IN";
    r.onresult = (e) => { const t = e.results[0][0].transcript; setHeard(t); setTimeout(() => { onOpenChange(false); onResult(t); }, 500); };
    r.onerror = () => onOpenChange(false);
    r.start();
    return () => r.abort();
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl text-center">
        <DialogTitle className="text-xl font-extrabold">Listening…</DialogTitle>
        <div className="mx-auto grid h-24 w-24 animate-pulse-ring place-items-center rounded-full bg-primary text-primary-foreground"><Mic className="h-10 w-10" /></div>
        <div className="flex h-10 items-center justify-center gap-1">
          {Array.from({ length: 9 }).map((_, i) => <span key={i} className="h-full w-1.5 rounded-full bg-primary" style={{ animation: `wave 0.9s ${i * 0.1}s ease-in-out infinite` }} />)}
        </div>
        <p className="text-muted-foreground">{heard || 'Try saying "tomatoes" or "Amul butter"'}</p>
      </DialogContent>
    </Dialog>
  );
}
type SpeechRec = { lang: string; start: () => void; abort: () => void; onresult: (e: { results: { transcript: string }[][] }) => void; onerror: () => void };

export function ScanModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogTitle className="flex items-center gap-2 text-xl font-extrabold"><Sparkles className="h-5 w-5 text-ai-from" /><span className="text-ai">Smart List</span></DialogTitle>
        <DialogDescription>Upload a photo of your handwritten list or paste it below — AI will match products.</DialogDescription>
        <SmartList onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function SmartList({ onDone }: { onDone?: () => void }) {
  const { add } = useStore();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ line: string; product?: Product; confidence: number; on: boolean }[] | null>(null);
  const run = async (t: string) => { setBusy(true); setRes(null); const r = await matchList(t); setRes(r.map((x) => ({ ...x, on: !!x.product && x.confidence >= 50 }))); setBusy(false); };
  return (
    <div className="space-y-3">
      {!res && (
        <>
          <label className="relative flex h-28 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed text-sm text-muted-foreground hover:border-ai-from">
            <Upload className="h-6 w-6" />Upload a photo
            <input type="file" accept="image/*" className="hidden" onChange={() => { setText("2 kg onion\nmilk\nbrown bread\neggs\nmaggi\ncoriander"); run("2 kg onion\nmilk\nbrown bread\neggs\nmaggi\ncoriander"); }} />
            {busy && <span className="absolute inset-x-0 h-1 animate-[float_1.2s_ease-in-out_infinite] bg-ai shadow-lg" />}
          </label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder={"milk\n1 kg tomato\npaneer, butter"} className="w-full rounded-xl border bg-muted p-3 text-sm outline-none focus:border-ai-from" />
          <button disabled={!text || busy} onClick={() => run(text)} className="h-11 w-full animate-gradient rounded-xl bg-ai font-bold text-primary-foreground disabled:opacity-50">{busy ? "Scanning…" : "Match products"}</button>
        </>
      )}
      {res && (
        <>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {res.map((r, i) => (
              <button key={i} onClick={() => r.product && setRes(res.map((x, k) => (k === i ? { ...x, on: !x.on } : x)))} className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${r.on ? "border-primary bg-primary-soft" : ""}`}>
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-card text-xl">{r.product?.emoji ?? "❓"}</span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{r.product?.name ?? "No match"}</div><div className="text-xs text-muted-foreground">“{r.line}” · {r.confidence}% match</div></div>
                {r.product && <span className="text-sm font-bold">{inr(r.product.variants[0].price)}</span>}
                <span className={`grid h-5 w-5 place-items-center rounded ${r.on ? "bg-primary text-primary-foreground" : "border"}`}>{r.on && <Check className="h-3 w-3" />}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRes(null)} className="h-11 flex-1 rounded-xl border font-semibold">Edit list</button>
            <button onClick={() => { const on = res.filter((r) => r.on && r.product); on.forEach((r) => add(r.product!.id)); toast.success(`${on.length} items added to cart`); onDone?.(); setRes(null); setText(""); }} className="h-11 flex-1 rounded-xl bg-primary font-bold text-primary-foreground">Add {res.filter((r) => r.on).length} to cart</button>
          </div>
        </>
      )}
    </div>
  );
}
