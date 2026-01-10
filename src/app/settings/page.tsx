"use client";

import React, { useState } from "react";
import { KeyRound, Loader2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "パスワードを更新しました！次回から新しいパスワードでログインしてください。" });
        setNewPassword("");
      } else {
        setMessage({ type: "error", text: result.error || "更新に失敗しました" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
          <KeyRound size={24} className="text-orange-500" /> パスワード変更
        </h2>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            <AlertCircle size={18} />
            {message.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-6">
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="新しいパスワード"
          />
          <button
            disabled={loading}
            className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "更新する"}
          </button>
        </form>
      </div>
    </div>
  );
}