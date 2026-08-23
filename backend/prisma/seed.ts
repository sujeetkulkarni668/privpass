import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { randomBytes, createHash } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo.user@example.com" },
    update: {},
    create: {
      email: "demo.user@example.com",
      passwordHash: await argon2.hash("ChangeMe!12345", { type: argon2.argon2id }),
      displayName: "Demo User",
      emailVerifiedAt: new Date(),
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "abc-finance-demo" },
    update: {},
    create: {
      name: "ABC Finance (Demo)",
      slug: "abc-finance-demo",
      members: { create: { userId: demoUser.id, role: "OWNER" } },
    },
  });

  // Synthetic PAN credential, watermarked, matching docs/identity-providers.md
  const panValue = "TESTPAN1234";
  const salt = randomBytes(32).toString("hex");
  const commitment = createHash("sha256").update(panValue + salt).digest("hex");

  await prisma.credential.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      userId: demoUser.id,
      type: "PAN",
      issuer: "SyntheticIdentityProvider",
      commitment,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seeded:", { demoUser: demoUser.email, org: org.slug });
  console.log("DEMO CREDENTIAL — NOT A REAL GOVERNMENT ID. Wallet salt (dev only):", salt);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
