// Mock AI service layer — swap bodies for real LLM calls later.
import { products, recipes, byId, pairings, type Product } from "./data";

const wait = () => new Promise((r) => setTimeout(r, 600 + Math.random() * 600));

export type AIReply = { text: string; items: { id: string; qty: number }[]; chips: string[] };

function find(words: string[]) {
  return products.filter((p) => words.some((w) => p.name.toLowerCase().includes(w) || p.category.includes(w)));
}

export async function askAssistant(prompt: string): Promise<AIReply> {
  await wait();
  const q = prompt.toLowerCase();
  const people = Number(q.match(/(\d+)\s*(people|persons|guests)?/)?.[1]) || 4;
  const mult = Math.max(1, Math.round(people / 4));
  const recipe = recipes.find((r) => q.includes(r.name.toLowerCase().split(" ")[0]) || q.includes(r.id.split("-")[0]) || q.includes(r.id.split("-")[1] ?? "@@"));
  if (recipe) {
    return {
      text: `Here's everything you need for **${recipe.name}** for ${people} people. I've scaled the quantities and picked the best-value options.`,
      items: recipe.items.map((id) => ({ id, qty: mult })),
      chips: ["Make it healthier", "Add a dessert", "Cheaper alternatives"],
    };
  }
  if (q.includes("healthy") || q.includes("breakfast") || q.includes("meal plan")) {
    return {
      text: "A balanced week starts here: high-protein breakfasts, fresh produce and wholesome staples — all within budget.",
      items: ["rolled-oats", "greek-yogurt", "banana-robusta", "roasted-almonds", "farm-fresh-eggs", "multigrain-bread", "avocado"].map((id) => ({ id, qty: 1 })),
      chips: ["Vegan version", "Under ₹1000", "Add fruits"],
    };
  }
  if (q.includes("party") || q.includes("snack")) {
    return {
      text: `Party mode on 🎉 Snacks and drinks for about ${people} guests.`,
      items: ["lay-s-classic-salted", "haldiram-s-bhujia", "popcorn-butter", "coca-cola", "dairy-milk-silk", "paper-boat-aamras"].map((id) => ({ id, qty: mult + 1 })),
      chips: ["Add healthy snacks", "More drinks", "Dips & sauces"],
    };
  }
  if (q.includes("staple") || q.includes("weekly") || q.includes("1500")) {
    return {
      text: "Your weekly staples, optimised to stay under ₹1500.",
      items: ["aashirvaad-atta", "india-gate-basmati-rice", "toor-dal", "amul-taaza-milk", "onion", "potato", "fresh-tomato", "fortune-sunflower-oil"].map((id) => ({ id, qty: 1 })),
      chips: ["Add cleaning supplies", "Add fruits", "Reduce budget"],
    };
  }
  const hits = find(q.split(/\W+/).filter((w) => w.length > 2)).slice(0, 6);
  if (hits.length) return { text: "I found these for you:", items: hits.map((p) => ({ id: p.id, qty: 1 })), chips: ["Show cheaper", "Similar items"] };
  return {
    text: "I can plan meals, build shopping lists and find deals. Try “biryani for 6 people” or “healthy breakfast”.",
    items: [],
    chips: ["Biryani for 6 people", "Healthy breakfast", "Party snacks", "Weekly staples under ₹1500"],
  };
}

export async function matchList(text: string) {
  await wait();
  return text
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const words = line.toLowerCase().replace(/\d+\s*(kg|g|l|ml|pcs)?/g, "").split(/\W+/).filter((w) => w.length > 2);
      let best: Product | undefined;
      let score = 0;
      for (const p of products) {
        const n = p.name.toLowerCase();
        const s = words.filter((w) => n.includes(w)).length / Math.max(1, words.length);
        if (s > score) { score = s; best = p; }
      }
      return { line, product: best, confidence: Math.round(score * 100) };
    });
}

export async function recommend(): Promise<{ product: Product; why: string }[]> {
  await wait();
  const whys = ["You often buy dairy on weekends", "Pairs with items in your cart", "Trending in your area", "Great value this week"];
  return products.filter((_, i) => i % 5 === 2).slice(0, 10).map((product, i) => ({ product, why: whys[i % whys.length] }));
}

export function substitute(id: string) {
  const p = byId(id);
  if (!p) return undefined;
  return products.find((x) => x.category === p.category && x.id !== id && x.stock > 0);
}

export function forgotSomething(cartIds: string[]) {
  const s = new Set<string>();
  cartIds.forEach((id) => pairings[id]?.forEach((x) => !cartIds.includes(x) && s.add(x)));
  if (s.size < 3) ["amul-taaza-milk", "farm-fresh-eggs", "coriander-leaves", "brown-bread"].forEach((x) => !cartIds.includes(x) && s.add(x));
  return [...s].slice(0, 6).map((id) => byId(id)!).filter(Boolean);
}
