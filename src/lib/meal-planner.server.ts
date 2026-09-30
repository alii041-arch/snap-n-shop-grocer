import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { products } from "./data";

const schema = z.object({
  summary: z.string(),
  products: z.array(z.object({ id: z.string(), qty: z.number(), reason: z.string() })),
  recipes: z.array(
    z.object({
      name: z.string(),
      emoji: z.string(),
      time: z.string(),
      servings: z.number(),
      why: z.string(),
      steps: z.array(z.string()),
      usesOnHand: z.array(z.string()),
      ingredients: z.array(z.object({ id: z.string(), qty: z.number() })),
    }),
  ),
});
export type MealPlan = z.infer<typeof schema>;

export type PlanInput = { goal: string; diet: string[]; onHand: string; servings: number; budget: number | null };

export async function generateMealPlan(input: PlanInput): Promise<MealPlan> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const catalog = products
    .filter((p) => p.stock > 0)
    .map((p) => `${p.id}|${p.name}|${p.variants[0].label}|₹${p.variants[0].price}|${p.diet.join("/")}`)
    .join("\n");

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    output: Output.object({ schema }),
    system:
      "You are FreshDash AI Chef, a grocery meal planner for Indian shoppers. Only recommend product ids that appear exactly in the catalog. Respect dietary needs strictly. Prefer using ingredients the shopper already has and do not add those to the cart. Recommend 4-8 products and 2-3 recipes; each recipe has 3-6 short steps. Keep the total cart within budget when a budget is given. Keep summary under 40 words.",
    prompt: `Catalog (id|name|unit|price|diet):\n${catalog}\n\nMeal goal: ${input.goal || "not specified"}\nDietary needs: ${input.diet.join(", ") || "none"}\nIngredients on hand: ${input.onHand || "none"}\nServings: ${input.servings}\nBudget: ${input.budget ? "₹" + input.budget : "no limit"}`,
    providerOptions: {
      openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
    },
  });

  let plan: MealPlan;
  try {
    plan = await result.output;
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e) && e.text) {
      try { plan = schema.parse(JSON.parse(e.text)); } catch { throw new Error("The AI returned an unreadable plan. Please try again."); }
    } else throw e;
  }
  // Drop hallucinated ids and clamp quantities.
  const valid = new Set(products.map((p) => p.id));
  const q = (n: number) => Math.min(10, Math.max(1, Math.round(n || 1)));
  return {
    summary: plan.summary,
    products: plan.products.filter((p) => valid.has(p.id)).map((p) => ({ ...p, qty: q(p.qty) })).slice(0, 10),
    recipes: plan.recipes.slice(0, 3).map((r) => ({ ...r, ingredients: r.ingredients.filter((i) => valid.has(i.id)).map((i) => ({ ...i, qty: q(i.qty) })) })),
  };
}
