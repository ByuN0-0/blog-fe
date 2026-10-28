"use client";

import { PublicHeader } from "@/components/public-header";
import { ListMessage } from "@/components/post-list";

export default function TagError({ reset }: { reset: () => void }) {
  return (
    <div className="blog-surface">
      <PublicHeader />
      <main className="blog-container blog-tag-page">
        <h1 className="blog-page-title">태그를 불러오지 못했습니다</h1>
        <ListMessage error>잠시 후 다시 시도해 주세요. <button onClick={reset}>다시 시도</button></ListMessage>
      </main>
    </div>
  );
}
