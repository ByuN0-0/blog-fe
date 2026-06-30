"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getAdminMe,
  updateAdminCategory,
  type Category,
  type CategoryPayload,
} from "@/lib/api";

const emptyCategory: CategoryPayload = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  active: true,
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [values, setValues] = useState<CategoryPayload>(emptyCategory);
  const meQuery = useQuery({
    queryKey: ["admin", "me"],
    queryFn: getAdminMe,
    retry: false,
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getAdminCategories,
    enabled: !meQuery.isError,
  });
  const createMutation = useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      toast.success("카테고리를 추가했습니다.");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: () => toast.error("카테고리 추가에 실패했습니다."),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      updateAdminCategory(id, payload),
    onSuccess: () => {
      toast.success("카테고리를 수정했습니다.");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: () => toast.error("카테고리 수정에 실패했습니다."),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      toast.success("카테고리를 삭제했습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: () => toast.error("사용 중인 카테고리는 삭제할 수 없습니다."),
  });

  useEffect(() => {
    if (meQuery.isError) router.push("/admin");
  }, [meQuery.isError, router]);

  function resetForm() {
    setEditing(null);
    setValues(emptyCategory);
  }

  function startEdit(category: Category) {
    setEditing(category);
    setValues({
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      active: category.active,
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
            <h1 className="text-2xl font-semibold">카테고리 관리</h1>
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
          <Field label="정렬순서">
            <input
              className={inputClassName}
              onChange={(event) => setValues({ ...values, sortOrder: Number(event.target.value) })}
              type="number"
              value={values.sortOrder}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={values.active}
              onChange={(event) => setValues({ ...values, active: event.target.checked })}
              type="checkbox"
            />
            활성
          </label>
          <div className="flex gap-2 md:justify-end">
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
          {(categoriesQuery.data ?? []).map((category) => (
            <article className="grid gap-3 p-4 md:grid-cols-[1fr_120px_150px] md:items-center" key={category.id}>
              <div>
                <h2 className="font-semibold">{category.name}</h2>
                <p className="font-mono text-xs text-muted-foreground">/{category.slug}</p>
                {category.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                ) : null}
              </div>
              <span className="text-sm text-muted-foreground">
                {category.active ? "활성" : "비활성"} · {category.sortOrder}
              </span>
              <div className="flex gap-2 md:justify-end">
                <Button onClick={() => startEdit(category)} type="button" variant="outline">
                  수정
                </Button>
                <Button
                  onClick={() => {
                    if (window.confirm("이 카테고리를 삭제할까요?")) {
                      deleteMutation.mutate(category.id);
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
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
