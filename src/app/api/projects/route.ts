import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// データを取得する（読み込み）
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { expenses: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

// データを保存する（新規登録）
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const project = await prisma.project.create({
      data: {
        code: json.name, // 物件名をcodeとして保存（Schemaに合わせる）
        propertyAddress: "-",
        projectTotal: json.projectTotal,
        expectedRent: json.expectedRent,
        expectedYieldBp: json.expectedYield,
        agentRent: json.agentRent,
        surfaceYieldBp: json.surfaceYield,
        expectedSalePrice: json.expectedSalePrice,
        propertyPrice: json.propertyPrice,
        acquisitionCost: json.acquisitionCost,
        expenses: {
          create: json.expenses.map((e: any) => ({
            name: e.label,
            price: parseInt(e.amount.replace(/[^0-9]/g, "")) || 0,
          })),
        },
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "保存失敗" }, { status: 500 });
  }
}