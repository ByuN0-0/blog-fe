import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Code2,
  GitBranch,
  PenLine,
  Rocket,
} from "lucide-react";

const writingTracks = [
  {
    label: "Tech Review",
    description: "직접 써본 기술과 도구를 판단 기준 중심으로 리뷰합니다.",
    icon: Code2,
  },
  {
    label: "Dev Diary",
    description: "개발 중 배운 것, 막혔던 지점, 생각의 변화를 기록합니다.",
    icon: PenLine,
  },
  {
    label: "Build Log",
    description: "제품을 만들고 사업으로 연결하는 과정을 남깁니다.",
    icon: Rocket,
  },
];

const buildingItems = [
  "Personal dev blog",
  "Go/Gin backend",
  "Next.js writing system",
  "SaaS experiments",
];

const notes = [
  {
    category: "Build Log",
    title: "개발자가 자기 블로그를 직접 만드는 이유",
    excerpt:
      "기술 리뷰, 개발 일기, 사업 기록을 한 공간에 쌓기 위해 블로그의 첫 구조를 설계하고 있다.",
    date: "2026.04.30",
  },
  {
    category: "Tech Review",
    title: "Next.js로 개인 블로그를 만들 때 먼저 정해야 할 것들",
    excerpt: "라우팅, SEO, 관리자 페이지, API 연동의 기준을 먼저 잡아본다.",
    date: "2026.04.30",
  },
  {
    category: "Dev Diary",
    title: "유명한 개발 블로그가 되고 싶다는 생각",
    excerpt: "기술력, 꾸준함, 개인적인 목소리 사이의 균형을 어떻게 만들지 고민한다.",
    date: "2026.04.30",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <header className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-5">
        <Link className="font-mono text-sm font-semibold" href="/">
          dev.build.notes
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#666666] md:flex">
          <a className="transition-colors hover:text-[#111111]" href="#writing">
            Writing
          </a>
          <a className="transition-colors hover:text-[#111111]" href="#building">
            Building
          </a>
          <a className="transition-colors hover:text-[#111111]" href="#notes">
            Notes
          </a>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-12 lg:grid-cols-[1fr_340px] lg:pb-24 lg:pt-24">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
            Developer / Maker / Builder
          </p>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
            I build, review, and write about software.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#555555]">
            기술을 직접 써보고, 제품을 만들고, 그 과정에서 배운 것을 오래
            남기는 개인 개발 블로그입니다.
          </p>
        </div>

        <aside
          id="building"
          className="self-end border border-[#e5e5e5] bg-white p-5"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitBranch className="size-4 text-[#2563eb]" />
            Currently building
          </div>
          <ul className="mt-5 space-y-3 text-sm text-[#555555]">
            {buildingItems.map((item) => (
              <li className="flex items-center justify-between gap-4" key={item}>
                <span>{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section id="writing" className="border-y border-[#e5e5e5] bg-white">
        <div className="mx-auto grid w-full max-w-6xl divide-y divide-[#e5e5e5] px-5 md:grid-cols-3 md:divide-x md:divide-y-0">
          {writingTracks.map((track) => (
            <article className="py-7 md:px-7 first:md:pl-0" key={track.label}>
              <track.icon className="size-5 text-[#2563eb]" />
              <h2 className="mt-5 text-lg font-semibold">{track.label}</h2>
              <p className="mt-3 text-sm leading-6 text-[#555555]">
                {track.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="notes" className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Latest Notes
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              최근 기록
            </h2>
          </div>
          <BookOpenText className="hidden size-6 text-[#999999] sm:block" />
        </div>

        <div className="border-y border-[#e5e5e5]">
          {notes.map((post) => (
            <article
              className="group grid gap-5 border-b border-[#e5e5e5] py-7 last:border-b-0 md:grid-cols-[150px_1fr_32px]"
              key={post.title}
            >
              <div className="text-sm text-[#666666]">
                <p className="font-medium text-[#111111]">{post.category}</p>
                <p className="mt-2">{post.date}</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {post.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555555]">
                  {post.excerpt}
                </p>
              </div>
              <ArrowUpRight className="hidden size-5 text-[#999999] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#2563eb] md:block" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
