export type WidgetConfig = {
  storeKey: string;
  apiBase: string;
  idleSeconds: number;
  debug: boolean;
};

export type EvaluateTrigger = "EXIT_INTENT" | "IDLE_TIME";

export type EvaluateResult = {
  matched: boolean;
  campaignId?: string;
  offer?: {
    id: string;
    title: string;
    description: string;
    ctaLabel: string;
    frameUrl: string;
  };
};
