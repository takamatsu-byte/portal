"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, ChevronRight } from "lucide-react";
import { createProjectAction } from "@/app/actions";

interface Project {
  id: string;
  propertyAddress: string | null;
  status: string;
  contractDate?: string | null;
  settlementDate?: string | null;
}

export default function DocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [address, setAddress] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("データ取得失敗:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    const result = await createProjectAction(address);
    if (result.success) {
      setAddress("");
      setIsModalOpen(false);
      fetchProjects();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ヘッダー：左側の縦線を消し、高さをpxで固定して一体化 */}
      <header 
        className="flex items-center justify-end px-10 flex-shrink-0 border-b border-slate-100"
        style={{ backgroundColor: "#ffffff", height: "128px" }}
      >
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm h-12 overflow-hidden">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 h-full font-bold text-slate-700 hover:text-white hover:bg-[#FD9D24] transition-all border-r outline-none"
          >
            ＋ 追加
          </button>
          <button disabled className="px-8 h-full font-bold border-r outline-none text-slate-300">編集</button>
          <button disabled className="px-8 h-full font-bold outline-none text-slate-300">削除</button>
        </div>
      </header>

      {/* メインエリア */}
      <main className="flex-1 p-8 overflow-hidden bg-[#f8f9fa]">
        <div className="h-full bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* 検索バー */}
          <div className="p-6 border-b border-slate-50 flex justify-center">
            <div className="max-w-[600px] w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="物件名・所在で検索..." className="w-full pl-12 pr-4 py-3 rounded-full border-none bg-slate-50 focus:ring-2 focus:ring-orange-500 transition-all text-sm"/>
            </div>
          </div>

          {/* 一覧テーブル */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black text-slate-400 sticky top-0 z-10 h-14 uppercase tracking-widest text-center">
                  <th className="px-8 text-left sticky left-0 bg-slate-50 z-20">種別</th>
                  <th className="px-8 text-left">物件名・所在</th>
                  <th className="px-4">契約予定日</th>
                  <th className="px-4">決済予定日</th>
                  <th className="px-8 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-center">
                {isFetching ? (
                  <tr><td colSpan={5} className="py-32 animate-pulse text-slate-300 italic font-black">LOADING...</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={5} className="py-32 text-center text-slate-300 font-bold font-sans">物件を登録して、資料の管理を始めましょう</td></tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id} className="group cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.location.href = `/documents/${p.id}`}>
                      <td className="px-8 py-5 text-left sticky left-0 bg-inherit"><span className="bg-blue-50 text-blue-500 text-[10px] px-3 py-1 rounded-full font-black uppercase">PROSPECT</span></td>
                      <td className="px-8 py-5 text-left font-black text-slate-800 whitespace-nowrap">{p.propertyAddress || "-"}</td>
                      <td className="px-4 py-5 font-bold text-slate-400">{p.contractDate || "未定"}</td>
                      <td className="px-4 py-5 font-bold text-slate-400">{p.settlementDate || "未定"}</td>
                      <td className="px-8 py-5 text-right">
                        <ChevronRight size={20} className="text-slate-200 group-hover:text-orange-500 transition-colors inline" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 新規登録モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl font-black mb-8 tracking-tighter uppercase text-center border-b pb-4 text-slate-800">New Property</h2>
            <form onSubmit={handleAddProject} className="space-y-8 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">物件名・所在</label>
                <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例：岐阜市八ツ梅町" className="w-full border-2 p-4 rounded-2xl font-bold bg-slate-50 outline-none focus:border-orange-500 transition-all text-lg text-slate-800"/>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border-2 p-5 rounded-2xl font-black text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-slate-800 text-white p-5 rounded-2xl font-black shadow-xl hover:bg-slate-700 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Save & Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}