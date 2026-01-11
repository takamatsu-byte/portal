import { NextResponse } from "next/server";
import { getDriveClient } from "@/lib/googleDrive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const drive = getDriveClient();
    
    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime)",
      q: "trashed = false", 
      orderBy: "modifiedTime desc",
    });

    return NextResponse.json(response.data.files || []);
  } catch (error: any) {
    console.error("Google Drive API Error:", error);
    return NextResponse.json(
      { error: `Google Drive接続失敗: ${error.message}` }, 
      { status: 500 }
    );
  }
}