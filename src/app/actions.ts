"use server";

import { prisma } from "@/lib/prisma";
import { createFolder } from "@/lib/googleDrive";
import { revalidatePath } from "next/cache";

/**
 * 物件を新規登録するアクション
 * 1. Googleドライブにフォルダを作成
 * 2. データベースに物件情報を保存（最初はPROSPECT=検討中として登録）
 */
export async function createProjectAction(address: string) {
  try {
    // 1. Googleドライブにフォルダを作成（物件名をフォルダ名にする）
    // ※この関数の実行にはGoogle APIの設定が必要です
    const folderId = await createFolder(address);

    // 2. データベースに保存
    const newProject = await prisma.project.create({
      data: {
        propertyAddress: address,
        googleDriveFolderId: folderId,
        status: "PROSPECT", // 初期ステータスは「検討中」
      },
    });

    // 画面のデータを最新にする
    revalidatePath("/documents");
    
    return { success: true, project: newProject };
  } catch (error) {
    console.error("物件登録エラー:", error);
    return { success: false, error: "登録に失敗しました" };
  }
}