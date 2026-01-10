import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

// ユーザー削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser) return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });

    // 自分自身を消さない保護
    if (session.user?.email === targetUser.email) {
      return NextResponse.json({ error: "自分自身は削除できません" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    // 操作ログを記録
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id || "unknown",
        userName: session.user.name || "不明",
        action: "DELETE",
        target: targetUser.name || targetUser.email,
        details: `${targetUser.email} を削除しました`
      }
    });

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}

// ユーザー編集
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { id } = await params;
    const { name, password } = await request.json();
    const oldUser = await prisma.user.findUnique({ where: { id } });

    if (!oldUser) return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });

    const data: any = {};
    let detailMsg = "";

    if (name) {
      data.name = name;
      detailMsg += `名前を「${oldUser.name}」から「${name}」に変更 `;
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10);
      detailMsg += "パスワードを更新 ";
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    // 操作ログを記録
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id || "unknown",
        userName: session.user.name || "不明",
        action: "UPDATE",
        target: updatedUser.name || updatedUser.email,
        details: detailMsg
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}