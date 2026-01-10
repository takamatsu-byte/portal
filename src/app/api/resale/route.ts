import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 転売案件を保存するプログラム
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const project = await prisma.resaleProject.create({
      data: {
        code: body.name, 
        propertyAddress: body.name,
        propertyPrice: body.propertyPrice,
        acquisitionCost: body.acquisitionCost,
        projectTotal: body.projectTotal,
        expectedSalePrice: body.expectedSalePrice,
        // 転売モデルには expectedRent が存在しないため削除しました
        expenses: {
          create: (body.expenses || []).map((e: any) => ({
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

// 転売案件の一覧を取得するプログラム
export async function GET() {
  try {
    const projects = await prisma.resaleProject.findMany({
      include: { expenses: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}