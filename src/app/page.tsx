import Link from "next/link";
import {
  ArrowUpRight,
  Code2,
  Cpu,
  GitBranch,
  Monitor,
  PenLine,
  Terminal,
} from "lucide-react";

const navItems = [
  { label: "Writing", href: "#writing" },
  { label: "Build log", href: "#build-log" },
  { label: "Notes", href: "#notes" },
  { label: "About", href: "#about" },
];

const terminalLines = [
  "$ pnpm dev-blog init",
  "loading essays from /notes",
  "mounting tech reviews, dev diary, build logs",
  "status: writing system ready",
];

const systemStats = [
  { label: "Stack", value: "Next.js / Go / Gin" },
  { label: "Mode", value: "Ship, review, write" },
  { label: "Archive", value: "Tech notes and build logs" },
];

const writingTracks = [
  {
    label: "Tech Review",
    description: "직접 써본 기술과 도구를 판단 기준 중심으로 리뷰합니다.",
    icon: Code2,
    command: "cat reviews/*.md",
  },
  {
    label: "Dev Diary",
    description: "개발 중 배운 것, 막혔던 지점, 생각의 변화를 기록합니다.",
    icon: PenLine,
    command: "tail -f diary.log",
  },
  {
    label: "Build Log",
    description: "제품을 만들고 사업으로 연결하는 과정을 남깁니다.",
    icon: GitBranch,
    command: "git log --oneline",
  },
];

const buildNotes = [
  {
    label: "Personal dev blog",
    detail: "글쓰기, 관리자, API 연동을 제품처럼 다듬는 중",
  },
  {
    label: "Go/Gin backend",
    detail: "인증, 글 관리, 댓글 흐름을 단단하게 연결",
  },
  {
    label: "Next.js writing system",
    detail: "읽기 좋은 화면과 관리하기 쉬운 구조를 함께 설계",
  },
  {
    label: "SaaS experiments",
    detail: "작게 만들고 빠르게 검증한 내용을 기록",
  },
];

const notes = [
  {
    category: "Build Log",
    title: "개발자가 자기 블로그를 직접 만드는 이유",
    excerpt:
      "기술 리뷰, 개발 일기, 사업 기록을 한 공간에 쌓기 위해 블로그의 첫 구조를 설계하고 있다.",
    date: "2026.04.30",
    id: "001",
  },
  {
    category: "Tech Review",
    title: "Next.js로 개인 블로그를 만들 때 먼저 정해야 할 것들",
    excerpt: "라우팅, SEO, 관리자 페이지, API 연동의 기준을 먼저 잡아본다.",
    date: "2026.04.30",
    id: "002",
  },
  {
    category: "Dev Diary",
    title: "유명한 개발 블로그가 되고 싶다는 생각",
    excerpt:
      "기술력, 꾸준함, 개인적인 목소리 사이의 균형을 어떻게 만들지 고민한다.",
    date: "2026.04.30",
    id: "003",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f4f2] text-[#111111]">
      <header className="sticky top-0 z-20 border-b border-[#c8c8c2] bg-[#f4f4f2]/92 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 lg:px-10">
          <Link
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold"
            href="/"
          >
            <span className="flex size-7 items-center justify-center rounded-md border border-[#1f1f1f] bg-[#111111] text-[#f4f4f2]">
              <Terminal className="size-4" />
            </span>
            dev.build.notes
          </Link>
          <nav className="hidden items-center gap-1 font-mono text-xs md:flex">
            {navItems.map((item) => (
              <a
                className="rounded-md px-3 py-2 text-[#555555] transition-colors hover:bg-[#111111] hover:text-[#f4f4f2]"
                href={item.href}
                key={item.label}
              >
                /{item.label.toLowerCase().replaceAll(" ", "-")}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:pb-20 lg:pt-20">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-[#b8b8b2] bg-[#e8e8e4] px-3 py-2 font-mono text-xs text-[#4b4b4b]">
              <span className="size-2 rounded-full bg-[#2f7d4f]" />
              Developer / Maker / Builder
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl">
              Software notes from a terminal-minded builder.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#4a4a4a]">
              기술을 직접 써보고, 제품을 만들고, 그 과정에서 배운 판단을
              오래 남기는 개인 개발 블로그입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[#111111] px-4 font-mono text-sm font-medium text-[#f4f4f2] transition-transform hover:-translate-y-0.5"
              href="#notes"
            >
              최근 글 보기
              <ArrowUpRight className="size-4" />
            </a>
            <a
              className="inline-flex h-11 items-center gap-2 rounded-md border border-[#9f9f98] bg-[#eeeeeb] px-4 font-mono text-sm font-medium text-[#222222] transition-colors hover:bg-white"
              href="#build-log"
            >
              빌드 로그
              <GitBranch className="size-4" />
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-[#1f1f1f] bg-[#d7d7d2] shadow-[8px_8px_0_#111111]">
          <div className="flex h-10 items-center justify-between border-b border-[#1f1f1f] bg-[#c9c9c3] px-4">
            <div className="flex gap-2">
              <span className="size-3 rounded-full border border-[#1f1f1f] bg-[#f4f4f2]" />
              <span className="size-3 rounded-full border border-[#1f1f1f] bg-[#b8b8b2]" />
              <span className="size-3 rounded-full border border-[#1f1f1f] bg-[#8f8f88]" />
            </div>
            <span className="font-mono text-xs text-[#333333]">
              dev-build-notes.local
            </span>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[1fr_260px]">
            <div className="min-h-[360px] rounded-md border border-[#2b2b2b] bg-[#111111] p-5 font-mono text-sm text-[#e8e8e4]">
              <div className="mb-5 flex items-center gap-2 text-[#9f9f98]">
                <Terminal className="size-4" />
                <span>terminal</span>
              </div>
              <div className="space-y-4">
                {terminalLines.map((line, index) => (
                  <p key={line}>
                    <span className="text-[#7fd08a]">
                      {index === 0 ? ">" : "ok"}
                    </span>{" "}
                    {line}
                  </p>
                ))}
              </div>
              <div className="mt-10 border-t border-[#3a3a3a] pt-5">
                <p className="text-[#b9b9b4]">next task</p>
                <p className="mt-2 text-2xl font-semibold leading-tight text-white">
                  write useful notes, ship useful software
                </p>
              </div>
            </div>

            <aside className="grid gap-4">
              <div className="rounded-md border border-[#9f9f98] bg-[#eeeeeb] p-4">
                <div className="flex items-center gap-2 font-mono text-xs text-[#555555]">
                  <Cpu className="size-4" />
                  system status
                </div>
                <dl className="mt-4 space-y-4">
                  {systemStats.map((item) => (
                    <div key={item.label}>
                      <dt className="font-mono text-xs text-[#696963]">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-[#191919]">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-md border border-[#9f9f98] bg-[#f8f8f5] p-4">
                <div className="flex items-center gap-2 font-mono text-xs text-[#555555]">
                  <Monitor className="size-4" />
                  current screen
                </div>
                <div className="mt-4 grid grid-cols-5 gap-1">
                  {Array.from({ length: 30 }).map((_, index) => (
                    <span
                      className="h-5 rounded-sm border border-[#c8c8c2] bg-[#e0e0dc]"
                      key={index}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-[#c8c8c2] bg-[#111111] py-3 text-[#f4f4f2]">
        <div className="mx-auto flex w-full max-w-7xl gap-8 overflow-hidden px-5 font-mono text-xs lg:px-10">
          <span>tech reviews</span>
          <span>build logs</span>
          <span>dev diary</span>
          <span>business notes</span>
          <span>writing system</span>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-5 py-14 lg:px-10 lg:py-20"
        id="writing"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#b8b8b2] pb-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs text-[#696963]">/writing-system</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              글은 정보보다 판단을 남기기 위해 씁니다.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#555555]">
            리뷰, 일기, 빌드 로그를 같은 기준으로 정리해 다시 꺼내볼 수 있는
            기록으로 남깁니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {writingTracks.map((track) => (
            <article
              className="rounded-lg border border-[#b8b8b2] bg-[#eeeeeb] p-5"
              key={track.label}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex size-10 items-center justify-center rounded-md border border-[#1f1f1f] bg-[#111111] text-[#f4f4f2]">
                  <track.icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-[#696963]">
                  {track.command}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{track.label}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#555555]">
                {track.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-5 pb-14 lg:px-10 lg:pb-20"
        id="build-log"
      >
        <div className="rounded-lg border border-[#1f1f1f] bg-[#d7d7d2] p-5 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="font-mono text-xs text-[#555555]">
                /currently-building
              </p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                블로그를 제품처럼 만들고, 제품을 글처럼 기록합니다.
              </h2>
            </div>
            <div className="divide-y divide-[#a9a9a2] rounded-md border border-[#a9a9a2] bg-[#eeeeeb]">
              {buildNotes.map((item, index) => (
                <article
                  className="grid gap-3 p-4 md:grid-cols-[88px_1fr]"
                  key={item.label}
                >
                  <span className="font-mono text-xs text-[#696963]">
                    commit {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#555555]">
                      {item.detail}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl px-5 pb-14 lg:px-10 lg:pb-20"
        id="notes"
      >
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs text-[#696963]">/latest-notes</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              최근 기록
            </h2>
          </div>
        </div>

        <div className="divide-y divide-[#b8b8b2] border-y border-[#b8b8b2]">
          {notes.map((post) => (
            <article
              className="group grid gap-5 py-6 md:grid-cols-[120px_1fr_44px] md:items-center"
              key={post.title}
            >
              <div className="font-mono text-xs text-[#696963]">
                <p>note-{post.id}</p>
                <p className="mt-2">{post.date}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-[#555555]">
                  {post.category}
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
                  {post.title}
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#555555]">
                  {post.excerpt}
                </p>
              </div>
              <div className="hidden justify-end md:flex">
                <span className="flex size-10 items-center justify-center rounded-md border border-[#b8b8b2] bg-[#eeeeeb] transition-colors group-hover:bg-[#111111] group-hover:text-[#f4f4f2]">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer
        className="mx-auto w-full max-w-7xl px-5 pb-10 lg:px-10"
        id="about"
      >
        <div className="rounded-lg border border-[#1f1f1f] bg-[#111111] p-6 text-[#f4f4f2] md:p-8">
          <p className="font-mono text-xs text-[#b9b9b4]">/about-this-blog</p>
          <p className="mt-5 max-w-3xl text-2xl font-medium leading-9">
            유명한 개발 블로그가 되는 것을 목표로, 검색에 걸리는 글보다 다시
            찾아오게 만드는 글을 쌓아갑니다.
          </p>
        </div>
      </footer>
    </main>
  );
}
