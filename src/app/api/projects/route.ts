import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 一覧取得
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
    const project = await prisma.project.create({
      data: {
        code: body.name,
        propertyAddress: body.name,
        propertyPrice: body.propertyPrice,
        acquisitionCost: body.acquisitionCost,
        projectTotal: body.projectTotal,
        expectedRent: body.expectedRent,
        agentRent: body.customerRent,
        expectedSalePrice: body.expectedSalePrice,
        expenses: {
          create: (body.expenses || []).map((e: any) => ({ name: e.name, price: e.price })),
        },
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "保存失敗" }, { status: 500 });
  }
}

// 編集（更新）
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    // 一旦今の経費を全部消してから作り直す
    await prisma.expenseItem.deleteMany({ where: { projectId: id } });

    const updated = await prisma.project.update({
      where: { id },
      data: {
        code: data.name,
        propertyAddress: data.name,
        propertyPrice: data.propertyPrice,
        acquisitionCost: data.acquisitionCost,
        projectTotal: data.projectTotal,
        expectedRent: data.expectedRent,
        agentRent: data.customerRent,
        expectedSalePrice: data.expectedSalePrice,
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

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: "削除完了" });
  } catch (error) {
    return NextResponse.json({ error: "削除失敗" }, { status: 500 });
  }
}