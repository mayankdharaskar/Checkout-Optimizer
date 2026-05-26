"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function FrameContent() {
  const params = useSearchParams();
  const title = params.get("title") ?? "Special offer";
  const description =
    params.get("description") ?? "Complete your order with an exclusive deal.";
  const cta = params.get("cta") ?? "Apply offer";

  function post(type: "cko:accept" | "cko:dismiss") {
    window.parent.postMessage({ type }, "*");
  }

  return (
    <div className="flex h-full min-h-[200px] flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-indigo-100">
          Checkout Optimizer
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-snug">{title}</h2>
        <p className="mt-2 text-sm text-indigo-100">{description}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1 bg-white text-indigo-700 hover:bg-indigo-50"
          onClick={() => post("cko:accept")}
        >
          {cta}
        </Button>
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => post("cko:dismiss")}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

export default function WidgetFramePage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-zinc-500">Loading offer…</div>
      }
    >
      <FrameContent />
    </Suspense>
  );
}
