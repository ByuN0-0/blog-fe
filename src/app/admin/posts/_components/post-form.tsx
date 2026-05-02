"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Post, PostPayload, PostStatus } from "@/lib/api";

type PostFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: PostStatus;
  category: string;
  tags: string;
  coverImage: string;
};

type PostFormProps = {
  initialPost?: Post;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (payload: PostPayload) => void;
};

const statusOptions: Array<{ label: string; value: PostStatus }> = [
  { label: "임시저장", value: "draft" },
  { label: "발행", value: "published" },
  { label: "비공개", value: "private" },
];

export function PostForm({
  initialPost,
  isSubmitting,
  submitLabel,
  onSubmit,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>({
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    summary: initialPost?.summary ?? "",
    content: initialPost?.content ?? "",
    status: initialPost?.status ?? "draft",
    category: initialPost?.category ?? "",
    tags: initialPost?.tags.join(", ") ?? "",
    coverImage: initialPost?.coverImage ?? "",
  });

  function updateValue<K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      title: values.title.trim(),
      slug: values.slug.trim(),
      summary: values.summary.trim(),
      content: values.content.trim(),
      status: values.status,
      category: values.category.trim(),
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      coverImage: values.coverImage.trim(),
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="제목">
          <input
            className={inputClassName}
            onChange={(event) => updateValue("title", event.target.value)}
            required
            value={values.title}
          />
        </Field>
        <Field label="Slug">
          <input
            className={inputClassName}
            onChange={(event) => updateValue("slug", event.target.value)}
            placeholder="empty이면 제목 기반 자동 생성"
            value={values.slug}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="상태">
          <select
            className={inputClassName}
            onChange={(event) =>
              updateValue("status", event.target.value as PostStatus)
            }
            value={values.status}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="카테고리">
          <input
            className={inputClassName}
            onChange={(event) => updateValue("category", event.target.value)}
            placeholder="Tech Review"
            value={values.category}
          />
        </Field>
      </div>

      <Field label="요약">
        <textarea
          className={`${inputClassName} min-h-24 resize-y py-2`}
          onChange={(event) => updateValue("summary", event.target.value)}
          value={values.summary}
        />
      </Field>

      <Field label="본문">
        <textarea
          className={`${inputClassName} min-h-80 resize-y py-3 font-mono text-sm leading-6`}
          onChange={(event) => updateValue("content", event.target.value)}
          required
          value={values.content}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="태그">
          <input
            className={inputClassName}
            onChange={(event) => updateValue("tags", event.target.value)}
            placeholder="nextjs, go, blog"
            value={values.tags}
          />
        </Field>
        <Field label="대표 이미지 URL">
          <input
            className={inputClassName}
            onChange={(event) => updateValue("coverImage", event.target.value)}
            value={values.coverImage}
          />
        </Field>
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
