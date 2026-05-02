import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminPage() {
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

        <form className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              name="email"
              placeholder="admin@example.com"
              type="email"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              name="password"
              placeholder="********"
              type="password"
            />
          </label>
          <Button className="w-full" type="submit">
            로그인
          </Button>
        </form>
      </section>
    </main>
  );
}
