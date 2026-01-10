"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Lock, User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが正しくありません");
        setLoading(false);
      } else {
        window.location.href = "/brokerage";
      }
    } catch (err) {
      setError("システムエラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <img src="/logo.png" alt="logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Portal Login</h1>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest font-sans">管理者専用ポータル</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-black p-4 rounded-xl text-center border border-red-100 font-sans">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block font-sans">Email Address</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                name="email"
                autoComplete="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FD9D24] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none transition-all font-sans"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block font-sans">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FD9D24] rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none transition-all font-sans"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#FD9D24] text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2 font-sans"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Login to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}