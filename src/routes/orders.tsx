import { createFileRoute } from "@tanstack/react-router";
import { inr, useStore } from "@/lib/store";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "My Orders — FreshDash AI" }, { name: "description", content: "Your FreshDash AI order history." }, { property: "og:title", content: "My Orders — FreshDash AI" }, { property: "og:description", content: "Order history." }] }),
  component: Orders,
});

function Orders() {
  const { orders } = useStore();
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 pb-28">
      <h1 className="mb-4 text-xl font-extrabold">My Orders</h1>
      {!orders.length && <p className="text-muted-foreground">No orders yet.</p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
            <div><p className="font-bold">#{o.id}</p><p className="text-xs text-muted-foreground">{new Date(o.at).toLocaleString()} · {o.lines.length} items</p></div>
            <span className="font-extrabold">{inr(o.total)}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
