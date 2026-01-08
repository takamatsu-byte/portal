"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

/* ===============================
   型定義
=============================== */
type CostItem = {
  id: string;
  label: string;   // 全角
  amount: string;  // 半角（円）
};

type Property = {
  id: string;
  name: string;

  projectTotalYen: string;
  assumedRentYen: string;
  assumedYield: string;

  customerRentYen: string;
  surfaceYield: string;

  expectedSalePriceYen: string;
  propertyPriceYen: string;

  buyCostTotalYen: string;
  buyCostBreakdown?: { label: string; amount: string }[];
};

const BRAND_ORANGE = "#FD9D24";

/* ===============================
   ユーティリティ
=============================== */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function parseYen(input: string): number | null {
  const s = (input ?? "").replace(/[,円]/g, "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatYen(n: number | null): string {
  if (n === null) return "-";
  return `${n.toLocaleString()}円`;
}

function formatPercent(n: number | null): string {
  if (n === null) return "-";
  return `${n.toFixed(1)}%`;
}

function toZenkakuLoose(v: string) {
  return v.replace(/ /g, "　");
}

function toHankakuNumberOnly(v: string) {
  return v
    .replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    )
    .replace(/[^0-9]/g, "");
}

function ensureTrailingEmptyCostRow(items: CostItem[]) {
  const last = items[items.length - 1];
  if (!last || last.label || last.amount) {
    return [...items, { id: uid(), label: "", amount: "" }];
  }
  return items;
}

function sumCost(items: CostItem[]) {
  return items.reduce((s, i) => s + (parseYen(i.amount) ?? 0), 0);
}

/* ===============================
   メインページ
=============================== */
export default function RealEstateDashboard() {
  const initial = useMemo<Property[]>(() => [], []);
  const [list, setList] = useState<Property[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    propertyPrice: "",
    assumedRent: "",
    customerRent: "",
    expectedSalePrice: "",
    costs: ensureTrailingEmptyCostRow([{ id: uid(), label: "", amount: "" }]),
  });

  function openCreate() {
    setForm({
      name: "",
      propertyPrice: "",
      assumedRent: "",
      customerRent: "",
      expectedSalePrice: "",
      costs: ensureTrailingEmptyCostRow([{ id: uid(), label: "", amount: "" }]),
    });
    setPanelOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const buyCostTotal = sumCost(form.costs);
    const propertyPrice = parseYen(form.propertyPrice);
    const projectTotal =
      propertyPrice !== null ? propertyPrice + buyCostTotal : null;

    const assumedYield =
      projectTotal && parseYen(form.assumedRent)
        ? (parseYen(form.assumedRent)! * 12) / projectTotal * 100
        : null;

    const surfaceYield =
      projectTotal && parseYen(form.customerRent)
        ? (parseYen(form.customerRent)! * 12) / projectTotal * 100
        : null;

    const item: Property = {
      id: uid(),
      name: form.name,

      propertyPriceYen: formatYen(propertyPrice),
      assumedRentYen: formatYen(parseYen(form.assumedRent)),
      customerRentYen: formatYen(parseYen(form.customerRent)),
      expectedSalePriceYen: formatYen(parseYen(form.expectedSalePrice)),

      buyCostTotalYen: formatYen(buyCostTotal),
      projectTotalYen: formatYen(projectTotal),

      assumedYield: formatPercent(assumedYield),
      surfaceYield: formatPercent(surfaceYield),

      buyCostBreakdown: form.costs
        .filter((c) => c.label || c.amount)
        .map((c) => ({
          label: c.label || "-",
          amount: formatYen(parseYen(c.amount)),
        })),
    };

    setList((prev) => [item, ...prev]);
    setPanelOpen(false);
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-700">
      {/* サイドバー */}
      <aside className="w-64 bg-[#FD9D24] text-white">
        <div className="h-28 bg-white flex items-center px-6 border-b">
          <Image src="/logo.png" alt="logo" width={48} height={48} />
          <span className="ml-3 text-2xl font-extrabold text-slate-800">
            PORTAL
          </span>
        </div>
        <nav className="p-4 space-y-2">
          <div className="bg-white text-[#FD9D24] px-4 py-3 rounded-xl font-bold">
            収益物件一覧
          </div>
        </nav>
      </aside>

      {/* メイン */}
      <main className="flex-1 flex flex-col">
        <header className="h-28 bg-white border-b flex items-center justify-end px-8">
          <button
            onClick={openCreate}
            className="w-12 h-12 rounded-full bg-[#FD9D24] text-white text-2xl font-bold hover:opacity-90"
          >
            +
          </button>
        </header>

        <div className="p-8 overflow-auto">
          <table className="w-full bg-white rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-sm">
              <tr>
                <th className="p-4 text-left">物件名</th>
                <th>プロジェクト総額</th>
                <th>想定家賃</th>
                <th>想定利回り</th>
                <th>客付家賃</th>
                <th>表面利回り</th>
                <th>物件価格</th>
                <th>買取経費</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    まだ登録された物件がありません。右上の「＋」から登録してください。
                  </td>
                </tr>
              )}

              {list.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedId(p.id)}
                >
                  <td className="p-4 text-left">{p.name}</td>
                  <td>{p.projectTotalYen}</td>
                  <td>{p.assumedRentYen}</td>
                  <td className="text-green-600">{p.assumedYield}</td>
                  <td>{p.customerRentYen}</td>
                  <td>{p.surfaceYield}</td>
                  <td>{p.propertyPriceYen}</td>
                  <td>{p.buyCostTotalYen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* 登録パネル */}
      {panelOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setPanelOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[560px] bg-white shadow-xl p-6 overflow-auto">
            <h2 className="text-lg font-bold mb-4">新規案件登録</h2>

            <form onSubmit={submit} className="space-y-4">
              <FieldZenkaku
                label="物件名"
                value={form.name}
                onChange={(v) =>
                  setForm((p) => ({ ...p, name: toZenkakuLoose(v) }))
                }
              />

              <FieldHankaku
                label="物件価格（円）"
                value={form.propertyPrice}
                onChange={(v) =>
                  setForm((p) => ({ ...p, propertyPrice: toHankakuNumberOnly(v) }))
                }
              />

              <div>
                <div className="font-semibold mb-2">買取経費</div>
                {form.costs.map((c, i) => (
                  <div key={c.id} className="flex gap-2 mb-2">
                    <input
                      className="flex-1 border rounded px-3 py-2"
                      placeholder="項目"
                      value={c.label}
                      onChange={(e) => {
                        const next = [...form.costs];
                        next[i].label = toZenkakuLoose(e.target.value);
                        setForm((p) => ({
                          ...p,
                          costs: ensureTrailingEmptyCostRow(next),
                        }));
                      }}
                    />
                    <input
                      className="w-40 border rounded px-3 py-2"
                      placeholder="金額"
                      value={c.amount}
                      onChange={(e) => {
                        const next = [...form.costs];
                        next[i].amount = toHankakuNumberOnly(e.target.value);
                        setForm((p) => ({
                          ...p,
                          costs: ensureTrailingEmptyCostRow(next),
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>

              <FieldHankaku
                label="想定家賃（円）"
                value={form.assumedRent}
                onChange={(v) =>
                  setForm((p) => ({ ...p, assumedRent: toHankakuNumberOnly(v) }))
                }
              />

              <FieldHankaku
                label="客付家賃（円）"
                value={form.customerRent}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    customerRent: toHankakuNumberOnly(v),
                  }))
                }
              />

              <FieldHankaku
                label="想定販売価格（円）"
                value={form.expectedSalePrice}
                onChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    expectedSalePrice: toHankakuNumberOnly(v),
                  }))
                }
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#FD9D24] text-white font-bold"
              >
                登録
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===============================
   入力コンポーネント
=============================== */
function FieldZenkaku(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-1">{props.label}</div>
      <input
        className="w-full border rounded px-4 py-3"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

function FieldHankaku(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-1">{props.label}</div>
      <input
        className="w-full border rounded px-4 py-3"
        inputMode="numeric"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}
