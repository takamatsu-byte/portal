"use client";

import { useMemo, useState } from "react";

type JobStatus = "未" | "成約" | "キャンセル";

type Job = {
  id: string;
  status: JobStatus;
  shipper: string;
  shipperArea: string;
  vehicle: string;
  vehicleNote: string;
  pickupAt: string;
  pickupArea: string;
  arriveAt: string;
  arriveArea: string;
  distanceKm: number;
  expressway: "許可" | "不許可";
  note: string;
};

const ORANGE = "rgb(245,158,11)";

function statusBadgeClass(status: JobStatus) {
  switch (status) {
    case "未":
      return "bg-red-600 text-white";
    case "成約":
      return "bg-emerald-600 text-white";
    case "キャンセル":
      return "bg-slate-400 text-white";
  }
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "JOB-001",
      status: "未",
      shipper: "ハコブツ食品",
      shipperArea: "東京都中央区",
      vehicle: "ドライ",
      vehicleNote: "軽 / 1台",
      pickupAt: "03/11 17:00",
      pickupArea: "東京都中央区",
      arriveAt: "03/12 10:00 まで",
      arriveArea: "東京都千代田区",
      distanceKm: 33,
      expressway: "不許可",
      note: "積置き：なし",
    },
    {
      id: "JOB-002",
      status: "成約",
      shipper: "ハコブツ飲料",
      shipperArea: "東京都中央区",
      vehicle: "冷凍",
      vehicleNote: "軽 / 1台",
      pickupAt: "即時",
      pickupArea: "東京都中央区",
      arriveAt: "即時",
      arriveArea: "東京都台東区",
      distanceKm: 2,
      expressway: "許可",
      note: "積置き：なし",
    },
  ]);

  const [selectedId, setSelectedId] = useState<string>("JOB-001");

  const selectedJob = useMemo(() => {
    return jobs.find((j) => j.id === selectedId) ?? jobs[0];
  }, [jobs, selectedId]);

  const [draft, setDraft] = useState<Job>(() => {
    return jobs.find((j) => j.id === selectedId) ?? jobs[0];
  });

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  const openEditor = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setSelectedId(id);
    setDraft(job);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
  };

  const saveDraft = () => {
    setJobs((prev) => prev.map((j) => (j.id === draft.id ? draft : j)));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 bg-[rgb(245,158,11)] shadow">
        <div className="mx-auto max-w-[1400px] px-5 py-2 flex items-center justify-between">
          <div className="bg-white rounded-md px-3 py-1.5 flex items-center shadow-sm">
            <img
              src="/logo.png"
              alt="株式会社アキサス"
              className="h-9 w-auto block"
            />
          </div>

          <div className="flex items-center gap-3 text-sm text-white">
            <div className="hidden sm:block">三◯様</div>
            <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-xs">
              👤
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          {/* サイドバー */}
          <aside className="bg-white rounded-lg border shadow-sm">
            <div className="px-4 py-3 border-b">
              <div className="text-xs font-semibold text-slate-500">メニュー</div>
            </div>

            <nav className="p-2 text-sm">
              <a className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-[rgb(245,158,11)] bg-orange-50">
                ● ホーム
              </a>
              <a className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50">
                案件情報
              </a>
              <a className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50">
                車両管理
              </a>
              <a className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50">
                企業情報管理
              </a>
              <a className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50">
                設定
              </a>
            </nav>
          </aside>

          {/* メイン */}
          <main className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">案件情報</h1>
                <p className="text-sm text-slate-600 mt-1">
                  「＋」で編集フォームを開きます（いまはDBなしの試作）。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen((v) => !v)}
                  className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  style={{ borderColor: ORANGE }}
                  title="編集フォームを開く/閉じる"
                >
                  {isEditorOpen ? "閉じる" : "＋"}
                </button>

                <button
                  onClick={saveDraft}
                  className="rounded-md text-white px-4 py-2 text-sm font-medium hover:opacity-90"
                  style={{ background: ORANGE }}
                  title="編集内容を保存（画面上だけ更新）"
                >
                  保存
                </button>
              </div>
            </div>

            <div
              className={[
                "grid grid-cols-1 gap-5",
                isEditorOpen ? "xl:grid-cols-[1fr_420px]" : "",
              ].join(" ")}
            >
              {/* 左：一覧 */}
              <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-orange-50 border-b px-4 py-3 flex items-center justify-between">
                  <div className="font-semibold text-slate-900">案件一覧</div>
                  <div className="text-xs text-slate-600">件数：{jobs.length}</div>
                </div>

                <div className="p-4">
                  <div className="hidden md:grid grid-cols-[80px_1.2fr_0.8fr_1.2fr_1.2fr_0.8fr_160px] gap-3 text-xs font-semibold text-slate-600 px-2 pb-2">
                    <div>状態</div>
                    <div>荷主</div>
                    <div>車種</div>
                    <div>引取指定</div>
                    <div>到着指定</div>
                    <div>距離</div>
                    <div className="text-right">操作</div>
                  </div>

                  <div className="space-y-2">
                    {jobs.map((job) => {
                      const isSelected = job.id === selectedId;
                      return (
                        <div
                          key={job.id}
                          className={[
                            "rounded-md border bg-white overflow-hidden",
                            isSelected ? "ring-2" : "",
                          ].join(" ")}
                          style={
                            isSelected
                              ? ({ ["--tw-ring-color" as any]: ORANGE } as any)
                              : undefined
                          }
                        >
                          <div className="grid grid-cols-1 md:grid-cols-[80px_1.2fr_0.8fr_1.2fr_1.2fr_0.8fr_160px] gap-3 items-center px-3 py-3">
                            <div>
                              <span
                                className={[
                                  "inline-flex items-center justify-center rounded px-2 py-1 text-xs font-bold",
                                  statusBadgeClass(job.status),
                                ].join(" ")}
                              >
                                {job.status}
                              </span>
                            </div>

                            <div className="text-sm font-medium text-slate-900">
                              {job.shipper}
                              <div className="text-xs text-slate-500 mt-0.5">
                                {job.shipperArea}
                              </div>
                            </div>

                            <div className="text-sm text-slate-800">
                              {job.vehicle}
                              <div className="text-xs text-slate-500 mt-0.5">
                                {job.vehicleNote}
                              </div>
                            </div>

                            <div className="text-sm text-slate-800">
                              {job.pickupAt}
                              <div className="text-xs text-slate-500 mt-0.5">
                                {job.pickupArea}
                              </div>
                            </div>

                            <div className="text-sm text-slate-800">
                              {job.arriveAt}
                              <div className="text-xs text-slate-500 mt-0.5">
                                {job.arriveArea}
                              </div>
                            </div>

                            <div className="text-sm text-slate-800">
                              {job.distanceKm}km
                            </div>

                            <div className="flex md:justify-end gap-2">
                              <button
                                onClick={() => openEditor(job.id)}
                                className="w-full md:w-auto rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                              >
                                編集
                              </button>
                              <button
                                className="w-full md:w-auto rounded-md text-white px-3 py-2 text-sm font-medium hover:opacity-90"
                                style={{ background: ORANGE }}
                              >
                                エントリー
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-50 border-t px-3 py-2 text-xs text-slate-700">
                            <span className="font-semibold">メモ：</span>
                            {job.note} / 高速：{job.expressway}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 右：編集フォーム（普段は非表示） */}
              {isEditorOpen && (
                <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-orange-50 border-b px-4 py-3 flex items-center justify-between">
                    <div className="font-semibold text-slate-900">編集</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-600">{draft.id}</div>
                      <button
                        onClick={closeEditor}
                        className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                        title="閉じる"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
                      編集 → 「保存」で左の一覧に反映（いまはDBなし）。
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">
                          状態
                        </div>
                        <select
                          className="w-full rounded-md border px-3 py-2 bg-white"
                          value={draft.status}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              status: e.target.value as JobStatus,
                            }))
                          }
                        >
                          <option value="未">未</option>
                          <option value="成約">成約</option>
                          <option value="キャンセル">キャンセル</option>
                        </select>
                      </label>

                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">
                          荷主
                        </div>
                        <input
                          className="w-full rounded-md border px-3 py-2"
                          value={draft.shipper}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, shipper: e.target.value }))
                          }
                        />
                        <div className="mt-2 text-xs font-semibold text-slate-600 mb-1">
                          荷主エリア
                        </div>
                        <input
                          className="w-full rounded-md border px-3 py-2"
                          value={draft.shipperArea}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              shipperArea: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            車種
                          </div>
                          <input
                            className="w-full rounded-md border px-3 py-2"
                            value={draft.vehicle}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                vehicle: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            車種メモ
                          </div>
                          <input
                            className="w-full rounded-md border px-3 py-2"
                            value={draft.vehicleNote}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                vehicleNote: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            引取指定
                          </div>
                          <input
                            className="w-full rounded-md border px-3 py-2"
                            value={draft.pickupAt}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                pickupAt: e.target.value,
                              }))
                            }
                          />
                        </label>

                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            引取エリア
                          </div>
                          <input
                            className="w-full rounded-md border px-3 py-2"
                            value={draft.pickupArea}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                pickupArea: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            到着指定
                          </div>
                          <input
                            className="w-full rounded-md border px-3 py-2"
                            value={draft.arriveAt}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                arriveAt: e.target.value,
                              }))
                            }
                          />
                        </label>

                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            到着エリア
                          </div>
                          <input
                            className="w-full rounded-md border px-3 py-2"
                            value={draft.arriveArea}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                arriveArea: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            距離(km)
                          </div>
                          <input
                            type="number"
                            className="w-full rounded-md border px-3 py-2"
                            value={draft.distanceKm}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                distanceKm: Number(e.target.value || 0),
                              }))
                            }
                          />
                        </label>

                        <label className="text-sm">
                          <div className="text-xs font-semibold text-slate-600 mb-1">
                            高速利用
                          </div>
                          <select
                            className="w-full rounded-md border px-3 py-2 bg-white"
                            value={draft.expressway}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                expressway: e.target.value as "許可" | "不許可",
                              }))
                            }
                          >
                            <option value="許可">許可</option>
                            <option value="不許可">不許可</option>
                          </select>
                        </label>
                      </div>

                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">
                          メモ
                        </div>
                        <textarea
                          className="w-full rounded-md border px-3 py-2 min-h-[90px]"
                          value={draft.note}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, note: e.target.value }))
                          }
                        />
                      </label>

                      <button
                        onClick={saveDraft}
                        className="rounded-md text-white px-4 py-2 text-sm font-medium hover:opacity-90"
                        style={{ background: ORANGE }}
                      >
                        保存（一覧に反映）
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
