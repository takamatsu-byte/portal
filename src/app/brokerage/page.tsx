import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import BrokerageDashboard from "@/app/components/BrokerageDashboard"; // 新しい部品を読み込み

export default async function Page() {
  // ★仲介案件データを取得
  const projects = await prisma.brokerageProject.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      expenses: true,
    },
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      
      {/* 帯（ヘッダー） */}
      <header className="flex-none bg-[#FD9D24] shadow-md z-20">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div className="rounded bg-white p-2 shadow-sm">
            <Image
              src="/logo.png"
              alt="株式会社アキサス"
              width={200}
              height={50}
              className="h-auto w-auto object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-sm">〇〇様</span>
            <div className="h-8 w-8 rounded-full bg-white/30" />
          </div>
        </div>
      </header>

      {/* 下部エリア */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* メニュー */}
        <aside className="w-64 flex-none overflow-y-auto border-r bg-white px-4 py-6 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
          <div className="mb-4 px-2 text-sm font-bold text-slate-500">
            メニュー
          </div>
          <nav className="space-y-1 text-sm">
            <Link 
              href="/" 
              className="block rounded px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-orange-500 transition-colors"
            >
              ホーム
            </Link>
            <Link 
              href="/" 
              className="block rounded px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-orange-500 transition-colors"
            >
              収益物件一覧
            </Link>
            {/* ★仲介・紹介案件をアクティブに */}
            <Link 
              href="/brokerage" 
              className="block rounded bg-orange-50 px-3 py-2 text-orange-600 font-bold"
            >
              仲介・紹介案件
            </Link>
            <div className="rounded px-3 py-2 text-slate-600 cursor-not-allowed opacity-50">
              企業情報管理
            </div>
            <div className="rounded px-3 py-2 text-slate-600 cursor-not-allowed opacity-50">
              設定
            </div>
          </nav>
        </aside>

        {/* 右コンテンツエリア：仲介用のダッシュボードを表示 */}
        <main className="flex flex-1 flex-col overflow-hidden relative">
          <BrokerageDashboard projects={projects} />
        </main>
      </div>
    </div>
  );
}