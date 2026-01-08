"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// サーバーアクション：案件を作成する
export async function createProject(formData: FormData) {
  // 1. テキスト項目
  const propertyAddress = formData.get("address") as string;
  const code = `P-${Date.now()}`; // コードは自動生成

  // 2. 金額項目（未入力や不正な値は0にする）
  const projectTotal = Number(formData.get("projectTotal")) || 0;
  const expectedRent = Number(formData.get("expectedRent")) || 0;
  const agentRent = Number(formData.get("agentRent")) || 0;
  const propertyPrice = Number(formData.get("propertyPrice")) || 0;
  const acquisitionCost = Number(formData.get("acquisitionCost")) || 0;

  // 3. 利回り項目（入力は%単位、DB保存は100倍したBp単位）
  // 例: 入力が "5.5" (%) なら、DBには 550 (bp) として保存
  const expectedYieldInput = Number(formData.get("expectedYield"));
  const expectedYieldBp = isNaN(expectedYieldInput) ? 0 : Math.round(expectedYieldInput * 100);

  const surfaceYieldInput = Number(formData.get("surfaceYield"));
  const surfaceYieldBp = isNaN(surfaceYieldInput) ? 0 : Math.round(surfaceYieldInput * 100);

  // データベースに保存
  await prisma.project.create({
    data: {
      code,
      propertyAddress,
      projectTotal,
      expectedRent,
      expectedYieldBp,
      agentRent,
      surfaceYieldBp,
      propertyPrice,
      expectedSalePrice: 0, // 今回の入力項目にないので0固定
      acquisitionCost,
    },
  });

  // 画面を更新
  revalidatePath("/");
}