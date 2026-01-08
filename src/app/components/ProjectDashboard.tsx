"use client";

import { useState } from "react";
import { createProject, updateProject, deleteProject } from "@/app/actions";

// 表示用フォーマット関数
function yen(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${n.toLocaleString("ja-JP")} 円`;
}

function pctFromBp(bp: number | null | undefined) {
  if (bp === null || bp === undefined) return "—";
  return `${(bp / 100).toFixed(2)}%`;
}

export default function ProjectDashboard({ projects }: { projects: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // フォームの項目State
  const [address, setAddress] = useState("");
  const [expectedRent, setExpectedRent] = useState<number | string>("");
  const [agentRent, setAgentRent] = useState<number | string>("");
  const [expectedYield, setExpectedYield] = useState<number | string>("");
  const [surfaceYield, setSurfaceYield] = useState<number | string>("");
  const [expectedSalePrice, setExpectedSalePrice] = useState<number | string>("");
  const [propertyPrice, setPropertyPrice] = useState<number | string>("");
  const [expenses, setExpenses] = useState([{ name: "", price: "" }]);

  // フォームリセット
  const resetForm = () => {
    setEditingId(null);
    setAddress("");
    setExpectedRent("");
    setAgentRent("");
    setExpectedYield("");
    setSurfaceYield("");
    setExpectedSalePrice("");
    setPropertyPrice("");
    setExpenses([{ name: "", price: "" }]);
  };

  // 編集ボタン処理
  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setAddress(project.propertyAddress);
    setExpectedRent(project.expectedRent || "");
    setAgentRent(project.agentRent || "");
    setExpectedYield(project.expectedYieldBp ? (project.expectedYieldBp / 100).toFixed(2) : "");
    setSurfaceYield(project.surfaceYieldBp ? (project.surfaceYieldBp / 100).toFixed(2) : "");
    setExpectedSalePrice(project.expectedSalePrice || "");
    setPropertyPrice(project.propertyPrice || "");

    if (project.expenses && project.expenses.length > 0) {
      setExpenses(project.expenses.map((e: any) => ({ 
        name: e.name, 
        price: e.price 
      })));
    } else {
      setExpenses([{ name: "", price: "" }]);
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("本当にこの物件データを削除しますか？\n※削除すると元に戻せません。")) {
      await deleteProject(id);
    }
  };

  const toggleBreakdown = (id: string) => {
    setExpandedProjectId(expandedProjectId === id ? null : id);
  };

  const addExpenseRow = () => {
    setExpenses([...expenses, { name: "", price: "" }]);
  };

  const removeExpenseRow = (index: number) => {
    const newExpenses = [...expenses];
    newExpenses.splice(index, 1);
    setExpenses(newExpenses);
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const currentTotal = (Number(propertyPrice) || 0) + totalExpenses;

  // グリッド定義
  const gridClass = "grid grid-cols-[1.2fr_1fr_0.8fr_1fr_0.8fr_1fr_1fr_1fr_0.8fr] gap-2 items-center text-center";

  return (
    <div className="flex h-full w-full bg-slate-50">
      
      {/* 左側：リストエリア */}
      <div className={`flex flex-col h-full ${isFormOpen ? "w-2/3 border-r" : "w-full"} transition-all duration-300`}>
        
        {/* 上部固定エリア */}
        <div className="flex-none px-6 py-6 flex items-center justify-between bg-slate-50 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800">収益物件一覧</h1>
            <p className="mt-1 text-sm text-slate-500">
              DBのデータを表示中（全{projects.length}件）
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(!isFormOpen);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl text-white shadow-md hover:opacity-90 transition-all ${isFormOpen ? 'bg-slate-600 rotate-45' : 'bg-[#FD9D24]'}`}
          >
            +
          </button>
        </div>

        {/* 見出し行（固定） */}
        <div className="flex-none px-6 pb-2 bg-slate-50 z-10">
          <div className={`rounded-t-lg border border-b-0 bg-slate-100 px-4 py-3 text-xs font-bold text-slate-500 ${gridClass}`}>
            <div>プロジェクト総額</div>
            <div>想定家賃</div>
            <div className="text-orange-600">想定利回り</div>
            <div>客付け家賃</div>
            <div className="text-orange-600">表面利回り</div>
            <div>想定販売価格</div>
            <div>物件価格</div>
            <div>買取経費</div>
            <div>操作</div>
          </div>
        </div>

        {/* ★スクロールエリア：flexとgapを使ってスナップを確実に効かせる */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 snap-y snap-mandatory flex flex-col gap-4 scroll-pt-4">
          
          {projects.length === 0 && (
            <div className="rounded-b-lg border bg-white p-8 text-center text-slate-500 snap-start">
              まだ登録された物件がありません。右上の「＋」ボタンから登録してください。
            </div>
          )}
          
          {projects.map((p) => (
            // ★ snap-start を指定
            <div key={p.id} className="snap-start rounded-lg border bg-white shadow-sm overflow-hidden first:rounded-t-none first:border-t-0 shrink-0">
              {/* 物件所在地 */}
              <div className="bg-slate-50 px-4 py-2 text-xs text-slate-600 border-b text-left">
                <span className="font-bold">物件所在地：</span> {p.propertyAddress}
              </div>

              {/* 数値データ行 */}
              <div className={`px-4 py-4 text-sm ${gridClass}`}>
                <div className="font-bold text-lg">{yen(p.projectTotal)}</div>
                <div>{yen(p.expectedRent)}</div>
                <div className="font-bold text-orange-600">{pctFromBp(p.expectedYieldBp)}</div>
                <div>{yen(p.agentRent)}</div>
                <div className="font-bold text-orange-600">{pctFromBp(p.surfaceYieldBp)}</div>
                <div>{yen(p.expectedSalePrice)}</div>
                <div>{yen(p.propertyPrice)}</div>
                
                {/* 買取経費と内訳ボタン */}
                <div className="flex flex-col items-center justify-center">
                  <span>{yen(p.acquisitionCost)}</span>
                  <button
                    onClick={() => toggleBreakdown(p.id)}
                    className="text-[10px] text-slate-400 underline hover:text-orange-600 mt-1"
                  >
                    {expandedProjectId === p.id ? "閉じる" : "内訳を見る"}
                  </button>
                </div>

                {/* 操作エリア */}
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleEdit(p)}
                    className="rounded border px-2 py-1 text-xs text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                  >
                    編集
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="rounded border px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>

              {/* 内訳パネル */}
              {expandedProjectId === p.id && (
                <div className="border-t border-orange-100 bg-orange-50/50 px-4 py-3 text-left">
                  <div className="rounded border border-orange-100 bg-white p-3 shadow-sm">
                    <div className="mb-2 text-xs font-bold text-slate-500 border-b pb-1">
                      ▼ 買取経費の内訳
                    </div>
                    {(!p.expenses || p.expenses.length === 0) ? (
                      <div className="text-sm text-slate-400">内訳情報はありません</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                        {p.expenses.map((exp: any) => (
                          <div key={exp.id} className="text-sm text-slate-700 truncate flex items-center justify-between pr-4 border-b border-orange-100/50 pb-1">
                            <span className="text-xs text-slate-500">{exp.name}</span>
                            <span className="font-medium ml-2">{yen(exp.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* 下部に余白を追加して最後のカードが見切れないようにする */}
          <div className="snap-start h-2 w-full"></div>
        </div>
      </div>

      {/* 右側：登録・編集フォーム */}
      {isFormOpen && (
        <div className="w-1/3 min-w-[380px] bg-white border-l shadow-xl flex flex-col h-full z-20">
          <div className="flex-none p-6 border-b flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">
              {editingId ? "収益物件情報を編集" : "新規物件登録"}
            </h2>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <form action={async (formData) => {
                if (editingId) {
                  await updateProject(editingId, formData);
                } else {
                  await createProject(formData);
                }
                resetForm();
                setIsFormOpen(false);
            }} className="space-y-4">
              
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">
                  物件所在地 <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm text-slate-700"
                  placeholder="例: 東京都..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    想定家賃 (円)
                  </label>
                  <input
                    name="expectedRent"
                    type="number"
                    value={expectedRent}
                    onChange={(e) => setExpectedRent(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm text-slate-700"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    想定利回り (%)
                  </label>
                  <input
                    name="expectedYield"
                    type="text"
                    disabled
                    value={expectedYield} 
                    className="w-full rounded border bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    placeholder="自動計算"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    客付け家賃 (円)
                  </label>
                  <input
                    name="agentRent"
                    type="number"
                    value={agentRent}
                    onChange={(e) => setAgentRent(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm text-slate-700"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">
                    表面利回り (%)
                  </label>
                  <input
                    name="surfaceYield"
                    type="text"
                    disabled
                    value={surfaceYield}
                    className="w-full rounded border bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    placeholder="自動計算"
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">
                  想定販売価格 (円)
                </label>
                <input
                  name="expectedSalePrice"
                  type="number"
                  value={expectedSalePrice}
                  onChange={(e) => setExpectedSalePrice(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm text-slate-700"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">
                  物件価格 (円)
                </label>
                <input
                  name="propertyPrice"
                  type="number"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm text-slate-700"
                  placeholder="0"
                />
              </div>

              <div className="rounded bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-500">
                    買取経費の内訳
                  </label>
                  <span className="text-xs font-bold text-slate-500">
                    経費計: {totalExpenses.toLocaleString()} 円
                  </span>
                </div>

                <div className="space-y-2">
                  {expenses.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        name="expenseName"
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newExpenses = [...expenses];
                          newExpenses[index].name = e.target.value;
                          setExpenses(newExpenses);
                        }}
                        className="flex-1 rounded border px-2 py-1 text-sm text-slate-700"
                        placeholder="項目名"
                      />
                      <input
                        name="expensePrice"
                        type="number"
                        value={item.price}
                        onChange={(e) => {
                          const newExpenses = [...expenses];
                          newExpenses[index].price = e.target.value;
                          setExpenses(newExpenses);
                        }}
                        className="w-24 rounded border px-2 py-1 text-sm text-slate-700 text-right"
                        placeholder="金額"
                      />
                      {expenses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseRow(index)}
                          className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addExpenseRow}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded border border-dashed border-slate-300 bg-white py-2 text-xs text-slate-500 hover:bg-slate-100"
                >
                  <span>＋ 経費項目を追加</span>
                </button>
              </div>

              <div className="rounded border border-orange-200 bg-orange-50 p-3 text-center">
                <div className="text-xs text-orange-600">プロジェクト総額 (自動計算)</div>
                <div className="text-xl font-bold text-orange-700">
                  {currentTotal.toLocaleString()} 円
                </div>
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
                  {editingId ? "更新する" : "保存する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}