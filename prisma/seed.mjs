import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ★ここにログインしたいメールアドレスとパスワードを入力してください
  const adminEmail = 'takamatsu@akisasu.com'; 
  const adminPassword = 'pass0123'; 
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: '管理者',
    },
  });

  console.log('✅ 本番環境に管理者ユーザーを登録/更新しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });