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

export default function Page() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    assumedRentYen: "",
    customerRentYen: "",
    expectedSalePriceYen: "",
    propertyPriceYen: "",
    buyCostItems: [{ id: uid(), label: "", amount: "" }],
  });

  // --- 1. データの読み込み (永続化のキモ) ---
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        
        // データベースの形式を画面表示用のProperty型に変換
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
        console.error("読み込みエラー:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // --- 2. データの保存 (APIへ送信) ---
  async function upsertProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("物件名は必須です");

    const buyCostTotal = form.buyCostItems.reduce((sum, item) => sum + (parseYen(item.amount) || 0), 0);
    const pPrice = parseYen(form.propertyPriceYen) || 0;
    const projectTotal = pPrice + buyCostTotal;

    const payload = {
      name: form.name,
      propertyPrice: pPrice,
      acquisitionCost: buyCostTotal,
      projectTotal: projectTotal,
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

      if (res.ok) {
        // 保存に成功したら画面をリロードして最新データを取得
        window.location.reload();
      }
    } catch (err) {
      alert("保存に失敗しました");
    }
  }

  // --- その他UI操作 ---
  function toggleExpanded(id: string) {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (isLoading) return <div className="p-8 text-center">データを読み込み中...</div>;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-slate-50">
      {/* 左サイドバー */}
      <aside className="w-64 text-white flex flex-col flex-shrink-0" style={{ backgroundColor: BRAND_ORANGE }}>
        <div className="h-28 flex items-center px-6 border-b border-white/30 bg-white text-slate-800 font-bold text-2xl">PORTAL</div>
        <nav className="flex-1 px-3 py-6 space-y-2">
          <div className="bg-white text-[#FD9D24] px-4 py-3 rounded-xl font-semibold">収益物件一覧</div>
          <div className="text-white hover:bg-white/15 px-4 py-3 rounded-xl font-semibold cursor-pointer">顧客管理</div>
        </nav>
      </aside>

      {/* メイン */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-28 border-b border-slate-100 flex items-center justify-end px-8">
           <button onClick={() => { setMode("create"); setIsPanelOpen(true); }} className="bg-[#FD9D24] text-white px-6 py-2 rounded-full font-bold">+ 新規追加</button>
        </header>

        <div className="flex-1 p-8 overflow-hidden flex flex-col">
          <div className="mb-4 font-bold text-lg">登録物件数: {properties.length}件</div>
          
          <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-auto snap-y snap-mandatory">
            <table className="w-full text-center border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b">
                <tr>
                  <th className="px-6 py-4 text-left">物件名</th>
                  <th>総額</th>
                  <th>想定利回り</th>
                  <th>物件価格</th>
                  <th>買取経費</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p, idx) => (
                  <React.Fragment key={p.id}>
                    <tr 
                      className={`snap-start border-b hover:bg-orange-50/30 cursor-pointer ${selectedId === p.id ? 'bg-orange-50' : ''}`}
                      onClick={() => setSelectedId(p.id)}
                    >
                      <td className="px-6 py-5 text-left font-bold">{p.name}</td>
                      <td>{p.projectTotalYen}</td>
                      <td className="text-green-600 font-bold">{p.assumedYield}</td>
                      <td>{p.propertyPriceYen}</td>
                      <td>
                        <div className="flex flex-col">
                          {p.buyCostTotalYen}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleExpanded(p.id); }}
                            className="text-xs text-orange-500 font-bold hover:underline"
                          >
                            {expandedIds[p.id] ? "閉じる" : "経費内訳を表示"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedIds[p.id] && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="px-8 py-4 text-left text-sm">
                          <div className="bg-white p-3 rounded-lg border border-slate-200">
                            {p.buyCostBreakdown?.map(b => `${b.label}: ${b.amount}`).join(" / ") || "内訳なし"}
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

        {/* 右サイドパネル (簡易版) */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20" onClick={() => setIsPanelOpen(false)} />
            <div className="relative w-[500px] bg-white h-full p-8 shadow-xl overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">新規登録</h2>
              <form onSubmit={upsertProperty} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">物件名</label>
                  <input className="w-full border rounded-lg p-3" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">物件価格 (円)</label>
                  <input className="w-full border rounded-lg p-3" value={form.propertyPriceYen} onChange={e => setForm({...form, propertyPriceYen: e.target.value})} />
                </div>
                {/* 経費入力、他項目も同様に配置... */}
                <button type="submit" className="w-full bg-[#FD9D24] text-white py-4 rounded-xl font-bold mt-8">データベースに保存</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}