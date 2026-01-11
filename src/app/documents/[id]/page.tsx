"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, ExternalLink, Loader2, Save, FolderOpen, MapPin, Home, DollarSign, UserPlus, Plus, CheckSquare } from "lucide-react";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await fetch(`/api/projects/${id}`);
        const pData = await pRes.json();
        setProject(pData);
        if (pData.googleDriveFolderId) {
          const fRes = await fetch(`/api/documents?folderId=${pData.googleDriveFolderId}`);
          setFiles(await fRes.json());
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>;

  return (
    <div className="p-4 bg-white min-h-screen w-full font-sans text-slate-700">
      {/* スリムヘッダー */}
      <div className="flex justify-between items-center h-10 mb-4">
        <div className="flex items-baseline gap-3">
          <div className="px-2 py-0.5 bg-orange-50 text-orange-500 border border-orange-100 rounded text-[11px] font-black uppercase">Property Specification</div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter truncate max-w-2xl">{project?.propertyAddress}</h1>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-[#1e293b] text-white rounded-xl font-bold text-xs shadow-md hover:bg-slate-800 transition-all">
          <Save size={14} /> 保存して反映
        </button>
      </div>

      <div className="space-y-4 w-full max-w-[1200px]">
        
        {/* PDF完全再現ボックス */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden w-full">
          
          {/* --- 土地の情報 --- */}
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-800 mb-4">土地の情報</h2>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">所在</label>
              <div className="w-[200px] shrink-0 h-9 bg-slate-50 rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-1 px-2 text-[10px] font-bold text-slate-400 uppercase">
                <div className="w-[100px] shrink-0">地番</div>
                <div className="w-[100px] shrink-0 text-center">地目</div>
                <div className="w-[100px] shrink-0 text-center">地積</div>
                <div className="w-[250px] shrink-0 ml-3">所有者</div>
                <div className="w-[500px] shrink-0 ml-1">所有者住所</div>
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-1 items-center">
                  <div className="w-[100px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
                  <div className="w-[100px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
                  <div className="w-[100px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
                  <div className="w-[250px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs ml-3"></div>
                  <div className="w-[500px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs ml-1"></div>
                </div>
              ))}
              
              <div className="flex gap-1 mt-6 items-center">
                <div className="w-[100px] shrink-0"></div>
                <div className="w-[100px] shrink-0 text-right pr-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">計</span>
                </div>
                <div className="w-[100px] shrink-0">
                  <div className="h-9 bg-slate-50 rounded-lg border border-slate-200 px-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">0.00</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">㎡</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 h-9 ml-4">
                  <span className="text-xs font-bold text-slate-600">0.00</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">坪</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- 建物の情報 --- */}
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-800 mb-4">建物の情報</h2>
            
            <div className="space-y-6">
              {/* 所在 */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">所在</label>
                <div className="w-[200px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
              </div>

              {/* ラベル行 */}
              <div className="flex gap-1 px-0 text-[10px] font-bold text-slate-400 uppercase items-end">
                <div className="w-[100px] shrink-0">家屋番号</div>
                <div className="w-[200px] shrink-0 text-center">種類</div>
                <div className="w-[250px] shrink-0 text-center">構造</div>
                <div className="w-[100px] shrink-0">床面積</div>
                <div className="w-[100px] shrink-0"></div> {/* 延床用スペーサー */}
                <div className="w-[180px] shrink-0 ml-4">築年月日</div>
                <div className="w-[100px] shrink-0">築後年数</div>
              </div>

              {/* 入力フォーム行 */}
              <div className="flex gap-1 items-start">
                <div className="w-[100px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
                <div className="w-[200px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
                <div className="w-[250px] shrink-0 h-9 bg-white rounded-lg border border-slate-200 px-3 flex items-center text-xs"></div>
                
                {/* 床面積 1階/2階 */}
                <div className="flex flex-col gap-1 shrink-0">
                  <div className="w-[100px] h-9 bg-white rounded-lg border border-slate-200 px-2 flex items-center text-[10px] gap-1 shrink-0">
                    <span className="text-slate-400 shrink-0">1階</span>
                    <div className="flex-1 text-right text-xs"></div>
                    <span className="text-slate-300">㎡</span>
                  </div>
                  <div className="w-[100px] h-9 bg-white rounded-lg border border-slate-200 px-2 flex items-center text-[10px] gap-1 shrink-0">
                    <span className="text-slate-400 shrink-0">2階</span>
                    <div className="flex-1 text-right text-xs"></div>
                    <span className="text-slate-300">㎡</span>
                  </div>
                </div>

                {/* 延床 */}
                <div className="w-[100px] h-9 bg-slate-50 rounded-lg border border-slate-200 px-2 flex items-center text-[10px] gap-1 shrink-0 font-bold">
                  <span className="text-slate-500 shrink-0">延床</span>
                  <div className="flex-1 text-right text-xs"></div>
                  <span className="text-slate-400">㎡</span>
                </div>

                {/* 築年月日 */}
                <div className="w-[180px] h-9 bg-white rounded-lg border border-slate-200 px-2 flex items-center justify-between text-[10px] shrink-0 ml-4">
                  <span className="w-8 text-right"></span><span className="text-slate-300 ml-0.5">年</span>
                  <span className="w-6 text-right"></span><span className="text-slate-300 ml-0.5">月</span>
                  <span className="w-6 text-right"></span><span className="text-slate-300 ml-0.5">日</span>
                </div>

                {/* 築後年数 (築年月日の右隣) */}
                <div className="w-[100px] h-9 bg-white rounded-lg border border-slate-200 px-2 flex items-center justify-end text-xs shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">年 築</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- 固定資産税 --- */}
          <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
            <div className="p-6">
              <h3 className="text-[10px] font-black text-slate-800 mb-4 uppercase tracking-[0.2em]">固定資産税 評価額</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 mb-1 block uppercase">土地</label>
                  <div className="w-full h-9 bg-slate-50 rounded-lg border border-slate-200 px-3 flex items-center justify-end text-xs">円</div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 mb-1 block uppercase">建物</label>
                  <div className="w-full h-9 bg-slate-50 rounded-lg border border-slate-200 px-3 flex items-center justify-end text-xs">円</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-[10px] font-black text-slate-800 mb-4 uppercase tracking-[0.2em]">固定資産税 年税額</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 mb-1 block uppercase">土地</label>
                  <div className="w-full h-9 bg-slate-50 rounded-lg border border-slate-200 px-3 flex items-center justify-end text-xs">円</div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 mb-1 block uppercase">建物</label>
                  <div className="w-full h-9 bg-slate-50 rounded-lg border border-slate-200 px-3 flex items-center justify-end text-xs">円</div>
                </div>
              </div>
            </div>
          </div>

          {/* --- 備考欄 --- */}
          <div className="p-6 bg-slate-50/10">
            <h3 className="text-[10px] font-black text-slate-800 mb-4 uppercase tracking-[0.2em]">備考欄</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4 mb-4">
              {["再建築不可", "既存宅地(調整区域)", "心理的瑕疵あり", "附属建物"].map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border-2 border-slate-300 group-hover:border-orange-500 transition-all bg-white"></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="bg-white rounded-[1.5rem] p-4 border border-slate-200 shadow-sm">
          <h2 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-1.5 tracking-widest">
            <FolderOpen size={14} /> Documents
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {files.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600">
                <span className="truncate">{file.name}</span>
                <ExternalLink size={12} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}