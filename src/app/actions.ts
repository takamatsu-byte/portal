"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// サーバーアクション：案件を作成する
export async function createProject(formData: FormData) {
  const propertyAddress = formData.get("address") as string;
  const projectTotal = Number(formData.get("price")) || 0;
  
  // コードは必須なので、入力がなければ自動生成
  const code = (formData.get("code") as string) || `P-${Date.now()}`;

  // データベースに保存
  await prisma.project.create({
    data: {
      code: code,
      propertyAddress: propertyAddress,
      projectTotal: projectTotal,
      expectedRent: 0,
      expectedYieldBp: 0,
      agentRent: 0,
      surfaceYieldBp: 0,
      expectedSalePrice: 0,
      propertyPrice: 0,
      acquisitionCost: 0,
    },
  });

  // トップページのデータを更新する（画面遷移せずにリストを最新にするため）
  revalidatePath("/");
}