import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const targetEmail = 'admin@example.com'; // あなたのメールアドレス
  const plainPassword = 'password123';   // あなたのパスワード
  
  // パスワードを10回ハッシュ化（暗号化）
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // DBにユーザーを登録、または既存ならパスワードを更新
  await prisma.user.upsert({
    where: { email: targetEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: targetEmail,
      password: hashedPassword,
      name: '管理者',
    },
  });

  console.log('✅ ユーザー情報を暗号化済みパスワードで更新しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });