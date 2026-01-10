import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 共通接続を使用
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { name, email, password } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json({ message: "登録完了" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "登録失敗" }, { status: 500 });
  }
}

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}