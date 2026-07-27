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
  Plus,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentType, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getPillarRoom,
  PILLAR_CAPTURE_COPY,
  PILLARS,
  type KosDomain,
  type Pillar,
  type PillarId,
  type PillarRecord,
} from "@/kos";
import { useKosLocalState } from "@/kos/use-kos-local-state";

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
      { title: `${loaderData?.room.roomName ?? "Pillar"} - KOS` },
      {
        name: "description",
        content: loaderData?.room.thesis ?? "A living room inside KOS.",
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

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function PillarRoom() {
  const { pillar, room } = Route.useLoaderData();
  const captureCopy = PILLAR_CAPTURE_COPY[pillar.id];
  const [records, setRecords] = useKosLocalState<PillarRecord[]>(
    `kos.pillars.${pillar.id}.records`,
    [],
  );
  const [activeDomainId, setActiveDomainId] = useState(pillar.domains[0]?.id ?? "");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", details: "", tags: "" });

  const activeDomain =
    pillar.domains.find((domain) => domain.id === activeDomainId) ?? pillar.domains[0];
  const visibleRecords = useMemo(
    () => records.filter((record) => record.domainId === activeDomainId),
    [activeDomainId, records],
  );

  useEffect(() => {
    setActiveDomainId(pillar.domains[0]?.id ?? "");
    setComposerOpen(false);
  }, [pillar]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setComposerOpen(false);
      if (
        event.key.toLowerCase() === "n" &&
        !composerOpen &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)
      ) {
        setComposerOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [composerOpen]);

  function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title || !activeDomain) return;

    const now = new Date().toISOString();
    const record: PillarRecord = {
      id: makeId(pillar.id),
      pillarId: pillar.id,
      domainId: activeDomain.id,
      kind: activeDomain.name.toUpperCase(),
      title,
      details: draft.details.trim(),
      tags: parseTags(draft.tags),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    setRecords([record, ...records]);
    setDraft({ title: "", details: "", tags: "" });
    setComposerOpen(false);
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <RoomAmbient pillar={pillar} />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1720px] flex-col px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.05] backdrop-blur-xl"
            >
              <Link to="/" aria-label="Voltar para o portal KOS">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                KOS / {pillar.index} / {pillar.name}
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">{room.roomName}</h1>
            </div>
          </div>

          <nav aria-label="Pilares do KOS" className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {PILLARS.map((item) => (
              <Button
                key={item.id}
                asChild
                variant="ghost"
                className={`h-11 shrink-0 rounded-full border px-4 ${
                  item.id === pillar.id
                    ? "border-foreground/25 bg-foreground/[0.1] text-foreground"
                    : "border-foreground/10 bg-foreground/[0.035] text-muted-foreground"
                }`}
              >
                <Link
                  to={item.id === "knowledge" ? "/study" : "/pillars/$pillarId"}
                  params={item.id === "knowledge" ? undefined : { pillarId: item.id }}
                >
                  <span className="text-xs tabular-nums">{item.index}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-4 w-4" style={{ color: pillar.hue }} />
              Sala ativa
            </div>
            <h2 className="serif mt-5 text-6xl leading-[0.9] md:text-8xl">{pillar.name}</h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {room.thesis}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button onClick={() => setComposerOpen(true)} className="h-12 rounded-full px-5">
                <Plus className="h-4 w-4" />
                {captureCopy.action}
              </Button>
              {pillar.id === "legacy" && (
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-foreground/10 bg-foreground/[0.04] px-5"
                >
                  <Link to="/legacy/academy">Abrir Academia</Link>
                </Button>
              )}
              <span className="text-xs text-muted-foreground">N / nova captura</span>
            </div>
          </div>

          <div className="border-l border-foreground/10 pl-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Agora neste pilar
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Metric value={records.length} label="registros" />
              <Metric value={pillar.domains.length} label="dominios" />
              <Metric value={visibleRecords.length} label="em foco" />
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">{room.atmosphere}</p>
          </div>
        </section>

        <section className="mt-11" aria-labelledby="domain-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Trilho de foco
              </div>
              <h2 id="domain-heading" className="mt-2 text-xl font-medium">
                Escolha um dominio
              </h2>
            </div>
            <span className="hidden text-xs text-muted-foreground md:block">
              A captura sera guardada no dominio selecionado
            </span>
          </div>

          <div className="-mx-5 mt-5 overflow-x-auto px-5 pb-5 md:-mx-9 md:px-9 lg:-mx-12 lg:px-12">
            <div className="flex gap-4">
              {pillar.domains.map((domain, index) => (
                <DomainSeed
                  key={domain.id}
                  domain={domain}
                  pillar={pillar}
                  index={index}
                  selected={domain.id === activeDomainId}
                  recordCount={records.filter((record) => record.domainId === domain.id).length}
                  onSelect={() => setActiveDomainId(domain.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Acervo local
                </div>
                <h2 className="mt-2 text-xl font-medium">{activeDomain?.name}</h2>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {visibleRecords.length} registros
              </span>
            </div>

            {visibleRecords.length ? (
              <div className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10">
                {visibleRecords.map((record) => (
                  <article
                    key={record.id}
                    className="grid gap-3 py-5 md:grid-cols-[150px_1fr_auto]"
                  >
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {record.kind}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDate(record.createdAt)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-medium">{record.title}</h3>
                      {record.details && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                          {record.details}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:max-w-48 md:justify-end">
                      {record.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 border-y border-foreground/10 py-10">
                <p className="text-base">Este dominio ainda esta em silencio.</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  O primeiro registro transforma esta sala de conceito em acervo pessoal.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setComposerOpen(true)}
                  className="mt-5 h-11 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                  Criar primeiro registro
                </Button>
              </div>
            )}
          </div>

          <aside className="border-t border-foreground/10 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Horizonte
            </div>
            <h2 className="mt-2 text-xl font-medium">Sistemas em preparacao</h2>
            <div className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10">
              {room.futureSystems.map((system, index) => (
                <div key={system} className="flex gap-4 py-4">
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-6">{system}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>

      <AnimatePresence>
        {composerOpen && activeDomain && (
          <CapturePanel
            pillar={pillar}
            domain={activeDomain}
            draft={draft}
            onDraftChange={setDraft}
            onClose={() => setComposerOpen(false)}
            onSubmit={createRecord}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="serif text-3xl leading-none tabular-nums">{value}</div>
      <div className="mt-2 text-[11px] text-muted-foreground">{label}</div>
    </div>
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
  selected,
  recordCount,
  onSelect,
}: {
  domain: KosDomain;
  pillar: Pillar;
  index: number;
  selected: boolean;
  recordCount: number;
  onSelect: () => void;
}) {
  const Icon = DOMAIN_ICONS[domain.id] ?? Sparkles;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex h-[250px] w-[230px] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] border p-5 text-left transition-[border-color,background-color,opacity] focus:outline-none focus:ring-2 focus:ring-ring motion-reduce:transform-none"
      style={{
        borderColor: selected
          ? `color-mix(in oklab, ${pillar.hue} 65%, transparent)`
          : "color-mix(in oklab, var(--foreground) 10%, transparent)",
        background: selected
          ? `color-mix(in oklab, ${pillar.hue} 13%, var(--background))`
          : "color-mix(in oklab, var(--foreground) 4.5%, transparent)",
        opacity: selected ? 1 : 0.76,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(80% 65% at 25% 10%, color-mix(in oklab, ${pillar.hue} 20%, transparent), transparent 72%)`,
        }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-foreground/10 bg-background/35">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="relative">
        <h3 className="serif text-3xl leading-none">{domain.name}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{domain.blurb}</p>
      </div>
      <div className="relative flex items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>{recordCount} seus</span>
        <span>{selected ? "em foco" : "abrir"}</span>
      </div>
    </motion.button>
  );
}

function CapturePanel({
  pillar,
  domain,
  draft,
  onDraftChange,
  onClose,
  onSubmit,
}: {
  pillar: Pillar;
  domain: KosDomain;
  draft: { title: string; details: string; tags: string };
  onDraftChange: (draft: { title: string; details: string; tags: string }) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const copy = PILLAR_CAPTURE_COPY[pillar.id];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <motion.aside
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-title"
        className="h-dvh w-full max-w-xl overflow-y-auto border-l border-foreground/10 bg-background/95 p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {copy.eyebrow} / {domain.name}
            </div>
            <h2 id="capture-title" className="serif mt-3 text-4xl">
              {copy.action}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar captura"
            className="h-11 w-11 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="mt-9 space-y-6">
          <label className="block">
            <span className="text-sm font-medium">{copy.titleLabel}</span>
            <Input
              autoFocus
              required
              value={draft.title}
              onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
              placeholder={copy.titlePlaceholder}
              className="mt-2 h-12 bg-foreground/[0.04]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">{copy.detailsLabel}</span>
            <Textarea
              value={draft.details}
              onChange={(event) => onDraftChange({ ...draft, details: event.target.value })}
              placeholder={copy.detailsPlaceholder}
              className="mt-2 min-h-44 resize-y bg-foreground/[0.04]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Tags</span>
            <Input
              value={draft.tags}
              onChange={(event) => onDraftChange({ ...draft, tags: event.target.value })}
              placeholder="separe, por, virgulas"
              className="mt-2 h-12 bg-foreground/[0.04]"
            />
            <span className="mt-2 block text-xs text-muted-foreground">
              Use poucas palavras para reencontrar este registro depois.
            </span>
          </label>

          <div className="flex gap-3 border-t border-foreground/10 pt-6">
            <Button type="submit" disabled={!draft.title.trim()} className="h-12 rounded-full px-5">
              <Save className="h-4 w-4" />
              Salvar no pilar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-12 rounded-full px-5"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </motion.aside>
    </motion.div>
  );
}
