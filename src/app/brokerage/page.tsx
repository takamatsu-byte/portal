"use client";

import React, { useState, useEffect } from "react";

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
  buyCostTotal: number | null;
  buyCostBreakdown?: { label: string; amount: string }[];
};

const BRAND_ORANGE = "#FD9D24";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatNumber(n: number | null): string {
  return n === null || !Number.isFinite(n) ? "-" : n.toLocaleString();
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

  const [form, setForm] = useState({
    name: "",
    assumedRent: "",
    customerRent: "",
    expectedSalePrice: "",
    propertyPrice: "",
    buyCostItems: [{ id: uid(), label: "", amount: "" }],
  });

  const currentProperties =
    activeTab === "仲介"
      ? brokerageData
      : activeTab === "転売"
      ? resaleData
      : investmentData;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [invRes, brokRes, resalRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/brokerage"),
          fetch("/api/resale"),
        ]);

        const format = (list: any[]) =>
          list.map((p: any) => ({
            id: p.id,
            name: p.propertyAddress || p.code || "-",
            projectTotal: p.projectTotal || 0,
            assumedRent: p.expectedRent || 0,
            assumedYield: p.expectedYieldBp
              ? `${p.expectedYieldBp.toFixed(1)}%`
              : "-",
            customerRent: p.agentRent || 0,
            surfaceYield: p.surfaceYieldBp
              ? `${p.surfaceYieldBp.toFixed(1)}%`
              : "-",
            expectedSalePrice: p.expectedSalePrice || p.sales || 0,
            propertyPrice: p.propertyPrice || 0,
            buyCostTotal: p.acquisitionCost || 0,
            buyCostBreakdown: p.expenses?.map((e: any) => ({
              label: e.name,
              amount: formatNumber(e.price),
            })),
          }));

        if (invRes.ok) setInvestmentData(format(await invRes.json()));
        if (brokRes.ok) setBrokerageData(format(await brokRes.json()));
        if (resalRes.ok) setResaleData(format(await resalRes.json()));
      } catch (e) {
        console.error("データの取得に失敗しました:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const buyCostTotal = form.buyCostItems.reduce(
      (sum, item) => sum + (parseNumber(item.amount) || 0),
      0
    );
    const pPrice = parseNumber(form.propertyPrice) || 0;

    // タブごとに保存先のURL（エンドポイント）を切り替える
    const endpoint =
      activeTab === "仲介"
        ? "/api/brokerage"
        : activeTab === "転売"
        ? "/api/resale"
        : "/api/projects";

    const payload = {
      name: form.name,
      propertyPrice: pPrice,
      acquisitionCost: buyCostTotal,
      projectTotal: pPrice + buyCostTotal,
      expectedRent: parseNumber(form.assumedRent),
      customerRent: parseNumber(form.customerRent),
      expectedSalePrice: parseNumber(form.expectedSalePrice),
      expenses: form.buyCostItems
        .filter((i) => i.label || i.amount)
        .map((i) => ({ name: i.label, price: parseNumber(i.amount) || 0 })),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const errData = await res.json();
        alert(`保存に失敗しました: ${errData.error || "サーバーエラー"}`);
      }
    } catch (err) {
      alert("通信に失敗しました。ネットワークを確認してください。");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-slate-50">
      {/* サイドバー */}
      <aside
        className="w-64 text-white flex flex-col flex-shrink-0"
        style={{ backgroundColor: BRAND_ORANGE }}
      >
        <div className="h-28 flex items-center px-6 bg-white">
          <span className="text-slate-800 text-2xl font-black">PORTAL</span>
        </div>
        <nav className="p-4">
          <div className="bg-white text-[#FD9D24] p-3 rounded-xl font-bold text-center shadow-sm text-sm">
            物件管理
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="bg-white h-28 border-b flex items-center justify-end px-8">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm h-12 overflow-hidden">
            <button
              onClick={() => setIsPanelOpen(true)}
              className="px-8 h-full font-bold text-slate-700 hover:text-white hover:bg-[#FD9D24] transition-all border-r outline-none"
            >
              ＋ 追加
            </button>
            <button
              disabled
              className="px-8 h-full font-bold text-slate-300 transition-all border-r outline-none cursor-not-allowed"
            >
              編集
            </button>
            <button
              disabled
              className="px-8 h-full font-bold text-slate-300 transition-all outline-none cursor-not-allowed"
            >
              削除
            </button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="flex-1 p-8 flex flex-col overflow-hidden text-center">
          {/* タブ切り替え */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-200 p-1 rounded-full shadow-inner">
              {["仲介", "転売", "収益"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as any);
                    setSelectedId(null);
                  }}
                  className={`px-12 py-3 rounded-full text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-white text-slate-800 shadow-md"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 一覧テーブル */}
          <div className="flex-1 bg-white rounded-2xl border shadow-sm overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-[11px] text-slate-400 sticky top-0 z-10 h-14 uppercase tracking-widest text-center">
                  <th className="px-6 text-left sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                    物件名
                  </th>
                  <th>総額</th>
                  <th>想定家賃</th>
                  <th>利回り</th>
                  <th>客付家賃</th>
                  <th>表面</th>
                  <th>販売価格</th>
                  <th>物件価格</th>
                  <th>買取経費</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-32 text-slate-400 animate-pulse">
                      読み込み中...
                    </td>
                  </tr>
                ) : currentProperties.length > 0 ? (
                  currentProperties.map((p) => (
                    <tr
                      key={p.id}
                      className={`group cursor-pointer transition-colors ${
                        selectedId === p.id
                          ? "bg-orange-50/70"
                          : "hover:bg-orange-50/30"
                      }`}
                      onClick={() => setSelectedId(p.id)}
                    >
                      <td className="px-6 py-6 text-left sticky left-0 bg-inherit border-r border-slate-100/50 font-bold text-slate-800 whitespace-nowrap">
                        {p.name}
                      </td>
                      <td className="px-4">{formatNumber(p.projectTotal)}</td>
                      <td className="px-4">{formatNumber(p.assumedRent)}</td>
                      <td className="px-4 text-green-600 font-bold">
                        {p.assumedYield}
                      </td>
                      <td className="px-4">{formatNumber(p.customerRent)}</td>
                      <td className="px-4">{p.surfaceYield}</td>
                      <td className="px-4">{formatNumber(p.expectedSalePrice)}</td>
                      <td className="px-4">{formatNumber(p.propertyPrice)}</td>
                      <td
                        className="font-bold select-none px-4"
                        onDoubleClick={() => setModalTarget(p)}
                      >
                        {formatNumber(p.buyCostTotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-32 text-slate-300 italic font-bold"
                    >
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 登録用パネル（右から出てくるパネル） */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsPanelOpen(false)}
            />
            <div className="relative w-[540px] bg-white h-full shadow-2xl p-8 flex flex-col">
              <h2 className="text-2xl font-bold mb-8 border-b pb-4">
                {activeTab}案件登録
              </h2>
              <form
                onSubmit={handleSave}
                className="space-y-6 flex-1 overflow-auto text-left"
              >
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-slate-400">物件名</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border-2 p-4 rounded-xl font-bold"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-slate-400">
                    物件価格
                  </span>
                  <input
                    value={form.propertyPrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        propertyPrice: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    className="w-full border-2 p-4 rounded-xl font-bold text-right"
                  />
                </label>

                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between font-bold text-sm">
                    買取経費内訳{" "}
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          buyCostItems: [
                            ...form.buyCostItems,
                            { id: uid(), label: "", amount: "" },
                          ],
                        })
                      }
                      className="text-[#FD9D24]"
                    >
                      ＋追加
                    </button>
                  </div>
                  {form.buyCostItems.map((item) => (
                    <div key={item.id} className="flex gap-2">
                      <input
                        value={item.label}
                        onChange={(e) => {
                          const next = form.buyCostItems.map((x) =>
                            x.id === item.id ? { ...x, label: e.target.value } : x
                          );
                          setForm({ ...form, buyCostItems: next });
                        }}
                        placeholder="項目名"
                        className="flex-1 p-2 rounded-lg border"
                      />
                      <input
                        value={item.amount}
                        onChange={(e) => {
                          const next = form.buyCostItems.map((x) =>
                            x.id === item.id
                              ? {
                                  ...x,
                                  amount: e.target.value.replace(/[^0-9]/g, ""),
                                }
                              : x
                          );
                          setForm({ ...form, buyCostItems: next });
                        }}
                        placeholder="金額"
                        className="w-24 p-2 rounded-lg border text-right"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-400">
                      想定家賃
                    </span>
                    <input
                      value={form.assumedRent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          assumedRent: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full border-2 p-4 rounded-xl font-bold text-right"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-400">
                      客付家賃
                    </span>
                    <input
                      value={form.customerRent}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customerRent: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full border-2 p-4 rounded-xl font-bold text-right"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-slate-400">
                    販売価格 / 売上
                  </span>
                  <input
                    value={form.expectedSalePrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expectedSalePrice: e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        ),
                      })
                    }
                    className="w-full border-2 p-4 rounded-xl font-bold text-right"
                  />
                </label>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    className="flex-1 border-2 p-4 rounded-xl font-bold text-slate-400"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#FD9D24] text-white p-4 rounded-xl font-bold shadow-lg"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 内訳モーダル（ダブルクリックで表示されるやつ） */}
        {modalTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setModalTarget(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-150">
              <h3 className="text-xl font-bold mb-6 text-center border-b pb-4">
                買取経費内訳
              </h3>
              <div className="space-y-4 mb-8 text-left">
                {modalTarget.buyCostBreakdown?.map((b, i) => (
                  <div key={i} className="flex justify-between font-bold text-sm">
                    <span className="text-slate-400">{b.label}</span>
                    <span>{b.amount}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModalTarget(null)}
                className="w-full bg-[#FD9D24] text-white py-4 rounded-2xl font-bold"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}