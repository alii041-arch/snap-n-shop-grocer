import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { products } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Grid } from "@/components/shop/Grid";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({ meta: [{ title: "Search — FreshDash AI" }, { name: "description", content: "Search groceries and essentials on FreshDash AI." }, { property: "og:title", content: "Search — FreshDash AI" }, { property: "og:description", content: "Find groceries fast." }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const { openAI } = useStore();
  const l = q.toLowerCase();
  const items = products.filter((p) => p.name.toLowerCase().includes(l) || p.brand.toLowerCase().includes(l) || p.category.includes(l));
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 pb-28">
      <h1 className="mb-4 text-xl font-extrabold">Results for "{q}" <span className="text-sm font-normal text-muted-foreground">({items.length})</span></h1>
      {items.length ? <Grid items={items} /> : (
        <div className="py-16 text-center"><p className="text-5xl">🔍</p><p className="mt-3 font-bold">No products found</p><button onClick={() => openAI(q)} className="mt-4 h-11 rounded-xl bg-ai px-5 font-bold text-primary-foreground">Try AI Assistant</button></div>
      )}
    </main>
  );
}
