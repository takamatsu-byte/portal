// src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function safeInt(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function calcBp(monthlyRent: number | null, projectTotal: number | null): number | null {
  if (!monthlyRent || !projectTotal || projectTotal <= 0) return null;
  return Math.round((monthlyRent * 12 * 10000) / projectTotal);
}

export async function PUT(request: NextRequest, context: { params: { promise<{ id: string } >} {
  const{id}  = awaitcontext.params;
  const body = await req.json().catch(() => ({}));

  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "物件名は必須です" }, { status: 400 });

  const expectedRent = safeInt(body?.expectedRent);
  const agentRent = safeInt(body?.agentRent);
  const expectedSalePrice = safeInt(body?.expectedSalePrice);
  const propertyPrice = safeInt(body?.propertyPrice);

  const expensesIn = Array.isArray(body?.expenses) ? body.expenses : [];
  const expenses = expensesIn
    .map((x: any) => ({
      name: String(x?.name ?? "").trim(),
      price: safeInt(x?.price) ?? 0,
    }))
    .filter((x: any) => x.name || x.price);

  const acquisitionCost = expenses.reduce((s: number, x: any) => s + (x.price ?? 0), 0) || 0;

  const projectTotal =
    propertyPrice === null ? null : (propertyPrice ?? 0) + (acquisitionCost ?? 0);

  const expectedYieldBp = calcBp(expectedRent, projectTotal);
  const surfaceYieldBp = calcBp(agentRent, projectTotal);

  // 内訳は一旦全削除→再作成（簡単で確実）
  await prisma.expenseItem.deleteMany({ where: { projectId: id } });

  const updated = await prisma.project.update({
    where: { id },
    data: {
      code: String(body?.code ?? "P").slice(0, 50),
      propertyAddress: String(body?.propertyAddress ?? "").slice(0, 200),

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
            create: expenses.map((e: any) => ({ name: e.name || "-", price: e.price ?? 0 })),
          }
        : undefined,
    },
    include: { expenses: { orderBy: { id: "asc" } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
