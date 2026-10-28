/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = toBlocks(content);

  return (
    <div className="blog-prose space-y-5 text-[17px] leading-8 text-[#352d22]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as "h2" | "h3";
          return (
            <Heading
              className="pt-4 text-2xl font-semibold leading-tight text-[#211b13] first:pt-0"
              key={index}
            >
              {renderInline(block.value)}
            </Heading>
          );
        }

        if (block.type === "image") {
          return (
            <figure className="blog-prose-wide" key={index}>
              <a href={block.src} target="_blank" rel="noopener noreferrer" aria-label={`${block.alt || "본문 이미지"} 원본 보기 (새 탭)`}>
              <img
                alt={block.alt}
                className="mx-auto block h-auto max-w-full rounded-md"
                src={block.src}
                loading="lazy"
              />
              </a>
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
              className="blog-prose-wide overflow-x-auto rounded-md border border-[#3b3831] bg-[#24211b] p-4 font-mono text-sm leading-6 text-[#f6f3eb]"
              key={index}
            >
              <code>{block.value}</code>
            </pre>
          );
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              className={
                block.ordered
                  ? "list-decimal space-y-2 pl-6"
                  : "list-disc space-y-2 pl-6"
              }
              key={index}
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  style={{ marginLeft: `${item.depth * 1.25}rem` }}
                >
                  {renderInline(item.value)}
                </li>
              ))}
            </List>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              className="border-l border-[#8c8170] bg-[#f0eadf] px-4 py-3 italic text-[#5f5a50]"
              key={index}
            >
              {renderInline(block.value)}
            </blockquote>
          );
        }

        if (block.type === "divider") {
          return <hr className="border-[#d7d0c1]" key={index} />;
        }

        if (block.type === "table") {
          return (
            <div className="blog-prose-wide overflow-x-auto" key={index}>
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          className="border border-[#d7d0c1] px-3 py-2 align-top"
                          key={cellIndex}
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  | {
      type: "list";
      ordered: boolean;
      items: Array<{ value: string; depth: number }>;
    }
  | { type: "quote"; value: string }
  | { type: "divider" }
  | { type: "table"; rows: string[][] }
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

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex] ?? "";
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

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "divider" });
      continue;
    }

    const listItem = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      const ordered = /\d+\./.test(listItem[2] ?? "");
      const items: Array<{ value: string; depth: number }> = [];
      while (lineIndex < lines.length) {
        const candidate = (lines[lineIndex] ?? "").match(
          /^(\s*)([-*+]|\d+\.)\s+(.+)$/,
        );
        if (!candidate || /\d+\./.test(candidate[2] ?? "") !== ordered) {
          break;
        }
        items.push({
          value: candidate[3] ?? "",
          depth: Math.floor((candidate[1]?.length ?? 0) / 2),
        });
        lineIndex += 1;
      }
      lineIndex -= 1;
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      const quote: string[] = [];
      while (
        lineIndex < lines.length &&
        (lines[lineIndex] ?? "").trim().startsWith("> ")
      ) {
        quote.push((lines[lineIndex] ?? "").trim().slice(2));
        lineIndex += 1;
      }
      lineIndex -= 1;
      blocks.push({ type: "quote", value: quote.join("\n") });
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushParagraph();
      const rows: string[][] = [];
      while (lineIndex < lines.length) {
        const tableLine = (lines[lineIndex] ?? "").trim();
        if (!tableLine.startsWith("|") || !tableLine.endsWith("|")) {
          break;
        }
        rows.push(
          tableLine
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim()),
        );
        lineIndex += 1;
      }
      lineIndex -= 1;
      blocks.push({ type: "table", rows });
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
  const inlinePattern =
    /\[([^\]]+)]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*|~~([^~]+)~~|`([^`]+)`|\*([^*\n]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(value))) {
    if (match.index > lastIndex) {
      parts.push(value.slice(lastIndex, match.index));
    }
    if (match[1] && match[2]) {
      parts.push(
        <Link
          className="font-medium text-[#315f50] underline underline-offset-4"
          href={match[2]}
          key={`${match[2]}-${match.index}`}
          rel="noreferrer"
          target="_blank"
        >
          {match[1]}
        </Link>,
      );
    } else if (match[3]) {
      parts.push(
        <strong
          className="font-semibold text-[#211b13]"
          key={match.index}
        >
          {match[3]}
        </strong>,
      );
    } else if (match[4]) {
      parts.push(<del key={match.index}>{match[4]}</del>);
    } else if (match[5]) {
      parts.push(
        <code
          className="rounded bg-[#e8e1d5] px-1.5 py-0.5 font-mono text-[0.9em]"
          key={match.index}
        >
          {match[5]}
        </code>,
      );
    } else if (match[6]) {
      parts.push(<em key={match.index}>{match[6]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }

  return parts.length > 0 ? parts : value;
}
