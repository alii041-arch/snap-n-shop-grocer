import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Camera, ChevronDown, MapPin, Mic, Search, ShoppingCart, User, Zap, Moon, Sun, Home, LayoutGrid, Sparkles, Clock } from "lucide-react";
import { categories, products } from "@/lib/data";
import { inr, useStore } from "@/lib/store";
import { LocationModal, LoginModal, ScanModal, VoiceModal } from "./Modals";

const hints = ["milk", "Maggi", "tomatoes", "paneer", "chips", "atta", "coffee"];

function useTypewriter() {
  const [text, setText] = useState("");
  useEffect(() => {
    let i = 0, c = 0, del = false;
    const t = setInterval(() => {
      const w = hints[i % hints.length];
      if (!del) { c++; if (c > w.length + 6) del = true; }
      else { c--; if (c === 0) { del = false; i++; } }
      setText(w.slice(0, Math.min(c, w.length)));
    }, 110);
    return () => clearInterval(t);
  }, []);
  return text;
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0 || !q) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="bg-transparent font-extrabold text-primary">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

export function SearchBar() {
  const nav = useNavigate();
  const tw = useTypewriter();
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [focus, setFocus] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [voice, setVoice] = useState(false);
  const [scan, setScan] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setDq(q), 250); return () => clearTimeout(t); }, [q]);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem("fd-recent") || "[]")); } catch {} }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setFocus(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = (term: string) => {
    const r = [term, ...recent.filter((x) => x !== term)].slice(0, 5);
    setRecent(r);
    localStorage.setItem("fd-recent", JSON.stringify(r));
    setFocus(false);
    setQ(term);
    nav({ to: "/search", search: { q: term } });
  };
  const sug = useMemo(() => {
    if (!dq) return { cats: [], prods: [] };
    const l = dq.toLowerCase();
    return { cats: categories.filter((c) => c.name.toLowerCase().includes(l)).slice(0, 3), prods: products.filter((p) => p.name.toLowerCase().includes(l) || p.brand.toLowerCase().includes(l)).slice(0, 6) };
  }, [dq]);

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }} className="flex h-12 items-center gap-2 rounded-2xl border bg-muted/60 px-3 transition focus-within:border-primary focus-within:bg-card focus-within:shadow-lg">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="relative min-w-0 flex-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} aria-label="Search products" className="w-full bg-transparent text-sm outline-none" />
          {!q && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-sm text-muted-foreground">Search for "{tw}<span className="animate-pulse">|</span>"</span>}
        </div>
        <button type="button" aria-label="Voice search" onClick={() => setVoice(true)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-background"><Mic className="h-4 w-4" /></button>
        <button type="button" aria-label="AI scan" onClick={() => setScan(true)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ai-from hover:bg-background"><Camera className="h-4 w-4" /></button>
      </form>
      {focus && (dq || recent.length > 0) && (
        <div className="absolute inset-x-0 top-14 z-50 animate-fade-up overflow-hidden rounded-2xl border bg-popover p-2 shadow-2xl">
          {!dq && recent.map((r) => (
            <button key={r} onClick={() => go(r)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"><Clock className="h-4 w-4 text-muted-foreground" />{r}</button>
          ))}
          {sug.cats.map((c) => (
            <Link key={c.id} to="/category/$id" params={{ id: c.id }} onClick={() => setFocus(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"><span className="text-xl">{c.emoji}</span><span>in <Highlight text={c.name} q={dq} /></span></Link>
          ))}
          {sug.prods.map((p) => (
            <button key={p.id} onClick={() => go(p.name)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-lg">{p.emoji}</span>
              <span className="min-w-0 flex-1 truncate"><Highlight text={p.name} q={dq} /></span>
              <span className="text-xs font-bold">{inr(p.variants[0].price)}</span>
            </button>
          ))}
          {dq && !sug.prods.length && !sug.cats.length && <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matches — press Enter to ask AI</p>}
        </div>
      )}
      <VoiceModal open={voice} onOpenChange={setVoice} onResult={go} />
      <ScanModal open={scan} onOpenChange={setScan} />
    </div>
  );
}

export function Header() {
  const { itemCount, itemTotal, setCartOpen, bump, location, user } = useStore();
  const [loc, setLoc] = useState(false);
  const [login, setLogin] = useState(false);
  const [dark, setDark] = useState(false);
  const [bounce, setBounce] = useState(false);
  useEffect(() => { if (bump) { setBounce(true); const t = setTimeout(() => setBounce(false), 500); return () => clearTimeout(t); } }, [bump]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
        <Link to="/" className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-xl font-black text-accent-foreground">F</span>
          <span className="text-xl font-extrabold tracking-tight">fresh<span className="text-primary">dash</span></span>
        </Link>
        <button onClick={() => setLoc(true)} className="min-w-0 shrink-0 text-left md:border-l md:pl-5">
          <div className="flex items-center gap-1.5 text-sm font-extrabold">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative h-2 w-2 rounded-full bg-primary" /></span>
            <Zap className="h-4 w-4 fill-accent text-accent" />Delivery in 10 minutes
          </div>
          <div className="flex max-w-52 items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{location}</span><ChevronDown className="h-3 w-3 shrink-0" /></div>
        </button>
        <div className="hidden flex-1 md:block"><SearchBar /></div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button aria-label="Toggle theme" onClick={() => setDark(!dark)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted">{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
          <button onClick={() => setLogin(true)} className="hidden h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold hover:bg-muted sm:flex"><User className="h-4 w-4" />{user ? "Account" : "Login"}</button>
          <button id="cart-target" onClick={() => setCartOpen(true)} className={`hidden h-12 items-center gap-2 rounded-xl bg-primary px-4 text-primary-foreground shadow-lg transition hover:bg-primary-dark active:scale-95 md:flex ${bounce ? "animate-bounce-in" : ""}`}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount ? <span className="text-left text-xs font-bold leading-tight">{itemCount} items<br />{inr(itemTotal)}</span> : <span className="text-sm font-bold">My Cart</span>}
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><SearchBar /></div>
      <LocationModal open={loc} onOpenChange={setLoc} />
      <LoginModal open={login} onOpenChange={setLogin} />
    </header>
  );
}

export function BottomNav() {
  const { itemCount, setCartOpen, openAI, bump } = useStore();
  const items = [
    { icon: Home, label: "Home", to: "/" as const },
    { icon: LayoutGrid, label: "Categories", to: "/category/$id" as const, params: { id: "fruits-veg" } },
  ];
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((i) => (
        <Link key={i.label} to={i.to} params={i.params as never} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted-foreground [&.active]:text-primary" activeOptions={{ exact: true }}>
          <i.icon className="h-5 w-5" />{i.label}
        </Link>
      ))}
      <button onClick={() => openAI()} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold"><span className="-mt-6 grid h-12 w-12 animate-gradient place-items-center rounded-full bg-ai text-primary-foreground shadow-lg"><Sparkles className="h-5 w-5" /></span><span className="text-ai">AI Chef</span></button>
      <button id={undefined} onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted-foreground">
        <ShoppingCart className="h-5 w-5" />Cart
        {itemCount > 0 && <span key={bump} className="absolute right-4 top-1 grid h-4 min-w-4 animate-bounce-in place-items-center rounded-full bg-destructive px-1 text-[9px] text-destructive-foreground">{itemCount}</span>}
      </button>
      <Link to="/orders" className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted-foreground [&.active]:text-primary"><User className="h-5 w-5" />Account</Link>
    </nav>
  );
}
