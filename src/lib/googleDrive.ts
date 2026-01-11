import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

export const getDriveClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  
  // 秘密鍵の補正（改行コードの復元と不要な引用符の削除）
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n").replace(/^"(.*)"$/, "$1");
  }

  if (!clientEmail || !privateKey) {
    throw new Error("Google Driveの環境変数が設定されていません。");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.drive({ version: "v3", auth });
};

export const createFolder = async (folderName: string, parentId?: string): Promise<string> => {
  try {
    const drive = getDriveClient();
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });

    const folderId = folder.data.id;
    if (!folderId) throw new Error("フォルダIDの取得に失敗しました");

    return folderId;
  } catch (error) {
    console.error("Google Drive createFolder Error:", error);
    throw error;
  }
};