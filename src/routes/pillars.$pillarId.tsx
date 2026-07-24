import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Clapperboard,
  Compass,
  FolderKanban,
  Gamepad2,
  Heart,
  LibraryBig,
  Link2,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

import { getPillarRoom, PILLARS, type KosDomain, type Pillar, type PillarId } from "@/kos";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pillars/$pillarId")({
  loader: ({ params }) => {
    const pillar = PILLARS.find((item) => item.id === params.pillarId);
    const room = getPillarRoom(params.pillarId as PillarId);

    if (!pillar || !room) {
      throw notFound();
    }

    return { pillar, room };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.room.roomName ?? "Pillar"} · KOS` },
      {
        name: "description",
        content: loaderData?.room.thesis ?? "A seed room inside KOS.",
      },
    ],
  }),
  component: PillarRoom,
});

const DOMAIN_ICONS: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  games: Gamepad2,
  movies: Clapperboard,
  clips: Clapperboard,
  moments: Sparkles,
  writing: NotebookPen,
  essays: BookOpen,
  code: FolderKanban,
  projects: FolderKanban,
  ideas: Brain,
  timeline: NotebookPen,
  diary: NotebookPen,
  people: Heart,
  family: Heart,
  connections: Link2,
  patterns: Brain,
  insights: Sparkles,
  suggestions: Link2,
  principles: Compass,
  teachings: BookOpen,
  lessons: LibraryBig,
  shared: Link2,
  wisdom: Sparkles,
};

function PillarRoom() {
  const { pillar, room } = Route.useLoaderData();

  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <RoomAmbient pillar={pillar} />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1720px] flex-col px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full border border-foreground/10 bg-foreground/[0.05] backdrop-blur-xl"
            >
              <Link to="/" aria-label="Voltar para o portal KOS">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                KOS · {pillar.index} · {pillar.name}
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">{room.roomName}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-2">
              {pillar.domains.length} dominios
            </span>
            <span className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-2">
              {pillar.recent.length} sementes
            </span>
          </div>
        </header>

        <section className="mt-9 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <div
              className="relative min-h-[390px] overflow-hidden rounded-[34px] border border-foreground/10 bg-foreground/[0.055] p-7 shadow-[0_44px_140px_-85px_oklch(0_0_0)] backdrop-blur-2xl md:p-9"
              style={{
                boxShadow: `0 46px 140px -90px color-mix(in oklab, ${pillar.hue} 55%, oklch(0 0 0))`,
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(70% 70% at 20% 0%, color-mix(in oklab, ${pillar.hue} 22%, transparent), transparent 72%)`,
                }}
              />
              <div className="relative max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/35 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" style={{ color: pillar.hue }} />
                  Sala-semente
                </div>
                <h2 className="serif mt-7 text-5xl leading-[0.92] md:text-8xl">{pillar.name}</h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  {room.thesis}
                </p>
              </div>
              <div className="relative mt-9 grid gap-3 md:grid-cols-3">
                {room.firstActions.slice(0, 3).map((action) => (
                  <div
                    key={action}
                    className="rounded-2xl border border-foreground/10 bg-background/35 p-4"
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Primeiro gesto
                    </div>
                    <p className="mt-3 text-sm leading-6">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-6 overflow-x-auto pb-6">
              <div className="flex gap-4 pr-6">
                {pillar.domains.map((domain, index) => (
                  <DomainSeed key={domain.id} domain={domain} pillar={pillar} index={index} />
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-[30px] border border-foreground/10 bg-background/45 p-5 backdrop-blur-2xl">
            <div className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
              Atmosfera
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{room.atmosphere}</p>

            <div className="mt-7">
              <h2 className="text-lg font-medium">Sistemas futuros</h2>
              <div className="mt-4 space-y-3">
                {room.futureSystems.map((system) => (
                  <div
                    key={system}
                    className="rounded-2xl border border-foreground/10 bg-foreground/[0.035] p-4"
                  >
                    <p className="text-sm leading-6">{system}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h2 className="text-lg font-medium">Sementes recentes</h2>
              <div className="mt-4 space-y-3">
                {pillar.recent.slice(0, 4).map((item) => (
                  <article
                    key={`${item.kind}-${item.title}`}
                    className="rounded-2xl border border-foreground/10 bg-foreground/[0.035] p-4"
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {item.kind}
                    </div>
                    <p className="mt-2 text-sm leading-6">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function RoomAmbient({ pillar }: { pillar: Pillar }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(70% 60% at 18% 8%, color-mix(in oklab, ${pillar.hue} 26%, transparent), transparent 72%),
            radial-gradient(52% 46% at 84% 18%, color-mix(in oklab, ${pillar.hue2} 18%, transparent), transparent 70%),
            linear-gradient(180deg, oklch(0.14 0.014 270), oklch(0.075 0.012 270) 82%)
          `,
        }}
      />
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(oklch(1_0_0_/_0.045)_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="absolute left-1/2 top-[18%] h-[48rem] w-[48rem] -translate-x-1/2 rounded-full border border-foreground/[0.035]" />
      <div className="absolute bottom-8 left-1/2 h-px w-[84%] -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </div>
  );
}

function DomainSeed({
  domain,
  pillar,
  index,
}: {
  domain: KosDomain;
  pillar: Pillar;
  index: number;
}) {
  const Icon = DOMAIN_ICONS[domain.id] ?? Sparkles;

  return (
    <button
      type="button"
      className="relative flex h-[260px] w-[240px] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] border border-foreground/10 bg-foreground/[0.045] p-5 text-left opacity-85 transition-all hover:-translate-y-1 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(80% 65% at 25% 10%, color-mix(in oklab, ${pillar.hue} 18%, transparent), transparent 72%)`,
        }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-foreground/10 bg-background/35">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="relative">
        <h3 className="serif text-3xl leading-none">{domain.name}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{domain.blurb}</p>
      </div>
      <div className="relative text-xs tabular-nums text-muted-foreground">
        {domain.count.toLocaleString()} entidades planejadas
      </div>
    </button>
  );
}
