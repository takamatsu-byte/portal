import { google } from "googleapis";

// 読み取り・書き込みの両方の権限を設定
const SCOPES = ["https://www.googleapis.com/auth/drive"];

export const getDriveClient = () => {
  // 環境変数から情報を取得
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