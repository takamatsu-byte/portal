import { NextResponse } from "next/server";
import { getDriveClient } from "@/lib/googleDrive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    // 1. ログイン認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 2. Driveクライアントの初期化
    const drive = getDriveClient();
    
    // 3. ファイル一覧の取得（ゴミ箱に入っていないもの、更新日順）
    const response = await drive.files.list({
      pageSize: 30,
      fields: "files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime)",
      q: "trashed = false", 
      orderBy: "modifiedTime desc",
    });

    return NextResponse.json(response.data.files || []);
  } catch (error: any) {
    console.error("Google Drive API Error:", error);
    return NextResponse.json(
      { error: error.message || "Google Driveの取得に失敗しました" }, 
      { status: 500 }
    );
  }
}