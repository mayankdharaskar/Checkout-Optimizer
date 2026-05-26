"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type StoreInfo = {
  id: string;
  name: string;
  publicKey: string;
};

export function EmbedSnippet() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  useEffect(() => {
    void fetch("/api/store")
      .then((res) => res.json())
      .then((data: { store: StoreInfo }) => setStore(data.store));
  }, []);

  const snippet = store
    ? `<script
  async
  src="${appUrl}/api/widget/sdk?key=${store.publicKey}"
  data-checkout-optimizer
  data-idle-seconds="45"
  data-country="US"
  data-cart-cents="5000"
></script>`
    : "";

  async function rotateKey() {
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rotate-key" }),
    });
    const data = (await res.json()) as { store: StoreInfo };
    setStore((prev) =>
      prev ? { ...prev, publicKey: data.store.publicKey } : prev,
    );
  }

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardTitle>Checkout embed snippet</CardTitle>
      <p className="mt-2 text-sm text-zinc-500">
        Paste this before the closing body tag on your checkout page.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs text-emerald-300">
        {snippet || "Loading…"}
      </pre>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => void copySnippet()} disabled={!snippet}>
          {copied ? "Copied!" : "Copy snippet"}
        </Button>
        <Button variant="secondary" onClick={() => void rotateKey()}>
          Rotate public key
        </Button>
      </div>
    </Card>
  );
}
