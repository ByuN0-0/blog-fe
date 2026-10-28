"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { MarkdownContent } from "@/components/markdown-content";
import { PublicHeader } from "@/components/public-header";
import { PostTags } from "@/components/post-tags";
import { Button } from "@/components/ui/button";
import {
  addPostLike,
  addPostView,
  createPublicComment,
  deletePublicComment,
  getPublishedPost,
  getPublicComments,
  getTags,
  updatePublicComment,
  type Comment,
  type Post,
  type Tag,
} from "@/lib/api";
import { SITE_URL } from "@/lib/public-api";
import { cn } from "@/lib/utils";

export function PostDetailClient({
  initialPost,
  initialTags,
  slug,
}: {
  initialPost: Post;
  initialTags: Tag[];
  slug: string;
}) {
  const queryClient = useQueryClient();
  const tagsQuery = useQuery({
    queryKey: ["tags", "public"],
    queryFn: getTags,
    initialData: initialTags.length > 0 ? initialTags : undefined,
  });
  const postQuery = useQuery({
    queryKey: ["posts", slug],
    queryFn: () => getPublishedPost(slug),
    initialData: initialPost,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const post = postQuery.data;
  const liked =
    likedBySlug[slug] ??
    (typeof window !== "undefined" &&
      window.localStorage.getItem(likeKey(slug)) === "1");

  return (
    <div className="blog-surface">
      <PublicHeader />
      <main>
      <article className="blog-article">
        <PostHero
          liked={liked}
          liking={likeMutation.isPending}
          onLike={() => {
            if (liked) return;
            likeMutation.mutate();
          }}
          post={post}
          tags={tagsQuery.data ?? []}
        />

        <section className="mt-8">
          <MarkdownContent content={post.content} />
        </section>
      </article>

      <section className="border-t border-[#d7d0c1] bg-[#f0eadf]/80">
        <div className="mx-auto w-full max-w-[760px] px-5 py-10">
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
            slug={slug}
          />
        </div>
      </section>
      </main>
    </div>
  );
}

function PostHero({
  liked,
  liking,
  onLike,
  post,
  tags,
}: {
  liked: boolean;
  liking: boolean;
  onLike: () => void;
  post: Post;
  tags: Tag[];
}) {
  const shareUrl = `${SITE_URL}/posts/${post.slug}`;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.summary || post.title,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("글 주소를 복사했습니다.");
    } catch {
      toast.error("공유에 실패했습니다.");
    }
  }

  return (
    <header className="blog-article-hero">
      <Link
        className="inline-flex items-center gap-2 rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3 py-2 font-mono text-xs text-[#5f5a50] transition-colors hover:border-[#315f50] hover:text-[#315f50]"
        href="/"
      >
        <ArrowLeft className="size-4" />
        목록으로
      </Link>

      <div className="blog-article-heading mt-8 border-b border-[#d7d0c1] pb-8">
        <p className="font-mono text-xs text-[#315f50]">{post.category}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-[#24211b] sm:text-5xl">
          {post.title}
        </h1>
        {post.summary ? (
          <p className="mt-5 text-lg leading-8 text-[#5f5a50]">{post.summary}</p>
        ) : null}

        <div className="mt-5"><PostTags names={post.tags} tags={tags} limit={3} expandable /></div>

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
            aria-label={`좋아요 ${post.likes}개${liked ? ", 누름" : ""}`}
            aria-pressed={liked}
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
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3 text-[#5f5a50] transition-colors hover:border-[#315f50] hover:text-[#315f50]"
            onClick={handleShare}
            type="button"
          >
            <Share2 className="size-4" />
            공유
          </button>
        </div>
      </div>

      {post.coverImage ? (
        <div className="blog-cover-image mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="mx-auto block h-auto max-w-full rounded-md"
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
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const createMutation = useMutation({
    mutationFn: () =>
      createPublicComment({
        postSlug: slug,
        author: author.trim(),
        content: content.trim(),
        password: password.trim(),
      }),
    onSuccess: () => {
      setAuthor("");
      setPassword("");
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
    if (!author.trim() || !content.trim() || !password.trim()) {
      toast.error("닉네임, 비밀번호, 댓글을 입력해주세요.");
      return;
    }
    createMutation.mutate();
  }

  return (
    <form
      className="rounded-md border border-[#d7d0c1] bg-[#fffdf7] p-4"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 sm:grid-cols-[160px_160px_1fr]">
        <input
          aria-label="닉네임"
          className={inputClassName}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="닉네임"
          value={author}
        />
        <input
          aria-label="댓글 비밀번호"
          className={inputClassName}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          type="password"
          value={password}
        />
        <input
          aria-label="댓글 내용"
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
  slug,
}: {
  comments: Comment[];
  isLoading: boolean;
  slug: string;
}) {
  const queryClient = useQueryClient();
  const visibleComments = useMemo(
    () => comments.filter((comment) => comment.status === "visible"),
    [comments],
  );
  const updateMutation = useMutation({
    mutationFn: ({
      comment,
      content,
      password,
    }: {
      comment: Comment;
      content: string;
      password: string;
    }) => updatePublicComment(comment.id, { content, password }),
    onSuccess: () => {
      toast.success("댓글을 수정했습니다.");
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
    onError: () => toast.error("댓글 수정에 실패했습니다."),
  });
  const deleteMutation = useMutation({
    mutationFn: ({ comment, password }: { comment: Comment; password: string }) =>
      deletePublicComment(comment.id, password),
    onSuccess: () => {
      toast.success("댓글을 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
    onError: () => toast.error("댓글 삭제에 실패했습니다."),
  });

  if (isLoading) {
    return (
      <p className="mt-6 font-mono text-sm text-[#6f685d]">loading comments...</p>
    );
  }

  if (visibleComments.length === 0) {
    return (
      <p className="mt-6 font-mono text-sm text-[#6f685d]">아직 댓글이 없습니다.</p>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-md border border-[#d7d0c1] bg-[#fffdf7]">
      {visibleComments.map((comment) => (
        <article
          className="border-b border-[#d7d0c1] p-4 last:border-b-0"
          key={comment.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-[#24211b]">{comment.author}</h3>
              <time className="font-mono text-xs text-[#6f685d]">
                {formatDate(comment.createdAt)}
              </time>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1 font-mono text-xs text-[#6f685d] hover:text-[#315f50]"
                onClick={() => {
                  const content = window.prompt("수정할 댓글", comment.content);
                  if (content === null || !content.trim()) return;
                  const password = window.prompt("댓글 비밀번호");
                  if (!password) return;
                  updateMutation.mutate({ comment, content, password });
                }}
                type="button"
              >
                <Pencil className="size-3.5" />
                수정
              </button>
              <button
                className="inline-flex items-center gap-1 font-mono text-xs text-[#6f685d] hover:text-red-700"
                onClick={() => {
                  const password = window.prompt("댓글 비밀번호");
                  if (!password) return;
                  deleteMutation.mutate({ comment, password });
                }}
                type="button"
              >
                <Trash2 className="size-3.5" />
                삭제
              </button>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5f5a50]">
            {comment.content}
          </p>
        </article>
      ))}
    </div>
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
