"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function BrokeragePage() {
  const [activeTab, setActiveTab] = useState("仲介");
  const tabs = ["仲介", "転売", "収益"];

  // データ定義
  const dataMap: { [key: string]: any[] } = {
    "仲介": [
      { id: 1, name: "岐阜市八ツ梅町 土地", price: "1,500万円", status: "公開中", date: "2024/01/10" },
      { id: 2, name: "各務原市蘇原 戸建", price: "2,800万円", status: "商談中", date: "2024/01/08" },
    ],
    "転売": [
      { id: 3, name: "大垣市久瀬 収益ビル", price: "5,200万円", status: "公開中", date: "2024/01/05" },
    ],
    "収益": [
      { 
        id: 4, 
        name: "瑞穂市本田 店舗", 
        projectTotal: "4,500万円", 
        expectedRent: "25万円", 
        expectedYield: "6.5%", 
        tenantRent: "22万円", 
        surfaceYield: "5.8%",
        expectedSalesPrice: "4,800万円",
        propertyPrice: "4,000万円",
        purchaseCost: "300万円"
      },
    ]
  };

  const currentData = dataMap[activeTab] || [];

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      {/* ヘッダー */}
      <header className="flex items-center justify-end px-10 flex-shrink-0 border-b border-slate-100" style={{ height: "128px" }}>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm h-12 overflow-hidden">
          <button className="px-8 h-full font-bold text-slate-700 hover:text-white hover:bg-[#FD9D24] transition-all border-r outline-none text-sm">追加</button>
          <button className="px-8 h-full font-bold text-slate-700 hover:text-white hover:bg-[#FD9D24] transition-all border-r outline-none text-sm">編集</button>
          <button className="px-8 h-full font-bold text-slate-300 hover:text-white hover:bg-red-500 transition-all outline-none text-sm">削除</button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-hidden bg-[#f8f9fa] flex flex-col items-center">
        {/* スイッチ */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* テーブルエリア */}
        <div className="w-full h-full bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4 text-left">物件名</th>
                  
                  {activeTab === "収益" ? (
                    <>
                      <th className="px-4 py-4 text-center">プロジェクト総額</th>
                      <th className="px-4 py-4 text-center">想定家賃</th>
                      <th className="px-4 py-4 text-center text-[#FD9D24]">想定利回り</th>
                      <th className="px-4 py-4 text-center">客付け家賃</th>
                      <th className="px-4 py-4 text-center text-[#FD9D24]">表面利回り</th>
                      <th className="px-4 py-4 text-center">想定販売価格</th>
                      <th className="px-4 py-4 text-center">物件価格</th>
                      <th className="px-4 py-4 text-center">買取経費</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-4 text-center">総額</th>
                      <th className="px-8 py-4 text-center">ステータス</th>
                      <th className="px-8 py-4 text-center">更新日</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-5 font-black text-slate-800 text-sm whitespace-nowrap">{item.name}</td>
                    
                    {activeTab === "収益" ? (
                      <>
                        <td className="px-4 py-5 text-center font-bold text-slate-600 text-xs whitespace-nowrap">{item.projectTotal}</td>
                        <td className="px-4 py-5 text-center font-bold text-slate-600 text-xs whitespace-nowrap">{item.expectedRent}</td>
                        <td className="px-4 py-5 text-center font-black text-[#FD9D24] text-xs whitespace-nowrap">{item.expectedYield}</td>
                        <td className="px-4 py-5 text-center font-bold text-slate-600 text-xs whitespace-nowrap">{item.tenantRent}</td>
                        <td className="px-4 py-5 text-center font-black text-[#FD9D24] text-xs whitespace-nowrap">{item.surfaceYield}</td>
                        <td className="px-4 py-5 text-center font-bold text-slate-600 text-xs whitespace-nowrap">{item.expectedSalesPrice}</td>
                        <td className="px-4 py-5 text-center font-bold text-slate-600 text-xs whitespace-nowrap">{item.propertyPrice}</td>
                        <td className="px-4 py-5 text-center font-bold text-slate-600 text-xs whitespace-nowrap">{item.purchaseCost}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-5 text-center font-bold text-slate-600 text-sm">{item.price}</td>
                        <td className="px-8 py-5 text-center">
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black tracking-tighter border border-green-100">{item.status}</span>
                        </td>
                        <td className="px-8 py-5 text-center font-bold text-slate-400 text-xs">{item.date}</td>
                      </>
                    )}
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
                    </td>
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