"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { 
  FolderOpen, ArrowLeft, Loader2, ExternalLink, 
  FileText, Home, Map, Database, Edit3, Plus, Trash2, Eye 
} from "lucide-react";
import Link from "next/link";

export default function DocumentDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(false); // 開発用に即表示
  
  // 坪換算の計算
  const toTsubo = (m2: number) => (m2 * 0.3025).toFixed(2);

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      {/* ヘッダー：高さを少し抑えて(128px→100px)圧迫感を軽減 */}
      <header className="flex items-center justify-between px-8 flex-shrink-0 border-b border-slate-100 bg-white" style={{ height: "100px" }}>
        <Link href="/documents" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs">
          <ArrowLeft size={16} /> 戻る
        </Link>
        <div className="flex gap-3">
          <button className="px-5 py-2 rounded-lg border border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Edit3 size={14} /> 物件管理編集
          </button>
          <button className="px-6 py-2 rounded-lg bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
            保存
          </button>
        </div>
      </header>

      {/* メインコンテンツ：1画面に収めるため grid を調整 */}
      <main className="flex-1 overflow-hidden bg-[#f8f9fa] p-4 lg:p-6">
        <div className="h-full max-w-[1400px] mx-auto grid grid-cols-12 gap-4">
          
          {/* 左側：登記情報エリア (土地・建物) */}
          <div className="col-span-8 flex flex-col gap-4 overflow-hidden">
            
            {/* 土地の情報 */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg text-[#FD9D24]"><Map size={18} /></div>
                <h2 className="text-sm font-black text-slate-800 uppercase">土地の情報</h2>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                <CompactInput label="所在" className="col-span-2" />
                <CompactInput label="地番" />
                <CompactInput label="地目" />
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">地積</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" className="w-full border p-2 rounded-lg font-bold bg-slate-50 text-xs focus:ring-1 focus:ring-orange-400 outline-none" placeholder="㎡" />
                    <span className="text-[10px] font-black text-slate-300 whitespace-nowrap">{toTsubo(0)}坪</span>
                  </div>
                </div>
                <CompactInput label="所有者住所" className="col-span-2" />
                <CompactInput label="所有者氏名" />
              </div>
            </section>

            {/* 建物の情報 */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Home size={18} /></div>
                <h2 className="text-sm font-black text-slate-800 uppercase">建物の情報</h2>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-3 overflow-y-auto pr-1 custom-scrollbar">
                <CompactInput label="所在" />
                <CompactInput label="家屋番号" />
                <CompactInput label="築年数" />
                <CompactInput label="種類" />
                <CompactInput label="構造" />
                <div />
                
                {/* 床面積セクション：スクロールせずに見えるよう1列に */}
                <div className="col-span-3 bg-slate-50 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">床面積 (㎡)</label>
                    <button className="text-[9px] font-black text-blue-500 hover:underline">+ 階層追加</button>
                  </div>
                  <div className="flex gap-2">
                    {["1階", "2階"].map((f, i) => (
                      <div key={i} className="flex-1 flex items-center bg-white border rounded-lg overflow-hidden h-8">
                        <span className="bg-slate-100 px-2 text-[10px] font-bold text-slate-500 h-full flex items-center">{f}</span>
                        <input type="number" className="w-full px-2 text-xs font-bold outline-none" placeholder="0.00" />
                      </div>
                    ))}
                  </div>
                </div>

                <CompactInput label="所有者住所" className="col-span-2" />
                <CompactInput label="所有者氏名" />
              </div>
            </section>
          </div>

          {/* 右側：ドライブ & 成約サマリー */}
          <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
            
            {/* ドライブ格納窓：高さを固定してプレビューを優先 */}
            <section className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col h-[65%] min-h-0">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-[#FD9D24]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Google Drive</span>
                </div>
                <ExternalLink size={14} className="text-white/40 hover:text-white cursor-pointer" />
              </div>
              
              <div className="space-y-2 mb-4 overflow-y-auto custom-scrollbar flex-shrink-0">
                {["売買契約書.pdf", "登記事項証明書.pdf", "公図.jpg"].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/file">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={12} className="text-white/40" />
                      <span className="text-[10px] font-bold truncate">{file}</span>
                    </div>
                    <Eye size={12} className="opacity-0 group-hover/file:opacity-100 text-[#FD9D24]" />
                  </div>
                ))}
              </div>

              <div className="flex-1 bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center p-4 border-dashed min-h-0">
                <Database size={20} className="text-white/10 mb-2" />
                <p className="text-[9px] font-bold text-white/30">プレビュー表示エリア</p>
              </div>
            </section>

            {/* 成約情報サマリー：極限までコンパクトに */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 min-h-0">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">成約・管理状況</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                <div className="flex justify-between border-b pb-1 col-span-2">
                  <span className="text-slate-400 font-bold">種別</span>
                  <span className="text-slate-800 font-black">収益案件</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold">利回り</span>
                  <span className="text-green-500 font-black text-sm">8.5%</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold">決済予定</span>
                  <span className="text-slate-800 font-black">03/15</span>
                </div>
                <div className="flex justify-between border-b pb-1 col-span-2">
                  <span className="text-slate-400 font-bold">ステータス</span>
                  <span className="text-blue-500 font-black">資料精査中</span>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

// 超コンパクトな入力パーツ
function CompactInput({ label, className = "" }: { label: string, className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <input 
        type="text" 
        className="w-full border p-2 rounded-lg font-bold bg-slate-50 outline-none focus:ring-1 focus:ring-orange-400 text-xs transition-all text-slate-800"
      />
    </div>
  );
}