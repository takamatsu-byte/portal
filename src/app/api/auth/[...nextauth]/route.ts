import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. データベースから入力されたメールアドレスのユーザーを探す
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 2. ユーザーが見つかり、かつパスワードが一致するか確認
        // (本来は暗号化が必要ですが、まずはseedで設定した文字と直接照合します)
        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        // 3. 一致しなければログイン失敗
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };