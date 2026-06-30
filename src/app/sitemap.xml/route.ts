import {
  fetchPublishedPosts,
  fetchTags,
  postUrl,
  SITE_URL,
  tagUrl,
} from "@/lib/public-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const [posts, tags] = await Promise.all([fetchPublishedPosts(), fetchTags()]);
  const urls = [
    { loc: SITE_URL, lastmod: new Date().toISOString() },
    { loc: `${SITE_URL}/search`, lastmod: new Date().toISOString() },
    ...posts.map((post) => ({
      loc: postUrl(post),
      lastmod: new Date(post.updatedAt).toISOString(),
    })),
    ...tags.map((tag) => ({
      loc: tagUrl(tag),
      lastmod: new Date(tag.updatedAt).toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
