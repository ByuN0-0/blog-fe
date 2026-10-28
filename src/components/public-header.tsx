import Link from "next/link";
import { Terminal } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="blog-header">
      <div className="blog-header-inner">
        <Link className="blog-brand" href="/">
          <span className="blog-brand-icon"><Terminal size={17} aria-hidden="true" /></span>
          <span>biyeon.log</span>
        </Link>
        <nav aria-label="블로그 메뉴" className="blog-nav">
          <Link href="/#posts">글 목록</Link>
          <Link href="/search">검색</Link>
        </nav>
      </div>
    </header>
  );
}
