import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

// ユーザー削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { id } = await params;
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}

// ユーザー編集（名前やパスワードの更新）
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { id } = await params;
    const { name, password } = await request.json();

    const data: any = {};
    if (name) data.name = name;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}