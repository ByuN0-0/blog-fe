"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PostForm } from "@/app/admin/posts/_components/post-form";
import { createAdminPost, getAdminMe, type PostPayload } from "@/lib/api";

export default function NewAdminPostPage() {
  const router = useRouter();
  const { isLoading, isError } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: getAdminMe,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (payload: PostPayload) => createAdminPost(payload),
    onSuccess: () => {
      toast.success("글을 작성했습니다.");
      router.push("/admin/dashboard");
    },
    onError: () => {
      toast.error("글 작성에 실패했습니다.");
    },
  });

  if (isLoading) {
    return <LoadingMessage />;
  }

  if (isError) {
    router.push("/admin");
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">Admin Posts</p>
            <h1 className="text-2xl font-semibold">새 글 작성</h1>
          </div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/admin/dashboard">
            대시보드로 돌아가기
          </Link>
        </div>

        <PostForm
          isSubmitting={createMutation.isPending}
          onSubmit={(payload) => createMutation.mutate(payload)}
          submitLabel="글 작성"
        />
      </section>
    </main>
  );
}

function LoadingMessage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">관리자 정보를 확인 중...</p>
    </main>
  );
}
