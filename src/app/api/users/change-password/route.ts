import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs"; // 必ず "bcryptjs" であることを確認

const prisma = new PrismaClient();

// ユーザー一覧の取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

// ユーザーの新規登録
export async function POST(request: Request) {
  try {
    // 1. 本番環境で確実に認証を確認
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "権限がありません" }, { status: 401 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // 2. パスワードを bcryptjs でハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. データベースに保存
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword 
      },
    });

    return NextResponse.json({ message: "ユーザーを登録しました", user: { email: user.email } });
  } catch (error: any) {
    console.error("User Creation Error:", error);
    // メールアドレスが既に存在する場合などのエラーハンドリング
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 400 });
    }
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}