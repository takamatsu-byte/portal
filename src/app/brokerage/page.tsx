"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2 } from "lucide-react";

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
};

function formatNumber(n: number | null): string {
  return (n === null || !Number.isFinite(n)) ? "-" : n.toLocaleString();
}

export default function BrokeragePage() {
  const [activeTab, setActiveTab] = useState<"仲介" | "転売" | "収益">("収益");
  const [investmentData, setInvestmentData] = useState<Property[]>([]);
  const [brokerageData, setBrokerageData] = useState<Property[]>([]);
  const [resaleData, setResaleData] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invRes, brokRes, resalRes] = await Promise.all([
        fetch("/api/projects"), fetch("/api/brokerage"), fetch("/api/resale"),
      ]);
      const format = (list: any[]) => list.map((p: any) => ({
        ...p,
        id: p.id, name: p.propertyAddress || p.code || "-",
        projectTotal: p.projectTotal || 0, assumedRent: p.expectedRent || 0,
        assumedYield: p.expectedYieldBp ? `${p.expectedYieldBp.toFixed(1)}%` : "-",
        customerRent: p.agentRent || 0, surfaceYield: p.surfaceYieldBp ? `${p.surfaceYieldBp.toFixed(1)}%` : "-",
        expectedSalePrice: p.expectedSalePrice || 0, propertyPrice: p.propertyPrice || 0,
        sales: p.sales || 0, contractDate: p.contractDate || "-", settlementDate: p.settlementDate || "-",
        buyCostTotal: p.acquisitionCost || 0,
      }));
      if (invRes.ok) setInvestmentData(format(await invRes.json()));
      if (brokRes.ok) setBrokerageData(format(await brokRes.json()));
      if (resalRes.ok) setResaleData(format(await resalRes.json()));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currentProperties = activeTab === "仲介" ? brokerageData : activeTab === "転売" ? resaleData : investmentData;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ヘッダー：背景を純白(#ffffff)に固定し、ロゴエリアと高さを同期 */}
      <header 
        className="flex items-center justify-end px-10 flex-shrink-0 border-b border-slate-100"
        style={{ backgroundColor: "#ffffff", height: "128px" }}
      >
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm h-12 overflow-hidden">
          <button className="px-8 h-full font-bold text-slate-700 hover:text-white hover:bg-[#FD9D24] transition-all border-r outline-none">＋ 追加</button>
          <button disabled={!selectedId} className={`px-8 h-full font-bold border-r outline-none ${selectedId ? "text-slate-700 hover:bg-[#FD9D24] hover:text-white" : "text-slate-300"}`}>編集</button>
          <button disabled={!selectedId} className={`px-8 h-full font-bold outline-none ${selectedId ? "text-red-500 hover:bg-red-500 hover:text-white" : "text-slate-300"}`}>削除</button>
        </div>
      </header>

      {/* メインエリア：背景を少し落としてカードを際立たせる */}
      <main className="flex-1 p-8 overflow-hidden bg-[#f8f9fa]">
        <div className="h-full bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* タブ切り替えボタン */}
          <div className="flex justify-center py-6 border-b border-slate-50">
            <div className="inline-flex bg-slate-200 p-1 rounded-2xl shadow-inner">
              {["仲介", "転売", "収益"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab as any); setSelectedId(null); }} 
                  className={`px-10 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 一覧テーブル */}
          <div className="flex-1 overflow-auto text-center">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-400 sticky top-0 z-10 h-14 uppercase tracking-widest">
                  <th className="px-8 text-left sticky left-0 bg-slate-50 z-20">物件名・所在</th>
                  {activeTab === "仲介" ? (
                    <><th className="px-4">売上</th><th className="px-4">契約日</th><th className="px-4">決済日</th><th className="px-4">経費</th></>
                  ) : activeTab === "転売" ? (
                    <><th className="px-4">総額</th><th className="px-4">想定販売価格</th><th className="px-4">物件価格</th><th className="px-4">買取経費</th><th className="px-4 text-blue-600">売上見込み</th></>
                  ) : (
                    <><th className="px-4">総額</th><th className="px-4">想定家賃</th><th className="px-4 text-green-600">利回り</th><th className="px-4">客付家賃</th><th className="px-4">表面</th><th className="px-4">販売価格</th><th className="px-4">物件価格</th><th className="px-4">買取経費</th></>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {isLoading ? (
                  <tr><td colSpan={10} className="py-32 animate-pulse text-slate-300 italic font-black">LOADING...</td></tr>
                ) : currentProperties.map((p) => (
                  <tr key={p.id} onClick={() => setSelectedId(p.id)} className={`group cursor-pointer transition-colors ${selectedId === p.id ? "bg-orange-50" : "hover:bg-slate-50"}`}>
                    <td className="px-8 py-5 text-left sticky left-0 bg-inherit font-black text-slate-800 whitespace-nowrap">{p.name}</td>
                    {activeTab === "仲介" ? (
                      <><td className="px-4 font-black text-blue-600">{formatNumber(p.sales)}</td><td className="px-4 font-bold text-slate-400">{p.contractDate}</td><td className="px-4 font-bold text-slate-400">{p.settlementDate}</td><td className="px-4 font-black">{formatNumber(p.buyCostTotal)}</td></>
                    ) : activeTab === "転売" ? (
                      <><td className="px-4 font-bold">{formatNumber(p.projectTotal)}</td><td className="px-4 font-bold">{formatNumber(p.expectedSalePrice)}</td><td className="px-4 font-bold">{formatNumber(p.propertyPrice)}</td><td className="px-4 font-bold">{formatNumber(p.buyCostTotal)}</td><td className="px-4 font-black text-blue-600">{formatNumber((p.expectedSalePrice || 0) - (p.projectTotal || 0))}</td></>
                    ) : (
                      <><td className="px-4 font-bold">{formatNumber(p.projectTotal)}</td><td className="px-4 font-bold">{formatNumber(p.assumedRent)}</td><td className="px-4 text-green-600 font-black">{p.assumedYield}</td><td className="px-4 font-bold">{formatNumber(p.customerRent)}</td><td className="px-4 font-bold">{p.surfaceYield}</td><td className="px-4 font-bold">{formatNumber(p.expectedSalePrice)}</td><td className="px-4 font-bold">{formatNumber(p.propertyPrice)}</td><td className="px-4 font-black">{formatNumber(p.buyCostTotal)}</td></>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}