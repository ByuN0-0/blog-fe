/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import {
  BLOG_CATEGORIES,
  createAdminTag,
  getAdminCategories,
  getAdminTags,
  uploadAdminImage,
  type Category,
  type Post,
  type PostPayload,
  type PostStatus,
  type Tag,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type PostFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  status: PostStatus;
  category: string;
  tags: string[];
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
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPost?.slug));
  const [isDirty, setIsDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getAdminCategories,
  });
  const tagsQuery = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: getAdminTags,
  });
  const createTagMutation = useMutation({
    mutationFn: (name: string) =>
      createAdminTag({
        name,
        slug: slugify(name),
        description: "",
        active: true,
      }),
    onSuccess: (tag) => {
      toast.success("태그를 추가했습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      updateValue("tags", [...values.tags, tag.name]);
    },
    onError: () => toast.error("태그 추가에 실패했습니다."),
  });

  const [values, setValues] = useState<PostFormValues>({
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    summary: initialPost?.summary ?? "",
    content: initialPost?.content ?? "",
    metaTitle: initialPost?.metaTitle ?? "",
    metaDescription: initialPost?.metaDescription ?? "",
    status: initialPost?.status ?? "draft",
    category: initialPost?.category ?? BLOG_CATEGORIES[2],
    tags: initialPost?.tags ?? [],
    coverImage: initialPost?.coverImage ?? "",
  });

  const categories = categoryOptions(categoriesQuery.data ?? [], values.category);
  const tags = tagOptions(tagsQuery.data ?? [], values.tags);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function updateValue<K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
  }

  function handleTitleChange(title: string) {
    setValues((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugify(title),
    }));
    setIsDirty(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDirty(false);

    onSubmit({
      title: values.title.trim(),
      slug: values.slug.trim(),
      summary: values.summary.trim(),
      content: values.content.trim(),
      metaTitle: values.metaTitle.trim(),
      metaDescription: values.metaDescription.trim(),
      status: values.status,
      category: values.category,
      tags: values.tags,
      coverImage: values.coverImage.trim(),
    });
  }

  async function handleCoverImageUpload(file: File | undefined) {
    if (!file) return;
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
    if (!file) return;
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

  function toggleTag(tagName: string) {
    const nextTags = values.tags.includes(tagName)
      ? values.tags.filter((tag) => tag !== tagName)
      : [...values.tags, tagName];
    updateValue("tags", nextTags);
  }

  function handleCreateTag() {
    const name = window.prompt("새 태그 이름");
    if (!name?.trim()) return;
    if (values.tags.includes(name.trim())) return;
    createTagMutation.mutate(name.trim());
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="제목">
          <input
            className={inputClassName}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
            value={values.title}
          />
        </Field>
        <Field label="Slug">
          <div className="flex gap-2">
            <input
              className={inputClassName}
              onChange={(event) => {
                setSlugTouched(true);
                updateValue("slug", event.target.value);
              }}
              placeholder="empty이면 제목 기반 자동 생성"
              value={values.slug}
            />
            <Button
              onClick={() => {
                setSlugTouched(true);
                updateValue("slug", slugify(values.title));
              }}
              type="button"
              variant="outline"
            >
              <RefreshCw className="size-4" />
              재생성
            </Button>
          </div>
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
            onChange={(event) => updateValue("category", event.target.value)}
            value={values.category}
          >
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
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

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Meta title">
          <input
            className={inputClassName}
            onChange={(event) => updateValue("metaTitle", event.target.value)}
            placeholder="비우면 제목 사용"
            value={values.metaTitle}
          />
        </Field>
        <Field label="Meta description">
          <input
            className={inputClassName}
            onChange={(event) =>
              updateValue("metaDescription", event.target.value)
            }
            placeholder="비우면 요약 사용"
            value={values.metaDescription}
          />
        </Field>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">본문</span>
          <div className="flex gap-2 md:hidden">
            <button
              className={tabClass(previewMode === "edit")}
              onClick={() => setPreviewMode("edit")}
              type="button"
            >
              편집
            </button>
            <button
              className={tabClass(previewMode === "preview")}
              onClick={() => setPreviewMode("preview")}
              type="button"
            >
              미리보기
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <textarea
            className={cn(
              `${inputClassName} min-h-[520px] resize-y py-3 font-mono text-sm leading-6`,
              previewMode === "preview" && "hidden md:block",
            )}
            onChange={(event) => updateValue("content", event.target.value)}
            ref={contentRef}
            required
            value={values.content}
          />
          <div
            className={cn(
              "min-h-[520px] overflow-auto rounded-md border bg-background p-4",
              previewMode === "edit" && "hidden md:block",
            )}
          >
            {values.content.trim() ? (
              <MarkdownContent content={values.content} />
            ) : (
              <p className="font-mono text-sm text-muted-foreground">
                preview
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <UploadButton
            disabled={isUploadingBodyImage}
            label={isUploadingBodyImage ? "삽입 중..." : "본문 이미지 삽입"}
            onFile={handleBodyImageUpload}
          />
        </div>
      </div>

      <Field label="태그">
        <div className="flex flex-wrap gap-2 rounded-md border bg-background p-3">
          {tags.map((tag) => (
            <button
              className={cn(
                "rounded-md border px-3 py-2 text-sm transition-colors",
                values.tags.includes(tag.name)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-ring",
              )}
              key={tag.name}
              onClick={() => toggleTag(tag.name)}
              type="button"
            >
              #{tag.name}
            </button>
          ))}
          <Button
            disabled={createTagMutation.isPending}
            onClick={handleCreateTag}
            type="button"
            variant="outline"
          >
            새 태그
          </Button>
        </div>
      </Field>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">대표 이미지</span>
          {values.coverImage ? (
            <Button
              onClick={() => updateValue("coverImage", "")}
              type="button"
              variant="outline"
            >
              <Trash2 className="size-4" />
              제거
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <Field label="대표 이미지 URL">
            <input
              className={inputClassName}
              onChange={(event) =>
                updateValue("coverImage", event.target.value)
              }
              value={values.coverImage}
            />
          </Field>
          <div className="flex items-end">
            <UploadButton
              disabled={isUploadingCover}
              label={isUploadingCover ? "업로드 중..." : "대표 이미지 업로드"}
              onFile={handleCoverImageUpload}
            />
          </div>
        </div>
        {values.coverImage ? (
          <img
            alt=""
            className="mt-4 aspect-[16/9] w-full max-w-md rounded-md border object-cover"
            src={values.coverImage}
          />
        ) : null}
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

function categoryOptions(categories: Category[], currentCategory: string) {
  const activeCategories = categories.filter((category) => category.active);
  const options =
    activeCategories.length > 0
      ? activeCategories
      : BLOG_CATEGORIES.map((name, index) => ({
          id: name,
          name,
          slug: slugify(name),
          description: "",
          sortOrder: index + 1,
          active: true,
          createdAt: "",
          updatedAt: "",
        }));
  if (
    currentCategory &&
    !options.some((category) => category.name === currentCategory)
  ) {
    return [
      ...options,
      {
        id: currentCategory,
        name: currentCategory,
        slug: slugify(currentCategory),
        description: "",
        sortOrder: options.length + 1,
        active: true,
        createdAt: "",
        updatedAt: "",
      },
    ];
  }
  return options;
}

function tagOptions(tags: Tag[], selectedTags: string[]) {
  const options = tags.filter((tag) => tag.active);
  const missing = selectedTags
    .filter((tag) => !options.some((option) => option.name === tag))
    .map((name) => ({
      id: name,
      name,
      slug: slugify(name),
      description: "",
      active: true,
      postCount: 0,
      createdAt: "",
      updatedAt: "",
    }));
  return [...options, ...missing];
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `post-${Date.now()}`;
}

function tabClass(active: boolean) {
  return cn(
    "rounded-md border px-3 py-1.5 text-xs",
    active ? "bg-primary text-primary-foreground" : "bg-card",
  );
}

const inputClassName =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
