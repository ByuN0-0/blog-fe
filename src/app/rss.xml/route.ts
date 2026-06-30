import { fetchPublishedPosts, postUrl, SITE_URL } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await fetchPublishedPosts();
  const items = posts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${postUrl(post)}</link>
  <guid>${postUrl(post)}</guid>
  <description>${escapeXml(post.summary || post.content.slice(0, 180))}</description>
  <pubDate>${new Date(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>biyeon.log</title>
  <link>${SITE_URL}</link>
  <description>라이프로그, 북 노트, 기술 노트, 비즈니스 기록을 남기는 개인 블로그</description>
  <language>ko</language>
${items}
</channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
