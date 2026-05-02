"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getAdminMe, logout } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: getAdminMe,
    retry: false,
  });

  async function handleLogout() {
    await logout();
    toast.success("로그아웃했습니다.");
    router.push("/admin");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">관리자 정보를 확인 중...</p>
      </main>
    );
  }

  if (isError) {
    router.push("/admin");
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{data?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="size-4" />
            로그아웃
          </Button>
        </div>

        <div className="grid gap-4 py-8 md:grid-cols-3">
          {["글 작성", "댓글 관리", "통계 확인"].map((title) => (
            <article className="rounded-lg border bg-card p-5" key={title}>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                API와 화면을 다음 단계에서 연결할 예정입니다.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
