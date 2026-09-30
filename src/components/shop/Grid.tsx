import type { Product } from "@/lib/data";
import { ProductCard } from "./ProductCard";

export function Grid({ items }: { items: Product[] }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>;
}
