import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // 認証が必要なルートを指定
  matcher: [
    "/brokerage/:path*",
    "/documents/:path*",
    "/settings/:path*",
    "/api/projects/:path*",
  ],
};