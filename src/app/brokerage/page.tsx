"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";

type CostItem = {
  id: string;
  label: string;
  amount: string;
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

// --- 便利関数群 ---
function uid() { return Math.random().toString(36).slice(2, 10); }

function parseYen(input: string): number | null {
  const s = (input ?? "").trim();
  if (!s) return null;
  const normalized = s.replace(/,/g, "").replace(/円/g, "");
  const n = Number(normalized);
  return isNaN(n) ? null : Math.round(n);
}

function formatYen(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "-";
  return `${Math.round(n).toLocaleString()}円`;
}

function formatPercent(p: number | null, digits = 1): string {
  if (p === null || !Number.isFinite(p)) return "-";
  return `${p.toFixed(digits)}%`;
}

function toZenkakuLoose(input: string): string {
  return (input ?? "").replace(/ /g, "　");
}

function toHankakuNumberOnly(input: string): string {
  const s = (input ?? "")
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[,円\s]/g, "");
  return s.replace(/[^0-9-]/g, "");
}

function ensureTrailingEmptyCostRow(items: CostItem[]): CostItem[] {
  const trimmed = items.map((x) => ({ ...x }));
  const last = trimmed[trimmed.length - 1];
  const lastHasValue = !!(last?.label?.trim() || last?.amount?.trim());
  if (!trimmed.length || lastHasValue) {
    trimmed.push({ id: uid(), label: "", amount: "" });
  }
  return trimmed;
}

export default function Page() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [form, setForm] = useState({
    name: "",
    assumedRentYen: "",
    customerRentYen: "",
    expectedSalePriceYen: "",
    propertyPriceYen: "",
    buyCostItems: ensureTrailingEmptyCostRow([{ id: uid(), label: "", amount: "" }]),
  });

  const active: string = "収益物件一覧";

  // --- 1. データの取得 ---
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.code,
          projectTotalYen: formatYen(p.projectTotal),
          assumedRentYen: formatYen(p.expectedRent),
          assumedYield: formatPercent(p.expectedYieldBp),
          customerRentYen: formatYen(p.agentRent),
          surfaceYield: formatPercent(p.surfaceYieldBp),
          expectedSalePriceYen: formatYen(p.expectedSalePrice),
          propertyPriceYen: formatYen(p.propertyPrice),
          buyCostTotalYen: formatYen(p.acquisitionCost),
          buyCostBreakdown: p.expenses?.map((e: any) => ({
            label: e.name,
            amount: formatYen(e.price)
          }))
        }));
        setProperties(formatted);
      } catch (e) {
        console.error("Fetch Error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // --- 2. データの保存 ---
  async function upsertProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("物件名は必須です");

    const buyCostTotal = form.buyCostItems.reduce((sum, item) => sum + (parseYen(item.amount) || 0), 0);
    const pPrice = parseYen(form.propertyPriceYen) || 0;
    
    const payload = {
      name: form.name,
      propertyPrice: pPrice,
      acquisitionCost: buyCostTotal,
      projectTotal: pPrice + buyCostTotal,
      expectedRent: parseYen(form.assumedRentYen),
      customerRent: parseYen(form.customerRentYen),
      expectedSalePrice: parseYen(form.expectedSalePriceYen),
      expenses: form.buyCostItems.filter(i => i.label || i.amount)
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) window.location.reload();
    } catch (err) {
      alert("保存に失敗しました");
    }
  }

  function toggleExpanded(id: string) {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (isLoading) return <div className="p-8 text-center font-bold">データを読み込み中...</div>;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-slate-50">
      {/* 左サイドバー */}
      <aside className="w-64 text-white flex flex-col flex-shrink-0" style={{ backgroundColor: BRAND_ORANGE }}>
        <div className="h-28 flex items-center px-6 border-b border-white/30 bg-white">
          <Image src="/logo.png" alt="PORTAL ロゴ" width={52} height={52} className="mr-4" priority />
          <span className="font-extrabold tracking-wide text-slate-800 text-2xl">PORTAL</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-hidden">
          <div className="flex items-center px-4 py-3 rounded-xl font-semibold bg-white text-[#FD9D24] shadow-sm">収益物件一覧</div>
          <div className="flex items-center px-4 py-3 rounded-xl font-semibold text-white hover:bg-white/15 cursor-pointer">顧客管理</div>
        </nav>
      </aside>

      {/* メイン */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-28 border-b border-slate-100 flex items-center justify-end px-8">
          <button onClick={() => { setForm({ name: "", assumedRentYen: "", customerRentYen: "", expectedSalePriceYen: "", propertyPriceYen: "", buyCostItems: ensureTrailingEmptyCostRow([{ id: uid(), label: "", amount: "" }]) }); setIsPanelOpen(true); }} className="bg-[#FD9D24] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-100 transition-transform active:scale-95">
            + 新規追加
          </button>
        </header>

        <div className="flex-1 overflow-hidden p-8 relative flex flex-col">
          <div className="mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-100 w-56">
              <p className="text-xs font-semibold text-slate-500">登録物件数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{properties.length}件</p>
            </div>
          </div>

          {/* テーブル外枠 */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col h-[calc(100%-88px)]">
            <div className="flex-1 overflow-y-auto overflow-x-auto snap-y snap-mandatory scroll-smooth">
              <table className="min-w-[1200px] w-full font-semibold text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-600 sticky top-0 z-20">
                    <th className="px-6 py-4 text-left sticky left-0 bg-slate-50 z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">物件名</th>
                    <th className="px-4 py-4">プロジェクト総額</th>
                    <th className="px-4 py-4">想定家賃</th>
                    <th className="px-4 py-4">想定利回り</th>
                    <th className="px-4 py-4">客付け家賃</th>
                    <th className="px-4 py-4">表面利回り</th>
                    <th className="px-4 py-4">想定販売価格</th>
                    <th className="px-4 py-4">物件価格</th>
                    <th className="px-4 py-4">買取経費</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {properties.map((p, idx) => (
                    <React.Fragment key={p.id}>
                      <tr className={["cursor-pointer snap-start transition-colors", selectedId === p.id ? "bg-orange-50/80" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/30", "hover:bg-orange-50/40"].join(" ")} onClick={() => setSelectedId(p.id)}>
                        <td className="px-6 py-5 whitespace-nowrap text-left sticky left-0 z-10 bg-inherit border-r border-slate-100/50 font-bold">{p.name}</td>
                        <td className="px-4 py-5 whitespace-nowrap">{p.projectTotalYen}</td>
                        <td className="px-4 py-5 whitespace-nowrap">{p.assumedRentYen}</td>
                        <td className="px-4 py-5 whitespace-nowrap text-green-600 font-bold">{p.assumedYield}</td>
                        <td className="px-4 py-5 whitespace-nowrap">{p.customerRentYen}</td>
                        <td className="px-4 py-5 whitespace-nowrap">{p.surfaceYield}</td>
                        <td className="px-4 py-5 whitespace-nowrap">{p.expectedSalePriceYen}</td>
                        <td className="px-4 py-5 whitespace-nowrap">{p.propertyPriceYen}</td>
                        <td className="px-4 py-5 whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            <span>{p.buyCostTotalYen}</span>
                            {p.buyCostBreakdown && p.buyCostBreakdown.length > 0 && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); toggleExpanded(p.id); }} className="text-[10px] text-[#FD9D24] hover:underline font-bold">
                                {expandedIds[p.id] ? "内訳を閉じる" : "経費内訳を表示"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedIds[p.id] && (
                        <tr className="bg-slate-50/50 snap-none">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-800 text-left font-medium">
                              <span className="text-slate-400 mr-2">【内訳】</span>
                              {p.buyCostBreakdown?.map(b => `${b.label}：${b.amount}`).join(" / ") || "内訳なし"}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 右サイドパネル (登録フォーム) */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
            <div className="relative w-[640px] max-w-[95vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">新規物件登録</h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
              </div>

              <form onSubmit={upsertProperty} className="flex-1 overflow-auto p-8 space-y-6">
                <FieldZenkaku label="物件名（必須）" value={form.name} onChange={(v: string) => setForm({ ...form, name: toZenkakuLoose(v) })} placeholder="例）アキサスハイツ東京" required />
                <FieldHankakuNumber label="物件価格（円）" value={form.propertyPriceYen} onChange={(v: string) => setForm({ ...form, propertyPriceYen: toHankakuNumberOnly(v) })} placeholder="例）78000000" />
                
                <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-slate-800">買取経費（内訳）</div>
                    <button type="button" onClick={() => setForm({ ...form, buyCostItems: ensureTrailingEmptyCostRow([...form.buyCostItems, { id: uid(), label: "", amount: "" }]) })} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#FD9D24] hover:bg-[#FD9D24] hover:text-white transition-colors">
                      <span className="text-xl font-bold">+</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.buyCostItems.map((item) => (
                      <div key={item.id} className="flex gap-2">
                        <input value={item.label} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, label: toZenkakuLoose(e.target.value) } : x); setForm({ ...form, buyCostItems: ensureTrailingEmptyCostRow(next) }); }} placeholder="項目" className="flex-1 rounded-xl border border-slate-200 px-4 py-2" />
                        <input value={item.amount} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, amount: toHankakuNumberOnly(e.target.value) } : x); setForm({ ...form, buyCostItems: ensureTrailingEmptyCostRow(next) }); }} placeholder="金額" className="w-36 rounded-xl border border-slate-200 px-4 py-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <FieldHankakuNumber label="想定家賃（円）" value={form.assumedRentYen} onChange={(v: string) => setForm({ ...form, assumedRentYen: toHankakuNumberOnly(v) })} />
                <FieldHankakuNumber label="客付け家賃（円）" value={form.customerRentYen} onChange={(v: string) => setForm({ ...form, customerRentYen: toHankakuNumberOnly(v) })} />
                <FieldHankakuNumber label="想定販売価格（円）" value={form.expectedSalePriceYen} onChange={(v: string) => setForm({ ...form, expectedSalePriceYen: toHankakuNumberOnly(v) })} />

                <div className="pt-6 border-t flex gap-4 bg-white sticky bottom-0">
                  <button type="button" onClick={() => setIsPanelOpen(false)} className="flex-1 border py-4 rounded-xl font-bold">キャンセル</button>
                  <button type="submit" className="flex-1 bg-[#FD9D24] text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 transition-transform active:scale-95">保存する</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// フォーム部品
function FieldZenkaku(props: any) {
  return (
    <label className="block">
      <div className="text-sm font-bold text-slate-700 mb-2 ml-1">{props.label}</div>
      <input {...props} onChange={(e) => props.onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-200 bg-white" />
    </label>
  );
}

function FieldHankakuNumber(props: any) {
  return (
    <label className="block">
      <div className="text-sm font-bold text-slate-700 mb-2 ml-1">{props.label}</div>
      <input {...props} onChange={(e) => props.onChange(e.target.value)} inputMode="numeric" className="w-full rounded-xl border border-slate-200 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-200 bg-white" />
    </label>
  );
}