import { NextResponse } from "next/server";
import { getDriveFiles } from "@/lib/googleDrive";

/**
 * 画面側からフォルダIDを受け取り、ファイル一覧を返すAPI
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  // 環境変数のチェック（本番環境でのビルドエラー防止）
  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
  }

  if (!folderId) {
    return NextResponse.json({ error: "folderId が必要です" }, { status: 400 });
  }

  try {
    const files = await getDriveFiles(folderId);
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: "ファイル取得に失敗しました" }, { status: 500 });
  }
}