import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 物件一覧の取得
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}

// 新しい物件の作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProject = await prisma.project.create({
      data: {
        propertyAddress: body.propertyAddress,
        // 必要に応じて初期値を設定
      }
    });
    return NextResponse.json(newProject);
  } catch (error) {
    return NextResponse.json({ error: "作成失敗" }, { status: 500 });
  }
}