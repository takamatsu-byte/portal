import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function sumExpenses(expenses: Array<{ name?: unknown; price?: unknown }>): number {
  return expenses.reduce((acc, e) => acc + (toIntOrNull(e.price) ?? 0), 0);
}

function calcBp(monthlyRent: number | null, projectTotal: number | null): number | null {
  if (monthlyRent === null || projectTotal === null) return null;
  if (projectTotal <= 0) return null;
  // bp = percent * 100  (9.23% => 923bp)
  return Math.round(((monthlyRent * 12) / projectTotal) * 10000);
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { expenses: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const code = String(body?.code ?? "").trim();
    const propertyAddress = String(body?.propertyAddress ?? "").trim();

    if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });
    if (!propertyAddress)
      return NextResponse.json({ error: "propertyAddress is required" }, { status: 400 });

    const propertyPrice = toIntOrNull(body?.propertyPrice);
    const expectedRent = toIntOrNull(body?.expectedRent);
    const agentRent = toIntOrNull(body?.agentRent);
    const expectedSalePrice = toIntOrNull(body?.expectedSalePrice);

    const rawExpenses: Array<{ name?: unknown; price?: unknown }> = Array.isArray(body?.expenses)
      ? body.expenses
      : [];

    const cleanedExpenses = rawExpenses
      .map((x) => ({
        name: String(x?.name ?? "").trim(),
        price: toIntOrNull(x?.price),
      }))
      .filter((x) => x.name || x.price !== null)
      .map((x) => ({
        name: x.name || "（未入力）",
        price: x.price ?? 0,
      }));

    const acquisitionCost = cleanedExpenses.length ? sumExpenses(cleanedExpenses) : null;

    const projectTotal =
      propertyPrice !== null ? propertyPrice + (acquisitionCost ?? 0) : null;

    const expectedYieldBp = calcBp(expectedRent, projectTotal);
    const surfaceYieldBp = calcBp(agentRent, projectTotal);

    const created = await prisma.project.create({
      data: {
        code,
        propertyAddress,

        propertyPrice: propertyPrice ?? undefined,
        expectedRent: expectedRent ?? undefined,
        agentRent: agentRent ?? undefined,
        expectedSalePrice: expectedSalePrice ?? undefined,

        acquisitionCost: acquisitionCost ?? undefined,
        projectTotal: projectTotal ?? undefined,
        expectedYieldBp: expectedYieldBp ?? undefined,
        surfaceYieldBp: surfaceYieldBp ?? undefined,

        expenses: cleanedExpenses.length
          ? {
              create: cleanedExpenses.map((e) => ({
                name: e.name,
                price: e.price,
              })),
            }
          : undefined,
      },
      include: { expenses: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
