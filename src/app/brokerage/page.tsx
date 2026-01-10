"use client";

import React, { useState, useEffect, useCallback } from "react";

type Property = {
  id: string;
  name: string;
  projectTotal: number | null;
  assumedRent: number | null;
  assumedYield: string;
  customerRent: number | null;
  surfaceYield: string;
  expectedSalePrice: number | null;
  propertyPrice: number | null;
  sales: number | null;
  contractDate: string | null;
  settlementDate: string | null;
  buyCostTotal: number | null;
  buyCostBreakdown?: { label: string; amount: string }[];
};

const BRAND_ORANGE = "#FD9D24";

function uid() { return Math.random().toString(36).slice(2, 10); }

function formatNumber(n: number | null): string {
  return (n === null || !Number.isFinite(n)) ? "-" : n.toLocaleString();
}

function parseNumber(input: any): number | null {
  if (!input) return null;
  const s = String(input).replace(/,/g, "").replace(/[^0-9]/g, "");
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<"仲介" | "転売" | "収益">("収益");
  const [investmentData, setInvestmentData] = useState<Property[]>([]);
  const [brokerageData, setBrokerageData] = useState<Property[]>([]);
  const [resaleData, setResaleData] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<Property | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "", propertyPrice: "", assumedRent: "", customerRent: "",
    expectedSalePrice: "", sales: "", contractDate: "", settlementDate: "",
    buyCostItems: [{ id: uid(), label: "", amount: "" }],
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invRes, brokRes, resalRes] = await Promise.all([
        fetch("/api/projects"), fetch("/api/brokerage"), fetch("/api/resale"),
      ]);
      const format = (list: any[]) => list.map((p: any) => ({
        id: p.id, name: p.propertyAddress || p.code || "-",
        projectTotal: p.projectTotal || 0, assumedRent: p.expectedRent || 0,
        assumedYield: p.expectedYieldBp ? `${p.expectedYieldBp.toFixed(1)}%` : "-",
        customerRent: p.agentRent || 0, surfaceYield: p.surfaceYieldBp ? `${p.surfaceYieldBp.toFixed(1)}%` : "-",
        expectedSalePrice: p.expectedSalePrice || 0, propertyPrice: p.propertyPrice || 0,
        sales: p.sales || 0, contractDate: p.contractDate || "-", settlementDate: p.settlementDate || "-",
        buyCostTotal: p.acquisitionCost || 0,
        buyCostBreakdown: p.expenses?.map((e: any) => ({ label: e.name, amount: formatNumber(e.price) })),
      }));
      if (invRes.ok) setInvestmentData(format(await invRes.json()));
      if (brokRes.ok) setBrokerageData(format(await brokRes.json()));
      if (resalRes.ok) setResaleData(format(await resalRes.json()));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete() {
    if (!selectedId || !confirm("削除しますか？")) return;
    const ep = activeTab === "仲介" ? "/api/brokerage" : activeTab === "転売" ? "/api/resale" : "/api/projects";
    const res = await fetch(`${ep}?id=${selectedId}`, { method: "DELETE" });
    if (res.ok) { setSelectedId(null); fetchData(); }
  }

  function openEditPanel() {
    const list = activeTab === "仲介" ? brokerageData : activeTab === "転売" ? resaleData : investmentData;
    const t = list.find(p => p.id === selectedId);
    if (!t) return;
    setIsEditMode(true);
    setForm({
      name: t.name, propertyPrice: t.propertyPrice?.toString() || "",
      assumedRent: t.assumedRent?.toString() || "", customerRent: t.customerRent?.toString() || "",
      expectedSalePrice: t.expectedSalePrice?.toString() || "", sales: t.sales?.toString() || "",
      contractDate: t.contractDate === "-" ? "" : t.contractDate || "",
      settlementDate: t.settlementDate === "-" ? "" : t.settlementDate || "",
      buyCostItems: t.buyCostBreakdown?.length 
        ? t.buyCostBreakdown.map(b => ({ id: uid(), label: b.label, amount: b.amount.replace(/,/g, "") }))
        : [{ id: uid(), label: "", amount: "" }]
    });
    setIsPanelOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const endpoint = activeTab === "仲介" ? "/api/brokerage" : activeTab === "転売" ? "/api/resale" : "/api/projects";
    const buyCost = form.buyCostItems.reduce((sum, item) => sum + (parseNumber(item.amount) || 0), 0);
    const pPrice = parseNumber(form.propertyPrice) || 0;
    const payload = {
      id: isEditMode ? selectedId : undefined, name: form.name, propertyPrice: pPrice,
      acquisitionCost: buyCost, projectTotal: pPrice + buyCost,
      expectedRent: parseNumber(form.assumedRent), customerRent: parseNumber(form.customerRent),
      expectedSalePrice: parseNumber(form.expectedSalePrice), sales: parseNumber(form.sales),
      contractDate: form.contractDate, settlementDate: form.settlementDate,
      expenses: form.buyCostItems.filter(i => i.label || i.amount).map(i => ({ name: i.label, price: parseNumber(i.amount) || 0 }))
    };
    const res = await fetch(endpoint, {
      method: isEditMode ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setIsPanelOpen(false); setIsEditMode(false); setSelectedId(null);
      setForm({ name: "", propertyPrice: "", assumedRent: "", customerRent: "", expectedSalePrice: "", sales: "", contractDate: "", settlementDate: "", buyCostItems: [{ id: uid(), label: "", amount: "" }] });
      fetchData();
    }
  }

  const currentProperties = activeTab === "仲介" ? brokerageData : activeTab === "転売" ? resaleData : investmentData;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-slate-50">
      <aside className="w-64 text-white flex flex-col flex-shrink-0" style={{ backgroundColor: BRAND_ORANGE }}>
        <div className="h-28 flex items-center px-6 bg-white"><span className="text-slate-800 text-2xl font-black">PORTAL</span></div>
        <nav className="p-4"><div className="bg-white text-[#FD9D24] p-3 rounded-xl font-bold text-center shadow-sm text-sm">物件管理</div></nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-28 border-b flex items-center justify-end px-8">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm h-12 overflow-hidden">
            <button onClick={() => { setIsEditMode(false); setIsPanelOpen(true); }} className="px-8 h-full font-bold text-slate-700 hover:text-white hover:bg-[#FD9D24] transition-all border-r outline-none">＋ 追加</button>
            <button onClick={openEditPanel} disabled={!selectedId} className={`px-8 h-full font-bold border-r outline-none ${selectedId ? "text-slate-700 hover:bg-[#FD9D24] hover:text-white" : "text-slate-300"}`}>編集</button>
            <button onClick={handleDelete} disabled={!selectedId} className={`px-8 h-full font-bold outline-none ${selectedId ? "text-red-500 hover:bg-red-500 hover:text-white" : "text-slate-300"}`}>削除</button>
          </div>
        </header>

        <div className="flex-1 p-8 flex flex-col overflow-hidden text-center">
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-200 p-1 rounded-full shadow-inner">
              {["仲介", "転売", "収益"].map((tab) => (
                <button key={tab} onClick={() => { setActiveTab(tab as any); setSelectedId(null); }} className={`px-12 py-3 rounded-full text-sm font-bold transition-all ${activeTab === tab ? "bg-white text-slate-800 shadow-md" : "text-slate-500"}`}>{tab}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl border shadow-sm overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-[11px] text-slate-400 sticky top-0 z-10 h-14 uppercase tracking-widest text-center">
                  <th className="px-6 text-left sticky left-0 bg-slate-50 z-20">物件名</th>
                  {activeTab === "仲介" ? (
                    <><th>売上</th><th>契約日</th><th>決済日</th><th>経費</th></>
                  ) : activeTab === "転売" ? (
                    <><th>総額</th><th>想定販売価格</th><th>物件価格</th><th>買取経費</th><th>売上見込み</th></>
                  ) : (
                    <><th>総額</th><th>想定家賃</th><th>利回り</th><th>客付家賃</th><th>表面</th><th>販売価格</th><th>物件価格</th><th>買取経費</th></>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {isLoading ? (<tr><td colSpan={10} className="py-32 animate-pulse">読み込み中...</td></tr>) : currentProperties.map((p) => (
                  <tr key={p.id} onClick={() => setSelectedId(p.id)} className={`group cursor-pointer ${selectedId === p.id ? "bg-orange-50/70" : "hover:bg-orange-50/30"}`}>
                    <td className="px-6 py-6 text-left sticky left-0 bg-inherit font-bold text-slate-800 whitespace-nowrap">{p.name}</td>
                    {activeTab === "仲介" ? (
                      <><td className="px-4 font-bold text-blue-600">{formatNumber(p.sales)}</td><td className="px-4">{p.contractDate}</td><td className="px-4">{p.settlementDate}</td><td className="px-4 font-bold" onDoubleClick={() => setModalTarget(p)}>{formatNumber(p.buyCostTotal)}</td></>
                    ) : activeTab === "転売" ? (
                      <><td className="px-4">{formatNumber(p.projectTotal)}</td><td className="px-4">{formatNumber(p.expectedSalePrice)}</td><td className="px-4">{formatNumber(p.propertyPrice)}</td><td className="px-4 font-bold" onDoubleClick={() => setModalTarget(p)}>{formatNumber(p.buyCostTotal)}</td><td className="px-4 font-bold text-blue-600">{formatNumber((p.expectedSalePrice || 0) - (p.projectTotal || 0))}</td></>
                    ) : (
                      <><td className="px-4">{formatNumber(p.projectTotal)}</td><td className="px-4">{formatNumber(p.assumedRent)}</td><td className="px-4 text-green-600 font-bold">{p.assumedYield}</td><td className="px-4">{formatNumber(p.customerRent)}</td><td className="px-4">{p.surfaceYield}</td><td className="px-4">{formatNumber(p.expectedSalePrice)}</td><td className="px-4">{formatNumber(p.propertyPrice)}</td><td className="px-4 font-bold" onDoubleClick={() => setModalTarget(p)}>{formatNumber(p.buyCostTotal)}</td></>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
            <div className="relative w-[540px] bg-white h-full shadow-2xl p-8 flex flex-col overflow-auto text-left">
              <h2 className="text-2xl font-bold mb-8 border-b pb-4">{activeTab}案件{isEditMode ? "編集" : "登録"}</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <label className="block space-y-2"><span className="text-xs font-bold text-slate-400">物件名</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 p-4 rounded-xl font-bold" required /></label>
                {activeTab === "仲介" ? (
                  <>
                    <label className="block space-y-2"><span className="text-xs font-bold text-slate-400">売上金額</span><input value={form.sales} onChange={(e) => setForm({ ...form, sales: e.target.value.replace(/[^0-9]/g, "") })} className="w-full border-2 p-4 rounded-xl font-bold text-right" /></label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block space-y-2"><span className="text-xs font-bold text-slate-400">契約日</span><input type="date" value={form.contractDate} onChange={(e) => setForm({ ...form, contractDate: e.target.value })} className="w-full border-2 p-4 rounded-xl font-bold" /></label>
                      <label className="block space-y-2"><span className="text-xs font-bold text-slate-400">決済日</span><input type="date" value={form.settlementDate} onChange={(e) => setForm({ ...form, settlementDate: e.target.value })} className="w-full border-2 p-4 rounded-xl font-bold" /></label>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block space-y-2"><span className="text-xs font-bold text-slate-400">物件価格</span><input value={form.propertyPrice} onChange={(e) => setForm({ ...form, propertyPrice: e.target.value.replace(/[^0-9]/g, "") })} className="w-full border-2 p-4 rounded-xl font-bold text-right" /></label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block space-y-2"><span className="text-xs font-bold text-slate-400">{activeTab === "転売" ? "想定販売価格" : "想定家賃"}</span><input value={activeTab === "転売" ? form.expectedSalePrice : form.assumedRent} onChange={(e) => setForm({ ...form, [activeTab === "転売" ? "expectedSalePrice" : "assumedRent"]: e.target.value.replace(/[^0-9]/g, "") })} className="w-full border-2 p-4 rounded-xl font-bold text-right" /></label>
                      {activeTab === "収益" && (
                        <label className="block space-y-2"><span className="text-xs font-bold text-slate-400">客付家賃</span><input value={form.customerRent} onChange={(e) => setForm({ ...form, customerRent: e.target.value.replace(/[^0-9]/g, "") })} className="w-full border-2 p-4 rounded-xl font-bold text-right" /></label>
                      )}
                    </div>
                  </>
                )}
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between font-bold text-sm">経費内訳 <button type="button" onClick={() => setForm({ ...form, buyCostItems: [...form.buyCostItems, { id: uid(), label: "", amount: "" }] })} className="text-[#FD9D24]">＋追加</button></div>
                  {form.buyCostItems.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <input value={item.label} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, label: e.target.value } : x); setForm({ ...form, buyCostItems: next }); }} placeholder="項目名" className="flex-1 p-2 rounded-lg border" />
                      <input value={item.amount} onChange={(e) => { const next = form.buyCostItems.map(x => x.id === item.id ? { ...x, amount: e.target.value.replace(/[^0-9]/g, "") } : x); setForm({ ...form, buyCostItems: next }); }} placeholder="金額" className="w-24 p-2 rounded-lg border text-right" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setIsPanelOpen(false)} className="flex-1 border-2 p-4 rounded-xl font-bold text-slate-400">取消</button>
                  <button type="submit" className="flex-1 bg-[#FD9D24] text-white p-4 rounded-xl font-bold shadow-lg">保存</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalTarget(null)} />
            <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-left">
              <h3 className="text-xl font-bold mb-6 text-center border-b pb-4">経費内訳</h3>
              <div className="space-y-4 mb-8">{modalTarget.buyCostBreakdown?.map((b, i) => (<div key={i} className="flex justify-between font-bold text-sm"><span className="text-slate-400">{b.label}</span><span>{b.amount}</span></div>))}</div>
              <button onClick={() => setModalTarget(null)} className="w-full bg-[#FD9D24] text-white py-4 rounded-2xl font-bold">閉じる</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}