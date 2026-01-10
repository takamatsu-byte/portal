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
  const [submittingUser, setSubmittingUser] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 編集用ステート
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // 新規登録用ステート
  const [userFormData, setUserFormData] = useState({ name: "", email: "", password: "" });
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoadingUsers(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 1. 新規ユーザー登録
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
        setMessage({ type: "success", text: "新規ユーザーを登録しました" });
        setUserFormData({ name: "", email: "", password: "" });
        fetchUsers();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "登録失敗" });
      }
    } catch (e) { setMessage({ type: "error", text: "通信エラー" }); }
    finally { setSubmittingUser(false); }
  };

  // 2. 自分のパスワード変更
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
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "更新失敗" });
      }
    } catch (e) { setMessage({ type: "error", text: "通信エラー" }); }
    finally { setChangingPass(false); }
  };

  // 3. ユーザー削除
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} さんを削除してもよろしいですか？`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "削除しました" });
        fetchUsers();
      }
    } catch (e) { setMessage({ type: "error", text: "削除失敗" }); }
  };

  // 4. ユーザー編集（名前変更）
  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setEditingId(null);
        setMessage({ type: "success", text: "ユーザー情報を更新しました" });
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
            <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border shadow-sm ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <AlertCircle size={18} /> {message.text}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* 左：自分のパスワード変更 */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
              <KeyRound size={20} className="text-orange-500" /> パスワード変更
            </h2>
            <form onSubmit={handleChangeMyPassword} className="space-y-4">
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="新しいパスワード" />
              <button disabled={changingPass} className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 flex items-center justify-center gap-2">
                {changingPass ? <Loader2 className="animate-spin" size={16} /> : "自分のパスワードを更新"}
              </button>
            </form>
          </div>

          {/* 右：新規ユーザー登録 */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus size={20} className="text-orange-500" /> ユーザー追加
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input type="text" required value={userFormData.name} onChange={(e) => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="氏名" />
              <input type="email" required value={userFormData.email} onChange={(e) => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="メールアドレス" />
              <input type="password" required value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="初期パスワード" />
              <button disabled={submittingUser} className="w-full py-4 bg-[#FD9D24] text-white font-black rounded-2xl hover:bg-orange-500 flex items-center justify-center gap-2">
                {submittingUser ? <Loader2 className="animate-spin" size={16} /> : "新規登録を実行"}
              </button>
            </form>
          </div>
        </div>

        {/* 下：ユーザー一覧 */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
            <ShieldCheck size={20} className="text-orange-500" /> アカウント一覧（編集・削除）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingUsers ? <Loader2 className="animate-spin text-slate-200" /> : users.map((u) => (
              <div key={u.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <div className="overflow-hidden">
                    {editingId === u.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="text-sm font-black text-slate-700 bg-white border-b-2 border-orange-400 outline-none w-full" />
                    ) : (
                      <p className="text-sm font-black text-slate-700 truncate">{u.name}</p>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  {editingId === u.id ? (
                    <>
                      <button onClick={() => handleUpdate(u.id)} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-green-600"><Check size={12}/> 保存</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-300"><X size={12}/> 取消</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(u.id); setEditName(u.name); }} className="flex-1 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-slate-50"><Edit2 size={12}/> 編集</button>
                      <button onClick={() => handleDelete(u.id, u.name)} className="flex-1 py-2 bg-white text-red-500 border border-red-100 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 hover:bg-red-50"><Trash2 size={12}/> 削除</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}