import { attachExitIntent } from "./triggers/exit-intent";
import { attachIdleTimer } from "./triggers/idle-timer";
import { callEvaluate } from "./transport/evaluate";
import { trackEvent } from "./transport/track";
import type { EvaluateTrigger, WidgetConfig } from "./types";
import { mountOfferIframe } from "./ui/mount-iframe";

declare global {
  interface Window {
    CheckoutOptimizer?: {
      init: (overrides?: Partial<WidgetConfig>) => void;
    };
  }
}

const SESSION_KEY = "cko_session_id";
const SHOWN_KEY = "cko_offer_shown";

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = `cko_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `cko_${Date.now()}`;
  }
}

const injectedScript = document.currentScript as HTMLScriptElement | null;

function readConfig(script: HTMLScriptElement | null): WidgetConfig | null {
  if (!script) return null;

  const srcUrl = new URL(script.src);
  const storeKey = srcUrl.searchParams.get("key");
  if (!storeKey) return null;

  const apiBase = srcUrl.origin;
  const idleSeconds = Number(script.dataset.idleSeconds ?? "45");
  const debug = script.dataset.debug === "true";

  return {
    storeKey,
    apiBase,
    idleSeconds: Number.isFinite(idleSeconds) ? idleSeconds : 45,
    debug,
  };
}

function getCartTotalCents(script: HTMLScriptElement | null): number {
  const fromData = script?.dataset.cartCents;
  if (fromData) return Number(fromData);

  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="cko:cart-cents"]',
  );
  if (meta?.content) return Number(meta.content);

  return 5000;
}

function getCountry(script: HTMLScriptElement | null): string {
  return (script?.dataset.country ?? "US").toUpperCase().slice(0, 2);
}

function init(overrides?: Partial<WidgetConfig>): void {
  try {
    const base = readConfig(injectedScript);
    if (!base) return;

    const config: WidgetConfig = { ...base, ...overrides };
    const scriptEl = injectedScript;
    const sessionId = getSessionId();
    const startedAt = Date.now();
    let evaluating = false;
    let teardownIframe: (() => void) | null = null;

    trackEvent(config.apiBase, config.storeKey, {
      sessionId,
      eventType: "IMPRESSION",
      cartCents: getCartTotalCents(scriptEl),
      country: getCountry(scriptEl),
    });

    const runEvaluate = async (trigger: EvaluateTrigger) => {
      if (evaluating) return;
      if (sessionStorage.getItem(SHOWN_KEY) === "1") return;

      evaluating = true;
      const result = await callEvaluate(config.apiBase, config.storeKey, {
        sessionId,
        trigger,
        cartTotalCents: getCartTotalCents(scriptEl),
        country: getCountry(scriptEl),
        durationOnPageMs: Date.now() - startedAt,
        currency: "USD",
      });
      evaluating = false;

      if (!result?.matched || !result.offer) return;

      sessionStorage.setItem(SHOWN_KEY, "1");

      trackEvent(config.apiBase, config.storeKey, {
        sessionId,
        eventType: "OFFER_SHOWN",
        campaignId: result.campaignId,
        offerId: result.offer.id,
        cartCents: getCartTotalCents(scriptEl),
        country: getCountry(scriptEl),
      });

      teardownIframe = mountOfferIframe({
        frameUrl: result.offer.frameUrl,
        onAccept: () => {
          trackEvent(config.apiBase, config.storeKey, {
            sessionId,
            eventType: "OFFER_ACCEPTED",
            campaignId: result.campaignId,
            offerId: result.offer?.id,
            cartCents: getCartTotalCents(scriptEl),
            country: getCountry(scriptEl),
          });
          teardownIframe?.();
          teardownIframe = null;
        },
        onDismiss: () => {
          trackEvent(config.apiBase, config.storeKey, {
            sessionId,
            eventType: "OFFER_DISMISSED",
            campaignId: result.campaignId,
            offerId: result.offer?.id,
          });
          teardownIframe?.();
          teardownIframe = null;
        },
      });
    };

    attachExitIntent(() => {
      void runEvaluate("EXIT_INTENT");
    });

    attachIdleTimer(config.idleSeconds, () => {
      void runEvaluate("IDLE_TIME");
    });
  } catch (error) {
    if (injectedScript?.dataset.debug === "true") {
      console.debug("[CheckoutOptimizer]", error);
    }
  }
}

window.CheckoutOptimizer = { init };

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => init());
} else {
  init();
}
