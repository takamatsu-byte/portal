import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // 認証が必要なページを指定
  matcher: ["/brokerage/:path*", "/documents/:path*"],
};