/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Link2,
  List,
  Minus,
  Quote,
  RefreshCw,
  SquareCode,
  Trash2,
} from "lucide-react";
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

type MarkdownFormat =
  | "h2"
  | "h3"
  | "bold"
  | "link"
  | "inlineCode"
  | "codeBlock"
  | "quote"
  | "list"
  | "divider";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [markdownTab, setMarkdownTab] = useState<"write" | "preview">("write");
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getAdminCategories,
  });
  const tagsQuery = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: getAdminTags,
  });

  const [values, setValues] = useState<PostFormValues>({
    title: initialPost?.title ?? "",
    slug: initialPost?.slug ?? "",
    summary: initialPost?.summary ?? "",
    content: initialPost?.content ?? "",
    status: initialPost?.status ?? "draft",
    category: initialPost?.category ?? BLOG_CATEGORIES[2],
    tags: initialPost?.tags ?? [],
    coverImage: initialPost?.coverImage ?? "",
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
      metaTitle: "",
      metaDescription: "",
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
      insertAtCursor(`\n![${file.name.replace(/\.[^.]+$/, "")}](${image.url})\n`);
      toast.success("본문 이미지를 삽입했습니다.");
    } catch {
      toast.error("본문 이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingBodyImage(false);
    }
  }

  function insertAtCursor(markdown: string, cursorOffset = markdown.length) {
    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? values.content.length;
    const end = textarea?.selectionEnd ?? start;
    const nextContent =
      values.content.slice(0, start) + markdown + values.content.slice(end);

    updateValue("content", nextContent);
    setMarkdownTab("write");
    window.requestAnimationFrame(() => {
      const cursor = start + cursorOffset;
      contentRef.current?.focus();
      contentRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function applyMarkdown(format: MarkdownFormat) {
    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? values.content.length;
    const end = textarea?.selectionEnd ?? start;
    const selected = values.content.slice(start, end);
    const { markdown, selectionStart, selectionEnd } = markdownFor(
      format,
      selected,
    );
    const nextContent =
      values.content.slice(0, start) + markdown + values.content.slice(end);

    updateValue("content", nextContent);
    setMarkdownTab("write");
    window.requestAnimationFrame(() => {
      contentRef.current?.focus();
      contentRef.current?.setSelectionRange(
        start + selectionStart,
        start + selectionEnd,
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
      </div>

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

      <Field label="요약">
        <textarea
          className={`${inputClassName} min-h-24 resize-y py-2`}
          onChange={(event) => updateValue("summary", event.target.value)}
          value={values.summary}
        />
      </Field>

      <section className="rounded-lg border bg-card p-4">
        <button
          className="flex w-full items-center justify-between text-left text-sm font-medium"
          onClick={() => setShowAdvanced((current) => !current)}
          type="button"
        >
          <span>고급 옵션</span>
          <span className="font-mono text-xs text-muted-foreground">
            {showAdvanced ? "hide" : "show"}
          </span>
        </button>
        {showAdvanced ? (
          <div className="mt-4">
            <Field label="Slug">
              <div className="flex gap-2">
                <input
                  className={inputClassName}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateValue("slug", event.target.value);
                  }}
                  placeholder="비우면 제목 기반 자동 생성"
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
                  제목으로 맞추기
                </Button>
              </div>
            </Field>
          </div>
        ) : null}
      </section>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">본문</span>
          <div className="flex rounded-md border border-[#bdb4a4] bg-[#f6f3eb] p-1">
            <button
              className={tabClass(markdownTab === "write")}
              onClick={() => setMarkdownTab("write")}
              type="button"
            >
              Write
            </button>
            <button
              className={tabClass(markdownTab === "preview")}
              onClick={() => setMarkdownTab("preview")}
              type="button"
            >
              Preview
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-[#bdb4a4] bg-[#fffdf7]">
          {markdownTab === "write" ? (
            <>
              <div className="flex gap-1 overflow-x-auto border-b border-[#d7d0c1] bg-[#f6f3eb] p-2">
                <ToolbarButton
                  icon={Heading2}
                  label="H2"
                  onClick={() => applyMarkdown("h2")}
                />
                <ToolbarButton
                  icon={Heading3}
                  label="H3"
                  onClick={() => applyMarkdown("h3")}
                />
                <ToolbarButton
                  icon={Bold}
                  label="굵게"
                  onClick={() => applyMarkdown("bold")}
                />
                <ToolbarButton
                  icon={Link2}
                  label="링크"
                  onClick={() => applyMarkdown("link")}
                />
                <ToolbarButton
                  icon={Code2}
                  label="코드"
                  onClick={() => applyMarkdown("inlineCode")}
                />
                <ToolbarButton
                  icon={SquareCode}
                  label="코드블록"
                  onClick={() => applyMarkdown("codeBlock")}
                />
                <ToolbarButton
                  icon={Quote}
                  label="인용"
                  onClick={() => applyMarkdown("quote")}
                />
                <ToolbarButton
                  icon={List}
                  label="목록"
                  onClick={() => applyMarkdown("list")}
                />
                <ToolbarButton
                  icon={Minus}
                  label="구분선"
                  onClick={() => applyMarkdown("divider")}
                />
                <UploadButton
                  disabled={isUploadingBodyImage}
                  label={isUploadingBodyImage ? "삽입 중..." : "이미지"}
                  onFile={handleBodyImageUpload}
                  size="sm"
                />
              </div>
              <textarea
                className="min-h-[560px] w-full resize-y bg-[#fffdf7] px-3 py-3 font-mono text-sm leading-6 outline-none"
                onChange={(event) => updateValue("content", event.target.value)}
                ref={contentRef}
                required
                value={values.content}
              />
            </>
          ) : (
            <div className="min-h-[560px] overflow-auto p-4">
              {values.content.trim() ? (
                <MarkdownContent content={values.content} />
              ) : (
                <p className="font-mono text-sm text-muted-foreground">
                  preview
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <Field label="태그">
        <div className="flex flex-wrap gap-2 rounded-md border border-[#bdb4a4] bg-[#fffdf7] p-3">
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
  size = "default",
}: {
  disabled: boolean;
  label: string;
  onFile: (file: File | undefined) => void;
  size?: "default" | "sm";
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        size={size}
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

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Heading2;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-2 text-xs text-foreground transition-colors hover:bg-[#f0eadf]"
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
    </button>
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

function markdownFor(format: MarkdownFormat, selected: string) {
  const text = selected || fallbackText(format);
  switch (format) {
    case "h2":
      return selectedMarkdown(`\n## ${text}\n`, "\n## ", text);
    case "h3":
      return selectedMarkdown(`\n### ${text}\n`, "\n### ", text);
    case "bold":
      return selectedMarkdown(`**${text}**`, "**", text);
    case "link":
      return selectedMarkdown(`[${text}](https://example.com)`, "[", text);
    case "inlineCode":
      return selectedMarkdown(`\`${text}\``, "`", text);
    case "codeBlock":
      return selectedMarkdown(`\n\`\`\`\n${text}\n\`\`\`\n`, "\n```\n", text);
    case "quote":
      return selectedMarkdown(`\n> ${text}\n`, "\n> ", text);
    case "list":
      return selectedMarkdown(`\n- ${text}\n`, "\n- ", text);
    case "divider":
      return {
        markdown: "\n---\n",
        selectionStart: 5,
        selectionEnd: 5,
      };
  }
}

function selectedMarkdown(markdown: string, prefix: string, text: string) {
  return {
    markdown,
    selectionStart: prefix.length,
    selectionEnd: prefix.length + text.length,
  };
}

function fallbackText(format: MarkdownFormat) {
  switch (format) {
    case "h2":
    case "h3":
      return "제목";
    case "link":
      return "링크 텍스트";
    case "inlineCode":
    case "codeBlock":
      return "code";
    case "quote":
      return "인용문";
    case "list":
      return "목록 항목";
    default:
      return "텍스트";
  }
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
    "rounded px-3 py-1.5 text-xs transition-colors",
    active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
  );
}

const inputClassName =
  "w-full rounded-md border border-[#bdb4a4] bg-[#fffdf7] px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-colors placeholder:text-muted-foreground focus:border-[#315f50] focus:ring-2 focus:ring-[#315f50]/15";
