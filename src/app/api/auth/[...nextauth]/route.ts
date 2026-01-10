import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route"; // 相対パスに注意
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // 1. 本番環境で確実にセッションを取得するための書き方
    const session = await getServerSession(authOptions);
    
    // デバッグ用：セッションがない場合はエラー理由を詳しく返す
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "セッションが見つかりません。一度ログアウトして再ログインしてください。" }, 
        { status: 401 }
      );
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "パスワードは4文字以上で入力してください。" }, 
        { status: 400 }
      );
    }

    // 2. bcryptjsでハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. データベースを更新
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "パスワードを更新しました" });
  } catch (error: any) {
    console.error("Password Update Error:", error);
    return NextResponse.json(
      { error: `更新失敗: ${error.message || "サーバーエラー"}` }, 
      { status: 500 }
    );
  }
}