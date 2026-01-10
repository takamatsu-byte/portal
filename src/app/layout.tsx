"use client"; // URLを判定するために必要です

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // 今どのページにいるかを取得

  // 現在のページによってボタンのスタイルを変える関数
  const getBtnClass = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? "bg-white text-[#FD9D24] shadow-sm" // アクティブ時（白背景）
      : "text-white/80 hover:bg-white/10";  // 非アクティブ時（透明背景）
  };

  return (
    <html lang="ja">
      <body className={`${inter.className} m-0 p-0 bg-white`}>
        <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-white">
          
          {/* サイドバー */}
          <aside className="w-64 flex flex-col flex-shrink-0 z-30" style={{ backgroundColor: "#FD9D24" }}>
            <div 
              className="flex items-center px-6 font-black text-slate-800 text-3xl italic gap-4 border-b border-slate-100 flex-shrink-0" 
              style={{ backgroundColor: "#ffffff", height: "128px" }}
            >
              PORTAL
              <img src="/logo.png" alt="logo" className="h-16 w-auto object-contain" />
            </div>

            <nav className="p-4 space-y-2 mt-4 text-white">
              <Link href="/brokerage">
                <div className={`p-3 rounded-xl font-bold text-center text-sm cursor-pointer transition-all ${getBtnClass("/brokerage")}`}>
                  物件管理
                </div>
              </Link>
              <Link href="/documents">
                <div className={`p-3 rounded-xl font-bold text-center text-sm cursor-pointer transition-all ${getBtnClass("/documents")}`}>
                  物件資料
                </div>
              </Link>
            </nav>
          </aside>

          {/* 右側メインエリア */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}