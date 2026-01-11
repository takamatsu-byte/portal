import { NextResponse, NextRequest } from "next/server";
import { getDriveClient } from "@/lib/googleDrive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    const drive = getDriveClient();
    
    // 特定のフォルダの中身だけをリストアップする
    const q = folderId ? `'${folderId}' in parents and trashed = false` : "trashed = false";

    const response = await drive.files.list({
      pageSize: 50,
      fields: "files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime)",
      q: q,
      orderBy: "modifiedTime desc",
    });

    return NextResponse.json(response.data.files || []);
  } catch (error: any) {
    console.error("Drive API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}