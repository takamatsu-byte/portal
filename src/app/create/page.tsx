// src/app/create/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function toIntOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function calcBp(monthlyRent: number | null, projectTotal: number | null): number | null {
  if (monthlyRent === null || projectTotal === null) return null;
  if (projectTotal <= 0) return null;
  return Math.round(((monthlyRent * 12) / projectTotal) * 10000);
}

export default function CreatePage() {
  async function createProject(formData: FormData) {
    "use server";

    const code = String(formData.get("code") ?? "").trim();
    const propertyAddress = String(formData.get("propertyAddress") ?? "").trim();
    if (!code || !propertyAddress) return;

    const propertyPrice = toIntOrNull(formData.get("propertyPrice"));
    const expectedRent = toIntOrNull(formData.get("expectedRent"));
    const agentRent = toIntOrNull(formData.get("agentRent"));
    const expectedSalePrice = toIntOrNull(formData.get("expectedSalePrice"));

    // 経費（配列）
    const expenseNames = formData.getAll("expenseName").map((x) => String(x ?? "").trim());
    const expensePrices = formData.getAll("expensePrice").map((x) => String(x ?? "").trim());

    const expenses = expenseNames
      .map((name, i) => ({
        name,
        price: Number((expensePrices[i] ?? "").replace(/,/g, "")),
      }))
      .filter((x) => x.name || Number.isFinite(x.price))
      .map((x) => ({
        name: x.name || "（未入力）",
        price: Number.isFinite(x.price) ? Math.trunc(x.price) : 0,
      }));

    const acquisitionCost = expenses.length ? expenses.reduce((a, e) => a + (e.price ?? 0), 0) : null;

    const projectTotal =
      propertyPrice !== null
        ? propertyPrice + (acquisitionCost ?? 0)
        : null;

    const expectedYieldBp = calcBp(expectedRent, projectTotal);
    const surfaceYieldBp = calcBp(agentRent, projectTotal);

    await prisma.project.create({
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

        expenses: expenses.length
          ? { create: expenses.map((e) => ({ name: e.name, price: e.price })) }
          : undefined,
      },
    });

    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <div className="max-w-3xl mx-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">新規案件登録</h1>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← 戻る
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form action={createProject} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <div className="text-sm font-semibold mb-1">コード（必須）</div>
                <input
                  name="code"
                  placeholder="例）P-0001"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
                  required
                />
              </label>

              <label className="block">
                <div className="text-sm font-semibold mb-1">物件住所（必須）</div>
                <input
                  name="propertyAddress"
                  placeholder="例）岐阜県岐阜市..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldYen name="propertyPrice" label="物件価格（円）" placeholder="例）78000000" />
              <FieldYen name="expectedSalePrice" label="想定販売価格（円）" placeholder="例）92000000" />
              <FieldYen name="expectedRent" label="想定家賃（円/月）" placeholder="例）650000" />
              <FieldYen name="agentRent" label="客付け家賃（円/月）" placeholder="例）620000" />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="font-semibold text-slate-900 mb-3">買取経費（内訳）</div>

              {/* 最低3行用意（空行は無視して保存） */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    name="expenseName"
                    placeholder="項目（例：仲介手数料）"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    name="expensePrice"
                    placeholder="金額（円）"
                    inputMode="numeric"
                    className="w-48 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              ))}

              <p className="text-xs text-slate-500 mt-2">
                ※ 空の行は自動的に無視されます（合計はサーバー側で計算）
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl px-4 py-3 font-semibold text-white bg-orange-500 hover:bg-orange-600 transition"
            >
              登録
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FieldYen(props: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-1">{props.label}</div>
      <input
        name={props.name}
        placeholder={props.placeholder}
        inputMode="numeric"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}
