"use client";

import { useMemo, useState } from "react";

type CostItem = {
  name: string;
  amount: number;
};

type Project = {
  id: string;
  location: string;

  expectedRent: number; // 想定家賃
  actualRent: number; // 客付け家賃（0は未入力扱い）
  propertyPrice: number; // 物件価格
  expectedSalePrice: number; // 想定販売価格

  purchaseCostItems: CostItem[]; // 買取経費 内訳（合計は自動計算）
};

const ORANGE = "rgb(245,158,11)";

function yen(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return `${Math.round(n).toLocaleString("ja-JP")} 円`;
}
function pct(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return `${n.toFixed(2)}%`;
}
function sumCost(items: CostItem[]) {
  return items.reduce((acc, it) => acc + (Number.isFinite(it.amount) ? it.amount : 0), 0);
}
function calcProjectTotal(propertyPrice: number, purchaseCostTotal: number) {
  return (Number.isFinite(propertyPrice) ? propertyPrice : 0) + (Number.isFinite(purchaseCostTotal) ? purchaseCostTotal : 0);
}
function calcYieldPercent(annualRent: number, projectTotal: number) {
  const total = Number.isFinite(projectTotal) ? projectTotal : 0;
  const annual = Number.isFinite(annualRent) ? annualRent : 0;
  if (total <= 0) return 0;
  return (annual / total) * 100;
}
function normalizedCostItems(items: CostItem[]) {
  return items
    .map((it) => ({
      name: (it.name ?? "").trim(),
      amount: Number.isFinite(it.amount) ? it.amount : 0,
    }))
    .filter((it) => it.name !== "" && it.amount !== 0);
}
function nextProjectNumberFrom(items: Project[]) {
  let max = 0;
  for (const it of items) {
    const m = it.id.match(/^PJ-(\d+)$/);
    if (!m) continue;
    const n = Number(m[1]);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return max + 1;
}
function createEmptyDraft(nextNo: number): Project {
  return {
    id: `PJ-${String(nextNo).padStart(3, "0")}`,
    location: "",
    expectedRent: 0,
    actualRent: 0,
    propertyPrice: 0,
    expectedSalePrice: 0,
    purchaseCostItems: [
      { name: "残置撤去費用", amount: 0 },
      { name: "リフォーム", amount: 0 },
    ],
  };
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "PJ-001",
      location: "岐阜県岐阜市 長良大路1丁目12番地",
      expectedRent: 75000,
      actualRent: 0, // 未入力 → 「—」
      propertyPrice: 16500000,
      expectedSalePrice: 18500000,
      purchaseCostItems: [
        { name: "残置撤去費用", amount: 200000 },
        { name: "リフォーム", amount: 1000000 },
        { name: "仲介手数料", amount: 300000 },
        { name: "登記費用", amount: 120000 },
        { name: "測量費用", amount: 150000 },
        { name: "解体調査", amount: 80000 },
        { name: "清掃費", amount: 50000 },
      ],
    },
    {
      id: "PJ-002",
      location: "",
      expectedRent: 88000,
      actualRent: 0,
      propertyPrice: 19800000,
      expectedSalePrice: 22800000,
      purchaseCostItems: [],
    },
  ]);

  // 編集パネルの開閉
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // 編集/新規モード
  const [mode, setMode] = useState<"create" | "edit">("edit");

  // 選択（ハイライト用）
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? "PJ-001");

  // 編集中データ
  const [draft, setDraft] = useState<Project>(() => projects[0] ?? createEmptyDraft(1));

  // 編集フォーム内：内訳入力の折り畳み
  const [isCostEditorOpen, setIsCostEditorOpen] = useState(false);

  // 一覧側：経費内訳を見る（案件ごと）
  const [openCostId, setOpenCostId] = useState<string | null>(null);

  const openEdit = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setMode("edit");
    setSelectedId(id);
    setDraft({ ...p, purchaseCostItems: p.purchaseCostItems.map((it) => ({ ...it })) });
    setIsEditorOpen(true);
    setIsCostEditorOpen(false);
  };

  const openCreate = () => {
    const nextNo = nextProjectNumberFrom(projects);
    const empty = createEmptyDraft(nextNo);
    setMode("create");
    setSelectedId(empty.id);
    setDraft(empty);
    setIsEditorOpen(true);
    setIsCostEditorOpen(true);
  };

  const closeEditor = () => setIsEditorOpen(false);

  const saveAndClose = () => {
    if (mode === "create") {
      setProjects((prev) => [draft, ...prev]);
      setMode("edit");
    } else {
      setProjects((prev) => prev.map((p) => (p.id === draft.id ? draft : p)));
    }
    setIsEditorOpen(false);
  };

  // ===== 編集フォーム側 自動計算 =====
  const draftPurchaseCostTotal = useMemo(() => sumCost(draft.purchaseCostItems), [draft.purchaseCostItems]);
  const draftProjectTotal = useMemo(
    () => calcProjectTotal(draft.propertyPrice, draftPurchaseCostTotal),
    [draft.propertyPrice, draftPurchaseCostTotal]
  );
  const draftExpectedYield = useMemo(
    () => calcYieldPercent(draft.expectedRent * 12, draftProjectTotal),
    [draft.expectedRent, draftProjectTotal]
  );
  const draftSurfaceYield = useMemo(
    () => calcYieldPercent(draft.actualRent * 12, draftProjectTotal),
    [draft.actualRent, draftProjectTotal]
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 bg-[rgb(245,158,11)] shadow">
        <div className="mx-auto max-w-[1400px] px-4 py-2 flex items-center justify-between">
          <div className="bg-white rounded-md px-3 py-1.5 flex items-center shadow-sm">
            {/* logo.png が public にある前提 */}
            <img src="/logo.png" alt="株式会社アキサス" className="h-9 w-auto block" />
          </div>

          <div className="flex items-center gap-3 text-sm text-white">
            <div className="hidden sm:block">三◯様</div>
            <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-xs">👤</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
          {/* 左メニュー */}
          <aside className="bg-white rounded-lg border shadow-sm">
            <div className="px-3 py-3 border-b">
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

          {/* 右メイン */}
          <main className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">案件情報</h1>
                <p className="text-sm text-slate-600 mt-1">
                  右下の「＋」で新規追加、一覧の「編集」で編集できます（いまはDBなしの試作）。
                </p>
              </div>

              <button
                onClick={() => setIsEditorOpen((v) => !v)}
                className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                style={{ borderColor: ORANGE }}
              >
                {isEditorOpen ? "閉じる" : "編集パネル"}
              </button>
            </div>

            <div className={["grid grid-cols-1 gap-4", isEditorOpen ? "xl:grid-cols-[1fr_420px]" : ""].join(" ")}>
              {/* 一覧 */}
              <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-orange-50 border-b px-4 py-3 flex items-center justify-between">
                  <div className="font-semibold text-slate-900">案件一覧</div>
                  <div className="text-xs text-slate-600">件数：{projects.length}</div>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    {projects.map((p) => {
                      const isSelected = p.id === selectedId;
                      const isOpen = openCostId === p.id;

                      const purchaseCost = sumCost(p.purchaseCostItems);
                      const total = calcProjectTotal(p.propertyPrice, purchaseCost);

                      const expectedYield = calcYieldPercent(p.expectedRent * 12, total);
                      const surfaceYield = p.actualRent ? calcYieldPercent(p.actualRent * 12, total) : 0;

                      const items = normalizedCostItems(p.purchaseCostItems);

                      return (
                        <div
                          key={p.id}
                          className={["rounded-md border bg-white overflow-hidden relative", isSelected ? "ring-2" : ""].join(
                            " "
                          )}
                          style={isSelected ? ({ ["--tw-ring-color" as any]: ORANGE } as any) : undefined}
                        >
                          {/* 編集ボタン */}
                          <button
                            onClick={() => openEdit(p.id)}
                            className="absolute right-3 top-3 rounded-md border bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                          >
                            編集
                          </button>

                          {/* ★ 物件所在地を「数値行の上」に */}
                          <div className="bg-slate-50 border-b px-3 py-2 text-xs text-slate-600 pr-24">
                            <span className="font-semibold">物件所在地：</span>
                            {p.location?.trim() ? p.location : "—"}
                          </div>

                          {/* 見出し＋数値（縦ズレ対策：table + セル内flex） */}
                          <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                              <colgroup>
                                <col className="w-[14%]" />
                                <col className="w-[12%]" />
                                <col className="w-[10%]" />
                                <col className="w-[12%]" />
                                <col className="w-[10%]" />
                                <col className="w-[14%]" />
                                <col className="w-[14%]" />
                                <col className="w-[14%]" />
                              </colgroup>

                              <thead>
                                <tr className="text-xs font-semibold text-slate-600">
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">プロジェクト総額</div>
                                  </th>
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">想定家賃</div>
                                  </th>
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">想定利回り</div>
                                  </th>
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">客付け家賃</div>
                                  </th>
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">表面利回り</div>
                                  </th>
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">想定販売価格</div>
                                  </th>
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">物件価格</div>
                                  </th>
                                  <th className="px-3 py-2 align-middle">
                                    <div className="flex items-center justify-end">買取経費</div>
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                <tr className="border-t text-sm text-slate-900">
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">{yen(total)}</div>
                                  </td>
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">{yen(p.expectedRent)}</div>
                                  </td>
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">{pct(expectedYield)}</div>
                                  </td>
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">
                                      {p.actualRent ? yen(p.actualRent) : "—"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">
                                      {p.actualRent ? pct(surfaceYield) : "—"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">
                                      {p.expectedSalePrice ? yen(p.expectedSalePrice) : "—"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">{yen(p.propertyPrice)}</div>
                                  </td>
                                  <td className="px-3 py-3 align-middle">
                                    <div className="flex items-center justify-end tabular-nums">{yen(purchaseCost)}</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* 経費内訳を見る（位置そのまま：下段右） */}
                          <div className="bg-slate-50 border-t px-3 py-2 text-xs text-slate-600 flex items-center justify-end">
                            <button
                              type="button"
                              className="underline text-slate-700 hover:text-slate-900"
                              onClick={() => setOpenCostId((prev) => (prev === p.id ? null : p.id))}
                            >
                              {isOpen ? "閉じる" : "経費内訳を見る"}
                            </button>
                          </div>

                          {/* 経費内訳（1行3項目） */}
                          {isOpen && (
                            <div className="border-t bg-white px-3 py-3">
                              {items.length ? (
                                <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-[12px] leading-5 text-slate-700">
                                  {items.map((it, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 text-left break-words">{it.name}</div>
                                      <div className="shrink-0 text-right tabular-nums">{yen(it.amount)}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[12px] text-slate-500">内訳がありません。</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 右：編集フォーム */}
              {isEditorOpen && (
                <section className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-orange-50 border-b px-4 py-3 flex items-center justify-between">
                    <div className="font-semibold text-slate-900">{mode === "create" ? "新規作成" : "編集"}</div>
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
                      入力 → 「保存」で反映（保存後は自動で閉じます）。
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">物件所在地</div>
                        <input
                          type="text"
                          className="w-full rounded-md border px-3 py-2"
                          placeholder="例）岐阜県岐阜市 長良大路1丁目12番地"
                          value={draft.location}
                          onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                        />
                      </label>

                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">想定家賃（円）</div>
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2"
                          value={draft.expectedRent}
                          onChange={(e) => setDraft((d) => ({ ...d, expectedRent: Number(e.target.value || 0) }))}
                        />
                      </label>

                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">客付け家賃（円）</div>
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2"
                          value={draft.actualRent}
                          onChange={(e) => setDraft((d) => ({ ...d, actualRent: Number(e.target.value || 0) }))}
                        />
                      </label>

                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">想定販売価格（円）</div>
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2"
                          value={draft.expectedSalePrice}
                          onChange={(e) => setDraft((d) => ({ ...d, expectedSalePrice: Number(e.target.value || 0) }))}
                        />
                      </label>

                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">物件価格（円）</div>
                        <input
                          type="number"
                          className="w-full rounded-md border px-3 py-2"
                          value={draft.propertyPrice}
                          onChange={(e) => setDraft((d) => ({ ...d, propertyPrice: Number(e.target.value || 0) }))}
                        />
                      </label>

                      {/* 自動計算表示 */}
                      <div className="rounded-md border bg-slate-50 p-3">
                        <div className="text-xs font-semibold text-slate-600">自動計算</div>
                        <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-800">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-slate-600">プロジェクト総額（物件価格＋買取経費）</div>
                            <div className="font-semibold tabular-nums">{yen(draftProjectTotal)}</div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-slate-600">想定利回り（想定家賃×12 / 総額）</div>
                            <div className="font-semibold tabular-nums">{pct(draftExpectedYield)}</div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-slate-600">表面利回り（客付け家賃×12 / 総額）</div>
                            <div className="font-semibold tabular-nums">{draft.actualRent ? pct(draftSurfaceYield) : "—"}</div>
                          </div>
                        </div>
                      </div>

                      {/* 買取経費：合計（自動） */}
                      <label className="text-sm">
                        <div className="text-xs font-semibold text-slate-600 mb-1">買取経費（合計・自動計算）</div>
                        <input
                          type="text"
                          readOnly
                          className="w-full rounded-md border px-3 py-2 bg-slate-50 text-slate-700"
                          value={yen(draftPurchaseCostTotal)}
                        />
                      </label>

                      {/* 内訳入力（折り畳み） */}
                      <div className="rounded-md border overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setIsCostEditorOpen((v) => !v)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white hover:bg-slate-50"
                        >
                          <span className="font-semibold text-slate-800">買取経費 内訳（入力）</span>
                          <span className="text-xs text-slate-600">{isCostEditorOpen ? "閉じる ▲" : "開く ▼"}</span>
                        </button>

                        {isCostEditorOpen && (
                          <div className="p-3 bg-slate-50 space-y-2">
                            <div className="text-xs text-slate-600">
                              内訳を追加していくと合計が自動で変わります。
                            </div>

                            <div className="space-y-2">
                              {draft.purchaseCostItems.map((it, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_140px_36px] gap-2 items-center">
                                  <input
                                    type="text"
                                    className="rounded-md border px-3 py-2 text-sm bg-white"
                                    placeholder="内訳名（例：残置撤去費用）"
                                    value={it.name}
                                    onChange={(e) => {
                                      const name = e.target.value;
                                      setDraft((d) => {
                                        const items = d.purchaseCostItems.map((x, i) => (i === idx ? { ...x, name } : x));
                                        return { ...d, purchaseCostItems: items };
                                      });
                                    }}
                                  />

                                  <input
                                    type="number"
                                    className="rounded-md border px-3 py-2 text-sm bg-white text-right tabular-nums"
                                    placeholder="金額（円）"
                                    value={it.amount}
                                    onChange={(e) => {
                                      const amount = Number(e.target.value || 0);
                                      setDraft((d) => {
                                        const items = d.purchaseCostItems.map((x, i) => (i === idx ? { ...x, amount } : x));
                                        return { ...d, purchaseCostItems: items };
                                      });
                                    }}
                                  />

                                  <button
                                    type="button"
                                    className="h-9 w-9 rounded-md border bg-white hover:bg-slate-100 text-slate-700"
                                    title="この行を削除"
                                    onClick={() => {
                                      setDraft((d) => {
                                        const items = d.purchaseCostItems.filter((_, i) => i !== idx);
                                        return { ...d, purchaseCostItems: items.length ? items : [{ name: "", amount: 0 }] };
                                      });
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <button
                                type="button"
                                className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100"
                                onClick={() => {
                                  setDraft((d) => ({
                                    ...d,
                                    purchaseCostItems: [...d.purchaseCostItems, { name: "", amount: 0 }],
                                  }));
                                }}
                              >
                                ＋ 内訳を追加
                              </button>

                              <div className="text-sm font-semibold text-slate-800">
                                合計：{yen(draftPurchaseCostTotal)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={closeEditor}
                          className="w-1/2 rounded-md border bg-white px-4 py-2 text-sm hover:bg-slate-50"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={saveAndClose}
                          className="w-1/2 rounded-md text-white px-4 py-2 text-sm font-medium hover:opacity-90"
                          style={{ background: ORANGE }}
                        >
                          保存
                        </button>
                      </div>

                      <div className="text-xs text-slate-500">※ 次の段階でDB保存（Prisma + Postgres）に差し替えます。</div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* 右下：新規追加（＋） */}
      <button
        onClick={openCreate}
        className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg text-white text-3xl leading-none flex items-center justify-center hover:opacity-95 active:scale-95"
        style={{ background: ORANGE }}
        title="新規案件を追加"
      >
        +
      </button>
    </div>
  );
}
