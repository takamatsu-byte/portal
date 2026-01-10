import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next"; // /next を追加
import { authOptions } from "../../auth/[...nextauth]/route"; // 認証設定を直接参照
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 本番環境で確実にセッションを取るために authOptions を渡します
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "認証エラー：再ログインしてからお試しください" }, 
        { status: 401 }
      );
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "パスワードは4文字以上で入力してください" }, 
        { status: 400 }
      );
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // データベースを更新
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "パスワードを更新しました" });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { error: "データベースの更新に失敗しました" }, 
      { status: 500 }
    );
  }
}