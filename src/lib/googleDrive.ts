import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

export const getDriveClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Google Driveの環境変数が設定されていません。");
  }

  // 引数をオブジェクト形式 { email, key, scopes } で渡すように修正
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  return google.drive({ version: "v3", auth });
};

/**
 * 指定した名前でGoogle Drive上にフォルダを作成し、そのIDを返す
 */
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