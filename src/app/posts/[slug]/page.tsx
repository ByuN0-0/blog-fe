"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Heart,
  MessageCircle,
  Send,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import {
  addPostLike,
  addPostView,
  createPublicComment,
  getPublishedPost,
  getPublicComments,
  type Comment,
  type Post,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);
  const queryClient = useQueryClient();
  const postQuery = useQuery({
    queryKey: ["posts", slug],
    queryFn: () => getPublishedPost(slug),
    retry: false,
  });
  const commentsQuery = useQuery({
    queryKey: ["comments", slug],
    queryFn: () => getPublicComments(slug),
  });
  const [likedBySlug, setLikedBySlug] = useState<Record<string, boolean>>({});

  const viewMutation = useMutation({
    mutationFn: () => addPostView(slug),
    onSuccess: (post) => {
      queryClient.setQueryData(["posts", slug], post);
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => addPostLike(slug),
    onSuccess: (post) => {
      window.localStorage.setItem(likeKey(slug), "1");
      setLikedBySlug((current) => ({ ...current, [slug]: true }));
      queryClient.setQueryData(["posts", slug], post);
    },
    onError: () => {
      toast.error("좋아요 반영에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (window.sessionStorage.getItem(viewKey(slug)) === "1") {
      return;
    }
    window.sessionStorage.setItem(viewKey(slug), "1");
    viewMutation.mutate();
    // viewMutation identity changes as mutation state changes; this effect is intentionally keyed by slug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const post = postQuery.data;
  const liked =
    likedBySlug[slug] ??
    (typeof window !== "undefined" &&
      window.localStorage.getItem(likeKey(slug)) === "1");

  if (postQuery.isLoading) {
    return <CenteredMessage message="글을 불러오는 중..." />;
  }

  if (postQuery.isError || !post) {
    return <CenteredMessage message="글을 찾을 수 없습니다." />;
  }

  return (
    <main className="min-h-screen bg-[#f6f3eb] text-[#24211b] [background-image:linear-gradient(#e5ded1_1px,transparent_1px),linear-gradient(90deg,#e5ded1_1px,transparent_1px)] [background-size:28px_28px]">
      <header className="sticky top-0 z-20 border-b border-[#d7d0c1] bg-[#f6f3eb]/92 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Link
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold"
            href="/"
          >
            <span className="flex size-8 items-center justify-center rounded-md border border-[#bdb4a4] bg-[#2b2924] text-[#fffdf7]">
              <Terminal className="size-4" />
            </span>
            <span>biyeon.log</span>
          </Link>
          <Link
            className="rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3 py-2 font-mono text-xs text-[#5f5a50] transition-colors hover:border-[#315f50] hover:text-[#315f50]"
            href="/admin"
          >
            /admin
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-5xl px-5 py-10">
        <PostHero
          liked={liked}
          liking={likeMutation.isPending}
          onLike={() => {
            if (liked) {
              return;
            }
            likeMutation.mutate();
          }}
          post={post}
        />

        <section className="mt-8">
          <MarkdownContent content={post.content} />
        </section>
      </article>

      <section className="border-t border-[#d7d0c1] bg-[#f0eadf]/80">
        <div className="mx-auto w-full max-w-5xl px-5 py-10">
          <div className="mb-6 flex items-center gap-2">
            <MessageCircle className="size-5 text-[#315f50]" />
            <h2 className="text-2xl font-semibold text-[#24211b]">
              댓글 {commentsQuery.data?.length ?? 0}
            </h2>
          </div>
          <CommentForm slug={slug} />
          <CommentList
            comments={commentsQuery.data ?? []}
            isLoading={commentsQuery.isLoading}
          />
        </div>
      </section>
    </main>
  );
}

function PostHero({
  liked,
  liking,
  onLike,
  post,
}: {
  liked: boolean;
  liking: boolean;
  onLike: () => void;
  post: Post;
}) {
  return (
    <header>
      <Link
        className="inline-flex items-center gap-2 rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3 py-2 font-mono text-xs text-[#5f5a50] transition-colors hover:border-[#315f50] hover:text-[#315f50]"
        href="/"
      >
        <ArrowLeft className="size-4" />
        목록으로
      </Link>

      <div className="mt-8 border-b border-[#d7d0c1] pb-8">
        <p className="font-mono text-xs text-[#315f50]">{post.category}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-[#24211b] sm:text-5xl">
          {post.title}
        </h1>
        {post.summary ? (
          <p className="mt-5 text-lg leading-8 text-[#5f5a50]">
            {post.summary}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs text-[#6f685d]">
          <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3">
            <CalendarDays className="size-4" />
            {formatDate(post.publishedAt ?? post.createdAt)}
          </span>
          <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3">
            <Eye className="size-4" />
            {post.views}
          </span>
          <button
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-3 transition-colors",
              liked
                ? "border-[#315f50] bg-[#315f50] text-[#fffdf7]"
                : "border-[#cbc3b4] bg-[#fffdf7] text-[#5f5a50] hover:border-[#315f50] hover:text-[#315f50]",
            )}
            disabled={liked || liking}
            onClick={onLike}
            type="button"
          >
            <Heart className={cn("size-4", liked && "fill-current")} />
            {post.likes}
          </button>
        </div>
      </div>

      {post.coverImage ? (
        <div className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="aspect-[16/9] w-full rounded-md border border-[#d7d0c1] object-cover"
            src={post.coverImage}
          />
        </div>
      ) : null}
    </header>
  );
}

function CommentForm({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const createMutation = useMutation({
    mutationFn: () =>
      createPublicComment({
        postSlug: slug,
        author: author.trim(),
        content: content.trim(),
      }),
    onSuccess: () => {
      setAuthor("");
      setContent("");
      toast.success("댓글을 남겼습니다.");
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
    onError: () => {
      toast.error("댓글 작성에 실패했습니다.");
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!author.trim() || !content.trim()) {
      toast.error("닉네임과 댓글을 입력해주세요.");
      return;
    }
    createMutation.mutate();
  }

  return (
    <form
      className="rounded-md border border-[#d7d0c1] bg-[#fffdf7] p-4"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <input
          className={inputClassName}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="닉네임"
          value={author}
        />
        <input
          className={inputClassName}
          onChange={(event) => setContent(event.target.value)}
          placeholder="댓글"
          value={content}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          className="bg-[#2b2924] text-[#fffdf7] hover:bg-[#3b3831]"
          disabled={createMutation.isPending}
          type="submit"
        >
          <Send className="size-4" />
          {createMutation.isPending ? "작성 중..." : "작성"}
        </Button>
      </div>
    </form>
  );
}

function CommentList({
  comments,
  isLoading,
}: {
  comments: Comment[];
  isLoading: boolean;
}) {
  const visibleComments = useMemo(
    () => comments.filter((comment) => comment.status === "visible"),
    [comments],
  );

  if (isLoading) {
    return (
      <p className="mt-6 font-mono text-sm text-[#6f685d]">
        loading comments...
      </p>
    );
  }

  if (visibleComments.length === 0) {
    return (
      <p className="mt-6 font-mono text-sm text-[#6f685d]">
        아직 댓글이 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-md border border-[#d7d0c1] bg-[#fffdf7]">
      {visibleComments.map((comment) => (
        <article
          className="border-b border-[#d7d0c1] p-4 last:border-b-0"
          key={comment.id}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-[#24211b]">{comment.author}</h3>
            <time className="font-mono text-xs text-[#6f685d]">
              {formatDate(comment.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5f5a50]">
            {comment.content}
          </p>
        </article>
      ))}
    </div>
  );
}

function CenteredMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3eb] px-5 font-mono text-sm text-[#6f685d]">
      {message}
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function likeKey(slug: string) {
  return `blog.like.${slug}`;
}

function viewKey(slug: string) {
  return `blog.view.${slug}`;
}

const inputClassName =
  "h-10 w-full rounded-md border border-[#cbc3b4] bg-[#f6f3eb] px-3 text-sm text-[#24211b] outline-none transition-colors placeholder:text-[#8a8377] focus:border-[#315f50] focus:ring-2 focus:ring-[#315f50]/15";
