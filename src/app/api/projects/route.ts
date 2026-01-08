import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. 物件を削除するAPI
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Promise型に変更
) {
  try {
    const { id } = await params; // awaitで受け取るように変更

    await prisma.project.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "削除成功" });
  } catch (error) {
    console.error("削除エラー:", error);
    return NextResponse.json({ error: "削除失敗" }, { status: 500 });
  }
}

// 2. 物件を更新するAPI
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Promise型に変更
) {
  try {
    const { id } = await params; // awaitで受け取るように変更
    const json = await request.json();

    // 関連する経費(expenses)を一旦すべて消してから作り直す
    await prisma.expenseItem.deleteMany({ where: { projectId: id } });

    const updated = await prisma.project.update({
      where: { id: id },
      data: {
        code: json.name,
        propertyPrice: json.propertyPrice,
        acquisitionCost: json.acquisitionCost,
        projectTotal: json.projectTotal,
        expectedRent: json.expectedRent,
        agentRent: json.customerRent,
        expectedSalePrice: json.expectedSalePrice,
        expenses: {
          create: json.expenses.map((e: any) => ({
            name: e.label,
            price: typeof e.amount === 'string' ? parseInt(e.amount.replace(/[^0-9]/g, "")) || 0 : e.amount,
          })),
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("更新エラー:", error);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}