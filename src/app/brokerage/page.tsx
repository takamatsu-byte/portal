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

// --- 便利関数群 ---
function uid() { return Math.random().toString(36).slice(2, 10); }

function parseNumber(input: any): number | null {
  if (input === null || input === undefined || input === "") return null;
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

function ensureTrailingEmptyCostRow(items: CostItem[]): CostItem[] {
  const trimmed = items.map((x) => ({ ...x }));
  const last = trimmed[trimmed.length - 1];
  if (!trimmed.length || !!(last?.label?.trim() || last?.amount?.trim())) {
    trimmed.push({ id: uid(), label: "", amount: "" });
  }
  return trimmed;
}

export default function Page() {
  const [properties, setProperties] = useState<Property[]>([]);
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

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        const formatted = data.map((p: any) => ({
          id: p.id, name: p.code, 
          projectTotal: p.projectTotal,
          assumedRent: p.expectedRent, 
          assumedYield: formatPercent(p.expectedYieldBp),
          customerRent: p.agentRent, 
          surfaceYield: formatPercent(p.surfaceYieldBp),
          expectedSalePrice: p.expectedSalePrice, 
          propertyPrice: p.propertyPrice,
          buyCostTotal: p.acquisitionCost,
          buyCostBreakdown: p.expenses?.map((e: any) => ({ label: e.name, amount: formatNumber(e.price) }))
        }));
        setProperties(formatted);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }
    fetchProjects();
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
    const p = properties.find(x => x.id === selectedId);
    if (!p) return;
    setMode("edit");
    setForm({
      name: p.name,
      assumedRent: p.assumedRent?.toString() || "",
      customerRent: p.customerRent?.toString() || "",
      expectedSalePrice: p.expectedSalePrice?.toString() || "",
      propertyPrice: p.propertyPrice?.toString() || "",
      buyCostItems: ensureTrailingEmptyCostRow(p.buyCostBreakdown?.map(b => ({ id: uid(), label: b.label, amount: b.amount.replace(/,/g, "") })) || [])
    });
    setIsPanelOpen(true);
  }

  async function onDelete() {
    if (!selectedId || !window.confirm("この物件を削除しますか？")) return;
    try {
      const res = await fetch(`/api/projects/${selectedId}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
    } catch (err) { alert("削除失敗"); }
  }

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-400">データを読み込み中...</div>;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-slate-50">
      <aside className="w-64 text-white flex flex-col flex-shrink-0" style={{ backgroundColor: BRAND_ORANGE }}>
        <div className="h-28 flex items-center px-6 border-b border-white/30 bg-white">
          <Image src="/logo.png" alt="PORTAL ロゴ" width={52} height={52} className="mr-4" priority />
          <span className="font-extrabold tracking-wide text-slate-800 text-2xl">PORTAL</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-2">
          <div className="flex items-center px-4 py-3 rounded-xl font-semibold bg-white text-[#FD9D24] shadow-sm cursor-default">収益物件一覧</div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white h-28 border-b border-slate-100 flex items-center px-8 justify-end">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden my-auto h-11">
              <button onClick={() => { setMode("create"); setForm({ name: "", assumedRent: "", customerRent: "", expectedSalePrice: "", propertyPrice: "", buyCostItems: [{ id: uid(), label: "", amount: "" }] }); setIsPanelOpen(true); }} className="group px-6 inline-flex items-center gap-2 font-bold text-slate-700 hover:text-white transition hover:bg-[#FD9D24]">
                <span className="text-[#FD9D24] group-hover:text-white text-xl">+</span><span className="text-sm">追加</span>
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <button onClick={openEdit} disabled={!selectedId} className={`px-6 inline-flex items-center font-bold transition h-full ${selectedId ? "text-slate-700 hover:text-white hover:bg-[#FD9D24]" : "text-slate-300 cursor-not-allowed"}`}>編集</button>
              <div className="w-px h-6 bg-slate-200" />
              <button onClick={onDelete} disabled={!selectedId} className={`px-6 inline-flex items-center font-bold transition h-full ${selectedId ? "text-slate-700 hover:text-white hover:bg-[#FD9D24]" : "text-slate-300 cursor-not-allowed"}`}>削除</button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden p-8 flex flex-col">
          <div className="mb-6"><div className="bg-white p-4 rounded-xl border border-slate-100 w-56"><p className="text-xs font-semibold text-slate-500">登録物件数</p><p className="text-2xl font-bold text-slate-800 mt-1">{properties.length}件</p></div></div>
          
          <div className="flex-1 bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col h-full shadow-sm">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full font-semibold text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs text-slate-500 sticky top-0 z-20 uppercase tracking-wider h-14">
                    <th className="px-6 text-left sticky left-0 bg-slate-50 z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">物件名</th>
                    <th>総額</th><th>想定家賃</th><th>想定利回り</th><th>客付け家賃</th><th>表面利回り</th><th>想定販売価格</th><th>物件価格</th><th>買取経費</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {properties.map((p) => (
                    <tr key={p.id} className={`group cursor-pointer transition-colors ${selectedId === p.id ? "bg-orange-50/60" : "bg-white"} hover:bg-orange-50/30`} onClick={() => setSelectedId(p.id)}>
                      <td className="px-6 py-5 whitespace-nowrap text-left sticky left-0 z-10 bg-inherit border-r border-slate-100/50 font-bold">{p.name}</td>
                      <td className="px-4 py-5">{formatNumber(p.projectTotal)}</td>
                      <td className="px-4 py-5">{formatNumber(p.assumedRent)}</td>
                      <td className="px-4 py-5 text-green-600 font-bold">{p.assumedYield}</td>
                      <td className="px-4 py-5">{formatNumber(p.customerRent)}</td>
                      <td className="px-4 py-5">{p.surfaceYield}</td>
                      <td className="px-4 py-5">{formatNumber(p.expectedSalePrice)}</td>
                      <td className="px-4 py-5">{formatNumber(p.propertyPrice)}</td>
                      <td className="px-4 py-5 text-center font-bold text-slate-800 select-none" onDoubleClick={() => setModalTarget(p)}>
                        {formatNumber(p.buyCostTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 右サイドパネル */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
            <div className="relative w-[540px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">{mode === "create" ? "新規物件登録" : "物件情報の編集"}</h2>
                <button onClick={() => setIsPanelOpen(false)} className="text-2xl text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={upsertProperty} className="flex-1 overflow-auto p-8 space-y-6">
                <FieldZenkaku label="物件名" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="物件名を入力してください" required />
                <FieldNumeric label="物件価格" value={form.propertyPrice} onChange={(v) => setForm({ ...form, propertyPrice: v })} />
                
                <div className="rounded-2xl border border-slate-100 p-6 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between font-bold text-sm text-slate-800">買取経費 内訳
                    <button type="button" onClick={() => setForm({ ...form, buyCostItems: ensureTrailingEmptyCostRow([...form.buyCostItems, { id: uid(), label: "", amount: "" }]) })} className="w-8 h-8 rounded-full bg-white border border-[#FD9D24]/20 flex items-center justify-center text-[#FD9D24] shadow-sm hover:bg-[#FD9D24] hover:text-white transition-colors">+</button>
                  </div>
                  {form.buyCostItems.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <input value={item.label} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, label: e.target.value } : x); setForm({ ...form, buyCostItems: ensureTrailingEmptyCostRow(next) }); }} placeholder="項目名" className="flex-1 rounded-xl border border-slate-200 px-4 py-2 bg-white" />
                      <input type="text" inputMode="numeric" value={item.amount} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, amount: e.target.value.replace(/[^0-9０-９]/g, '') } : x); setForm({ ...form, buyCostItems: ensureTrailingEmptyCostRow(next) }); }} placeholder="金額" className="w-28 rounded-xl border border-slate-200 px-4 py-2 bg-white text-right" />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FieldNumeric label="想定家賃" value={form.assumedRent} onChange={(v) => setForm({ ...form, assumedRent: v })} />
                  <FieldNumeric label="客付け家賃" value={form.customerRent} onChange={(v) => setForm({ ...form, customerRent: v })} />
                </div>
                <FieldNumeric label="想定販売価格" value={form.expectedSalePrice} onChange={(v) => setForm({ ...form, expectedSalePrice: v })} />

                <div className="pt-6 flex gap-4 bg-white sticky bottom-0">
                  <button type="button" onClick={() => setIsPanelOpen(false)} className="flex-1 border-2 border-slate-100 py-4 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-colors">キャンセル</button>
                  <button type="submit" className="flex-1 bg-[#FD9D24] text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 active:scale-[0.98] transition-transform">保存する</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 内訳表示モーダル */}
        {modalTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalTarget(null)} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-150">
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#FD9D24] rounded-full"></span>
                  買取経費の内訳
                </h3>
                <div className="space-y-3 mb-8">
                  {modalTarget.buyCostBreakdown?.map((b, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="font-semibold text-slate-500">{b.label}</span>
                      <span className="font-bold text-slate-800">{b.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center mb-6">
                  <span className="font-bold text-slate-500">合計</span>
                  <span className="text-2xl font-black text-slate-800">{formatNumber(modalTarget.buyCostTotal)}</span>
                </div>
                <button onClick={() => setModalTarget(null)} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-colors">閉じる</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 物件名・項目用（全角・制限なし）
function FieldZenkaku({ label, value, onChange, placeholder, required }: any) {
  return (
    <label className="block">
      <div className="text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">{label}</div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full rounded-xl border border-slate-200 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#FD9D24] transition-all bg-white font-semibold text-slate-800" />
    </label>
  );
}

// 数値用（半角・円なし、入力挙動修正済み）
function FieldNumeric({ label, value, onChange }: any) {
  return (
    <label className="block">
      <div className="text-xs font-bold text-slate-400 mb-2 ml-1 uppercase tracking-wider">{label}</div>
      <input type="text" inputMode="numeric" value={value} 
        onChange={(e) => {
          // 数字・全角数字以外をまず除外
          const raw = e.target.value.replace(/[^0-9０-９]/g, '');
          // 内部ではそのまま保持（変換しないことで入力バグを回避）
          onChange(raw);
        }}
        onBlur={(e) => {
          // 入力が終わった時（フォーカスが外れた時）に半角に強制変換
          const half = e.target.value.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
          onChange(half);
        }}
        placeholder="0"
        className="w-full rounded-xl border border-slate-200 px-5 py-4 outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#FD9D24] transition-all bg-white font-bold text-slate-800 text-right" 
      />
    </label>
  );
}