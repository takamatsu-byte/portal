import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const project = await prisma.project.create({
      data: {
        code: json.name,
        propertyAddress: "-",
        projectTotal: json.projectTotal,
        expectedRent: json.expectedRent,
        expectedYieldBp: json.expectedYield,
        agentRent: json.customerRent,
        surfaceYieldBp: json.surfaceYield,
        expectedSalePrice: json.expectedSalePrice,
        propertyPrice: json.propertyPrice,
        acquisitionCost: json.acquisitionCost,
        expenses: {
          create: json.expenses.map((e: any) => ({
            name: e.label,
            price: typeof e.amount === 'string' ? parseInt(e.amount.replace(/[^0-9]/g, "")) || 0 : e.amount,
          })),
        },
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "保存失敗" }, { status: 500 });
  }
}