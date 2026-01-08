// src/app/create/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CreatePage() {
  async function createProject(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    // ここも Prisma schema に合わせて調整してください（Projectにnameがある想定）
    await prisma.project.create({
      data: { name },
    });

    redirect("/"); // 作成後にトップへ
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <div className="max-w-3xl mx-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">新規作成</h1>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← 戻る
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form action={createProject} className="space-y-4">
            <label className="block">
              <div className="text-sm font-semibold mb-1">プロジェクト名</div>
              <input
                name="name"
                placeholder="例）テスト案件"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl px-4 py-3 font-semibold text-white bg-orange-500 hover:bg-orange-600 transition"
            >
              作成
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            ※ このページは Prisma を直接使うサーバーコンポーネントです（Vercelでも安定）。
          </p>
        </div>
      </div>
    </div>
  );
}
