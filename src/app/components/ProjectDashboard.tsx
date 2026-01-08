"use client";

import { useState } from "react";
import Link from "next/link";
import { createProject } from "@/app/actions"; // さっき作った保存機能を読み込み

// 数値フォーマット関数
function yen(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${n.toLocaleString("ja-JP")} 円`;
}

function pctFromBp(bp: number | null | undefined) {
  if (bp === null || bp === undefined) return "—";
  return `${(bp / 100).toFixed(2)}%`;
}

// ここがメインの部品です
export default function ProjectDashboard({ projects }: { projects: any[] }) {
  // フォームが開いているかどうかのスイッチ（最初は閉じている）
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="relative">
      
      {/* メインエリア：フレックスボックスで横並びに対応 */}
      <div className="flex items-start gap-4">
        
        {/* 左側：案件一覧（フォームが開くと幅が縮みます） */}
        <div className={`${isFormOpen ? "w-2/3" : "w-full"} transition-all duration-300`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">案件情報</h1>
              <p className="mt-1 text-sm text-slate-500">
                DBの案件データを表示中（全{projects.length}件）
              </p>
            </div>
            <button className="rounded-md border bg-white px-4 py-2 text-sm">
              編集パネル
            </button>
          </div>

          <div className="rounded-lg border bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold">案件一覧</div>
              <div className="text-sm text-slate-500">件数：{projects.length}</div>
            </div>

            <div className="divide-y">
              {projects.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  まだ案件がありません。右下の「＋」ボタンを押してください。
                </div>
              )}
              {projects.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">物件所在地：</span>{" "}
                      {p.propertyAddress}
                    </div>
                    <button className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">
                      編集
                    </button>
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
                          <td className="px-3 py-3">{pctFromBp(p.expectedYieldBp)}</td>
                          <td className="px-3 py-3">{yen(p.agentRent)}</td>
                          <td className="px-3 py-3">{pctFromBp(p.surfaceYieldBp)}</td>
                          <td className="px-3 py-3">{yen(p.expectedSalePrice)}</td>
                          <td className="px-3 py-3">{yen(p.propertyPrice)}</td>
                          <td className="px-3 py-3">{yen(p.acquisitionCost)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右側：入力フォーム（isFormOpenがtrueの時だけ表示） */}
        {isFormOpen && (
          <div className="w-1/3 min-w-[320px] rounded-lg border bg-white p-6 shadow-xl animate-in slide-in-from-right-10 duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">新規案件登録</h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <form action={async (formData) => {
                await createProject(formData); // データを保存
                setIsFormOpen(false); // 保存したら閉じる
            }} className="space-y-4">
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  物件コード (必須)
                </label>
                <input
                  name="code"
                  type="text"
                  required
                  className="w-full rounded border px-3 py-2 text-slate-700"
                  placeholder="例: P-001"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  物件所在地
                </label>
                <input
                  name="address"
                  type="text"
                  required
                  className="w-full rounded border px-3 py-2 text-slate-700"
                  placeholder="例: 東京都港区..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  プロジェクト総額 (円)
                </label>
                <input
                  name="price"
                  type="number"
                  className="w-full rounded border px-3 py-2 text-slate-700"
                  placeholder="10000000"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 rounded border px-4 py-2 text-center text-sm text-slate-600 hover:bg-slate-50"
                >
                  閉じる
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-[#FD9D24] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 右下の＋ボタン：クリックするとフォームの開閉を切り替え */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsFormOpen(!isFormOpen)} // スイッチを切り替え
          className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white shadow-lg hover:opacity-90 transition-all ${isFormOpen ? 'bg-slate-600 rotate-45' : 'bg-[#FD9D24]'}`}
        >
          +
        </button>
      </div>
    </div>
  );
}