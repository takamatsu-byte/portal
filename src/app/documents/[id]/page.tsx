"use client";

import React, { useState } from "react";
import { ArrowLeft, MapPin, Home, HardDrive, CheckCircle2, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DocumentDetailPage() {
  const [activeSubTab, setActiveSubTab] = useState("土地の情報");
  const subTabs = ["土地の情報", "建物の情報", "ドライブ", "成約情報"];

  const CompactInput = ({ label, className = "", defaultValue = "" }: { label: string, className?: string, defaultValue?: string }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <input 
        type="text" 
        defaultValue={defaultValue}
        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" 
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      <header className="flex items-center justify-between px-10 flex-shrink-0 border-b border-slate-100" style={{ height: "128px" }}>
        <div className="flex items-center gap-6">
          <Link href="/documents" className="p-3 rounded-full bg-slate-50 text-slate-400 hover:text-slate-800 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {subTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeSubTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-3 bg-[#FD9D24] text-white rounded-full font-black text-xs shadow-lg shadow-orange-100 hover:bg-orange-500 transition-all uppercase tracking-widest">
          <Save size={16} /> 保存
        </button>
      </header>

      <main className="flex-1 overflow-hidden bg-[#f8f9fa] p-6">
        <div className="h-full max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
          <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 text-[#FD9D24] rounded-lg"><MapPin size={20} /></div>
                <h3 className="font-black text-slate-800 text-lg tracking-tighter">土地の情報</h3>
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <CompactInput label="物件名" className="col-span-2" />
                <CompactInput label="地番" />
                <CompactInput label="地目" />
                <CompactInput label="地積" />
                <CompactInput label="都市計画" />
                <CompactInput label="用途地域" />
                <CompactInput label="建蔽率" />
                <CompactInput label="容積率" />
                <CompactInput label="接道状況" />
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Home size={20} /></div>
                <h3 className="font-black text-slate-800 text-lg tracking-tighter">建物の情報</h3>
              </div>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <CompactInput label="物件名" className="col-span-2" />
                <CompactInput label="家屋番号" />
                <CompactInput label="種類" />
                <CompactInput label="構造" />
                <CompactInput label="床面積" />
                <CompactInput label="築年月" />
              </div>
            </section>
          </div>

          <aside className="col-span-4 flex flex-col gap-6 overflow-hidden">
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><HardDrive size={20} /></div>
                  <h3 className="font-black text-slate-800 text-lg tracking-tighter">ドライブ</h3>
                </div>
                <button className="text-[10px] font-black text-[#FD9D24] hover:underline uppercase tracking-widest">開く</button>
              </div>
              <div className="flex-1 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4"><Loader2 className="text-slate-200 animate-spin" /></div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Drive IDを連携中...</p>
              </div>
            </section>

            <section className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 text-white rounded-lg"><CheckCircle2 size={20} /></div>
                <h3 className="font-black text-white text-lg tracking-tighter">成約ステータス</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">現在の状態</p>
                  <p className="text-white font-bold text-sm">調査・資料収集中</p>
                </div>
                <button className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                  成約としてマークする
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}