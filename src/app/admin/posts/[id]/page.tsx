"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PostForm } from "@/app/admin/posts/_components/post-form";
import {
  getAdminMe,
  getAdminPost,
  updateAdminPost,
  type PostPayload,
} from "@/lib/api";

export default function EditAdminPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const meQuery = useQuery({
    queryKey: ["admin", "me"],
    queryFn: getAdminMe,
    retry: false,
  });
  const postQuery = useQuery({
    queryKey: ["admin", "post", id],
    queryFn: () => getAdminPost(id),
    enabled: !meQuery.isError,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: PostPayload) => updateAdminPost(id, payload),
    onSuccess: () => {
      toast.success("글을 수정했습니다.");
      router.push("/admin/dashboard");
    },
    onError: () => {
      toast.error("글 수정에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (meQuery.isError) {
      router.push("/admin");
    }
  }, [meQuery.isError, router]);

  if (meQuery.isLoading || postQuery.isLoading) {
    return <LoadingMessage />;
  }

  if (meQuery.isError) {
    return null;
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">글을 찾을 수 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">Admin Posts</p>
            <h1 className="text-2xl font-semibold">글 수정</h1>
          </div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/admin/dashboard">
            대시보드로 돌아가기
          </Link>
        </div>

        <PostForm
          initialPost={postQuery.data}
          isSubmitting={updateMutation.isPending}
          onSubmit={(payload) => updateMutation.mutate(payload)}
          submitLabel="글 수정"
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
