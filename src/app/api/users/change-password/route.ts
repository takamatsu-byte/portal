import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    // 本番環境でセッションを確実に取得
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "セッションが切れています。再ログインしてください。" }, { status: 401 });
    }

    const { newPassword } = await request.json();
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "パスワードは4文字以上で入力してください。" }, { status: 400 });
    }

    // 新しいパスワードを暗号化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ログイン中のユーザーのパスワードを更新
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "パスワードを更新しました" });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}