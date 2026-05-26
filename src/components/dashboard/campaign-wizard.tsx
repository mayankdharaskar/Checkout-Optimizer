"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CampaignWithOffer } from "@/types/campaign";
import type {
  CampaignStatus,
  OfferType,
  TriggerType,
} from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type WizardStep = "conditions" | "triggers" | "offer" | "review";

type FormState = {
  name: string;
  status: CampaignStatus;
  priority: number;
  minCartCents: number;
  maxCartCents: string;
  geoCountries: string;
  triggerType: TriggerType;
  idleSeconds: number;
  marginFloorPercent: string;
  offerType: OfferType;
  offerTitle: string;
  offerDescription: string;
  ctaLabel: string;
  payloadDiscountCents: number;
  payloadCouponCode: string;
  payloadSku: string;
  payloadGiftTitle: string;
  payloadUpgradeLabel: string;
};

function initialForm(campaign?: CampaignWithOffer): FormState {
  const payload = campaign?.offer.payload;
  return {
    name: campaign?.name ?? "",
    status: campaign?.status ?? "DRAFT",
    priority: campaign?.priority ?? 5,
    minCartCents: (campaign?.minCartCents ?? 3000) / 100,
    maxCartCents: campaign?.maxCartCents
      ? String(campaign.maxCartCents / 100)
      : "",
    geoCountries: (campaign?.geoCountries ?? []).join(", "),
    triggerType: campaign?.triggerType ?? "EXIT_INTENT",
    idleSeconds: campaign?.idleSeconds ?? 45,
    marginFloorPercent: campaign?.marginFloorPercent
      ? String(campaign.marginFloorPercent)
      : "15",
    offerType: campaign?.offer.type ?? "FIXED_DISCOUNT",
    offerTitle: campaign?.offer.title ?? "",
    offerDescription: campaign?.offer.description ?? "",
    ctaLabel: campaign?.offer.ctaLabel ?? "Apply offer",
    payloadDiscountCents:
      payload?.type === "FIXED_DISCOUNT" ||
      payload?.type === "SHIPPING_DISCOUNT"
        ? payload.discountCents / 100
        : 5,
    payloadCouponCode:
      payload?.type === "FIXED_DISCOUNT"
        ? (payload.couponCode ?? "")
        : "SAVE5",
    payloadSku:
      payload?.type === "FREE_GIFT_SKU" ? payload.sku : "SAMPLE-01",
    payloadGiftTitle:
      payload?.type === "FREE_GIFT_SKU"
        ? payload.giftTitle
        : "Free sample",
    payloadUpgradeLabel:
      payload?.type === "EXPRESS_SHIPPING_UPGRADE"
        ? payload.upgradeLabel
        : "Free express shipping",
  };
}

function buildPayload(form: FormState): Record<string, unknown> {
  switch (form.offerType) {
    case "SHIPPING_DISCOUNT":
    case "FIXED_DISCOUNT":
      return {
        discountCents: Math.round(form.payloadDiscountCents * 100),
        ...(form.offerType === "FIXED_DISCOUNT" && form.payloadCouponCode
          ? { couponCode: form.payloadCouponCode }
          : {}),
      };
    case "FREE_GIFT_SKU":
      return {
        sku: form.payloadSku,
        giftTitle: form.payloadGiftTitle,
      };
    case "EXPRESS_SHIPPING_UPGRADE":
      return { upgradeLabel: form.payloadUpgradeLabel };
    default:
      return {};
  }
}

export function CampaignWizard({
  campaign,
}: {
  campaign?: CampaignWithOffer;
}) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("conditions");
  const [form, setForm] = useState<FormState>(() => initialForm(campaign));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const steps: WizardStep[] = ["conditions", "triggers", "offer", "review"];
  const stepIndex = steps.indexOf(step);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    const body = {
      name: form.name,
      status: form.status,
      priority: form.priority,
      minCartCents: Math.round(form.minCartCents * 100),
      maxCartCents: form.maxCartCents
        ? Math.round(Number(form.maxCartCents) * 100)
        : null,
      geoCountries: form.geoCountries
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean),
      triggerType: form.triggerType,
      idleSeconds:
        form.triggerType === "IDLE_TIME" ? form.idleSeconds : null,
      marginFloorPercent: form.marginFloorPercent
        ? Number(form.marginFloorPercent)
        : null,
      offer: {
        type: form.offerType,
        title: form.offerTitle,
        description: form.offerDescription,
        ctaLabel: form.ctaLabel,
        payload: buildPayload(form),
      },
    };

    const url = campaign
      ? `/api/campaigns/${campaign.id}`
      : "/api/campaigns";
    const method = campaign ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to save campaign");
      return;
    }

    router.push("/dashboard/campaigns");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              i <= stepIndex ? "bg-indigo-600" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      {step === "conditions" && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Conditions</h2>
          <div>
            <Label htmlFor="name">Campaign name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="minCart">Min cart ($)</Label>
              <Input
                id="minCart"
                type="number"
                value={form.minCartCents}
                onChange={(e) =>
                  update("minCartCents", Number(e.target.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="maxCart">Max cart ($, optional)</Label>
              <Input
                id="maxCart"
                type="number"
                value={form.maxCartCents}
                onChange={(e) => update("maxCartCents", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="geo">Countries (ISO codes, comma-separated)</Label>
            <Input
              id="geo"
              placeholder="US, CA (empty = worldwide)"
              value={form.geoCountries}
              onChange={(e) => update("geoCountries", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as CampaignStatus)
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={form.priority}
                onChange={(e) => update("priority", Number(e.target.value))}
              />
            </div>
          </div>
        </Card>
      )}

      {step === "triggers" && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Triggers</h2>
          <div>
            <Label htmlFor="trigger">Trigger type</Label>
            <Select
              id="trigger"
              value={form.triggerType}
              onChange={(e) =>
                update("triggerType", e.target.value as TriggerType)
              }
            >
              <option value="EXIT_INTENT">Exit intent</option>
              <option value="IDLE_TIME">Idle time</option>
            </Select>
          </div>
          {form.triggerType === "IDLE_TIME" && (
            <div>
              <Label htmlFor="idle">Idle seconds</Label>
              <Input
                id="idle"
                type="number"
                value={form.idleSeconds}
                onChange={(e) =>
                  update("idleSeconds", Number(e.target.value))
                }
              />
            </div>
          )}
          <div>
            <Label htmlFor="margin">Margin floor (%)</Label>
            <Input
              id="margin"
              type="number"
              value={form.marginFloorPercent}
              onChange={(e) =>
                update("marginFloorPercent", e.target.value)
              }
            />
          </div>
        </Card>
      )}

      {step === "offer" && (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Offer action</h2>
          <div>
            <Label htmlFor="offerType">Offer type</Label>
            <Select
              id="offerType"
              value={form.offerType}
              onChange={(e) =>
                update("offerType", e.target.value as OfferType)
              }
            >
              <option value="FIXED_DISCOUNT">Fixed discount</option>
              <option value="SHIPPING_DISCOUNT">Shipping discount</option>
              <option value="FREE_GIFT_SKU">Free gift SKU</option>
              <option value="EXPRESS_SHIPPING_UPGRADE">
                Express shipping upgrade
              </option>
            </Select>
          </div>
          <div>
            <Label htmlFor="title">Headline</Label>
            <Input
              id="title"
              value={form.offerTitle}
              onChange={(e) => update("offerTitle", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={3}
              value={form.offerDescription}
              onChange={(e) => update("offerDescription", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cta">CTA label</Label>
            <Input
              id="cta"
              value={form.ctaLabel}
              onChange={(e) => update("ctaLabel", e.target.value)}
            />
          </div>
          {(form.offerType === "FIXED_DISCOUNT" ||
            form.offerType === "SHIPPING_DISCOUNT") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Discount ($)</Label>
                <Input
                  type="number"
                  value={form.payloadDiscountCents}
                  onChange={(e) =>
                    update("payloadDiscountCents", Number(e.target.value))
                  }
                />
              </div>
              {form.offerType === "FIXED_DISCOUNT" && (
                <div>
                  <Label>Coupon code</Label>
                  <Input
                    value={form.payloadCouponCode}
                    onChange={(e) =>
                      update("payloadCouponCode", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          )}
          {form.offerType === "FREE_GIFT_SKU" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>SKU</Label>
                <Input
                  value={form.payloadSku}
                  onChange={(e) => update("payloadSku", e.target.value)}
                />
              </div>
              <div>
                <Label>Gift title</Label>
                <Input
                  value={form.payloadGiftTitle}
                  onChange={(e) =>
                    update("payloadGiftTitle", e.target.value)
                  }
                />
              </div>
            </div>
          )}
          {form.offerType === "EXPRESS_SHIPPING_UPGRADE" && (
            <div>
              <Label>Upgrade label</Label>
              <Input
                value={form.payloadUpgradeLabel}
                onChange={(e) =>
                  update("payloadUpgradeLabel", e.target.value)
                }
              />
            </div>
          )}
        </Card>
      )}

      {step === "review" && (
        <Card className="space-y-3 text-sm text-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900">Review</h2>
          <p>
            <strong>Name:</strong> {form.name} ({form.status})
          </p>
          <p>
            <strong>Cart:</strong> ${form.minCartCents}
            {form.maxCartCents ? ` – $${form.maxCartCents}` : "+"}
          </p>
          <p>
            <strong>Trigger:</strong> {form.triggerType}
            {form.triggerType === "IDLE_TIME"
              ? ` after ${form.idleSeconds}s`
              : ""}
          </p>
          <p>
            <strong>Offer:</strong> {form.offerTitle} ({form.offerType})
          </p>
          {error ? <p className="text-red-600">{error}</p> : null}
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="secondary"
          disabled={stepIndex === 0}
          onClick={() => setStep(steps[stepIndex - 1])}
        >
          Back
        </Button>
        {step === "review" ? (
          <Button disabled={saving} onClick={() => void handleSubmit()}>
            {saving ? "Saving…" : campaign ? "Update campaign" : "Launch campaign"}
          </Button>
        ) : (
          <Button onClick={() => setStep(steps[stepIndex + 1])}>Continue</Button>
        )}
      </div>
    </div>
  );
}
