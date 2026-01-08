import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const projects = await prisma.resaleProject.findMany({
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
    const project = await prisma.resaleProject.create({
      data: {
        code: json.name,
        propertyPrice: json.propertyPrice,
        acquisitionCost: json.acquisitionCost,
        projectTotal: json.projectTotal,
        expectedSalePrice: json.expectedSalePrice,
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