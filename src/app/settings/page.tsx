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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  
  const [userFormData, setUserFormData] = useState({ name: "", email: "", password: "" });
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("取得失敗");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("ユーザー情報の取得に失敗:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 新規ユーザー登録
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

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "新規ユーザーを登録しました" });
        setUserFormData({ name: "", email: "", password: "" });
        fetchUsers();
      } else {
        setMessage({ type: "error", text: result.error || "ユーザー登録に失敗しました" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setSubmittingUser(false);
    }
  };

  // 自分のパスワード変更
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

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "パスワードを更新しました。次回から新しいパスワードでログインしてください。" });
        setNewPassword("");
      } else {
        setMessage({ type: "error", text: result.error || "パスワード更新に失敗しました" });
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
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">アカウント・セキュリティ設定</p>
        </header>

        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左：パスワード変更フォーム */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
              <KeyRound size={20} className="text-[#FD9D24]" /> パスワード変更
            </h2>
            <form onSubmit={handleChangeMyPassword} className="space-y-4">
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" 
                placeholder="新しいパスワード"
              />
              <button disabled={changingPass} className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all text-xs uppercase flex items-center justify-center gap-2">
                {changingPass ? <Loader2 className="animate-spin" size={16} /> : "自分のパスワードを更新"}
              </button>
            </form>
          </div>

          {/* 中央：新規ユーザー登録フォーム */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus size={20} className="text-[#FD9D24]" /> ユーザー追加
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="text" required value={userFormData.name} onChange={(e) => setUserFormData({...userFormData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="氏名" />
              <input type="email" required value={userFormData.email} onChange={(e) => setUserFormData({...userFormData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="メールアドレス" />
              <input type="password" required value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" placeholder="初期パスワード" />
              <button disabled={submittingUser} className="w-full py-4 bg-[#FD9D24] text-white font-black rounded-2xl hover:bg-orange-500 transition-all text-xs uppercase flex items-center justify-center gap-2">
                {submittingUser ? <Loader2 className="animate-spin" size={16} /> : "新規ユーザーを登録"}
              </button>
            </form>
          </div>

          {/* 右：アカウント一覧表示 */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#FD9D24]" /> 登録済みアカウント
            </h2>
            {loadingUsers ? (
              <div className="flex justify-center py-10 text-slate-300"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <User size={14} className="text-slate-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-slate-700 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate">{u.email}</p>
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