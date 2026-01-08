"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

type CostItem = {
  id: string;
  label: string; // 項目（全角）
  amount: string; // 金額（半角）
};

type Property = {
  id: string;
  name: string;

  projectTotalYen: string;
  assumedRentYen: string;
  assumedYield: string;

  customerRentYen: string;
  surfaceYield: string;

  expectedSalePriceYen: string;
  propertyPriceYen: string;

  buyCostTotalYen: string;
  buyCostBreakdown?: { label: string; amount: string }[];
};

const BRAND_ORANGE = "#FD9D24";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function parseYen(input: string): number | null {
  const s = (input ?? "").trim();
  if (!s) return null;
  const normalized = s.replace(/,/g, "").replace(/円/g, "");
  const m = normalized.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function formatYen(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "-";
  return `${Math.round(n).toLocaleString()}円`;
}

function normalizeYenString(input: string): string {
  const n = parseYen(input);
  if (n === null) return "-";
  return formatYen(n);
}

function formatPercent(p: number | null, digits = 1): string {
  if (p === null || !Number.isFinite(p)) return "-";
  return `${p.toFixed(digits)}%`;
}

function sumCostItemsYen(items: CostItem[]): number {
  let sum = 0;
  for (const it of items) {
    const v = parseYen(it.amount);
    if (v !== null) sum += v;
  }
  return sum;
}

function calcProjectTotalYen(propertyPriceYen: string, buyCostTotalYen: number): number | null {
  const pp = parseYen(propertyPriceYen);
  if (pp === null) return null;
  return pp + buyCostTotalYen;
}

function calcYieldPercent(monthlyRentYen: number | null, projectTotalYen: number | null): number | null {
  if (monthlyRentYen === null || projectTotalYen === null) return null;
  if (projectTotalYen <= 0) return null;
  return (monthlyRentYen * 12 / projectTotalYen) * 100;
}

function oneLineBreakdown(items?: { label: string; amount: string }[]): string {
  if (!items || items.length === 0) return "";
  return items.map((x) => `${x.label || "-"}：${x.amount || "-"}`).join(" / ");
}

function toZenkakuLoose(input: string): string {
  return (input ?? "").replace(/ /g, "　");
}

function toHankakuNumberOnly(input: string): string {
  const s = (input ?? "")
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[,円\s]/g, "");
  return s.replace(/[^0-9-]/g, "");
}

function ensureTrailingEmptyCostRow(items: CostItem[]): CostItem[] {
  const trimmed = items.map((x) => ({ ...x }));
  const last = trimmed[trimmed.length - 1];
  const lastHasValue = !!(last?.label?.trim() || last?.amount?.trim());

  if (!trimmed.length || lastHasValue) {
    trimmed.push({ id: uid(), label: "", amount: "" });
  }

  while (trimmed.length >= 2) {
    const a = trimmed[trimmed.length - 1];
    const b = trimmed[trimmed.length - 2];
    const aEmpty = !(a.label.trim() || a.amount.trim());
    const bEmpty = !(b.label.trim() || b.amount.trim());
    if (aEmpty && bEmpty) trimmed.splice(trimmed.length - 1, 1);
    else break;
  }

  return trimmed;
}

export default function RealEstateDashboard() {
  const initial: Property[] = useMemo(
    () => [
      {
        id: "1",
        name: "アキサスハイツ東京",
        projectTotalYen: "-",
        assumedRentYen: "650,000円",
        assumedYield: "9.2%",
        customerRentYen: "-",
        surfaceYield: "-",
        expectedSalePriceYen: "-",
        propertyPriceYen: "-",
        buyCostTotalYen: "-",
      },
      {
        id: "2",
        name: "メゾン横浜あざみ野",
        projectTotalYen: "-",
        assumedRentYen: "980,000円",
        assumedYield: "9.8%",
        customerRentYen: "-",
        surfaceYield: "-",
        expectedSalePriceYen: "-",
        propertyPriceYen: "-",
        buyCostTotalYen: "-",
      },
    ],
    []
  );

  const [properties, setProperties] = useState<Property[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [modalTarget, setModalTarget] = useState<Property | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    assumedRentYen: string;
    customerRentYen: string;
    expectedSalePriceYen: string;
    propertyPriceYen: string;
    buyCostItems: CostItem[];
  }>({
    name: "",
    assumedRentYen: "",
    customerRentYen: "",
    expectedSalePriceYen: "",
    propertyPriceYen: "",
    buyCostItems: ensureTrailingEmptyCostRow([{ id: uid(), label: "", amount: "" }]),
  });

  const active = "収益物件一覧";

  function resetForm() {
    setForm({
      name: "",
      assumedRentYen: "",
      customerRentYen: "",
      expectedSalePriceYen: "",
      propertyPriceYen: "",
      buyCostItems: ensureTrailingEmptyCostRow([{ id: uid(), label: "", amount: "" }]),
    });
    setEditingId(null);
  }

  function closePanel() {
    setIsPanelOpen(false);
  }

  function openCreate() {
    setMode("create");
    resetForm();
    setIsPanelOpen(true);
  }

  function openEdit() {
    if (!selectedId) return;
    const p = properties.find((x) => x.id === selectedId);
    if (!p) return;

    setMode("edit");
    setEditingId(p.id);

    const breakdown = (p.buyCostBreakdown ?? []).map((b) => ({
      id: uid(),
      label: b.label ?? "",
      amount: (b.amount ?? "").replace(/円/g, "").replace(/,/g, ""),
    }));

    setForm({
      name: p.name === "-" ? "" : p.name,
      assumedRentYen: (p.assumedRentYen ?? "").replace(/円/g, "").replace(/,/g, ""),
      customerRentYen: (p.customerRentYen ?? "").replace(/円/g, "").replace(/,/g, ""),
      expectedSalePriceYen: (p.expectedSalePriceYen ?? "").replace(/円/g, "").replace(/,/g, ""),
      propertyPriceYen: (p.propertyPriceYen ?? "").replace(/円/g, "").replace(/,/g, ""),
      buyCostItems: ensureTrailingEmptyCostRow(breakdown.length ? breakdown : [{ id: uid(), label: "", amount: "" }]),
    });

    setIsPanelOpen(true);
  }

  function onDelete() {
    if (!selectedId) return;
    const p = properties.find((x) => x.id === selectedId);
    const name = p?.name ?? "";
    const ok = window.confirm(`この行を削除しますか？\n${name}`);
    if (!ok) return;

    setProperties((prev) => prev.filter((x) => x.id !== selectedId));
    setSelectedId(null);
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function openModalIfHasBreakdown(p: Property) {
    if (p.buyCostBreakdown && p.buyCostBreakdown.length > 0) setModalTarget(p);
  }

  function upsertProperty(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("物件名は必須です。");
      return;
    }

    const buyCostTotalYenNum = sumCostItemsYen(form.buyCostItems);
    const projectTotalYenNum = calcProjectTotalYen(form.propertyPriceYen, buyCostTotalYenNum);

    const assumedYieldNum = calcYieldPercent(parseYen(form.assumedRentYen), projectTotalYenNum);
    const surfaceYieldNum = calcYieldPercent(parseYen(form.customerRentYen), projectTotalYenNum);

    const breakdownClean = form.buyCostItems
      .map((x) => ({ label: x.label.trim(), amount: x.amount.trim() }))
      .filter((x) => x.label || x.amount)
      .map((x) => ({
        label: x.label || "-",
        amount: x.amount ? normalizeYenString(x.amount) : "-",
      }));

    const nextItem: Property = {
      id: mode === "edit" && editingId ? editingId : uid(),
      name: form.name.trim(),

      propertyPriceYen: form.propertyPriceYen.trim() ? normalizeYenString(form.propertyPriceYen.trim()) : "-",
      assumedRentYen: form.assumedRentYen.trim() ? normalizeYenString(form.assumedRentYen.trim()) : "-",
      customerRentYen: form.customerRentYen.trim() ? normalizeYenString(form.customerRentYen.trim()) : "-",
      expectedSalePriceYen: form.expectedSalePriceYen.trim() ? normalizeYenString(form.expectedSalePriceYen.trim()) : "-",

      buyCostTotalYen: formatYen(buyCostTotalYenNum),
      projectTotalYen: projectTotalYenNum === null ? "-" : formatYen(projectTotalYenNum),

      assumedYield: assumedYieldNum === null ? "-" : formatPercent(assumedYieldNum, 1),
      surfaceYield: surfaceYieldNum === null ? "-" : formatPercent(surfaceYieldNum, 1),

      buyCostBreakdown: breakdownClean.length ? breakdownClean : undefined,
    };

    setProperties((prev) => {
      if (mode === "edit" && editingId) return prev.map((x) => (x.id === editingId ? nextItem : x));
      return [nextItem, ...prev];
    });

    setSelectedId(nextItem.id);
    resetForm();
    closePanel();
  }

  const selected = selectedId ? properties.find((x) => x.id === selectedId) : null;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-600 bg-slate-50">
      {/* 左サイドバー */}
      <aside className="w-64 text-white flex flex-col flex-shrink-0" style={{ backgroundColor: BRAND_ORANGE }}>
        {/* ヘッダー(h-28)と下端を合わせる */}
        <div className="h-28 flex items-center px-6 border-b border-white/30 bg-white">
          {/* ✅ public/logo.png を置いてください */}
          <Image src="/logo.png" alt="PORTAL ロゴ" width={52} height={52} className="mr-4" priority />
          <span className="font-extrabold tracking-wide text-slate-800 text-2xl">PORTAL</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-hidden">
          <a
            href="#"
            className={[
              "flex items-center px-4 py-3 rounded-xl font-semibold transition",
              active === "収益物件一覧" ? "bg-white text-[#FD9D24] shadow-sm" : "text-white hover:bg-white/15",
            ].join(" ")}
          >
            収益物件一覧
          </a>
          <a
            href="#"
            className={[
              "flex items-center px-4 py-3 rounded-xl font-semibold transition",
              active === "顧客管理" ? "bg-white text-[#FD9D24] shadow-sm" : "text-white hover:bg-white/15",
            ].join(" ")}
          >
            顧客管理
          </a>
        </nav>
      </aside>

      {/* メイン */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー白帯（太め） */}
        <div className="bg-white h-28 border-b border-slate-100 flex items-center">
          <header className="w-full px-8 flex items-center justify-end h-full">
            {/* ピル型ボタン群（ヘッダー中央揃え） */}
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden my-auto">
              {/* ＋（追加）※＋だけ */}
              <button
                onClick={openCreate}
                className="group w-14 h-11 inline-flex items-center justify-center font-semibold text-slate-700 transition hover:bg-[#FD9D24]"
                title="追加"
                aria-label="追加"
              >
                <span className="text-xl font-extrabold leading-none text-[#FD9D24] group-hover:text-white transition">
                  +
                </span>
              </button>

              <div className="w-px h-7 bg-slate-200" />

              <button
                onClick={openEdit}
                disabled={!selectedId}
                className={[
                  "px-5 h-11 inline-flex items-center font-semibold transition",
                  selectedId ? "text-slate-700 hover:text-white hover:bg-[#FD9D24]" : "text-slate-300 cursor-not-allowed",
                ].join(" ")}
                title={selectedId ? "編集" : "行を選択してください"}
                aria-label="編集"
              >
                編集
              </button>

              <div className="w-px h-7 bg-slate-200" />

              <button
                onClick={onDelete}
                disabled={!selectedId}
                className={[
                  "px-5 h-11 inline-flex items-center font-semibold transition",
                  selectedId ? "text-slate-700 hover:text-white hover:bg-[#FD9D24]" : "text-slate-300 cursor-not-allowed",
                ].join(" ")}
                title={selectedId ? "削除" : "行を選択してください"}
                aria-label="削除"
              >
                削除
              </button>
            </div>
          </header>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-hidden p-8 relative">
          <div className="mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-100 w-56">
              <p className="text-xs font-semibold text-slate-500">登録物件数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{properties.length}件</p>
            </div>
          </div>

          {/* ✅ スクロールはテーブル(青枠)のみ：ここだけ overflow */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden flex flex-col h-[calc(100%-88px)]">
            <div className="flex-1 overflow-y-auto overflow-x-auto">
              <table className="min-w-[1200px] w-full font-semibold text-center">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-600 sticky top-0 z-10">
                    <th className="px-6 py-4 text-left">物件名</th>
                    <th className="px-4 py-4 text-center">プロジェクト総額</th>
                    <th className="px-4 py-4 text-center">想定家賃</th>
                    <th className="px-4 py-4 text-center">想定利回り</th>
                    <th className="px-4 py-4 text-center">客付け家賃</th>
                    <th className="px-4 py-4 text-center">表面利回り</th>
                    <th className="px-4 py-4 text-center">想定販売価格</th>
                    <th className="px-4 py-4 text-center">物件価格</th>
                    <th className="px-4 py-4 text-center">買取経費</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {properties.map((p) => {
                    const hasBreakdown = !!(p.buyCostBreakdown && p.buyCostBreakdown.length > 0);
                    const isExpanded = !!expandedIds[p.id];
                    const isSelected = p.id === selectedId;

                    return (
                      <React.Fragment key={p.id}>
                        <tr
                          className={["hover:bg-slate-50", isSelected ? "bg-orange-50/60" : "", "cursor-pointer"].join(" ")}
                          onClick={() => setSelectedId(p.id)}
                          onDoubleClick={() => openModalIfHasBreakdown(p)}
                          title="クリックで選択 / ダブルクリックで内訳モーダル（内訳がある場合）"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-left">{p.name}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{p.projectTotalYen}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{p.assumedRentYen}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-green-600">{p.assumedYield}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{p.customerRentYen}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{p.surfaceYield}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{p.expectedSalePriceYen}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{p.propertyPriceYen}</td>

                          <td className="px-4 py-4 whitespace-nowrap relative">
                            {p.buyCostTotalYen}

                            {/* ◢（90度右回転＝▶） */}
                            {hasBreakdown && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(p.id);
                                }}
                                className="absolute right-0 bottom-0 w-7 h-7"
                                aria-label="買取経費の内訳を表示"
                                title={isExpanded ? "内訳を閉じる" : "内訳を開く"}
                              >
                                <span
                                  className="absolute right-1 bottom-1 w-0 h-0"
                                  style={{
                                    borderTop: "6px solid transparent",
                                    borderBottom: "6px solid transparent",
                                    borderLeft: `10px solid ${BRAND_ORANGE}`,
                                    opacity: 0.95,
                                  }}
                                />
                              </button>
                            )}
                          </td>
                        </tr>

                        {hasBreakdown && isExpanded && (
                          <tr className="bg-white">
                            <td colSpan={9} className="px-6 py-3">
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-sm text-slate-800 leading-relaxed break-words text-left font-semibold">
                                  {oneLineBreakdown(p.buyCostBreakdown)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 右パネル（登録/編集） */}
          {isPanelOpen && (
            <div className="fixed inset-0 z-40">
              <button
                className="absolute inset-0 bg-black/20"
                onClick={() => setIsPanelOpen(false)}
                aria-label="背景クリックで閉じる"
              />

              <div className="absolute top-0 right-0 h-full w-[640px] max-w-[95vw] bg-white border-l border-slate-200 shadow-2xl">
                <div className="h-full flex flex-col">
                  <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
                    <div className="font-bold text-slate-800">
                      {mode === "edit" ? "案件編集" : "新規案件登録"}
                      {mode === "edit" && selected?.name ? (
                        <span className="ml-2 text-sm font-semibold text-slate-500">（{selected.name}）</span>
                      ) : null}
                    </div>
                    <button
                      onClick={() => setIsPanelOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                      aria-label="閉じる"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={upsertProperty} className="flex-1 overflow-auto p-6">
                    <div className="space-y-4">
                      <FieldZenkaku
                        label="物件名（必須）"
                        value={form.name}
                        onChange={(v) => setForm((prev) => ({ ...prev, name: toZenkakuLoose(v) }))}
                        placeholder="例）アキサスハイツ東京"
                        required
                      />

                      <FieldHankakuNumber
                        label="物件価格（円）"
                        value={form.propertyPriceYen}
                        onChange={(v) => setForm((prev) => ({ ...prev, propertyPriceYen: toHankakuNumberOnly(v) }))}
                        placeholder="例）78000000"
                      />

                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-semibold text-slate-800">買取経費（内訳）</div>

                          {/* ＋（内訳追加）ホバーでオレンジ背景、白抜き */}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                buyCostItems: ensureTrailingEmptyCostRow([...prev.buyCostItems, { id: uid(), label: "", amount: "" }]),
                              }))
                            }
                            className="group inline-flex items-center justify-center rounded-full w-10 h-10 border border-slate-200 bg-white font-semibold text-sm transition hover:bg-[#FD9D24]"
                            aria-label="内訳を追加"
                            title="内訳を追加"
                          >
                            <span className="text-xl font-extrabold leading-none text-[#FD9D24] group-hover:text-white transition">
                              +
                            </span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {form.buyCostItems.map((item, idx) => {
                            const isLast = idx === form.buyCostItems.length - 1;
                            const canDelete = !isLast;

                            return (
                              <div key={item.id} className="flex gap-2">
                                <input
                                  value={item.label}
                                  onChange={(e) => {
                                    const nextLabel = toZenkakuLoose(e.target.value);
                                    setForm((prev) => {
                                      const updated = prev.buyCostItems.map((x) => (x.id === item.id ? { ...x, label: nextLabel } : x));
                                      return { ...prev, buyCostItems: ensureTrailingEmptyCostRow(updated) };
                                    });
                                  }}
                                  placeholder="項目（例：仲介手数料）"
                                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                                  inputMode="text"
                                  lang="ja"
                                />

                                <input
                                  value={item.amount}
                                  onChange={(e) => {
                                    const nextAmt = toHankakuNumberOnly(e.target.value);
                                    setForm((prev) => {
                                      const updated = prev.buyCostItems.map((x) => (x.id === item.id ? { ...x, amount: nextAmt } : x));
                                      return { ...prev, buyCostItems: ensureTrailingEmptyCostRow(updated) };
                                    });
                                  }}
                                  placeholder="金額（円）例：1200000"
                                  className="w-44 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                                  inputMode="numeric"
                                />

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!canDelete) return;
                                    setForm((prev) => {
                                      const filtered = prev.buyCostItems.filter((x) => x.id !== item.id);
                                      return { ...prev, buyCostItems: ensureTrailingEmptyCostRow(filtered) };
                                    });
                                  }}
                                  disabled={!canDelete}
                                  className={[
                                    "w-10 rounded-xl border border-slate-200 text-slate-500",
                                    canDelete ? "hover:bg-slate-50" : "opacity-30 cursor-not-allowed",
                                  ].join(" ")}
                                  aria-label={`内訳${idx + 1}を削除`}
                                  title={canDelete ? "削除" : "空行は削除不可"}
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="text-slate-500">買取経費（合計）</div>
                          <div className="font-semibold text-slate-800">{formatYen(sumCostItemsYen(form.buyCostItems))}</div>
                        </div>
                      </div>

                      <FieldHankakuNumber
                        label="想定家賃（円）"
                        value={form.assumedRentYen}
                        onChange={(v) => setForm((prev) => ({ ...prev, assumedRentYen: toHankakuNumberOnly(v) }))}
                        placeholder="例）650000"
                      />

                      <FieldHankakuNumber
                        label="客付け家賃（円）"
                        value={form.customerRentYen}
                        onChange={(v) => setForm((prev) => ({ ...prev, customerRentYen: toHankakuNumberOnly(v) }))}
                        placeholder="例）620000"
                      />

                      <FieldHankakuNumber
                        label="想定販売価格（円）"
                        value={form.expectedSalePriceYen}
                        onChange={(v) => setForm((prev) => ({ ...prev, expectedSalePriceYen: toHankakuNumberOnly(v) }))}
                        placeholder="例）92000000"
                      />

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            closePanel();
                          }}
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold hover:bg-slate-50"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          className="flex-1 rounded-xl px-4 py-3 font-semibold text-white"
                          style={{ backgroundColor: BRAND_ORANGE }}
                        >
                          {mode === "edit" ? "更新" : "登録"}
                        </button>
                      </div>

                      <div className="h-4" />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* 内訳モーダル */}
          {modalTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <button className="absolute inset-0 bg-black/30" onClick={() => setModalTarget(null)} aria-label="閉じる" />
              <div className="relative w-[780px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
                  <div className="font-bold text-slate-800">買取経費 内訳：{modalTarget.name}</div>
                  <button
                    onClick={() => setModalTarget(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    aria-label="閉じる"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-800 leading-relaxed break-words">
                      {oneLineBreakdown(modalTarget.buyCostBreakdown)}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                    <div className="text-slate-500">買取経費（合計）</div>
                    <div className="font-semibold text-slate-800">{modalTarget.buyCostTotalYen}</div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => setModalTarget(null)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold hover:bg-slate-50"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FieldZenkaku(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-1">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        inputMode="text"
        lang="ja"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}

function FieldHankakuNumber(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-1">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        inputMode="numeric"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}
