"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Lock, User, Loader2, ShieldCheck, KeyRound, AlertCircle } from "lucide-react";

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
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch users failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "ユーザーを登録しました" });
        setFormData({ name: "", email: "", password: "" });
        fetchUsers();
      } else {
        // 詳細なエラー理由を表示
        setMessage({ type: "error", text: `登録失敗: ${result.error || '不明なエラー'}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "パスワードを更新しました" });
        setNewPassword("");
      } else {
        setMessage({ type: "error", text: `更新失敗: ${result.error || '不明なエラー'}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Settings</h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">ユーザー・セキュリティ管理</p>
        </header>

        {/* メッセージ表示エリア */}
        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. 自分のパスワード変更 */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col h-fit">
            <h2 className="text-base font-black text-slate-800 mb-8 flex items-center gap-2">
              <KeyRound size={20} className="text-[#FD9D24]" /> 自分のパスワード変更
            </h2>
            <form onSubmit={handleChangeMyPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner" 
                  placeholder="新しいパスワード"
                />
              </div>
              <button 
                disabled={changingPass}
                className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                {changingPass ? <Loader2 className="animate-spin" size={16} /> : "パスワードを更新"}
              </button>
            </form>
          </div>

          {/* 2. ユーザー追加 */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-base font-black text-slate-800 mb-8 flex items-center gap-2">
              <UserPlus size={20} className="text-[#FD9D24]" /> ユーザー追加
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner" placeholder="氏名" />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner" placeholder="メールアドレス" />
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-inner" placeholder="初期パスワード" />
              <button disabled={submitting} className="w-full py-4 bg-[#FD9D24] text-white font-black rounded-2xl hover:bg-orange-500 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-orange-100">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : "新規ユーザー作成"}
              </button>
            </form>
          </div>

          {/* 3. ユーザー一覧 */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-800 mb-8 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#FD9D24]" /> アカウント一覧
            </h2>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-200" /></div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        <User size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700 leading-tight">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">{u.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}