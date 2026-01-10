import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 仲介案件を保存するプログラム
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const project = await prisma.brokerageProject.create({
      data: {
        code: body.name, // 物件名をコードとして保存
        propertyAddress: body.name,
        propertyPrice: body.propertyPrice,
        acquisitionCost: body.acquisitionCost,
        projectTotal: body.projectTotal,
        expectedRent: body.expectedRent,
        agentRent: body.customerRent,
        expectedSalePrice: body.expectedSalePrice,
        // 経費の内訳も一緒に保存する
        expenses: {
          create: body.expenses.map((e: any) => ({
            name: e.name,
            price: e.price,
          })),
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("保存エラー:", error);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}

// 仲介案件の一覧を取得するプログラム
export async function GET() {
  try {
    const projects = await prisma.brokerageProject.findMany({
      include: { expenses: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}