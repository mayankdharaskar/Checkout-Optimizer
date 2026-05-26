export type ExitIntentHandler = () => void;

export function attachExitIntent(onTrigger: ExitIntentHandler): () => void {
  let lastY = 0;
  let triggered = false;

  const onMouseMove = (event: MouseEvent) => {
    const velocity = lastY - event.clientY;
    lastY = event.clientY;

    if (
      !triggered &&
      event.clientY <= 12 &&
      velocity > 18 &&
      event.movementY < 0
    ) {
      triggered = true;
      onTrigger();
    }
  };

  document.addEventListener("mousemove", onMouseMove, { passive: true });

  return () => {
    document.removeEventListener("mousemove", onMouseMove);
  };
}
