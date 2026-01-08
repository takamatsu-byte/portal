"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------
//  共通の計算ロジック
// ---------------------------------------------------------
function calculateValues(
  expectedRent: number,
  agentRent: number,
  propertyPrice: number,
  expensePrices: number[]
) {
  const acquisitionCost = expensePrices.reduce((sum, val) => sum + (val || 0), 0);
  const projectTotal = propertyPrice + acquisitionCost;

  let expectedYieldBp = 0;
  let surfaceYieldBp = 0;

  if (projectTotal > 0) {
    expectedYieldBp = Math.round(((expectedRent * 12) / projectTotal) * 10000);
    surfaceYieldBp = Math.round(((agentRent * 12) / projectTotal) * 10000);
  }

  return { acquisitionCost, projectTotal, expectedYieldBp, surfaceYieldBp };
}

// ---------------------------------------------------------
//  1. 収益物件 (Project) 用のアクション
// ---------------------------------------------------------

// 作成
export async function createProject(formData: FormData) {
  const propertyAddress = formData.get("address") as string;
  const code = `P-${Date.now()}`;

  const expectedRent = Number(formData.get("expectedRent")) || 0;
  const agentRent = Number(formData.get("agentRent")) || 0;
  const expectedSalePrice = Number(formData.get("expectedSalePrice")) || 0;
  const propertyPrice = Number(formData.get("propertyPrice")) || 0;

  const expenseNames = formData.getAll("expenseName") as string[];
  const expensePrices = formData.getAll("expensePrice").map(p => Number(p));

  const calc = calculateValues(expectedRent, agentRent, propertyPrice, expensePrices);

  await prisma.project.create({
    data: {
      code,
      propertyAddress,
      projectTotal: calc.projectTotal,
      expectedRent,
      expectedYieldBp: calc.expectedYieldBp,
      agentRent,
      surfaceYieldBp: calc.surfaceYieldBp,
      expectedSalePrice,
      propertyPrice,
      acquisitionCost: calc.acquisitionCost,
      expenses: {
        create: expenseNames.map((name, index) => ({
          name: name || "名称未設定",
          price: expensePrices[index] || 0,
        })).filter(item => item.price > 0 || item.name !== "名称未設定"),
      },
    },
  });

  revalidatePath("/");
}

// 更新
export async function updateProject(id: string, formData: FormData) {
  const propertyAddress = formData.get("address") as string;
  
  const expectedRent = Number(formData.get("expectedRent")) || 0;
  const agentRent = Number(formData.get("agentRent")) || 0;
  const expectedSalePrice = Number(formData.get("expectedSalePrice")) || 0;
  const propertyPrice = Number(formData.get("propertyPrice")) || 0;

  const expenseNames = formData.getAll("expenseName") as string[];
  const expensePrices = formData.getAll("expensePrice").map(p => Number(p));

  const calc = calculateValues(expectedRent, agentRent, propertyPrice, expensePrices);

  await prisma.project.update({
    where: { id },
    data: {
      propertyAddress,
      projectTotal: calc.projectTotal,
      expectedRent,
      expectedYieldBp: calc.expectedYieldBp,
      agentRent,
      surfaceYieldBp: calc.surfaceYieldBp,
      expectedSalePrice,
      propertyPrice,
      acquisitionCost: calc.acquisitionCost,
      expenses: {
        deleteMany: {}, 
        create: expenseNames.map((name, index) => ({
          name: name || "名称未設定",
          price: expensePrices[index] || 0,
        })).filter(item => item.price > 0 || item.name !== "名称未設定"),
      },
    },
  });

  revalidatePath("/");
}

// 削除
export async function deleteProject(id: string) {
  await prisma.project.delete({
    where: { id },
  });
  revalidatePath("/");
}


// ---------------------------------------------------------
//  2. 仲介・紹介案件 (Brokerage) 用のアクション
// ---------------------------------------------------------

// 作成
export async function createBrokerageProject(formData: FormData) {
  const propertyAddress = formData.get("address") as string;
  const code = `B-${Date.now()}`; 

  // 新しい項目を取得
  const sales = Number(formData.get("sales")) || 0;
  const contractDate = formData.get("contractDate") as string;
  const settlementDate = formData.get("settlementDate") as string;

  const expenseNames = formData.getAll("expenseName") as string[];
  const expensePrices = formData.getAll("expensePrice").map(p => Number(p));
  const acquisitionCost = expensePrices.reduce((sum, val) => sum + (val || 0), 0);

  await prisma.brokerageProject.create({
    data: {
      code,
      propertyAddress,
      sales,            // 売上
      contractDate,     // 契約予定日
      settlementDate,   // 決済予定日
      acquisitionCost,
      expenses: {
        create: expenseNames.map((name, index) => ({
          name: name || "名称未設定",
          price: expensePrices[index] || 0,
        })).filter(item => item.price > 0 || item.name !== "名称未設定"),
      },
    },
  });

  revalidatePath("/brokerage");
}

// 更新
export async function updateBrokerageProject(id: string, formData: FormData) {
  const propertyAddress = formData.get("address") as string;
  
  // 新しい項目を取得
  const sales = Number(formData.get("sales")) || 0;
  const contractDate = formData.get("contractDate") as string;
  const settlementDate = formData.get("settlementDate") as string;

  const expenseNames = formData.getAll("expenseName") as string[];
  const expensePrices = formData.getAll("expensePrice").map(p => Number(p));
  const acquisitionCost = expensePrices.reduce((sum, val) => sum + (val || 0), 0);

  await prisma.brokerageProject.update({
    where: { id },
    data: {
      propertyAddress,
      sales,            // 売上
      contractDate,     // 契約予定日
      settlementDate,   // 決済予定日
      acquisitionCost,
      expenses: {
        deleteMany: {}, 
        create: expenseNames.map((name, index) => ({
          name: name || "名称未設定",
          price: expensePrices[index] || 0,
        })).filter(item => item.price > 0 || item.name !== "名称未設定"),
      },
    },
  });

  revalidatePath("/brokerage");
}

// 削除
export async function deleteBrokerageProject(id: string) {
  await prisma.brokerageProject.delete({
    where: { id },
  });
  revalidatePath("/brokerage");
}