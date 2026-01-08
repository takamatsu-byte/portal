import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function CreatePage() {
  // サーバーアクション（データを保存する機能）
  async function createProject(formData: FormData) {
    "use server";

    const propertyAddress = formData.get("address") as string;
    const projectTotal = Number(formData.get("price"));
    // コードは必須なので、今のところランダムな数字か入力値を使います
    const code = formData.get("code") as string || `P-${Date.now()}`;

    // データベースに保存
    await prisma.project.create({
      data: {
        code: code, // 必須項目
        propertyAddress: propertyAddress,
        projectTotal: projectTotal,
        // 他の数字項目は一旦0や固定値で埋めます（テスト用）
        expectedRent: 0,
        expectedYieldBp: 0,
        agentRent: 0,
        surfaceYieldBp: 0,
        expectedSalePrice: 0,
        propertyPrice: 0,
        acquisitionCost: 0,
      },
    });

    // 保存したらトップページに戻る
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-slate-800">新規案件登録</h1>
        
        <form action={createProject} className="space-y-4">
          
          {/* 物件コード */}
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

          {/* 物件所在地 */}
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

          {/* プロジェクト総額 */}
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
            <Link
              href="/"
              className="flex-1 rounded border px-4 py-2 text-center text-sm text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="flex-1 rounded bg-orange-400 px-4 py-2 text-sm font-bold text-white hover:bg-orange-500"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}