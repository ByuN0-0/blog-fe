"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { login } from "@/lib/api";

const loginSchema = z.object({
  email: z.email("올바른 이메일을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "입력값을 확인해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(result.data.email, result.data.password);
      toast.success("로그인했습니다.");
      router.push("/admin/dashboard");
    } catch {
      toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              블로그 글 작성과 관리를 위한 관리자 영역
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              className="h-10 w-full rounded-md border border-[#bdb4a4] bg-[#fffdf7] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-colors placeholder:text-muted-foreground focus:border-[#315f50] focus:ring-2 focus:ring-[#315f50]/15"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              type="email"
              value={email}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              className="h-10 w-full rounded-md border border-[#bdb4a4] bg-[#fffdf7] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-colors placeholder:text-muted-foreground focus:border-[#315f50] focus:ring-2 focus:ring-[#315f50]/15"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              type="password"
              value={password}
            />
          </label>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </section>
    </main>
  );
}
