"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function BlogSearchForm({ initialQuery = "", onSearch }: {
  initialQuery?: string; onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  return (
    <form className="blog-search-form" role="search" onSubmit={(event) => {
      event.preventDefault();
      onSearch(query.trim());
    }}>
      <div className="blog-search-input">
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor="blog-search">글 검색</label>
        <input id="blog-search" name="q" type="search" placeholder="읽고 싶은 글을 검색해 보세요" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <button className="blog-primary-button" type="submit">검색</button>
    </form>
  );
}
