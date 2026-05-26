import type { EvaluateResult, EvaluateTrigger } from "../types";

export type EvaluateContext = {
  sessionId: string;
  trigger: EvaluateTrigger;
  cartTotalCents: number;
  country: string;
  durationOnPageMs: number;
  currency?: string;
};

export async function callEvaluate(
  apiBase: string,
  storeKey: string,
  context: EvaluateContext,
): Promise<EvaluateResult | null> {
  try {
    const response = await fetch(`${apiBase}/api/engine/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Store-Key": storeKey,
      },
      body: JSON.stringify(context),
    });

    if (!response.ok) return null;
    return (await response.json()) as EvaluateResult;
  } catch {
    return null;
  }
}
