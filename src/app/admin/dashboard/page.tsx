"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Edit, EyeOff, LogOut, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  deleteAdminComment,
  deleteAdminPost,
  getAdminComments,
  getAdminMe,
  getAdminPosts,
  hideAdminComment,
  logout,
  type Comment,
  type Post,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["admin", "me"],
    queryFn: getAdminMe,
    retry: false,
  });
  const postsQuery = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: getAdminPosts,
    enabled: !meQuery.isError,
  });
  const commentsQuery = useQuery({
    queryKey: ["admin", "comments"],
    queryFn: getAdminComments,
    enabled: !meQuery.isError,
  });

  const deletePostMutation = useMutation({
    mutationFn: deleteAdminPost,
    onSuccess: () => {
      toast.success("글을 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
    },
    onError: () => {
      toast.error("글 삭제에 실패했습니다.");
    },
  });

  const hideCommentMutation = useMutation({
    mutationFn: hideAdminComment,
    onSuccess: () => {
      toast.success("댓글을 숨겼습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    },
    onError: () => {
      toast.error("댓글 숨김에 실패했습니다.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteAdminComment,
    onSuccess: () => {
      toast.success("댓글을 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (meQuery.isError) {
      router.push("/admin");
    }
  }, [meQuery.isError, router]);

  async function handleLogout() {
    await logout();
    toast.success("로그아웃했습니다.");
    router.push("/admin");
  }

  function handleDeletePost(id: string) {
    if (!window.confirm("이 글을 삭제할까요?")) {
      return;
    }

    deletePostMutation.mutate(id);
  }

  function handleDeleteComment(id: string) {
    if (!window.confirm("이 댓글을 삭제할까요?")) {
      return;
    }

    deleteCommentMutation.mutate(id);
  }

  if (meQuery.isLoading) {
    return <LoadingMessage />;
  }

  if (meQuery.isError) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {meQuery.data?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              className={cn(buttonVariants({ size: "lg" }))}
              href="/admin/posts/new"
            >
              <Plus className="size-4" />
              새 글
            </Link>
            <Button onClick={handleLogout} size="lg" variant="outline">
              <LogOut className="size-4" />
              로그아웃
            </Button>
          </div>
        </div>

        <div className="grid gap-4 py-8 md:grid-cols-3">
          <StatCard
            label="전체 글"
            value={postsQuery.data?.length ?? 0}
          />
          <StatCard
            label="발행 글"
            value={
              postsQuery.data?.filter((post) => post.status === "published")
                .length ?? 0
            }
          />
          <StatCard
            label="댓글"
            value={commentsQuery.data?.length ?? 0}
          />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">글 관리</h2>
            {postsQuery.isFetching ? (
              <p className="text-sm text-muted-foreground">불러오는 중...</p>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[1fr_120px_120px_120px] gap-4 bg-muted px-4 py-3 text-sm font-medium max-md:hidden">
              <span>제목</span>
              <span>상태</span>
              <span>카테고리</span>
              <span>관리</span>
            </div>
            <div className="divide-y">
              {(postsQuery.data ?? []).map((post) => (
                <PostRow
                  key={post.id}
                  onDelete={() => handleDeletePost(post.id)}
                  post={post}
                />
              ))}
              {postsQuery.data?.length === 0 ? (
                <EmptyRow message="아직 작성된 글이 없습니다." />
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">댓글 관리</h2>
            {commentsQuery.isFetching ? (
              <p className="text-sm text-muted-foreground">불러오는 중...</p>
            ) : null}
          </div>
          <div className="divide-y rounded-lg border">
            {(commentsQuery.data ?? []).map((comment) => (
              <CommentRow
                comment={comment}
                key={comment.id}
                onDelete={() => handleDeleteComment(comment.id)}
                onHide={() => hideCommentMutation.mutate(comment.id)}
              />
            ))}
            {commentsQuery.data?.length === 0 ? (
              <EmptyRow message="아직 작성된 댓글이 없습니다." />
            ) : null}
          </div>
        </section>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function PostRow({ onDelete, post }: { onDelete: () => void; post: Post }) {
  return (
    <article className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_120px_120px_120px] md:items-center">
      <div>
        <h3 className="font-medium">{post.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">/{post.slug}</p>
      </div>
      <span className="text-sm text-muted-foreground">{post.status}</span>
      <span className="text-sm text-muted-foreground">
        {post.category || "-"}
      </span>
      <div className="flex gap-2">
        <Link
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          href={`/admin/posts/${post.id}`}
        >
          <Edit className="size-4" />
          수정
        </Link>
        <Button onClick={onDelete} size="sm" variant="destructive">
          <Trash2 className="size-4" />
          삭제
        </Button>
      </div>
    </article>
  );
}

function CommentRow({
  comment,
  onDelete,
  onHide,
}: {
  comment: Comment;
  onDelete: () => void;
  onHide: () => void;
}) {
  return (
    <article className="grid gap-4 px-4 py-4 md:grid-cols-[1fr_auto] md:items-start">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{comment.author}</span>
          <span className="text-muted-foreground">/{comment.postSlug}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {comment.status}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6">{comment.content}</p>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={comment.status === "hidden"}
          onClick={onHide}
          size="sm"
          variant="outline"
        >
          <EyeOff className="size-4" />
          숨김
        </Button>
        <Button onClick={onDelete} size="sm" variant="destructive">
          <Trash2 className="size-4" />
          삭제
        </Button>
      </div>
    </article>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
