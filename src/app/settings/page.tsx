"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Lock, User, Loader2, ShieldCheck, KeyRound } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "ユーザーを登録しました" });
      setFormData({ name: "", email: "", password: "" });
      fetchUsers();
    } else {
      setMessage({ type: "error", text: "登録に失敗しました" });
    }
    setSubmitting(false);
  };

  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "自分のパスワードを更新しました" });
      setNewPassword("");
    } else {
      setMessage({ type: "error", text: "パスワード更新に失敗しました" });
    }
    setChangingPass(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Settings</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">ユーザー・セキュリティ管理</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. 自分のパスワード変更 */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col h-fit">
            <h2 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
              <KeyRound size={18} className="text-[#FD9D24]" /> 自分のパスワード変更
            </h2>
            <form onSubmit={handleChangeMyPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" 
                  placeholder="新しいパスワード"
                />
              </div>
              <button 
                disabled={changingPass}
                className="w-full py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {changingPass ? <Loader2 className="animate-spin" size={16} /> : "パスワードを更新"}
              </button>
            </form>
          </div>

          {/* 2. ユーザー追加（管理者用） */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus size={18} className="text-[#FD9D24]" /> ユーザー追加
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="氏名" />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="メールアドレス" />
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="初期パスワード" />
              <button disabled={submitting} className="w-full py-3 bg-[#FD9D24] text-white font-black rounded-xl hover:bg-orange-500 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : "新規ユーザー作成"}
              </button>
              {message.text && <p className={`text-[10px] font-bold text-center mt-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>}
            </form>
          </div>

          {/* 3. ユーザー一覧 */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 min-h-[400px]">
            <h2 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FD9D24]" /> アカウント一覧
            </h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 font-bold text-sm">
                    <User size={16} className="text-slate-400" />
                    <div>
                      <p className="text-slate-700">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{u.email}</p>
                    </div>
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