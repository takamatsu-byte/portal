import { redirect } from "next/navigation";

export default function RootPage() {
  // トップページ（/）にアクセスしたら、収益物件一覧（/brokerage）へ飛ばす
  redirect("/brokerage");
}