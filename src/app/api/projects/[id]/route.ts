// src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================
   utility
========================= */

function safeInt(v: unknown): number | null {
  const n =
    typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function calcBp(monthlyRent: number | null, projectTotal: number | null): number | null {
  if (!monthlyRent || !projectTotal || projectTotal <= 0) return null;
  return Math.round((monthlyRent * 12 * 10000) / projectTotal);
}

/* =========================
   PUT /api/projects/[id]
========================= */

type ExpenseInput = {
  name: string;
  price: number;
};

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: Ctx) {
  const { id } = await context.params;

  const body = await request.json().catch(() => ({}));

  const name = String((body as any)?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "物件名は必須です" }, { status: 400 });
  }

  const expectedRent = safeInt((body as any)?.expectedRent);
  const agentRent = safeInt((body as any)?.agentRent);
  const expectedSalePrice = safeInt((body as any)?.expectedSalePrice);
  const propertyPrice = safeInt((body as any)?.propertyPrice);

  const expensesIn: unknown[] = Array.isArray((body as any)?.expenses) ? (body as any).expenses : [];

  const expenses: ExpenseInput[] = expensesIn
    .map((x: unknown): ExpenseInput => {
      const obj = (x ?? {}) as Record<string, unknown>;
      return {
        name: String(obj.name ?? "").trim(),
        price: safeInt(obj.price) ?? 0,
      };
    })
    .filter((x: ExpenseInput) => x.name !== "" || x.price !== 0);

  const acquisitionCost = expenses.reduce((s: number, x: ExpenseInput) => s + x.price, 0) || 0;

  const projectTotal =
    propertyPrice === null ? null : (propertyPrice ?? 0) + acquisitionCost;

  const expectedYieldBp = calcBp(expectedRent, projectTotal);
  const surfaceYieldBp = calcBp(agentRent, projectTotal);

  // 内訳は一旦全削除→再作成
  await prisma.expenseItem.deleteMany({ where: { projectId: id } });

  const updated = await prisma.project.update({
    where: { id },
    data: {
      code: String((body as any)?.code ?? "P").slice(0, 50),
      propertyAddress: String((body as any)?.propertyAddress ?? "").slice(0, 200),

      projectTotal,
      expectedRent,
      expectedYieldBp,
      agentRent,
      surfaceYieldBp,
      expectedSalePrice,
      propertyPrice,

      acquisitionCost,

      expenses: expenses.length
        ? {
            create: expenses.map((e) => ({ name: e.name || "-", price: e.price })),
          }
        : undefined,
    },
    include: { expenses: { orderBy: { id: "asc" } } },
  });

  return NextResponse.json(updated);
}

/* =========================
   DELETE /api/projects/[id]
========================= */

export async function DELETE(_request: NextRequest, context: Ctx) {
  const { id } = await context.params;

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
