import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // admin@example.com というユーザーがいない場合のみ作成
  const targetEmail = 'takamatsu@akisasu.com'; // ★ここを自由に変えてください
  
  const existingUser = await prisma.user.findUnique({
    where: { email: targetEmail }, 
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: targetEmail,
        password: 'taka8846', // ★ここを自由に変えてください
        name: '管理者',
      },
    });
    console.log('✅ ユーザーの作成に成功しました');
  } else {
    console.log('ℹ️ すでにユーザーが存在するため、作成をスキップしました');
  }
}

main()
  .catch((e) => {
    console.error('❌ エラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });