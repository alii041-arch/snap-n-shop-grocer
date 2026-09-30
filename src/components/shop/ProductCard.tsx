import { useState } from "react";
import { Heart, Minus, Plus, Clock, Star, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { byId, discount, pairings, products, type Product } from "@/lib/data";
import { inr, useStore } from "@/lib/store";
import { substitute } from "@/lib/ai";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function flyToCart(from: HTMLElement, emoji: string) {
  const target = document.getElementById("cart-target");
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const el = document.createElement("div");
  el.textContent = emoji;
  el.style.cssText = `position:fixed;z-index:100;left:${a.left + a.width / 2 - 16}px;top:${a.top}px;font-size:32px;pointer-events:none;transition:transform .7s cubic-bezier(.5,-0.4,.7,1),opacity .7s;`;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = `translate(${b.left - a.left - a.width / 2 + 16}px, ${b.top - a.top}px) scale(.3)`;
    el.style.opacity = "0.4";
  });
  setTimeout(() => el.remove(), 750);
}

export function Stepper({ p, v, size = "md" }: { p: Product; v: number; size?: "md" | "lg" }) {
  const { qty, setQty, add } = useStore();
  const q = qty(p.id, v);
  const h = size === "lg" ? "h-11 text-base" : "h-9 text-sm";
  if (p.stock === 0) {
    const sub = substitute(p.id);
    return (
      <button
        onClick={(e) => { e.stopPropagation(); if (sub) { add(sub.id); toast.success(`Swapped for ${sub.name}`); } }}
        className={`${h} w-full rounded-xl border border-dashed border-ai-from/50 px-2 text-xs font-semibold text-ai-from transition active:scale-95`}
      >
        <Sparkles className="mr-1 inline h-3 w-3" />Swap similar
      </button>
    );
  }
  if (q === 0)
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          add(p.id, v);
          flyToCart(e.currentTarget, p.emoji);
          toast.success(`${p.name} added to cart`);
        }}
        className={`${h} w-full min-w-20 rounded-xl border-[1.5px] border-primary bg-primary-soft font-bold text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95`}
      >
        ADD
      </button>
    );
  return (
    <div onClick={(e) => e.stopPropagation()} className={`${h} flex w-full min-w-20 animate-bounce-in items-center justify-between rounded-xl bg-primary font-bold text-primary-foreground`}>
      <button aria-label="Decrease" onClick={() => setQty(p.id, v, q - 1)} className="grid h-full w-8 place-items-center active:scale-90"><Minus className="h-4 w-4" /></button>
      <span key={q} className="animate-flip">{q}</span>
      <button aria-label="Increase" onClick={() => add(p.id, v)} className="grid h-full w-8 place-items-center active:scale-90"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

export function ProductTile({ p, className = "" }: { p: Product; className?: string }) {
  const cat = p.category;
  return (
    <div className={`grid place-items-center rounded-xl bg-gradient-to-br from-primary-soft to-muted ${className}`} data-cat={cat}>
      <span className="select-none drop-shadow-sm transition-transform duration-500 group-hover:scale-110">{p.emoji}</span>
    </div>
  );
}

export function ProductCard({ p, why }: { p: Product; why?: string }) {
  const [v, setV] = useState(0);
  const [open, setOpen] = useState(false);
  const { wishlist, toggleWish } = useStore();
  const variant = p.variants[v];
  const off = discount(variant);
  const wished = wishlist.includes(p.id);
  return (
    <>
      <article
        onClick={() => setOpen(true)}
        className="group relative flex w-full cursor-pointer flex-col rounded-2xl border bg-card p-2.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative">
          <ProductTile p={p} className={`aspect-square text-6xl ${p.stock === 0 ? "grayscale" : ""}`} />
          {off > 0 && <span className="absolute left-0 top-2 rounded-r-lg bg-destructive px-2 py-0.5 text-[10px] font-extrabold text-destructive-foreground">{off}% OFF</span>}
          <button
            aria-label="Wishlist"
            onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
            className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-card/90 shadow-sm transition active:scale-75"
          >
            <Heart className={`h-4 w-4 transition ${wished ? "scale-110 fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
          {why && (
            <span title={why} className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-ai px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              <Sparkles className="h-3 w-3" />Why?
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold"><Clock className="h-3 w-3" />{p.eta} MINS</span>
          {p.tags[0] && <span className="rounded-md bg-accent/40 px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">{p.tags[0]}</span>}
        </div>
        <h3 className="mt-1.5 line-clamp-2 min-h-10 text-sm font-semibold leading-5">{p.name}</h3>
        <div className="mt-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
          {p.variants.map((x, i) => (
            <button key={i} onClick={() => setV(i)} className={`truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition ${i === v ? "border-primary bg-primary-soft text-primary" : "text-muted-foreground"}`}>{x.label}</button>
          ))}
        </div>
        {p.stock > 0 && p.stock <= 3 && <p className="mt-1 text-[10px] font-bold text-destructive">Only {p.stock} left</p>}
        {p.stock === 0 && <p className="mt-1 text-[10px] font-bold text-destructive">Out of stock</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="leading-tight">
            <div className="text-sm font-extrabold">{inr(variant.price)}</div>
            {variant.mrp > variant.price && <div className="text-xs text-muted-foreground line-through">{inr(variant.mrp)}</div>}
          </div>
          <div className="w-20"><Stepper p={p} v={v} /></div>
        </div>
      </article>
      <QuickView p={p} open={open} onOpenChange={setOpen} />
    </>
  );
}

function QuickView({ p, open, onOpenChange }: { p: Product; open: boolean; onOpenChange: (b: boolean) => void }) {
  const [v, setV] = useState(0);
  const similar = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const fbt = (pairings[p.id] ?? []).map(byId).filter(Boolean) as Product[];
  const n = p.nutrition;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl p-0 [&>button]:hidden">
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <ProductTile p={p} className="aspect-square text-[9rem]" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => <ProductTile key={i} p={p} className="aspect-square text-3xl opacity-80" />)}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary">{p.brand}</p>
                <DialogTitle className="text-2xl font-extrabold">{p.name}</DialogTitle>
              </div>
              <button aria-label="Close" onClick={() => onOpenChange(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 font-bold text-primary-foreground"><Star className="h-3 w-3 fill-current" />{p.rating.toFixed(1)}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />Delivery in {p.eta} mins</span>
            </div>
            <div className="mt-4 flex gap-2">
              {p.variants.map((x, i) => (
                <button key={i} onClick={() => setV(i)} className={`flex-1 rounded-xl border-2 p-2 text-left transition ${i === v ? "border-primary bg-primary-soft" : ""}`}>
                  <div className="text-xs text-muted-foreground">{x.label}</div>
                  <div className="font-bold">{inr(x.price)} <span className="text-xs font-normal text-muted-foreground line-through">{inr(x.mrp)}</span></div>
                </button>
              ))}
            </div>
            <div className="mt-4"><Stepper p={p} v={v} size="lg" /></div>
            <p className="mt-4 text-sm text-muted-foreground">{p.desc}</p>
            <table className="mt-4 w-full overflow-hidden rounded-xl text-sm">
              <tbody>
                {[["Energy", `${n.kcal} kcal`], ["Protein", `${n.protein} g`], ["Carbohydrates", `${n.carbs} g`], ["Fat", `${n.fat} g`]].map(([k, val]) => (
                  <tr key={k} className="odd:bg-muted"><td className="px-3 py-1.5">{k}</td><td className="px-3 py-1.5 text-right font-semibold">{val}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {fbt.length > 0 && <MiniRow title="Frequently bought together" items={fbt} />}
        <MiniRow title="Similar products" items={similar} />
      </DialogContent>
    </Dialog>
  );
}

function MiniRow({ title, items }: { title: string; items: Product[] }) {
  return (
    <div className="border-t px-5 py-4">
      <h4 className="mb-3 font-bold">{title}</h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((x) => (
          <div key={x.id} className="rounded-xl border p-2">
            <ProductTile p={x} className="aspect-square text-4xl" />
            <p className="mt-1 line-clamp-1 text-xs font-semibold">{x.name}</p>
            <div className="mt-1 flex items-center justify-between gap-1">
              <span className="text-xs font-bold">{inr(x.variants[0].price)}</span>
              <div className="w-16"><Stepper p={x} v={0} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
