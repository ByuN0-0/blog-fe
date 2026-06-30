import { ImageResponse } from "next/og";

import { fetchPublishedPost } from "@/lib/public-api";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPublishedPost(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f6f3eb",
          color: "#24211b",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          border: "1px solid #d7d0c1",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#315f50",
          }}
        >
          <span>{post.category}</span>
          <span>biyeon.log</span>
        </div>
        <div>
          <h1
            style={{
              fontSize: 76,
              lineHeight: 1.08,
              letterSpacing: 0,
              margin: 0,
              maxWidth: 980,
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              marginTop: 32,
              fontSize: 30,
              lineHeight: 1.4,
              color: "#5f5a50",
              maxWidth: 900,
            }}
          >
            {post.summary || post.content.slice(0, 120)}
          </p>
        </div>
        <div style={{ fontSize: 24, color: "#6f685d" }}>
          /posts/{post.slug}
        </div>
      </div>
    ),
    size,
  );
}
