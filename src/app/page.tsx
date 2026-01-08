import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import ProjectDashboard from "@/app/components/ProjectDashboard"; // さっき作った部品を読み込み

export default async function Page() {
  // サーバー側でデータを取得
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-[#FD9D24]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* 左メニュー */}
          <aside className="col-span-12 md:col-span-3">
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-600">
                メニュー
              </div>
              <nav className="space-y-1 text-sm">
                <div className="rounded bg-orange-50 px-3 py-2 text-orange-600">
                  ホーム
                </div>
                <div className="rounded px-3 py-2 text-slate-600">
                  案件情報
                </div>
                <div className="rounded px-3 py-2 text-slate-600">車両管理</div>
                <div className="rounded px-3 py-2 text-slate-600">
                  企業情報管理
                </div>
                <div className="rounded px-3 py-2 text-slate-600">設定</div>
              </nav>
            </div>
          </aside>

          {/* 右コンテンツ：動的な部品に任せる */}
          <section className="col-span-12 md:col-span-9">
            {/* データを渡して表示させる */}
            <ProjectDashboard projects={projects} />
          </section>
        </div>
      </main>
    </div>
  );
}