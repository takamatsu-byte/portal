"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, User, Loader2, ShieldCheck, KeyRound, AlertCircle, Trash2, Edit2, X, Check, History } from "lucide-react";

interface UserData { id: string; name: string; email: string; createdAt: string; }
interface LogData { id: string; userName: string; action: string; target: string; details: string; createdAt: string; }

export default function SettingsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [userFormData, setUserFormData] = useState({ name: "", email: "", password: "" });
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoadingUsers(false); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoadingLogs(false); }
  };

  useEffect(() => { fetchUsers(); fetchLogs(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userFormData),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "新規登録しました" });
        setUserFormData({ name: "", email: "", password: "" });
        fetchUsers(); fetchLogs();
      }
    } catch (e) { setMessage({ type: "error", text: "通信エラー" }); }
    finally { setSubmittingUser(false); }
  };

  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "パスワードを更新しました" });
        setNewPassword("");
        fetchLogs();
      }
    } catch (e) { setMessage({ type: "error", text: "通信エラー" }); }
    finally { setChangingPass(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} さんを削除しますか？`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) { setMessage({ type: "success", text: "削除しました" }); fetchUsers(); fetchLogs(); }
    } catch (e) { setMessage({ type: "error", text: "失敗" }); }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) { setEditingId(null); setMessage({ type: "success", text: "更新しました" }); fetchUsers(); fetchLogs(); }
    } catch (e) { setMessage({ type: "error", text: "失敗" }); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      <div className="max-w-6xl mx-auto text-slate-800">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Settings</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Management & Logs</p>
          </div>
          {message.text && (
            <div className={`px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-bold border shadow-sm ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <AlertCircle size={16} /> {message.text}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-400"><KeyRound size={18} className="text-orange-500" /> Password</h2>
            <form onSubmit={handleChangeMyPassword} className="space-y-4">
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="新しいパスワード" />
              <button disabled={changingPass} className="w-full py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 text-xs flex items-center justify-center gap-2 transition-all shadow-md">{changingPass ? <Loader2 className="animate-spin" size={16} /> : "Update Password"}</button>
            </form>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-400"><UserPlus size={18} className="text-orange-500" /> Add User</h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input type="text" required value={userFormData.name} onChange={(e) => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-2 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="氏名" />
              <input type="email" required value={userFormData.email} onChange={(e) => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-2 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="メールアドレス" />
              <input type="password" required value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-2 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="パスワード" />
              <button disabled={submittingUser} className="w-full py-3 bg-[#FD9D24] text-white font-black rounded-xl hover:bg-orange-500 text-xs flex items-center justify-center gap-2 transition-all shadow-md">{submittingUser ? <Loader2 className="animate-spin" size={16} /> : "Register User"}</button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-8">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-400"><ShieldCheck size={18} className="text-orange-500" /> Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingUsers ? <Loader2 className="animate-spin" /> : users.map((u) => (
              <div key={u.id} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><User size={14} className="text-slate-400" /></div>
                  <div className="overflow-hidden">
                    {editingId === u.id ? <input value={editName} onChange={(e) => setEditName(e.target.value)} className="text-sm font-black text-slate-700 bg-white border-b-2 border-orange-400 outline-none w-full" /> : <p className="text-sm font-black text-slate-700 truncate">{u.name}</p>}
                    <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  {editingId === u.id ? (
                    <><button onClick={() => handleUpdate(u.id)} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-[10px] font-black"><Check size={12}/></button><button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black"><X size={12}/></button></>
                  ) : (
                    <><button onClick={() => { setEditingId(u.id); setEditName(u.name); }} className="flex-1 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black hover:bg-slate-50 transition-all">EDIT</button><button onClick={() => handleDelete(u.id, u.name)} className="flex-1 py-1.5 bg-white text-red-500 border border-red-100 rounded-lg text-[10px] font-black hover:bg-red-50 transition-all">DEL</button></>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-slate-400"><History size={18} className="text-orange-500" /> Activity Logs</h2>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {loadingLogs ? <Loader2 className="animate-spin text-slate-200" /> : logs.map((log) => (
              <div key={log.id} className="text-[11px] font-bold py-3 border-b border-slate-50 flex items-center gap-4">
                <span className="text-slate-300 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 text-[9px]">{log.userName}</span>
                <span className="text-slate-600 flex-1">
                  <span className="text-orange-500">[{log.target}]</span> {log.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}