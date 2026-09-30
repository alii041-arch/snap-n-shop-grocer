import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Clock, Sparkles, Tag, X, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { byId, type Product } from "@/lib/data";
import { FREE_DELIVERY, inr, useStore } from "@/lib/store";
import { forgotSomething } from "@/lib/ai";
import { Stepper, ProductTile } from "./ProductCard";

export function useBill(tip = 0, coupon = 0) {
  const { itemTotal, mrpTotal } = useStore();
  const delivery = itemTotal >= FREE_DELIVERY || itemTotal === 0 ? 0 : 25;
  const handling = itemTotal ? 4 : 0;
  const toPay = Math.max(0, itemTotal + delivery + handling + tip - coupon);
  return { itemTotal, mrpTotal, delivery, handling, toPay, saved: mrpTotal - itemTotal + coupon };
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} className="absolute top-0 h-2 w-1.5 animate-confetti rounded-sm" style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.08}s`, background: `var(--chart-${(i % 5) + 1})` }} />
      ))}
    </div>
  );
}

export function NutritionRing({ lines }: { lines: { p: Product; qty: number }[] }) {
  const t = lines.reduce((a, { p, qty }) => ({ protein: a.protein + p.nutrition.protein * qty, carbs: a.carbs + p.nutrition.carbs * qty, fat: a.fat + p.nutrition.fat * qty }), { protein: 0, carbs: 0, fat: 0 });
  const sum = t.protein + t.carbs + t.fat || 1;
  const segs = [["Protein", t.protein, "var(--chart-1)"], ["Carbs", t.carbs, "var(--chart-2)"], ["Fat", t.fat, "var(--chart-3)"]] as const;
  let acc = 0;
  const score = Math.min(95, Math.round(50 + (t.protein / sum) * 120 - (t.fat / sum) * 40));
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
      <svg viewBox="0 0 42 42" className="h-20 w-20 -rotate-90">
        {segs.map(([k, v, c]) => { const pct = (v / sum) * 100; const el = <circle key={k} cx="21" cy="21" r="15.9" fill="none" stroke={c} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc} />; acc += pct; return el; })}
      </svg>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm font-bold"><Sparkles className="h-4 w-4 text-ai-from" />Health score <span className="text-ai">{score}/100</span></div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">{segs.map(([k, v, c]) => <span key={k} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{k} {Math.round((v / sum) * 100)}%</span>)}</div>
        <p className="mt-1 text-xs text-muted-foreground">{score > 70 ? "Nicely balanced basket 💪" : "Add some fruits or protein for balance"}</p>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, itemCount, add } = useStore();
  const nav = useNavigate();
  const [tip, setTip] = useState(0);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(0);
  const bill = useBill(tip, coupon);
  const lines = cart.map((l) => ({ l, p: byId(l.id)! })).filter((x) => x.p);
  const pct = Math.min(100, (bill.itemTotal / FREE_DELIVERY) * 100);
  const [boom, setBoom] = useState(false);
  const prev = useRef(pct);
  useEffect(() => { if (pct >= 100 && prev.current < 100 && cartOpen) { setBoom(true); setTimeout(() => setBoom(false), 1600); } prev.current = pct; }, [pct, cartOpen]);
  const forgot = forgotSomething(cart.map((c) => c.id));
  const apply = (c: string) => { const up = c.toUpperCase(); if (up === "FRESH50" && bill.itemTotal >= 299) { setCoupon(50); toast.success("FRESH50 applied — ₹50 off"); } else if (up === "FIRST20") { setCoupon(Math.round(bill.itemTotal * 0.2)); toast.success("FIRST20 applied"); } else toast.error("Coupon not applicable"); };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 bg-background p-0 sm:max-w-md [&>button]:hidden">
        {boom && <Confetti />}
        <div className="flex items-center justify-between border-b bg-card px-4 py-3">
          <div>
            <SheetTitle className="text-lg font-extrabold">My Cart</SheetTitle>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />Delivery in 10 minutes · {itemCount} items</p>
          </div>
          <button aria-label="Close cart" onClick={() => setCartOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBasket className="h-24 w-24 animate-float text-primary" strokeWidth={1.2} />
            <h3 className="text-lg font-extrabold">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Let our AI chef fill it up, or browse fresh picks.</p>
            <button onClick={() => setCartOpen(false)} className="h-11 rounded-xl bg-primary px-6 font-bold text-primary-foreground">Start shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="rounded-2xl border bg-card p-3">
                <p className="text-sm font-semibold">{pct >= 100 ? "🎉 Yay! You got FREE delivery" : `Add ${inr(FREE_DELIVERY - bill.itemTotal)} more for FREE delivery`}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="divide-y rounded-2xl border bg-card">
                {lines.map(({ l, p }) => (
                  <div key={p.id + l.v} className="flex animate-fade-up items-center gap-3 p-3">
                    <ProductTile p={p} className="h-14 w-14 shrink-0 text-3xl" />
                    <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.variants[l.v].label}</p></div>
                    <div className="flex w-20 shrink-0 flex-col items-end gap-1"><Stepper p={p} v={l.v} /><span className="text-sm font-bold">{inr(p.variants[l.v].price * l.qty)}</span></div>
                  </div>
                ))}
              </div>
              <NutritionRing lines={lines.map(({ l, p }) => ({ p, qty: l.qty }))} />
              <div className="rounded-2xl border bg-card p-3">
                <p className="mb-2 flex items-center gap-1 text-sm font-bold"><Sparkles className="h-4 w-4 text-ai-from" /><span className="text-ai">Forgot something?</span></p>
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {forgot.map((p) => (
                    <div key={p.id} className="w-28 shrink-0 rounded-xl border p-2">
                      <ProductTile p={p} className="aspect-square text-3xl" />
                      <p className="mt-1 line-clamp-1 text-xs font-semibold">{p.name}</p>
                      <button onClick={() => add(p.id)} className="mt-1 h-7 w-full rounded-lg border border-primary text-xs font-bold text-primary">+ {inr(p.variants[0].price)}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border bg-card p-3">
                <form onSubmit={(e) => { e.preventDefault(); apply(code); }} className="flex gap-2"><div className="flex flex-1 items-center gap-2 rounded-xl border px-3"><Tag className="h-4 w-4 text-primary" /><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code" className="h-10 w-full bg-transparent text-sm outline-none" /></div><button className="rounded-xl px-3 text-sm font-bold text-primary">Apply</button></form>
                <div className="mt-2 flex gap-2">{["FRESH50", "FIRST20"].map((c) => <button key={c} onClick={() => apply(c)} className="rounded-lg border border-dashed border-primary px-2 py-1 text-xs font-bold text-primary">{c}</button>)}</div>
              </div>
              <div className="rounded-2xl border bg-card p-3 text-sm">
                <h4 className="mb-2 font-bold">Bill details</h4>
                {[["Item total", bill.mrpTotal, bill.itemTotal], ["Delivery fee", 25, bill.delivery], ["Handling fee", null, bill.handling], ...(coupon ? [["Coupon discount", null, -coupon]] : []), ...(tip ? [["Delivery tip", null, tip]] : [])].map(([k, was, now]) => (
                  <div key={k as string} className="flex justify-between py-1"><span className="text-muted-foreground">{k}</span><span>{was !== null && was !== now && <s className="mr-1 text-muted-foreground">{inr(was as number)}</s>}{now === 0 ? <b className="text-primary">FREE</b> : inr(now as number)}</span></div>
                ))}
                <div className="mt-1 flex justify-between border-t pt-2 font-extrabold"><span>To pay</span><span>{inr(bill.toPay)}</span></div>
                {bill.saved > 0 && <p className="mt-2 rounded-lg bg-primary-soft px-2 py-1 text-center text-xs font-bold text-primary">You're saving {inr(bill.saved)} on this order</p>}
              </div>
              <div className="rounded-2xl border bg-card p-3">
                <h4 className="text-sm font-bold">Tip your delivery partner</h4>
                <div className="mt-2 flex gap-2">{[10, 20, 30, 50].map((t) => <button key={t} onClick={() => setTip(tip === t ? 0 : t)} className={`h-9 flex-1 rounded-xl border text-sm font-semibold transition ${tip === t ? "border-primary bg-primary-soft text-primary" : ""}`}>{inr(t)}</button>)}</div>
              </div>
            </div>
            <div className="border-t bg-card p-3">
              <button onClick={() => { setCartOpen(false); nav({ to: "/checkout" }); }} className="flex h-14 w-full items-center justify-between rounded-2xl bg-primary px-4 text-primary-foreground shadow-lg transition hover:bg-primary-dark active:scale-[.98]">
                <span className="text-left leading-tight"><b className="block">{inr(bill.toPay)}</b><span className="text-xs opacity-90">TOTAL</span></span>
                <span className="flex items-center font-bold">Proceed to Pay <ChevronRight className="h-5 w-5" /></span>
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
