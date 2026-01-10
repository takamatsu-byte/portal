import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "パスワードは4文字以上で入力してください" }, { status: 400 });
    }

    // ログイン中のユーザーのパスワードを更新
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: newPassword },
    });

    return NextResponse.json({ message: "パスワードを更新しました" });
  } catch (error) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}