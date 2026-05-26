import type { AnalyticsEventType } from "../../types/enums";

type TrackPayload = {
  sessionId: string;
  eventType: AnalyticsEventType;
  campaignId?: string;
  offerId?: string;
  cartCents?: number;
  country?: string;
};

export function trackEvent(
  apiBase: string,
  storeKey: string,
  payload: TrackPayload,
): void {
  try {
    const url = `${apiBase}/api/analytics/track`;
    const body = JSON.stringify(payload);
    const blob = new Blob([body], { type: "application/json" });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
      return;
    }

    void fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Store-Key": storeKey,
      },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // fail silently
  }
}
