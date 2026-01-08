"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

type CostItem = { id: string; label: string; amount: string; };
type Property = {
  id: string; name: string; projectTotal: number | null; assumedRent: number | null;
  assumedYield: string; customerRent: number | null; surfaceYield: string;
  expectedSalePrice: number | null; propertyPrice: number | null;
  buyCostTotal: number | null; buyCostBreakdown?: { label: string; amount: string }[];
};

const BRAND_ORANGE = "#FD9D24";

function uid() { return Math.random().toString(36).slice(2, 10); }

function parseNumber(input: any): number | null {
  if (!input) return null;
  const s = String(input).replace(/,/g, "").replace(/円/g, "");
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function formatNumber(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "-";
  return n.toLocaleString();
}

function formatPercent(p: number | null, digits = 1): string {
  if (p === null || !Number.isFinite(p)) return "-";
  return `${p.toFixed(digits)}%`;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<"仲介" | "転売" | "収益">("収益");
  
  // 各タブのデータ管理
  const [brokerageData, setBrokerageData] = useState<Property[]>([]);
  const [resaleData, setResaleData] = useState<Property[]>([]);
  const [investmentData, setInvestmentData] = useState<Property[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<Property | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [form, setForm] = useState({
    name: "", assumedRent: "", customerRent: "",
    expectedSalePrice: "", propertyPrice: "",
    buyCostItems: [{ id: uid(), label: "", amount: "" }],
  });

  // 現在表示中のリストを特定
  const currentProperties = activeTab === "仲介" ? brokerageData : activeTab === "転売" ? resaleData : investmentData;

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        const formatted = data.map((p: any) => ({
          id: p.id, name: p.code, projectTotal: p.projectTotal,
          assumedRent: p.expectedRent, assumedYield: formatPercent(p.expectedYieldBp),
          customerRent: p.agentRent, surfaceYield: formatPercent(p.surfaceYieldBp),
          expectedSalePrice: p.expectedSalePrice, propertyPrice: p.propertyPrice,
          buyCostTotal: p.acquisitionCost,
          buyCostBreakdown: p.expenses?.map((e: any) => ({ label: e.name, amount: formatNumber(e.price) }))
        }));
        // 現時点ではAPIから全件取得し、便宜上「収益」に入れています
        setInvestmentData(formatted);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }
    fetchAll();
  }, []);

  async function upsertProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("物件名は必須です");

    const buyCostTotal = form.buyCostItems.reduce((sum, item) => sum + (parseNumber(item.amount) || 0), 0);
    const pPrice = parseNumber(form.propertyPrice) || 0;
    const payload = {
      name: form.name, propertyPrice: pPrice, acquisitionCost: buyCostTotal,
      projectTotal: pPrice + buyCostTotal, expectedRent: parseNumber(form.assumedRent),
      customerRent: parseNumber(form.customerRent), expectedSalePrice: parseNumber(form.expectedSalePrice),
      expenses: form.buyCostItems.filter(i => i.label || i.amount)
    };

    try {
      const url = mode === "create" ? "/api/projects" : `/api/projects/${selectedId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) window.location.reload();
    } catch (err) { alert("保存に失敗しました"); }
  }

  function openEdit() {
    const p = currentProperties.find(x => x.id === selectedId);
    if (!p) return;
    setMode("edit");
    setForm({
      name: p.name,
      assumedRent: p.assumedRent?.toString() || "",
      customerRent: p.customerRent?.toString() || "",
      expectedSalePrice: p.expectedSalePrice?.toString() || "",
      propertyPrice: p.propertyPrice?.toString() || "",
      buyCostItems: p.buyCostBreakdown?.map(b => ({ id: uid(), label: b.label, amount: b.amount.replace(/,/g, "") })) || [{ id: uid(), label: "", amount: "" }]
    });
    setIsPanelOpen(true);
  }

  async function onDelete() {
    if (!selectedId || !window.confirm(`この${activeTab}案件を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/projects/${selectedId}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
    } catch (err) { alert("削除失敗"); }
  }

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-400 tracking-widest">LOADING...</div>;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-slate-50">
      <aside className="w-64 text-white flex flex-col flex-shrink-0" style={{ backgroundColor: BRAND_ORANGE }}>
        <div className="h-28 flex items-center px-6 border-b border-white/30 bg-white">
          <Image src="/logo.png" alt="PORTAL" width={52} height={52} className="mr-4" priority />
          <span className="font-extrabold tracking-wide text-slate-800 text-2xl">PORTAL</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-2">
          <div className="flex items-center px-4 py-3 rounded-xl font-semibold bg-white text-[#FD9D24] shadow-sm cursor-default text-sm">物件管理</div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダーボタンエリア */}
        <div className="bg-white h-28 border-b border-slate-100 flex items-center px-8 justify-end">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden h-11">
              <button 
                onClick={() => { setMode("create"); setForm({ name: "", assumedRent: "", customerRent: "", expectedSalePrice: "", propertyPrice: "", buyCostItems: [{ id: uid(), label: "", amount: "" }] }); setIsPanelOpen(true); }} 
                className="group px-6 h-full inline-flex items-center gap-2 font-bold text-slate-700 hover:text-white transition hover:bg-[#FD9D24] border-r border-slate-100"
              >
                <span className="text-[#FD9D24] group-hover:text-white text-xl">+</span>
                <span className="text-sm">{activeTab}案件を追加</span>
              </button>
              <button 
                onClick={openEdit} 
                disabled={!selectedId} 
                className={`px-6 inline-flex items-center font-bold transition h-full text-sm border-r border-slate-100 ${selectedId ? "text-slate-700 hover:text-white hover:bg-[#FD9D24]" : "text-slate-300 cursor-not-allowed"}`}
              >
                編集
              </button>
              <button 
                onClick={onDelete} 
                disabled={!selectedId} 
                className={`px-6 inline-flex items-center font-bold transition h-full text-sm ${selectedId ? "text-slate-700 hover:text-white hover:bg-[#FD9D24]" : "text-slate-300 cursor-not-allowed"}`}
              >
                削除
              </button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden p-8 flex flex-col">
          {/* 上部スイッチエリア */}
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex bg-slate-200 p-1 rounded-full shadow-inner">
              {(["仲介", "転売", "収益"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedId(null); }}
                  className={`px-10 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    activeTab === tab 
                    ? "bg-white text-slate-800 shadow-md transform scale-105" 
                    : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col h-full shadow-sm">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full font-semibold border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] text-slate-400 sticky top-0 z-20 uppercase tracking-[0.1em] h-14">
                    <th className="px-6 text-left sticky left-0 bg-slate-50 z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">物件名</th>
                    <th className="px-4 text-center">プロジェクト総額</th>
                    <th className="px-4 text-center">想定家賃</th>
                    <th className="px-4 text-center">想定利回り</th>
                    <th className="px-4 text-center">客付け家賃</th>
                    <th className="px-4 text-center">表面利回り</th>
                    <th className="px-4 text-center">想定販売価格</th>
                    <th className="px-4 text-center">物件価格</th>
                    <th className="px-4 text-center">買取経費</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentProperties.length > 0 ? currentProperties.map((p) => (
                    <tr 
                      key={p.id} 
                      className={`group cursor-pointer transition-colors ${selectedId === p.id ? "bg-orange-50/60" : "bg-white hover:bg-orange-50/30"}`} 
                      onClick={() => setSelectedId(p.id)}
                    >
                      <td className="px-6 py-5 whitespace-nowrap text-left sticky left-0 z-10 bg-inherit border-r border-slate-100/50 font-bold text-slate-800">{p.name}</td>
                      <td className="px-4 py-5 text-center">{formatNumber(p.projectTotal)}</td>
                      <td className="px-4 py-5 text-center">{formatNumber(p.assumedRent)}</td>
                      <td className="px-4 py-5 text-center text-green-600 font-bold">{p.assumedYield}</td>
                      <td className="px-4 py-5 text-center">{formatNumber(p.customerRent)}</td>
                      <td className="px-4 py-5 text-center">{p.surfaceYield}</td>
                      <td className="px-4 py-5 text-center">{formatNumber(p.expectedSalePrice)}</td>
                      <td className="px-4 py-5 text-center">{formatNumber(p.propertyPrice)}</td>
                      <td 
                        className="px-4 py-5 text-center font-bold text-slate-800 select-none" 
                        onDoubleClick={() => setModalTarget(p)}
                      >
                        {formatNumber(p.buyCostTotal)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-20">
                          <span className="text-4xl">📁</span>
                          <span className="text-sm font-bold tracking-widest">{activeTab}案件は登録されていません</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 右パネル */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
            <div className="relative w-[540px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">{activeTab}案件を{mode === "create" ? "登録" : "編集"}</h2>
                <button onClick={() => setIsPanelOpen(false)} className="text-2xl text-slate-400 hover:text-slate-600 px-2">✕</button>
              </div>
              <form onSubmit={upsertProperty} className="flex-1 overflow-auto p-8 space-y-6 text-left">
                <FieldZenkaku label="物件名" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} placeholder="物件名を入力してください" required />
                <FieldNumeric label="物件価格" value={form.propertyPrice} onChange={(v: string) => setForm({ ...form, propertyPrice: v })} />
                <div className="rounded-2xl border border-slate-100 p-6 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-400">買取経費 内訳
                    <button type="button" onClick={() => setForm({ ...form, buyCostItems: [...form.buyCostItems, { id: uid(), label: "", amount: "" }] })} className="w-8 h-8 rounded-full bg-white border border-[#FD9D24]/20 flex items-center justify-center text-[#FD9D24] shadow-sm hover:bg-[#FD9D24] hover:text-white transition-colors">+</button>
                  </div>
                  {form.buyCostItems.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <input value={item.label} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, label: e.target.value } : x); setForm({ ...form, buyCostItems: next }); }} placeholder="項目名" className="flex-1 rounded-xl border border-slate-200 px-4 py-2 bg-white text-sm" />
                      <input type="text" value={item.amount} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, amount: e.target.value.replace(/[^0-9]/g, '') } : x); setForm({ ...form, buyCostItems: next }); }} placeholder="金額" className="w-28 rounded-xl border border-slate-200 px-4 py-2 bg-white text-right text-sm font-bold" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldNumeric label="想定家賃" value={form.assumedRent} onChange={(v: string) => setForm({ ...form, assumedRent: v })} />
                  <FieldNumeric label="客付け家賃" value={form.customerRent} onChange={(v: string) => setForm({ ...form, customerRent: v })} />
                </div>
                <FieldNumeric label="想定販売価格" value={form.expectedSalePrice} onChange={(v: string) => setForm({ ...form, expectedSalePrice: v })} />
                <div className="pt-6 flex gap-4 bg-white sticky bottom-0">
                  <button type="button" onClick={() => setIsPanelOpen(false)} className="flex-1 border-2 border-slate-100 py-4 rounded-xl font-bold text-slate-400 text-sm">キャンセル</button>
                  <button type="submit" className="flex-1 bg-[#FD9D24] text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 text-sm">保存する</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 内訳モーダル */}
        {modalTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalTarget(null)} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in duration-150">
              <h3 className="text-xl font-bold text-slate-800 mb-6">{modalTarget.name} の経費内訳</h3>
              <div className="space-y-3 mb-8">
                {modalTarget.buyCostBreakdown?.map((b, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-400">{b.label}</span>
                    <span className="font-bold text-slate-800">{b.amount}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl flex justify-between items-center mb-8">
                <span className="font-bold text-slate-400 text-xs">合計金額</span>
                <span className="text-2xl font-black text-slate-800">{formatNumber(modalTarget.buyCostTotal)}</span>
              </div>
              <button onClick={() => setModalTarget(null)} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-xl">閉じる</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FieldZenkaku({ label, value, onChange, placeholder, required }: any) {
  return (
    <label className="block">
      <div className="text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">{label}</div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full rounded-xl border border-slate-200 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#FD9D24] transition-all bg-white font-bold text-slate-800" />
    </label>
  );
}

function FieldNumeric({ label, value, onChange }: any) {
  return (
    <label className="block">
      <div className="text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">{label}</div>
      <input type="text" inputMode="numeric" value={value} 
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={(e) => {
          const half = e.target.value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
          onChange(half);
        }}
        placeholder="0"
        className="w-full rounded-xl border border-slate-200 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#FD9D24] transition-all bg-white font-bold text-slate-800 text-right" 
      />
    </label>
  );
}