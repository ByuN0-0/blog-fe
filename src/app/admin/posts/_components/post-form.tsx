/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  BLOG_CATEGORIES,
  uploadAdminImage,
  type BlogCategory,
  type Post,
  type PostPayload,
  type PostStatus,
} from "@/lib/api";

type PostFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: PostStatus;
  category: BlogCategory;
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
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);
  const [values, setValues] = useState<PostFormValues>({
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    summary: initialPost?.summary ?? "",
    content: initialPost?.content ?? "",
    status: initialPost?.status ?? "draft",
    category: toBlogCategory(initialPost?.category),
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
      category: values.category,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      coverImage: values.coverImage.trim(),
    });
  }

  async function handleCoverImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }
    setIsUploadingCover(true);
    try {
      const image = await uploadAdminImage(file);
      updateValue("coverImage", image.url);
      toast.success("대표 이미지를 업로드했습니다.");
    } catch {
      toast.error("대표 이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleBodyImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }
    setIsUploadingBodyImage(true);
    try {
      const image = await uploadAdminImage(file);
      insertMarkdownImage(image.url, file.name);
      toast.success("본문 이미지를 삽입했습니다.");
    } catch {
      toast.error("본문 이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingBodyImage(false);
    }
  }

  function insertMarkdownImage(url: string, filename: string) {
    const alt = filename.replace(/\.[^.]+$/, "");
    const markdown = `\n![${alt}](${url})\n`;
    const textarea = contentRef.current;
    const cursor = textarea?.selectionStart ?? values.content.length;
    const nextContent =
      values.content.slice(0, cursor) + markdown + values.content.slice(cursor);

    updateValue("content", nextContent);
    window.requestAnimationFrame(() => {
      contentRef.current?.focus();
      contentRef.current?.setSelectionRange(
        cursor + markdown.length,
        cursor + markdown.length,
      );
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
          <select
            className={inputClassName}
            onChange={(event) =>
              updateValue("category", event.target.value as BlogCategory)
            }
            value={values.category}
          >
            {BLOG_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
          ref={contentRef}
          required
          value={values.content}
        />
      </Field>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap gap-3">
          <UploadButton
            disabled={isUploadingBodyImage}
            label={isUploadingBodyImage ? "삽입 중..." : "본문 이미지 삽입"}
            onFile={handleBodyImageUpload}
          />
        </div>
      </div>

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

      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <UploadButton
            disabled={isUploadingCover}
            label={isUploadingCover ? "업로드 중..." : "대표 이미지 업로드"}
            onFile={handleCoverImageUpload}
          />
          {values.coverImage ? (
            <img
              alt=""
              className="h-20 w-32 rounded-md border object-cover"
              src={values.coverImage}
            />
          ) : null}
        </div>
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

function UploadButton({
  disabled,
  label,
  onFile,
}: {
  disabled: boolean;
  label: string;
  onFile: (file: File | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        type="button"
        variant="outline"
      >
        <ImagePlus className="size-4" />
        {label}
      </Button>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          onFile(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
    </>
  );
}

function toBlogCategory(category: string | undefined): BlogCategory {
  return BLOG_CATEGORIES.find((candidate) => candidate === category) ?? "기술 노트";
}

const inputClassName =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
