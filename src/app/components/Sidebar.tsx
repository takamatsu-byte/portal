"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  LogOut,
  Building2,
  FileText
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  // メニュー項目に「設定」が含まれていることを確認済み
  const menuItems = [
    { name: "物件管理", href: "/brokerage", icon: Building2 },
    { name: "物件資料", href: "/documents", icon: FolderOpen },
    { name: "設定", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#1e293b] h-screen flex flex-col text-white flex-shrink-0">
      <div className="p-8">
        <h1 className="text-xl font-black tracking-tighter uppercase">Portal System</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
              pathname.startsWith(item.href)
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={20} />
            <span className="font-bold text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-8 border-t border-white/10">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 text-white/40 hover:text-red-400 transition-colors w-full px-6 py-2"
        >
          <LogOut size={20} />
          <span className="font-bold text-sm text-left">ログアウト</span>
        </button>
      </div>
    </div>
  );
}