import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const targetEmail = 'admin@example.com'; 
  const plainPassword = 'password123';   
  
  // bcryptjsを使用してパスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

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

  console.log('✅ ユーザー情報をbcryptjsで暗号化し更新しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });