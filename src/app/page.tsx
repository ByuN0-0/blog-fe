import Link from "next/link";
import { ArrowUpRight, Code2, GitBranch, PenLine, Rocket } from "lucide-react";

const navItems = ["Writing", "Build log", "About"];

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

const buildNotes = [
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
    excerpt:
      "기술력, 꾸준함, 개인적인 목소리 사이의 균형을 어떻게 만들지 고민한다.",
    date: "2026.04.30",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link className="text-lg font-semibold tracking-[-0.02em]" href="/">
          dev.build.notes
        </Link>
        <nav className="hidden items-center gap-7 text-[15px] font-normal md:flex">
          {navItems.map((item) => (
            <a
              className="rounded-full px-2 py-1 transition-colors hover:bg-black hover:text-white"
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-14 lg:px-12 lg:pb-24 lg:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em]">
          Developer / Maker / Builder
        </p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <h1 className="max-w-5xl text-[56px] font-normal leading-[0.96] tracking-[-0.055em] sm:text-[76px] lg:text-[96px]">
            I build, review, and write about software.
          </h1>
          <div className="flex flex-col justify-end gap-8">
            <p className="text-xl font-light leading-[1.42] tracking-[-0.01em]">
              기술을 직접 써보고, 제품을 만들고, 그 과정에서 배운 것을 오래
              남기는 개인 개발 블로그입니다.
            </p>
            <a
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-black px-6 text-[18px] font-medium tracking-[-0.01em] text-white transition-transform hover:-translate-y-0.5"
              href="#notes"
            >
              최근 글 보기
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-black py-3 text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-8 overflow-hidden px-6 font-mono text-xs uppercase tracking-[0.18em] lg:px-12">
          <span>Tech reviews</span>
          <span>Build logs</span>
          <span>Dev diary</span>
          <span>Business notes</span>
          <span>Writing system</span>
        </div>
      </section>

      <section id="writing" className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
        <div className="rounded-[24px] bg-[#d7ff5f] p-8 md:p-12 lg:p-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            Writing system
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <h2 className="text-[44px] font-normal leading-[1.02] tracking-[-0.045em] sm:text-[64px]">
              글은 정보보다 판단을 남기기 위해 씁니다.
            </h2>
            <div className="grid gap-5">
              {writingTracks.map((track) => (
                <article
                  className="grid gap-4 border-t border-black/20 pt-5 sm:grid-cols-[44px_1fr]"
                  key={track.label}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-black text-white">
                    <track.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                      {track.label}
                    </h3>
                    <p className="mt-2 text-[17px] font-light leading-[1.45] tracking-[-0.01em]">
                      {track.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="build-log" className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-12 lg:pb-24">
        <div className="rounded-[24px] bg-[#151a3a] p-8 text-white md:p-12 lg:p-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            Currently building
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
            <h2 className="text-[44px] font-normal leading-[1.02] tracking-[-0.045em] sm:text-[64px]">
              블로그를 제품처럼 만들고, 제품을 글처럼 기록합니다.
            </h2>
            <ul className="space-y-3">
              {buildNotes.map((item) => (
                <li
                  className="flex items-center justify-between rounded-full bg-white/12 px-5 py-3 text-[17px] font-light"
                  key={item}
                >
                  <span>{item}</span>
                  <GitBranch className="size-4" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="notes" className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-12 lg:pb-24">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em]">
              Latest notes
            </p>
            <h2 className="mt-4 text-[44px] font-normal leading-none tracking-[-0.045em] sm:text-[64px]">
              최근 기록
            </h2>
          </div>
        </div>

        <div className="divide-y divide-black border-y border-black">
          {notes.map((post) => (
            <article
              className="group grid gap-6 py-7 md:grid-cols-[160px_1fr_48px]"
              key={post.title}
            >
              <div className="font-mono text-xs uppercase tracking-[0.12em]">
                <p>{post.category}</p>
                <p className="mt-3">{post.date}</p>
              </div>
              <div>
                <h3 className="text-[28px] font-normal leading-[1.12] tracking-[-0.035em] sm:text-[34px]">
                  {post.title}
                </h3>
                <p className="mt-3 max-w-2xl text-[17px] font-light leading-[1.45] tracking-[-0.01em]">
                  {post.excerpt}
                </p>
              </div>
              <div className="hidden justify-end md:flex">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#f4f4f0] transition-colors group-hover:bg-black group-hover:text-white">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer id="about" className="mx-auto w-full max-w-7xl px-6 pb-10 lg:px-12">
        <div className="rounded-[24px] bg-[#ffd2c7] p-8 md:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">
            About this blog
          </p>
          <p className="mt-5 max-w-3xl text-[26px] font-light leading-[1.28] tracking-[-0.02em]">
            유명한 개발 블로그가 되는 것을 목표로, 검색에 걸리는 글보다 다시
            찾아오게 만드는 글을 쌓아갑니다.
          </p>
        </div>
      </footer>
    </main>
  );
}
