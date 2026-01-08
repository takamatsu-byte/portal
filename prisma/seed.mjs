// prisma/seed.mjs
import { PrismaClient, ProjectStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 仮ユーザー（Auth.js導入前の管理者）
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理者",
      email: "admin@example.com"
    }
  });

  // 案件を2件投入（UIに合わせた例）
  await prisma.project.createMany({
    data: [
      {
        ownerId: user.id,
        title: "長良大路 1丁目",
        propertyAddress: "岐阜県岐阜市 長良大路1丁目12番地",
        status: ProjectStatus.ACTIVE,
        projectTotal: 18400000,
        expectedRent: 75000,
        expectedYieldBp: 489,
        expectedSalePrice: 18500000,
        propertyPrice: 16500000,
        acquisitionCost: 1900000
      },
      {
        ownerId: user.id,
        title: "サンプル案件",
        propertyAddress: "岐阜県岐阜市（住所未入力）",
        status: ProjectStatus.ACTIVE,
        projectTotal: 19800000,
        expectedRent: 88000,
        expectedYieldBp: 533,
        expectedSalePrice: 22800000,
        propertyPrice: 19800000,
        acquisitionCost: 0
      }
    ],
    skipDuplicates: true
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
