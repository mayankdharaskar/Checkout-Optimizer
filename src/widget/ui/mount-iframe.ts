const CONTAINER_ID = "cko-widget-root";

export type OfferMountOptions = {
  frameUrl: string;
  onAccept: () => void;
  onDismiss: () => void;
};

export function mountOfferIframe(options: OfferMountOptions): () => void {
  const existing = document.getElementById(CONTAINER_ID);
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  container.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:2147483646;width:360px;max-width:calc(100vw - 32px);height:220px;pointer-events:auto;";

  const iframe = document.createElement("iframe");
  iframe.src = options.frameUrl;
  iframe.title = "Checkout offer";
  iframe.style.cssText =
    "width:100%;height:100%;border:0;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.18);background:transparent;";
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");

  container.appendChild(iframe);
  document.body.appendChild(container);

  const onMessage = (event: MessageEvent) => {
    if (typeof event.data !== "object" || event.data === null) return;
    const data = event.data as { type?: string };
    if (data.type === "cko:accept") options.onAccept();
    if (data.type === "cko:dismiss") options.onDismiss();
  };

  window.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener("message", onMessage);
    container.remove();
  };
}
