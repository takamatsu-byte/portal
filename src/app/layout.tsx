"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, LayoutDashboard, LogOut, Settings } from "lucide-react"; // Settingsを追加
import { signOut, SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ログイン画面ではサイドバーを表示しない
  const isLoginPage = pathname === "/login";

  const getBtnClass = (path: string) => {
    const isActive = pathname.startsWith(path);
    return isActive
      ? "bg-white text-[#FD9D24] shadow-sm"
      : "text-white/80 hover:bg-white/10";
  };

  return (
    <html lang="ja">
      <body className={`${inter.className} m-0 p-0 bg-white`}>
        <SessionProvider>
          <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-white">
            
            {!isLoginPage && (
              <aside className="w-64 flex flex-col flex-shrink-0 z-30 shadow-xl" style={{ backgroundColor: "#FD9D24" }}>
                <div 
                  className="flex items-center px-6 bg-white font-black text-slate-800 text-3xl italic gap-4 border-b border-slate-100 flex-shrink-0" 
                  style={{ height: "128px" }}
                >
                  PORTAL
                  <img src="/logo.png" alt="logo" className="h-16 w-auto object-contain" />
                </div>

                <nav className="p-4 space-y-2 mt-4 text-white flex-1 overflow-y-auto">
                  <Link href="/brokerage">
                    <div className={`p-4 rounded-xl font-bold text-center text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${getBtnClass("/brokerage")}`}>
                      <LayoutDashboard size={18} />
                      物件管理
                    </div>
                  </Link>

                  <Link href="/documents">
                    <div className={`p-4 rounded-xl font-bold text-center text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${getBtnClass("/documents")}`}>
                      <FolderOpen size={18} />
                      物件資料
                    </div>
                  </Link>

                  {/* ★設定（ユーザー管理）ボタンを追加 */}
                  <Link href="/settings">
                    <div className={`p-4 rounded-xl font-bold text-center text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${getBtnClass("/settings")}`}>
                      <Settings size={18} />
                      設定
                    </div>
                  </Link>
                </nav>

                <div className="p-4 border-t border-white/10 mt-auto">
                  <button 
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full p-4 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <LogOut size={18} />
                    ログアウト
                  </button>
                </div>
              </aside>
            )}

            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {children}
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}