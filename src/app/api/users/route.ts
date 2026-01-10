import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs"; // ここを確実に bcryptjs に変更しました

const prisma = new PrismaClient();

// ユーザー一覧を取得
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "ユーザーの取得に失敗しました" }, { status: 500 });
  }
}

// ユーザーを新規登録
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "全項目入力してください" }, { status: 400 });
    }

    // パスワードを暗号化
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword 
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "登録に失敗しました（メールアドレス重複など）" }, { status: 500 });
  }
}