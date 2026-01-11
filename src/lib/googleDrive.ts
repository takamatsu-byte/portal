import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

export const getDriveClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Google Driveの環境変数が設定されていません。");
  }

  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    SCOPES
  );

  return google.drive({ version: "v3", auth });
};

/**
 * 指定した名前でGoogle Drive上にフォルダを作成する
 * @param folderName 作成するフォルダ名
 * @param parentId 作成先の親フォルダID（任意）
 */
export const createFolder = async (folderName: string, parentId?: string) => {
  try {
    const drive = getDriveClient();
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name",
    });

    return folder.data;
  } catch (error) {
    console.error("Google Drive createFolder Error:", error);
    throw error;
  }
};