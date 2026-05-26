import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/create-prisma-client";

const prisma = createPrismaClient();

const DEMO_PUBLIC_KEY = "cko_demo_store_key_for_local_testing";

async function main() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.create({
    data: {
      email: "demo@checkoutoptimizer.dev",
      passwordHash,
      name: "Demo Brand Owner",
    },
  });

  const store = await prisma.store.create({
    data: {
      name: "Frido Demo Store",
      slug: "frido-demo",
      publicKey: DEMO_PUBLIC_KEY,
      domain: "localhost",
      ownerId: user.id,
    },
  });

  const exitOffer = await prisma.offer.create({
    data: {
      storeId: store.id,
      type: "FIXED_DISCOUNT",
      title: "Wait — take $5 off today",
      description:
        "Complete checkout now and save $5 on your order. Limited to this session.",
      ctaLabel: "Apply $5 off",
      payloadJson: JSON.stringify({
        discountCents: 500,
        couponCode: "SAVE5NOW",
      }),
    },
  });

  await prisma.campaign.create({
    data: {
      storeId: store.id,
      name: "Exit intent — mid cart",
      status: "ACTIVE",
      priority: 10,
      minCartCents: 3000,
      maxCartCents: 15000,
      geoCountries: JSON.stringify(["US", "CA"]),
      triggerType: "EXIT_INTENT",
      marginFloorPercent: 15,
      offerId: exitOffer.id,
    },
  });

  const idleOffer = await prisma.offer.create({
    data: {
      storeId: store.id,
      type: "SHIPPING_DISCOUNT",
      title: "Free shipping unlocked",
      description:
        "You've been browsing a while — enjoy free standard shipping on this order.",
      ctaLabel: "Activate free shipping",
      payloadJson: JSON.stringify({ discountCents: 799 }),
    },
  });

  await prisma.campaign.create({
    data: {
      storeId: store.id,
      name: "Idle 45s — high AOV",
      status: "ACTIVE",
      priority: 5,
      minCartCents: 8000,
      geoCountries: JSON.stringify([]),
      triggerType: "IDLE_TIME",
      idleSeconds: 45,
      marginFloorPercent: 20,
      offerId: idleOffer.id,
    },
  });

  const giftOffer = await prisma.offer.create({
    data: {
      storeId: store.id,
      type: "FREE_GIFT_SKU",
      title: "Free comfort sample",
      description: "Add our bestseller sample pack free — just stay and checkout.",
      ctaLabel: "Add free sample",
      payloadJson: JSON.stringify({
        sku: "SAMPLE-CLOUD-01",
        giftTitle: "Cloud Comfort Sample",
      }),
    },
  });

  const giftCampaign = await prisma.campaign.create({
    data: {
      storeId: store.id,
      name: "Gift upsell — low cart",
      status: "ACTIVE",
      priority: 3,
      minCartCents: 1500,
      maxCartCents: 5000,
      geoCountries: JSON.stringify(["US"]),
      triggerType: "EXIT_INTENT",
      offerId: giftOffer.id,
    },
  });

  const sessionBase = "seed_session_";
  const events = [
    { type: "IMPRESSION" as const, count: 120 },
    { type: "OFFER_SHOWN" as const, count: 85 },
    { type: "OFFER_ACCEPTED" as const, count: 28 },
    { type: "OFFER_DISMISSED" as const, count: 40 },
    { type: "CHECKOUT_COMPLETED" as const, count: 22 },
    { type: "ABANDONMENT" as const, count: 35 },
  ];

  let i = 0;
  for (const batch of events) {
    for (let n = 0; n < batch.count; n++) {
      const daysAgo = i % 7;
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await prisma.analyticsEvent.create({
        data: {
          storeId: store.id,
          campaignId:
            batch.type === "OFFER_SHOWN" ||
            batch.type === "OFFER_ACCEPTED" ||
            batch.type === "CHECKOUT_COMPLETED"
              ? giftCampaign.id
              : undefined,
          offerId:
            batch.type === "OFFER_ACCEPTED" ? giftOffer.id : undefined,
          sessionId: `${sessionBase}${i}`,
          eventType: batch.type,
          cartCents: 4500 + (i % 10) * 500,
          country: "US",
          createdAt,
        },
      });
      i += 1;
    }
  }

  console.log("Seed complete");
  console.log("  Email: demo@checkoutoptimizer.dev");
  console.log("  Password: demo1234");
  console.log(`  Store public key: ${DEMO_PUBLIC_KEY}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
