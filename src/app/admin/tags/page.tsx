"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  createAdminTag,
  deleteAdminTag,
  getAdminMe,
  getAdminTags,
  updateAdminTag,
  type Tag,
  type TagPayload,
} from "@/lib/api";

const emptyTag: TagPayload = {
  name: "",
  slug: "",
  description: "",
  active: true,
};

export default function AdminTagsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Tag | null>(null);
  const [values, setValues] = useState<TagPayload>(emptyTag);
  const meQuery = useQuery({
    queryKey: ["admin", "me"],
    queryFn: getAdminMe,
    retry: false,
  });
  const tagsQuery = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: getAdminTags,
    enabled: !meQuery.isError,
  });
  const createMutation = useMutation({
    mutationFn: createAdminTag,
    onSuccess: () => {
      toast.success("태그를 추가했습니다.");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
    onError: () => toast.error("태그 추가에 실패했습니다."),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TagPayload }) =>
      updateAdminTag(id, payload),
    onSuccess: () => {
      toast.success("태그를 수정했습니다.");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
    onError: () => toast.error("태그 수정에 실패했습니다."),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminTag,
    onSuccess: () => {
      toast.success("태그를 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
    onError: () => toast.error("사용 중인 태그는 삭제할 수 없습니다."),
  });

  useEffect(() => {
    if (meQuery.isError) router.push("/admin");
  }, [meQuery.isError, router]);

  function resetForm() {
    setEditing(null);
    setValues(emptyTag);
  }

  function startEdit(tag: Tag) {
    setEditing(tag);
    setValues({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      active: tag.active,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...values,
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      return;
    }
    createMutation.mutate(payload);
  }

  if (meQuery.isLoading) {
    return <CenteredMessage message="관리자 정보를 확인 중..." />;
  }
  if (meQuery.isError) return null;

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-sm text-muted-foreground">Admin Taxonomy</p>
            <h1 className="text-2xl font-semibold">태그 관리</h1>
          </div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/admin/dashboard">
            대시보드로 돌아가기
          </Link>
        </div>

        <form className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="이름">
            <input
              className={inputClassName}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              required
              value={values.name}
            />
          </Field>
          <Field label="Slug">
            <input
              className={inputClassName}
              onChange={(event) => setValues({ ...values, slug: event.target.value })}
              placeholder="비우면 이름 기반 자동 생성"
              value={values.slug}
            />
          </Field>
          <Field label="설명">
            <input
              className={inputClassName}
              onChange={(event) => setValues({ ...values, description: event.target.value })}
              value={values.description}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm md:self-end">
            <input
              checked={values.active}
              onChange={(event) => setValues({ ...values, active: event.target.checked })}
              type="checkbox"
            />
            활성
          </label>
          <div className="flex gap-2 md:col-span-2 md:justify-end">
            {editing ? (
              <Button onClick={resetForm} type="button" variant="outline">
                취소
              </Button>
            ) : null}
            <Button disabled={createMutation.isPending || updateMutation.isPending} type="submit">
              {editing ? "수정" : "추가"}
            </Button>
          </div>
        </form>

        <div className="mt-8 divide-y rounded-lg border bg-card">
          {(tagsQuery.data ?? []).map((tag) => (
            <article className="grid gap-3 p-4 md:grid-cols-[1fr_120px_150px] md:items-center" key={tag.id}>
              <div>
                <h2 className="font-semibold">#{tag.name}</h2>
                <p className="font-mono text-xs text-muted-foreground">/{tag.slug}</p>
                {tag.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{tag.description}</p>
                ) : null}
              </div>
              <span className="text-sm text-muted-foreground">
                {tag.active ? "활성" : "비활성"} · {tag.postCount}개 글
              </span>
              <div className="flex gap-2 md:justify-end">
                <Button onClick={() => startEdit(tag)} type="button" variant="outline">
                  수정
                </Button>
                <Button
                  onClick={() => {
                    if (window.confirm("이 태그를 삭제할까요?")) {
                      deleteMutation.mutate(tag.id);
                    }
                  }}
                  type="button"
                  variant="destructive"
                >
                  삭제
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function CenteredMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}

const inputClassName =
  "h-10 w-full rounded-md border border-[#bdb4a4] bg-[#fffdf7] px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-colors placeholder:text-muted-foreground focus:border-[#315f50] focus:ring-2 focus:ring-[#315f50]/15";
