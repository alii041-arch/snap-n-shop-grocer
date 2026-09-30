import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ChefHat, Clock, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { planMeals } from "@/lib/meal-planner.functions";
import type { MealPlan } from "@/lib/meal-planner.server";
import { byId } from "@/lib/data";
import { inr, useStore } from "@/lib/store";
import { ProductTile, Stepper } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Meal Planner — FreshDash AI" },
      { name: "description", content: "Describe your meal goals, diet and what's in your kitchen — AI builds recipes and a ready cart." },
      { property: "og:title", content: "AI Meal Planner — FreshDash AI" },
      { property: "og:description", content: "Personalised recipes and cart-ready groceries from your goals and pantry." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planner,
});

const DIETS = ["Vegetarian", "Vegan", "Gluten-free", "High protein", "Low carb", "Diabetic-friendly", "Jain", "Nut-free"];
const GOALS = ["Quick weeknight dinner", "High-protein breakfast", "Kids' lunchbox", "Weight-loss friendly week", "Festive feast"];

function Planner() {
  const run = useServerFn(planMeals);
  const { add } = useStore();
  const [goal, setGoal] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [onHand, setOnHand] = useState("");
  const [servings, setServings] = useState(2);
  const [budget, setBudget] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<MealPlan | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const r = await run({ data: { goal, diet, onHand, servings, budget: budget ? Number(budget) : null } });
      if (r.ok) setPlan(r.plan); else setError(r.error);
    } catch { setError("Couldn't reach AI Chef. Check your connection and try again."); }
    setBusy(false);
  };
  const addAll = (items: { id: string; qty: number }[]) => {
    items.forEach(({ id, qty }) => { for (let i = 0; i < qty; i++) add(id); });
    toast.success(`${items.length} items added to cart`);
  };
  const cost = (items: { id: string; qty: number }[]) => items.reduce((a, i) => a + (byId(i.id)?.variants[0].price ?? 0) * i.qty, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-28">
      <div className="animate-gradient rounded-3xl bg-ai p-6 text-primary-foreground shadow-xl md:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold opacity-90"><Sparkles className="h-4 w-4" />Lovable AI powered</p>
        <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">AI Meal Planner</h1>
        <p className="mt-1 max-w-xl opacity-90">Tell us your goal, diet and what's already in your kitchen. Get recipes and a cart in seconds.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="h-fit space-y-5 rounded-3xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <div>
            <label className="text-sm font-bold">Meal goal</label>
            <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} placeholder="e.g. Protein-rich dinners for the week, ready in 30 mins" className="mt-2 w-full rounded-xl border bg-muted p-3 text-sm outline-none focus:border-ai-from" />
            <div className="mt-2 flex flex-wrap gap-1.5">{GOALS.map((g) => <button type="button" key={g} onClick={() => setGoal(g)} className="rounded-full border px-2.5 py-1 text-xs hover:border-ai-from">{g}</button>)}</div>
          </div>
          <div>
            <label className="text-sm font-bold">Dietary needs</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DIETS.map((d) => { const on = diet.includes(d); return <button type="button" key={d} onClick={() => setDiet(on ? diet.filter((x) => x !== d) : [...diet, d])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? "border-primary bg-primary text-primary-foreground" : ""}`}>{d}</button>; })}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold">Ingredients on hand</label>
            <textarea value={onHand} onChange={(e) => setOnHand(e.target.value)} rows={2} placeholder="e.g. rice, 3 eggs, spinach, curd" className="mt-2 w-full rounded-xl border bg-muted p-3 text-sm outline-none focus:border-ai-from" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-bold">Servings</label><input type="number" min={1} max={20} value={servings} onChange={(e) => setServings(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="mt-2 h-11 w-full rounded-xl border bg-muted px-3 text-sm outline-none" /></div>
            <div><label className="text-sm font-bold">Budget (₹)</label><input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Optional" className="mt-2 h-11 w-full rounded-xl border bg-muted px-3 text-sm outline-none" /></div>
          </div>
          <button disabled={busy || (!goal && !onHand && !diet.length)} className="flex h-12 w-full animate-gradient items-center justify-center gap-2 rounded-xl bg-ai font-bold text-primary-foreground shadow-lg transition active:scale-95 disabled:opacity-50">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Planning your meals…</> : <><ChefHat className="h-4 w-4" />Get recommendations</>}
          </button>
          {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{error}</p>}
        </form>

        <section className="min-w-0 space-y-6">
          {busy && !plan && <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-40 rounded-3xl" />)}</div>}
          {!busy && !plan && (
            <div className="grid h-full min-h-72 place-items-center rounded-3xl border border-dashed p-8 text-center">
              <div><ChefHat className="mx-auto h-16 w-16 animate-float text-ai-from" strokeWidth={1.3} /><p className="mt-3 font-bold">Your personalised plan will appear here</p><p className="text-sm text-muted-foreground">Fill in at least one field and tap "Get recommendations".</p></div>
            </div>
          )}
          {plan && (
            <>
              <p className="animate-fade-up rounded-2xl bg-primary-soft p-4 text-sm font-medium">{plan.summary}</p>
              {plan.recipes.map((r, i) => (
                <article key={i} className="animate-fade-up overflow-hidden rounded-3xl border bg-card shadow-sm" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-start gap-4 p-5">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent/40 text-4xl">{r.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-extrabold">{r.name}</h3>
                      <p className="mt-0.5 flex gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</span><span className="flex items-center gap-1"><Users className="h-3 w-3" />Serves {r.servings}</span></p>
                      <p className="mt-2 text-sm text-muted-foreground">{r.why}</p>
                      {r.usesOnHand.length > 0 && <p className="mt-2 text-xs"><b>Uses what you have:</b> {r.usesOnHand.join(", ")}</p>}
                    </div>
                  </div>
                  <ol className="list-decimal space-y-1 px-10 pb-4 text-sm">{r.steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
                  {r.ingredients.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-t bg-muted/40 p-4">
                      {r.ingredients.map((ing) => { const p = byId(ing.id)!; return <span key={ing.id} className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium">{p.emoji} {p.name} ×{ing.qty}</span>; })}
                      <button onClick={() => addAll(r.ingredients)} className="ml-auto h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground active:scale-95">Add ingredients · {inr(cost(r.ingredients))}</button>
                    </div>
                  )}
                </article>
              ))}
              {plan.products.length > 0 && (
                <div className="rounded-3xl border bg-card p-5">
                  <div className="mb-3 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 font-extrabold"><Sparkles className="h-4 w-4 text-ai-from" />Recommended for you</h3><button onClick={() => addAll(plan.products)} className="h-9 rounded-xl border border-primary px-3 text-sm font-bold text-primary">Add all · {inr(cost(plan.products))}</button></div>
                  <div className="divide-y">
                    {plan.products.map((x) => { const p = byId(x.id)!; return (
                      <div key={x.id} className="flex items-center gap-3 py-2.5">
                        <ProductTile p={p} className="h-12 w-12 shrink-0 text-2xl" />
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name} <span className="font-normal text-muted-foreground">· {p.variants[0].label}</span></p><p className="truncate text-xs text-muted-foreground">{x.reason}</p></div>
                        <span className="text-sm font-bold">{inr(p.variants[0].price)}</span>
                        <div className="w-20 shrink-0"><Stepper p={p} v={0} /></div>
                      </div>
                    ); })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
