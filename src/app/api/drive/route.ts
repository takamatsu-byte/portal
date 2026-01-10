import { NextResponse } from "next/server";

// ビルドエラー回避のため、一時的に中身を空にします。
// 現在は直接Googleドライブを開く運用のため、このAPIは使用していません。
export async function GET() {
  return NextResponse.json({ message: "Drive API is currently disabled." });
}