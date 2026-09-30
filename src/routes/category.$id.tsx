import { createFileRoute, Link } from "@tanstack/react-router";
import { categories, inCategory } from "@/lib/data";
import { Grid } from "@/components/shop/Grid";

export const Route = createFileRoute("/category/$id")({
  head: ({ params }) => {
    const n = categories.find((c) => c.id === params.id)?.name ?? "Category";
    return { meta: [{ title: `${n} — FreshDash AI` }, { name: "description", content: `Shop ${n} delivered in 10 minutes.` }, { property: "og:title", content: `${n} — FreshDash AI` }, { property: "og:description", content: `Shop ${n} delivered in 10 minutes.` }] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { id } = Route.useParams();
  return (
    <main className="mx-auto flex max-w-7xl gap-4 px-4 py-6 pb-28">
      <aside className="sticky top-24 hidden h-fit w-48 shrink-0 space-y-1 md:block">
        {categories.map((c) => (
          <Link key={c.id} to="/category/$id" params={{ id: c.id }} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${c.id === id ? "bg-primary-soft text-primary" : "hover:bg-muted"}`}><span>{c.emoji}</span>{c.name}</Link>
        ))}
      </aside>
      <div className="min-w-0 flex-1">
        <h1 className="mb-4 text-xl font-extrabold">{categories.find((c) => c.id === id)?.name}</h1>
        <Grid items={inCategory(id)} />
      </div>
    </main>
  );
}
