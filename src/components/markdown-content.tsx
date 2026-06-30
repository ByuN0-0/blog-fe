/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = toBlocks(content);

  return (
    <div className="space-y-5 text-[17px] leading-8 text-[#352d22]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as "h2" | "h3";
          return (
            <Heading
              className="pt-4 text-2xl font-semibold leading-tight text-[#211b13] first:pt-0"
              key={index}
            >
              {block.value}
            </Heading>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={index}>
              <img
                alt={block.alt}
                className="max-h-[560px] w-full rounded-md border border-[#d7d0c1] object-cover"
                src={block.src}
              />
              {block.alt ? (
                <figcaption className="mt-2 text-center font-mono text-xs text-[#6f685d]">
                  {block.alt}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              className="overflow-x-auto rounded-md border border-[#3b3831] bg-[#24211b] p-4 font-mono text-sm leading-6 text-[#f6f3eb]"
              key={index}
            >
              <code>{block.value}</code>
            </pre>
          );
        }

        return (
          <p className="whitespace-pre-wrap" key={index}>
            {renderInline(block.value)}
          </p>
        );
      })}
    </div>
  );
}

type Block =
  | { type: "heading"; level: 2 | 3; value: string }
  | { type: "image"; alt: string; src: string }
  | { type: "code"; value: string }
  | { type: "paragraph"; value: string };

function toBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.replaceAll("\r\n", "\n").split("\n");
  let paragraph: string[] = [];
  let code: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }
    blocks.push({ type: "paragraph", value: paragraph.join("\n") });
    paragraph = [];
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) {
        blocks.push({ type: "code", value: code.join("\n") });
        code = null;
      } else {
        flushParagraph();
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const image = trimmed.match(/^!\[(.*)]\((https?:\/\/[^)\s]+)\)$/);
    if (image) {
      flushParagraph();
      blocks.push({ type: "image", alt: image[1] ?? "", src: image[2] ?? "" });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push({ type: "heading", level: 3, value: trimmed.slice(4) });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "heading", level: 2, value: trimmed.slice(3) });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  if (code) {
    blocks.push({ type: "code", value: code.join("\n") });
  }

  return blocks;
}

function renderInline(value: string) {
  const parts: React.ReactNode[] = [];
  const linkPattern = /\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(value))) {
    if (match.index > lastIndex) {
      parts.push(value.slice(lastIndex, match.index));
    }
    parts.push(
      <Link
        className="font-medium text-[#315f50] underline underline-offset-4"
        href={match[2] ?? "#"}
        key={`${match[2]}-${match.index}`}
        rel="noreferrer"
        target="_blank"
      >
        {match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }

  return parts.length > 0 ? parts : value;
}
