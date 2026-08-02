import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Download,
  Gift,
  GraduationCap,
  LockKeyhole,
  Network,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { KosSystemNav } from "@/components/kos-system-nav";
import { LearningProfileControl } from "@/components/learning-profile-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ACADEMY_DISCIPLINES,
  ACADEMY_NODES,
  getVaultAssetBlob,
  useVaultAssets,
  type AcademyDiscipline,
  type AcademyNode,
  type AcademyState,
} from "@/kos";
import type { LearningProfile, LearningProfileKind } from "@/kos";
import { getAcademyProfileFallback, useLearningProfiles } from "@/kos/learning-profiles";
import { useKosLocalState } from "@/kos/use-kos-local-state";

export const Route = createFileRoute("/legacy/academy")({
  head: () => ({
    meta: [
      { title: "Academia do Legado - KOS" },
      {
        name: "description",
        content: "Atlas gamificado de disciplinas, especializacao e pesquisa.",
      },
    ],
  }),
  component: LegacyAcademy,
});

type AcademyMode = "learn" | "teach";

const DEFAULT_STATE: AcademyState = {
  completedNodeIds: [],
  rewardAssetIds: {},
};

const STAGE_LABELS: Record<number, string> = {
  1: "Fundacao",
  2: "Base academica",
  3: "Nucleo universitario",
  4: "Aprofundamento",
  5: "Especializacao",
  6: "Pesquisa",
};

function LegacyAcademy() {
  const { profiles, activeProfile, setActiveProfileId, createProfile } = useLearningProfiles();

  return (
    <AcademyForProfile
      key={activeProfile.id}
      profile={activeProfile}
      profiles={profiles}
      onSelectProfile={setActiveProfileId}
      onCreateProfile={createProfile}
    />
  );
}

function AcademyForProfile({
  profile,
  profiles,
  onSelectProfile,
  onCreateProfile,
}: {
  profile: LearningProfile;
  profiles: LearningProfile[];
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, kind?: LearningProfileKind) => LearningProfile | null;
}) {
  const { assets } = useVaultAssets();
  const [mode, setMode] = useState<AcademyMode>("learn");
  const [disciplineId, setDisciplineId] = useState(ACADEMY_DISCIPLINES[0].id);
  const [selectedId, setSelectedId] = useState(ACADEMY_DISCIPLINES[0].nodes[0].id);
  const [search, setSearch] = useState("");
  const [academyState, setAcademyState] = useKosLocalState<AcademyState>(
    `kos.legacy.academy.${profile.id}`,
    profile.id === "self" ? getAcademyProfileFallback(profile.id) : DEFAULT_STATE,
  );

  const discipline =
    ACADEMY_DISCIPLINES.find((item) => item.id === disciplineId) ?? ACADEMY_DISCIPLINES[0];
  const selected = discipline.nodes.find((node) => node.id === selectedId) ?? discipline.nodes[0];
  const completed = academyState.completedNodeIds.includes(selected.id);
  const unlocked = selected.prerequisites.every((id) => academyState.completedNodeIds.includes(id));
  const linkedReward = assets.find(
    (asset) => asset.id === academyState.rewardAssetIds[selected.id],
  );
  const knownNodeIds = useMemo(() => new Set(ACADEMY_NODES.map((node) => node.id)), []);
  const knownCompleted = academyState.completedNodeIds.filter((id) => knownNodeIds.has(id));
  const disciplineCompleted = discipline.nodes.filter((node) =>
    academyState.completedNodeIds.includes(node.id),
  ).length;
  const disciplineProgress = Math.round((disciplineCompleted / discipline.nodes.length) * 100);
  const overallProgress = Math.round((knownCompleted.length / ACADEMY_NODES.length) * 100);
  const tracks = useMemo(
    () => [...new Set(discipline.nodes.map((node) => node.subject))],
    [discipline.nodes],
  );
  const filteredDisciplines = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ACADEMY_DISCIPLINES;
    return ACADEMY_DISCIPLINES.filter((item) =>
      `${item.name} ${item.area} ${item.summary}`.toLowerCase().includes(query),
    );
  }, [search]);

  function selectDiscipline(next: AcademyDiscipline) {
    setDisciplineId(next.id);
    setSelectedId(next.nodes[0].id);
  }

  function linkReward(assetId: string) {
    setAcademyState({
      ...academyState,
      rewardAssetIds: {
        ...academyState.rewardAssetIds,
        [selected.id]: assetId,
      },
    });
  }

  async function downloadReward() {
    if (!linkedReward) return;
    const blob = await getVaultAssetBlob(linkedReward.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = linkedReward.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className="ambient-field min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div className="relative mx-auto w-full max-w-[1720px] px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full border border-foreground/15 bg-surface"
            >
              <Link
                to="/pillars/$pillarId"
                params={{ pillarId: "legacy" }}
                aria-label="Voltar ao Legacy"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                KOS / Legacy / Atlas academico
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">Academia do Legado</h1>
            </div>
          </div>
          <div className="flex flex-col gap-3 xl:items-end">
            <KosSystemNav active="academy" />
            <LearningProfileControl
              profiles={profiles}
              activeProfileId={profile.id}
              onSelect={onSelectProfile}
              onCreate={onCreateProfile}
              compact
            />
          </div>
        </header>

        <section className="mt-8 grid gap-6 border-y border-foreground/15 py-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Network className="h-4 w-4 text-accent" />
              Fundacao ampla, especializacao profunda
            </div>
            <p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground">
              Escolha um campo, atravesse seus pre-requisitos e avance da fundacao ate pesquisa.
              Cada arvore pode servir ao seu estudo agora e a uma experiencia de lecionamento no
              futuro.
            </p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Modo da Academia">
            <ModeButton
              selected={mode === "learn"}
              icon={GraduationCap}
              label="Aprender"
              onClick={() => setMode("learn")}
            />
            <ModeButton
              selected={mode === "teach"}
              icon={Settings2}
              label="Lecionar"
              onClick={() => setMode("teach")}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Atlas de disciplinas
              </div>
              <h2 className="mt-2 text-xl font-medium">
                {ACADEMY_DISCIPLINES.length} campos para explorar
              </h2>
            </div>
            <label className="relative block w-full md:w-80">
              <span className="sr-only">Buscar disciplina</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar campo ou area"
                className="h-12 rounded-full bg-surface pl-11"
              />
            </label>
          </div>

          <div className="mt-5 grid auto-cols-[230px] grid-flow-col gap-3 overflow-x-auto pb-3">
            {filteredDisciplines.map((item) => {
              const itemCompleted = item.nodes.filter((node) =>
                academyState.completedNodeIds.includes(node.id),
              ).length;
              const active = item.id === discipline.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectDiscipline(item)}
                  className={`group min-h-[150px] border p-4 text-left transition-[transform,border-color,background-color] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring motion-reduce:transform-none ${
                    active
                      ? "border-accent bg-surface-elevated"
                      : "border-foreground/15 bg-card hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.area}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <div className="mt-5 line-clamp-2 text-base font-medium leading-6">
                    {item.name}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {itemCompleted} / {item.nodes.length} nucleos
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7 grid gap-5 sm:grid-cols-3">
          <Metric value={`${disciplineProgress}%`} label={`progresso em ${discipline.name}`} />
          <Metric
            value={`${disciplineCompleted}/${discipline.nodes.length}`}
            label="nucleos da arvore"
          />
          <Metric value={`${overallProgress}%`} label="progresso no atlas completo" />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {discipline.area} / Arvore de competencias
                </div>
                <h2 className="mt-2 text-2xl font-light">{discipline.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {discipline.summary}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                Complete os pre-requisitos para abrir novos caminhos
              </span>
            </div>

            <div className="mt-5 overflow-x-auto border-y border-foreground/15 bg-background/40 py-6">
              <KnowledgeGraph
                nodes={discipline.nodes}
                selectedId={selected.id}
                completedIds={academyState.completedNodeIds}
                onSelect={setSelectedId}
              />
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {tracks.map((track) => (
                <span
                  key={track}
                  className="shrink-0 rounded-full border border-foreground/15 bg-surface px-4 py-2 text-xs text-muted-foreground"
                >
                  {track}
                </span>
              ))}
            </div>
          </div>

          <aside className="kos-panel self-start p-6 xl:sticky xl:top-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {STAGE_LABELS[selected.level]} / {selected.subject}
                </div>
                <h2 className="serif mt-3 text-3xl leading-tight">{selected.title}</h2>
              </div>
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center border"
                style={{
                  borderColor: `color-mix(in oklab, ${selected.color} 65%, transparent)`,
                  background: `color-mix(in oklab, ${selected.color} 18%, var(--card))`,
                }}
              >
                {completed ? (
                  <Check className="h-5 w-5" />
                ) : unlocked ? (
                  <Sparkles className="h-5 w-5" />
                ) : (
                  <LockKeyhole className="h-5 w-5" />
                )}
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">{selected.summary}</p>

            {selected.prerequisites.length > 0 && (
              <div className="mt-6 border-t border-foreground/15 pt-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Pre-requisitos
                </div>
                <div className="mt-3 space-y-2">
                  {selected.prerequisites.map((id) => {
                    const prerequisite = discipline.nodes.find((node) => node.id === id);
                    const done = academyState.completedNodeIds.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedId(id)}
                        className="flex w-full items-center gap-3 border border-foreground/15 bg-surface px-3 py-3 text-left text-sm"
                      >
                        {done ? (
                          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        {prerequisite?.title ?? id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 border-y border-foreground/15 py-5">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Recompensa / {selected.rewardType}
                  </div>
                  <div className="mt-1 text-sm">{selected.rewardLabel}</div>
                </div>
              </div>

              {mode === "teach" && (
                <label className="mt-5 block">
                  <span className="text-sm font-medium">Arquivo liberado ao concluir</span>
                  <select
                    value={academyState.rewardAssetIds[selected.id] ?? ""}
                    onChange={(event) => linkReward(event.target.value)}
                    className="mt-2 h-12 w-full border border-input bg-surface px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" className="bg-background">
                      Nenhum arquivo vinculado
                    </option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id} className="bg-background">
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {mode === "learn" ? (
              <div className="mt-6 space-y-3">
                <Button asChild className="h-12 w-full rounded-none">
                  <Link to="/legacy/academy/$nodeId" params={{ nodeId: selected.id }}>
                    {completed ? (
                      <>
                        <Check className="h-4 w-4" />
                        Rever unidade dominada
                      </>
                    ) : unlocked ? (
                      <>
                        <GraduationCap className="h-4 w-4" />
                        Entrar na unidade
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-4 w-4" />
                        Ver unidade bloqueada
                      </>
                    )}
                  </Link>
                </Button>
                {completed && linkedReward && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void downloadReward()}
                    className="h-11 w-full rounded-full bg-surface"
                  >
                    <Download className="h-4 w-4" />
                    Abrir recompensa
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                <Button asChild className="h-11 rounded-none">
                  <Link
                    to="/legacy/academy/$nodeId"
                    params={{ nodeId: selected.id }}
                    search={{ mode: "teach" }}
                  >
                    <Settings2 className="h-4 w-4" />
                    Preparar unidade
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full bg-surface">
                  <Link to="/vault">
                    <BookOpen className="h-4 w-4" />
                    Organizar materiais
                  </Link>
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  Selecione qualquer nucleo da arvore para vincular a aula, livro, jogo ou arquivo
                  que sera liberado como recompensa.
                </p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function KnowledgeGraph({
  nodes,
  selectedId,
  completedIds,
  onSelect,
}: {
  nodes: AcademyNode[];
  selectedId: string;
  completedIds: string[];
  onSelect: (id: string) => void;
}) {
  const nodeWidth = 184;
  const nodeHeight = 88;
  const maxLevel = Math.max(...nodes.map((node) => node.level));
  const maxRows = Math.max(
    ...Array.from(
      { length: maxLevel },
      (_, index) => nodes.filter((node) => node.level === index + 1).length,
    ),
  );
  const width = Math.max(980, 40 + (maxLevel - 1) * 250 + nodeWidth + 40);
  const height = Math.max(460, 30 + maxRows * 118 + 20);

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        aria-hidden
        viewBox={`0 0 ${width} ${height}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {nodes.flatMap((node) =>
          node.prerequisites.map((prerequisiteId) => {
            const source = nodes.find((item) => item.id === prerequisiteId);
            if (!source) return null;
            const active = completedIds.includes(prerequisiteId);
            return (
              <line
                key={`${prerequisiteId}-${node.id}`}
                x1={source.x + nodeWidth}
                y1={source.y + nodeHeight / 2}
                x2={node.x}
                y2={node.y + nodeHeight / 2}
                stroke={active ? source.color : "oklch(1 0 0 / 0.13)"}
                strokeWidth={active ? 2 : 1}
                strokeDasharray={active ? undefined : "5 8"}
              />
            );
          }),
        )}
      </svg>

      {nodes.map((node) => {
        const completed = completedIds.includes(node.id);
        const unlocked = node.prerequisites.every((id) => completedIds.includes(id));
        const selected = node.id === selectedId;
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node.id)}
            className="absolute flex h-[88px] w-[184px] flex-col justify-between border p-4 text-left transition-[transform,opacity,border-color,background-color] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring motion-reduce:transform-none"
            style={{
              left: node.x,
              top: node.y,
              borderColor: selected
                ? `color-mix(in oklab, ${node.color} 85%, transparent)`
                : completed
                  ? `color-mix(in oklab, ${node.color} 48%, transparent)`
                  : "oklch(1 0 0 / 0.15)",
              background: selected
                ? `color-mix(in oklab, ${node.color} 20%, var(--card))`
                : "var(--card)",
              opacity: unlocked || completed ? 1 : 0.48,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {STAGE_LABELS[node.level]}
              </span>
              {completed ? (
                <Check className="h-3.5 w-3.5" />
              ) : unlocked ? (
                <span className="h-2 w-2 rounded-full" style={{ background: node.color }} />
              ) : (
                <LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <span className="line-clamp-2 text-sm font-medium leading-5">{node.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function ModeButton({
  selected,
  icon: Icon,
  label,
  onClick,
}: {
  selected: boolean;
  icon: typeof GraduationCap;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
        selected
          ? "border-primary/40 bg-primary/15"
          : "border-foreground/15 bg-surface text-muted-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-foreground/15 pl-5">
      <div className="serif text-4xl leading-none tabular-nums">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
