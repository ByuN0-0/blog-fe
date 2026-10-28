import { PublicHeader } from "@/components/public-header";
import { ListMessage } from "@/components/post-list";

export default function TagLoading() {
  return (
    <div className="blog-surface">
      <PublicHeader />
      <main className="blog-container blog-tag-page"><ListMessage>태그의 글을 불러오고 있습니다.</ListMessage></main>
    </div>
  );
}
