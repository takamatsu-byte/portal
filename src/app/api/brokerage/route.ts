import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 一覧取得
export async function GET() {
  try {
    const projects = await prisma.brokerageProject.findMany({
      include: { expenses: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

// 新規作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const project = await prisma.brokerageProject.create({
      data: {
        code: body.name,
        propertyAddress: body.name,
        propertyPrice: body.propertyPrice,
        acquisitionCost: body.acquisitionCost,
        projectTotal: body.projectTotal,
        // 仲介専用の項目を保存
        sales: body.sales,
        contractDate: body.contractDate,
        settlementDate: body.settlementDate,
        expenses: {
          create: (body.expenses || []).map((e: any) => ({ name: e.name, price: e.price })),
        },
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error("保存エラー:", error);
    return NextResponse.json({ error: "保存失敗" }, { status: 500 });
  }
}

// 編集（更新）
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    // 経費内訳を一旦リセット
    await prisma.brokerageExpenseItem.deleteMany({ where: { projectId: id } });

    const updated = await prisma.brokerageProject.update({
      where: { id },
      data: {
        code: data.name,
        propertyAddress: data.name,
        propertyPrice: data.propertyPrice,
        acquisitionCost: data.acquisitionCost,
        projectTotal: data.projectTotal,
        // 仲介専用の項目を更新
        sales: data.sales,
        contractDate: data.contractDate,
        settlementDate: data.settlementDate,
        expenses: {
          create: (data.expenses || []).map((e: any) => ({ name: e.name, price: e.price })),
        },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

// 削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });

    await prisma.brokerageProject.delete({ where: { id } });
    return NextResponse.json({ message: "削除完了" });
  } catch (error) {
    return NextResponse.json({ error: "削除失敗" }, { status: 500 });
  }
}