import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id: id } });
    return NextResponse.json({ message: "削除成功" });
  } catch (error) {
    return NextResponse.json({ error: "削除失敗" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();

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
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}