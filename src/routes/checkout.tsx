import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { inr, useStore } from "@/lib/store";
import { useBill } from "@/components/shop/CartDrawer";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — FreshDash AI" }, { name: "description", content: "Complete your FreshDash AI order." }, { property: "og:title", content: "Checkout — FreshDash AI" }, { property: "og:description", content: "Complete your order." }] }),
  component: Checkout,
});

function Checkout() {
  const { location, placeOrder, itemCount } = useStore();
  const bill = useBill();
  const nav = useNavigate();
  const [pay, setPay] = useState("UPI");
  return (
    <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 pb-28 md:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-4"><h2 className="font-bold">Deliver to</h2><p className="text-sm text-muted-foreground">{location}</p></div>
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="mb-2 font-bold">Payment</h2>
          {["UPI", "Card", "Cash on delivery", "Wallet"].map((m) => <label key={m} className={`mb-2 flex items-center gap-2 rounded-xl border p-3 text-sm ${pay === m ? "border-primary bg-primary-soft" : ""}`}><input type="radio" checked={pay === m} onChange={() => setPay(m)} />{m}</label>)}
        </div>
      </div>
      <div className="h-fit rounded-2xl border bg-card p-4">
        <p className="text-sm">{itemCount} items</p>
        <p className="mt-1 text-2xl font-extrabold">{inr(bill.toPay)}</p>
        <button disabled={!itemCount} onClick={() => { placeOrder(bill.toPay); toast.success("Order placed!"); nav({ to: "/orders" }); }} className="mt-4 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-50">Place order</button>
      </div>
    </main>
  );
}
