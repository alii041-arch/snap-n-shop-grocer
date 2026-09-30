import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const planMeals = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      goal: z.string().max(500),
      diet: z.array(z.string()).max(10),
      onHand: z.string().max(500),
      servings: z.number().int().min(1).max(20),
      budget: z.number().nullable(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { generateMealPlan } = await import("./meal-planner.server");
    try {
      return { ok: true as const, plan: await generateMealPlan(data) };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      const msg =
        status === 429 ? "AI is busy right now — please wait a moment and try again."
        : status === 402 ? "AI credits have run out. Please add credits to keep using AI Chef."
        : e instanceof Error ? e.message : "Something went wrong.";
      console.error("planMeals failed", e);
      return { ok: false as const, error: msg };
    }
  });
