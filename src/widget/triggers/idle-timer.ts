export type IdleHandler = () => void;

export function attachIdleTimer(
  idleSeconds: number,
  onTrigger: IdleHandler,
): () => void {
  let triggered = false;
  const timeoutMs = idleSeconds * 1000;
  let timer = window.setTimeout(fire, timeoutMs);

  function fire() {
    if (!triggered) {
      triggered = true;
      onTrigger();
    }
  }

  function reset() {
    window.clearTimeout(timer);
    timer = window.setTimeout(fire, timeoutMs);
  }

  const events = ["mousemove", "keydown", "scroll", "touchstart"] as const;
  events.forEach((event) => {
    document.addEventListener(event, reset, { passive: true });
  });

  return () => {
    window.clearTimeout(timer);
    events.forEach((event) => {
      document.removeEventListener(event, reset);
    });
  };
}
