"use client";

import React, { useState, useEffect } from "react";
import { Folder, Search, Grid, List, ChevronRight, Loader2, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  propertyAddress: string | null;
  updatedAt: string;
}

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async () => {
    if (!newProjectName) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyAddress: newProjectName }),
      });
      if (res.ok) {
        setNewProjectName("");
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-[#FD9D24]" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden relative">
      <header className="flex items-center justify-end px-10 flex-shrink-0 border-b border-slate-100" style={{ height: "128px" }}>
        
        {/* 修正箇所: ボタンユニットのみ変更 */}
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm h-12 overflow-hidden px-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-3 text-slate-700 hover:text-[#FD9D24] transition-all outline-none"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
          <button 
            disabled={!selectedId}
            className={`p-3 outline-none transition-all ${selectedId ? "text-slate-400 hover:text-red-500" : "text-slate-200"}`}
          >
            <Trash2 size={20} />
          </button>
        </div>
        {/* 修正箇所おわり */}

      </header>

      <main className="flex-1 p-6 overflow-hidden bg-[#f8f9fa]">
        <div className="h-full bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white/50">
            <div className="max-w-[360px] w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="物件名を検索..." 
                className="w-full pl-11 pr-4 py-2 rounded-full border-none bg-slate-50 focus:ring-2 focus:ring-orange-500 transition-all text-xs font-bold text-slate-800 outline-none" 
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}><List size={16} /></button>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}><Grid size={16} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {viewMode === 'list' ? (
              <div className="grid grid-cols-4 gap-3">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    onClick={() => setSelectedId(project.id)}
                    className={`flex items-center justify-between px-3 py-4 rounded-2xl border transition-all cursor-pointer group ${selectedId === project.id ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-white border-slate-100 hover:border-orange-100 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 truncate">
                      <Folder size={24} className="text-[#FD9D24] fill-orange-50 flex-shrink-0" />
                      <div className="flex flex-col truncate">
                        <Link href={`/documents/${project.id}`} className="text-base font-black text-slate-800 truncate hover:underline leading-tight">{project.propertyAddress || "名称未設定"}</Link>
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-200 group-hover:text-orange-500 transition-colors flex-shrink-0 ml-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                {projects.map((project) => (
                  <div key={project.id} onClick={() => setSelectedId(project.id)} className={`flex flex-col items-center gap-3 p-4 rounded-[2rem] transition-all cursor-pointer group text-center ${selectedId === project.id ? "bg-orange-50 ring-2 ring-orange-200 shadow-sm" : "hover:bg-slate-50"}`}>
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FD9D24] shadow-sm group-hover:scale-105 transition-transform">
                      <Folder size={28} className="fill-orange-100/50" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-800 line-clamp-2">{project.propertyAddress || "名称未設定"}</span>
                      <span className="text-[8px] font-bold text-slate-400 block tracking-tighter">{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tighter">新規物件の登録</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">物件名</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="例：岐阜市八ツ梅町 土地"
                  className="w-full border-2 p-4 rounded-2xl font-bold bg-slate-50 outline-none focus:border-[#FD9D24] transition-all text-sm text-slate-800"
                />
              </div>
              <button onClick={handleSave} className="w-full py-4 bg-[#FD9D24] text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all uppercase tracking-widest text-xs mt-4">物件を作成する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}