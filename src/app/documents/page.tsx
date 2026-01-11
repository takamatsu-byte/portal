"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, ChevronRight, Loader2, X, Inbox } from "lucide-react";
import Link from "next/link";

export default function DocumentsExplorerPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleCreate = async () => {
    const trimmedName = newProjectName.trim();
    if (!trimmedName) return;
    if (projects.some(p => p.propertyAddress?.toLowerCase() === trimmedName.toLowerCase())) {
      setError("すでに同じ名称のファイルがあります");
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyAddress: trimmedName }),
      });
      if (res.ok) {
        setNewProjectName("");
        setError(null);
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (error) {
      setError("作成に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (window.confirm("選択した物件を削除してもよろしいですか？")) {
      try {
        const res = await fetch(`/api/projects/${selectedId}`, { method: "DELETE" });
        if (res.ok) {
          setSelectedId(null);
          fetchProjects();
        }
      } catch (error) {
        alert("削除に失敗しました");
      }
    }
  };

  const filteredAndSortedProjects = projects
    .filter(p => (p.propertyAddress || "").toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-8 bg-white min-h-screen relative">
      {/* ヘッダー */}
      <div className="flex items-center justify-end h-16 mb-12">
        <div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm overflow-hidden h-10">
          <button 
            onClick={() => { setError(null); setNewProjectName(""); setIsModalOpen(true); }}
            className="px-5 h-full text-slate-400 hover:text-orange-500 hover:bg-slate-50 border-r border-slate-100"
          >
            <Plus size={18} />
          </button>
          <button 
            onClick={handleDelete}
            className={`px-5 h-full ${selectedId ? 'text-red-500 hover:bg-red-50' : 'text-slate-200'}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 検索窓 */}
      <div className="flex items-center justify-between mb-10 bg-slate-50/50 p-2 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="物件を検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        </div>
      </div>

      {/* グリッド */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>
      ) : filteredAndSortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {filteredAndSortedProjects.map((project) => {
            const createDate = new Date(project.createdAt);
            return (
              <div 
                key={project.id}
                onClick={() => setSelectedId(selectedId === project.id ? null : project.id)}
                className={`flex flex-col p-4 rounded-2xl transition-all cursor-pointer border ${
                  selectedId === project.id 
                    ? "bg-orange-100/50 border-orange-500 shadow-sm" 
                    : "bg-orange-50/30 border-orange-100 hover:bg-orange-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Link 
                    href={`/documents/${project.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-slate-800 text-sm line-clamp-1 hover:text-orange-600 transition-colors"
                  >
                    {project.propertyAddress || "名称未設定"}
                  </Link>
                  <Link
                    href={`/documents/${project.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-300 hover:text-orange-500"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {createDate.toLocaleDateString()} {createDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
          <Inbox size={32} className="mb-4 text-slate-200" />
          <p className="text-sm font-bold text-slate-400">物件がありません</p>
        </div>
      )}

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <h2 className="text-lg font-bold mb-6">新規物件の追加</h2>
            <div className="mb-6">
              <input 
                type="text" autoFocus value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="物件名称を入力"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
              />
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500">キャンセル</button>
              <button onClick={handleCreate} className="flex-1 py-3 bg-[#FD9D24] text-white text-sm font-bold rounded-xl">作成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}