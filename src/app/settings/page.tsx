"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, User, Loader2, ShieldCheck, KeyRound, AlertCircle, Trash2, Edit2, X, Check } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoadingUsers(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} さんを削除してもよろしいですか？`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "削除しました" });
        fetchUsers();
      }
    } catch (e) { setMessage({ type: "error", text: "削除に失敗しました" }); }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setEditingId(null);
        setMessage({ type: "success", text: "更新しました" });
        fetchUsers();
      }
    } catch (e) { setMessage({ type: "error", text: "更新失敗" }); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">User Management</h1>
          {message.text && (
            <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <AlertCircle size={18} /> {message.text}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#FD9D24]" /> 登録済みアカウント
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingUsers ? <Loader2 className="animate-spin" /> : users.map((u) => (
                <div key={u.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <User size={18} className="text-slate-400" />
                      </div>
                      <div className="overflow-hidden">
                        {editingId === u.id ? (
                          <input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-sm font-black text-slate-700 bg-white border-b-2 border-orange-400 outline-none w-full"
                          />
                        ) : (
                          <p className="text-sm font-black text-slate-700 truncate">{u.name}</p>
                        )}
                        <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                    {editingId === u.id ? (
                      <>
                        <button onClick={() => handleUpdate(u.id)} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-green-600 transition-colors">
                          <Check size={12} /> 保存
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-300 transition-colors">
                          <X size={12} /> 取消
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setEditingId(u.id); setEditName(u.name); }}
                          className="flex-1 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 size={12} /> 編集
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id, u.name)}
                          className="flex-1 py-2 bg-white text-red-500 border border-red-100 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} /> 削除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}