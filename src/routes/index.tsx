import { createFileRoute, Link } from "@tanstack/react-router";
import { ChefHat, Sparkles } from "lucide-react";
import { categories, products, recipes, byId } from "@/lib/data";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { ProductCard } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FreshDash AI — Groceries in 10 minutes" },
      { name: "description", content: "AI-powered grocery delivery: fresh produce, daily essentials and smart meal planning in minutes." },
      { property: "og:title", content: "FreshDash AI — Groceries in 10 minutes" },
      { property: "og:description", content: "Smart grocery shopping with an AI chef and 10-minute delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Rail({ title, items }: { title: string; items: typeof products }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">{items.map((p) => <div key={p.id} className="w-44 shrink-0 snap-start"><ProductCard p={p} /></div>)}</div>
    </section>
  );
}

function Home() {
  const { openAI, add } = useStore();
  return (
    <main className="mx-auto max-w-7xl px-4 py-5 pb-28">
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="animate-fade-up rounded-3xl bg-primary p-7 text-primary-foreground shadow-xl">
          <p className="text-sm font-semibold opacity-90">Fresh Fruits & Veg</p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Farm-fresh, at your door in 10 minutes</h1>
          <p className="mt-2 opacity-90">Up to 20% off on seasonal picks</p>
          <Link to="/category/$id" params={{ id: "fruits-veg" }} className="mt-5 inline-flex h-11 items-center rounded-xl bg-accent px-5 font-bold text-accent-foreground">Shop now</Link>
        </div>
        <Link to="/planner" className="group animate-fade-up animate-gradient rounded-3xl bg-ai p-7 text-primary-foreground shadow-xl transition hover:-translate-y-1">
          <ChefHat className="h-9 w-9" />
          <h2 className="mt-3 text-2xl font-extrabold">AI Meal Planner</h2>
          <p className="mt-1 opacity-90">Share your goals, diet and pantry — get recipes and a ready cart.</p>
          <span className="mt-4 inline-flex items-center gap-1 font-bold">Try it <Sparkles className="h-4 w-4" /></span>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["Dinner for 4", "Healthy breakfast", "Party snacks", "Weekly staples under ₹1500"].map((c) => <button key={c} onClick={() => openAI(c)} className="rounded-full border border-ai-from/40 bg-card px-3 py-1.5 text-sm font-semibold text-ai-from">{c}</button>)}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-extrabold">Shop by category</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
          {categories.map((c) => (
            <Link key={c.id} to="/category/$id" params={{ id: c.id }} className="wobble-hover flex flex-col items-center gap-1.5 text-center">
              <span className="wobble-target grid aspect-square w-full place-items-center rounded-2xl text-4xl" style={{ background: c.tint }}>{c.emoji}</span>
              <span className="text-xs font-semibold leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <Rail title="Trending near you" items={products.filter((p) => p.tags.includes("Bestseller"))} />
      <Rail title="Fresh & seasonal" items={products.filter((p) => p.category === "fruits-veg")} />

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-extrabold">Cook tonight</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-4">
              <span className="text-4xl">{r.emoji}</span>
              <h3 className="mt-2 font-bold">{r.name}</h3>
              <p className="text-xs text-muted-foreground">{r.time} · Serves {r.serves} · {r.items.length} items</p>
              <button onClick={() => { r.items.forEach((id) => byId(id) && add(id)); toast.success("Ingredients added"); }} className="mt-3 h-10 w-full rounded-xl bg-primary-soft text-sm font-bold text-primary">Add all ingredients</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
