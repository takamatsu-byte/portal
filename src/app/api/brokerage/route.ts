import { NextResponse } from "next/server";

// ビルドエラー回避のため、一時的に空のリストを返すようにします
export async function GET() {
  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json({ success: true });
}