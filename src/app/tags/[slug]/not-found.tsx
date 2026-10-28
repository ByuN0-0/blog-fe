import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { ListMessage } from "@/components/post-list";

export default function TagNotFound() {
  return (
    <div className="blog-surface">
      <PublicHeader />
      <main className="blog-container blog-tag-page">
        <h1 className="blog-page-title">태그를 찾을 수 없습니다</h1>
        <ListMessage>태그 주소를 확인해 주세요.</ListMessage>
        <Link className="blog-back-link" href="/#posts">글 목록으로</Link>
      </main>
    </div>
  );
}
