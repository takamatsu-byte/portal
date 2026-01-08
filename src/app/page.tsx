// src/app/page.tsx
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

function yen(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${n.toLocaleString("ja-JP")} 円`;
}

function pctFromBp(bp: number | null | undefined) {
  if (bp === null || bp === undefined) return "—";
  return `${(bp / 100).toFixed(2)}%`;
}

export default async function Page() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ここはあなたのヘッダーUIに合わせて最低限。必要なら後で“見た目そのまま”で調整します */}
      <header className="bg-orange-400">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="rounded bg-white px-4 py-2 text-sm font-semibold">
            株式会社アキサス
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-sm">〇〇様</span>
            <div className="h-8 w-8 rounded-full bg-white/30" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* 左メニュー（見た目はあとで微調整OK） */}
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

          {/* 右コンテンツ */}
          <section className="col-span-12 md:col-span-9">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800">案件情報</h1>
                <p className="mt-1 text-sm text-slate-500">
                  DBの案件データを表示中（seedで入れた2件）
                </p>
              </div>

              <button className="rounded-md border bg-white px-4 py-2 text-sm">
                編集パネル
              </button>
            </div>

            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="font-semibold">案件一覧</div>
                <div className="text-sm text-slate-500">
                  件数：{projects.length}
                </div>
              </div>

              <div className="divide-y">
                {projects.map((p) => (
                  <div key={p.id} className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">
                          物件所在地：
                        </span>{" "}
                        {p.propertyAddress}
                      </div>

                      <Link
                        href="#"
                        className="rounded-md border px-3 py-1 text-sm"
                      >
                        編集
                      </Link>
                    </div>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="min-w-[900px] w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr className="border-b">
                            <th className="px-3 py-2 text-left">プロジェクト総額</th>
                            <th className="px-3 py-2 text-left">想定家賃</th>
                            <th className="px-3 py-2 text-left">想定利回り</th>
                            <th className="px-3 py-2 text-left">客付け家賃</th>
                            <th className="px-3 py-2 text-left">表面利回り</th>
                            <th className="px-3 py-2 text-left">想定販売価格</th>
                            <th className="px-3 py-2 text-left">物件価格</th>
                            <th className="px-3 py-2 text-left">買取経費</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="px-3 py-3">{yen(p.projectTotal)}</td>
                            <td className="px-3 py-3">{yen(p.expectedRent)}</td>
                            <td className="px-3 py-3">
                              {pctFromBp(p.expectedYieldBp)}
                            </td>
                            <td className="px-3 py-3">{yen(p.agentRent)}</td>
                            <td className="px-3 py-3">
                              {pctFromBp(p.surfaceYieldBp)}
                            </td>
                            <td className="px-3 py-3">
                              {yen(p.expectedSalePrice)}
                            </td>
                            <td className="px-3 py-3">{yen(p.propertyPrice)}</td>
                            <td className="px-3 py-3">
                              {yen(p.acquisitionCost)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-2 text-right">
                      <Link href="#" className="text-sm text-slate-500">
                        経営内訳を見る
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右下の＋（見た目合わせ） */}
            <div className="fixed bottom-6 right-6">
              <button className="h-12 w-12 rounded-full bg-orange-400 text-2xl text-white shadow-lg">
                +
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
