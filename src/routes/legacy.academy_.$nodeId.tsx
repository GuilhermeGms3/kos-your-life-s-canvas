import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Gift,
  GraduationCap,
  Link2,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  Settings2,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { LearningProfileControl } from "@/components/learning-profile-control";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ACADEMY_DISCIPLINES,
  ACADEMY_NODES,
  createEmptyLearningUnitState,
  generateLearningQuestion,
  getLearningUnitTemplate,
  getVaultAssetBlob,
  useVaultAssets,
  type AcademyState,
  type LearningProfile,
  type LearningProfileKind,
  type LearningUnitCollection,
  type LearningUnitState,
  type VaultAsset,
} from "@/kos";
import { getAcademyProfileFallback, useLearningProfiles } from "@/kos/learning-profiles";
import { useKosLocalState } from "@/kos/use-kos-local-state";

const unitSearchSchema = z.object({
  mode: z.enum(["learn", "teach"]).optional().catch(undefined),
});

export const Route = createFileRoute("/legacy/academy_/$nodeId")({
  validateSearch: unitSearchSchema,
  head: ({ params }) => {
    const node = ACADEMY_NODES.find((item) => item.id === params.nodeId);
    return {
      meta: [
        { title: `${node?.title ?? "Unidade de aprendizagem"} - KOS` },
        {
          name: "description",
          content: "Sala de estudo, producao, pratica e dominio do KOS.",
        },
      ],
    };
  },
  component: LearningUnitRoute,
});

const DEFAULT_ACADEMY_STATE: AcademyState = {
  completedNodeIds: [],
  rewardAssetIds: {},
};

function LearningUnitRoute() {
  const { nodeId } = Route.useParams();
  const search = Route.useSearch();
  const { profiles, activeProfile, setActiveProfileId, createProfile } = useLearningProfiles();

  return (
    <LearningUnitRoom
      key={`${activeProfile.id}-${nodeId}`}
      nodeId={nodeId}
      initialMode={search.mode ?? "learn"}
      profile={activeProfile}
      profiles={profiles}
      onSelectProfile={setActiveProfileId}
      onCreateProfile={createProfile}
    />
  );
}

function LearningUnitRoom({
  nodeId,
  initialMode,
  profile,
  profiles,
  onSelectProfile,
  onCreateProfile,
}: {
  nodeId: string;
  initialMode: "learn" | "teach";
  profile: LearningProfile;
  profiles: LearningProfile[];
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, kind?: LearningProfileKind) => LearningProfile | null;
}) {
  const node = ACADEMY_NODES.find((item) => item.id === nodeId);
  const discipline = ACADEMY_DISCIPLINES.find((item) => item.id === node?.disciplineId);
  const template = useMemo(() => getLearningUnitTemplate(nodeId), [nodeId]);
  const { assets, loading: assetsLoading } = useVaultAssets();
  const [mode, setMode] = useState<"learn" | "teach">(initialMode);
  const [collection, setCollection] = useKosLocalState<LearningUnitCollection>(
    `kos.learning.units.${profile.id}`,
    {},
  );
  const [academyState, setAcademyState] = useKosLocalState<AcademyState>(
    `kos.legacy.academy.${profile.id}`,
    profile.id === "self" ? getAcademyProfileFallback(profile.id) : DEFAULT_ACADEMY_STATE,
  );
  const unit = collection[nodeId] ?? createEmptyLearningUnitState(nodeId, profile.id);
  const objectives = unit.customObjectives.length ? unit.customObjectives : template.objectives;
  const challengePrompt = unit.challengePrompt || template.challenge;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const linkedAssets = assets.filter((asset) => unit.materialAssetIds.includes(asset.id));
  const primaryAsset =
    linkedAssets.find((asset) => asset.id === unit.primaryAssetId) ?? linkedAssets[0];
  const prerequisiteNodes = (node?.prerequisites ?? [])
    .map((id) => ACADEMY_NODES.find((item) => item.id === id))
    .filter(Boolean);
  const prerequisitesComplete = (node?.prerequisites ?? []).every((id) =>
    academyState.completedNodeIds.includes(id),
  );
  const linkedReward = assets.find((asset) => asset.id === academyState.rewardAssetIds[nodeId]);
  const materialEvidenceDone = unit.materialStudied && Boolean(primaryAsset);
  const noteEvidenceDone = unit.note.trim().length >= 80;
  const substantialAttemptCount = unit.attempts.filter(
    (attempt) => attempt.answer.trim().length >= 30,
  ).length;
  const questionEvidenceDone = substantialAttemptCount >= 3;
  const challengeEvidenceDone = unit.challengeEvidence.trim().length >= 100;
  const firstFourComplete =
    materialEvidenceDone && noteEvidenceDone && questionEvidenceDone && challengeEvidenceDone;

  const evidence = [
    {
      id: "material",
      label: "Material estudado",
      detail: primaryAsset ? primaryAsset.name : "Vincule e estude um material principal",
      done: materialEvidenceDone,
    },
    {
      id: "note",
      label: "Anotacao propria",
      detail: `${unit.note.trim().length}/80 caracteres de elaboracao`,
      done: noteEvidenceDone,
    },
    {
      id: "questions",
      label: "Perguntas respondidas",
      detail: `${substantialAttemptCount}/3 respostas substanciais`,
      done: questionEvidenceDone,
    },
    {
      id: "challenge",
      label: "Desafio ou projeto",
      detail: `${unit.challengeEvidence.trim().length}/100 caracteres de evidencia`,
      done: challengeEvidenceDone,
    },
    {
      id: "review",
      label: "Revisao posterior",
      detail: unit.reviewCompletedAt
        ? `Registrada em ${new Date(unit.reviewCompletedAt).toLocaleDateString("pt-BR")}`
        : unit.reviewDueAt
          ? `Agendada para ${new Date(`${unit.reviewDueAt}T12:00:00`).toLocaleDateString("pt-BR")}`
          : "Sera agendada quando as quatro primeiras evidencias existirem",
      done: Boolean(unit.reviewCompletedAt),
    },
  ];
  const evidenceCount = evidence.filter((item) => item.done).length;
  const mastery = evidenceCount * 20;
  const mastered = mastery === 100 && prerequisitesComplete;

  function updateUnit(patch: Partial<LearningUnitState>) {
    setCollection((current) => ({
      ...current,
      [nodeId]: {
        ...(current[nodeId] ?? createEmptyLearningUnitState(nodeId, profile.id)),
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  useEffect(() => {
    if (!firstFourComplete || unit.reviewDueAt) return;
    const due = new Date();
    due.setDate(due.getDate() + 3);
    setCollection((current) => ({
      ...current,
      [nodeId]: {
        ...(current[nodeId] ?? createEmptyLearningUnitState(nodeId, profile.id)),
        reviewDueAt: due.toISOString().slice(0, 10),
        updatedAt: new Date().toISOString(),
      },
    }));
  }, [firstFourComplete, nodeId, profile.id, setCollection, unit.reviewDueAt]);

  useEffect(() => {
    if (!mastered || academyState.completedNodeIds.includes(nodeId)) return;
    setAcademyState((current) => ({
      ...current,
      completedNodeIds: [...new Set([...current.completedNodeIds, nodeId])],
    }));
  }, [academyState.completedNodeIds, mastered, nodeId, setAcademyState]);

  if (!node || !discipline) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-5 text-foreground">
        <div className="max-w-lg border border-foreground/15 bg-card p-8">
          <h1 className="text-2xl font-medium">Unidade nao encontrada</h1>
          <Button asChild className="mt-6 rounded-none">
            <Link to="/legacy/academy">Voltar a Academia</Link>
          </Button>
        </div>
      </main>
    );
  }

  function generateQuestion() {
    setQuestion(generateLearningQuestion(template, unit));
    setAnswer("");
  }

  function saveAttempt() {
    if (!question || answer.trim().length < 30) return;
    updateUnit({
      attempts: [
        ...unit.attempts,
        {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `attempt-${Date.now()}`,
          question,
          answer: answer.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setQuestion("");
    setAnswer("");
  }

  function toggleMaterial(assetId: string) {
    const selected = unit.materialAssetIds.includes(assetId);
    const nextIds = selected
      ? unit.materialAssetIds.filter((id) => id !== assetId)
      : [...unit.materialAssetIds, assetId];
    updateUnit({
      materialAssetIds: nextIds,
      primaryAssetId:
        unit.primaryAssetId === assetId
          ? (nextIds[0] ?? "")
          : unit.primaryAssetId || nextIds[0] || "",
      materialStudied: selected && nextIds.length === 0 ? false : unit.materialStudied,
    });
  }

  async function openAsset(asset: VaultAsset, download = false) {
    const blob = await getVaultAssetBlob(asset.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    if (download) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = asset.name;
      anchor.click();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  const today = new Date().toISOString().slice(0, 10);
  const reviewAvailable = Boolean(unit.reviewDueAt && unit.reviewDueAt <= today);

  return (
    <main className="ambient-field min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div className="relative mx-auto w-full max-w-[1600px] px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full border border-foreground/15 bg-surface"
            >
              <Link to="/legacy/academy" aria-label="Voltar a Academia">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="truncate text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {discipline.name} / {node.subject}
              </div>
              <h1 className="serif mt-1 text-3xl leading-none md:text-5xl">{node.title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LearningProfileControl
              profiles={profiles}
              activeProfileId={profile.id}
              onSelect={onSelectProfile}
              onCreate={onCreateProfile}
              compact
            />
            <div className="flex border border-foreground/15 bg-surface p-1">
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
          </div>
        </header>

        <section className="mt-8 grid gap-6 border-y border-foreground/15 py-7 lg:grid-cols-[1fr_330px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="border border-foreground/15 px-3 py-1.5">
                {template.estimatedSessions} sessoes estimadas
              </span>
              <span>{objectives.length} objetivos</span>
              <span>{linkedAssets.length} materiais</span>
            </div>
            <p className="mt-5 max-w-4xl text-base leading-8 text-muted-foreground">
              {template.introduction}
            </p>
          </div>
          <MasteryMeter
            mastery={mastery}
            mastered={mastered}
            prerequisitesComplete={prerequisitesComplete}
          />
        </section>

        {!prerequisitesComplete && (
          <section className="mt-5 flex gap-4 border border-amber-300/25 bg-amber-300/[0.07] p-5">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <h2 className="text-sm font-medium">Estudo aberto, dominio bloqueado</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Voce pode preparar e estudar esta sala, mas ela so desbloqueia a arvore depois de
                dominar: {prerequisiteNodes.map((item) => item?.title).join(", ")}.
              </p>
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-8">
            <UnitSection icon={Target} eyebrow="Direcao" title="Objetivos e conexoes">
              {mode === "teach" ? (
                <label className="block">
                  <span className="text-sm font-medium">Objetivos, um por linha</span>
                  <Textarea
                    value={objectives.join("\n")}
                    onChange={(event) =>
                      updateUnit({
                        customObjectives: event.target.value
                          .split("\n")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-3 min-h-40 rounded-none bg-background/50"
                  />
                </label>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {objectives.map((objective, index) => (
                    <div
                      key={objective}
                      className="flex gap-3 border-l border-foreground/20 py-2 pl-4"
                    >
                      <span className="font-mono text-xs text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm leading-6">{objective}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                {template.relationships.map((id) => {
                  const related = ACADEMY_NODES.find((item) => item.id === id);
                  if (!related) return null;
                  return (
                    <Button
                      key={id}
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-none bg-surface"
                    >
                      <Link to="/legacy/academy/$nodeId" params={{ nodeId: id }}>
                        <Link2 className="h-3.5 w-3.5" />
                        {related.title}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </UnitSection>

            <UnitSection icon={BookOpen} eyebrow="Fonte" title="Materiais do Cofre">
              {mode === "teach" ? (
                <>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Vincule livros, PDFs, videos ou qualquer item do Cofre. Depois escolha a fonte
                    principal da unidade.
                  </p>
                  <div className="mt-5 max-h-72 overflow-y-auto border-y border-foreground/15">
                    {assetsLoading ? (
                      <div className="py-5 text-sm text-muted-foreground">Lendo o Cofre...</div>
                    ) : assets.length ? (
                      assets.map((asset) => {
                        const selected = unit.materialAssetIds.includes(asset.id);
                        return (
                          <label
                            key={asset.id}
                            className="flex cursor-pointer items-center gap-3 border-b border-foreground/10 py-3 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleMaterial(asset.id)}
                              className="h-4 w-4"
                            />
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="min-w-0 flex-1 truncate text-sm">{asset.name}</span>
                            <span className="text-xs uppercase text-muted-foreground">
                              {asset.kind}
                            </span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="py-5 text-sm text-muted-foreground">
                        O Cofre ainda nao possui materiais.
                      </div>
                    )}
                  </div>
                  {linkedAssets.length > 0 && (
                    <label className="mt-5 block">
                      <span className="text-sm font-medium">Material principal</span>
                      <select
                        value={primaryAsset?.id ?? ""}
                        onChange={(event) => updateUnit({ primaryAssetId: event.target.value })}
                        className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm"
                      >
                        {linkedAssets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              ) : primaryAsset ? (
                <div>
                  <div className="flex flex-col gap-5 border-y border-foreground/15 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Principal / {primaryAsset.kind}
                      </div>
                      <h3 className="mt-2 truncate text-lg font-medium">{primaryAsset.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {primaryAsset.description || primaryAsset.collection}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-none bg-surface"
                        onClick={() => void openAsset(primaryAsset)}
                        aria-label="Abrir material"
                        title="Abrir material"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-none bg-surface"
                        onClick={() => void openAsset(primaryAsset, true)}
                        aria-label="Baixar material"
                        title="Baixar material"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="mt-5 rounded-none"
                    variant={unit.materialStudied ? "secondary" : "default"}
                    onClick={() => updateUnit({ materialStudied: !unit.materialStudied })}
                  >
                    {unit.materialStudied ? <Check /> : <BookOpen />}
                    {unit.materialStudied ? "Estudo registrado" : "Registrar estudo do material"}
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="Nenhum material principal"
                  text="Entre no modo Lecionar para vincular um item do Cofre a esta unidade."
                />
              )}
            </UnitSection>

            <UnitSection
              icon={mode === "teach" ? Settings2 : MessageSquareText}
              eyebrow={mode === "teach" ? "Autoria" : "Elaboracao"}
              title={mode === "teach" ? "Explicacao para lecionar" : "Anotacao pessoal"}
            >
              {mode === "teach" ? (
                <Textarea
                  value={unit.teacherExplanation}
                  onChange={(event) => updateUnit({ teacherExplanation: event.target.value })}
                  placeholder="Construa aqui a explicacao, a sequencia da aula, analogias e pontos de atencao..."
                  className="min-h-64 rounded-none bg-background/50 leading-7"
                />
              ) : (
                <>
                  {unit.teacherExplanation && (
                    <div className="mb-6 border-l-2 border-primary/50 bg-primary/[0.06] p-5">
                      <div className="text-xs uppercase tracking-[0.16em] text-primary">
                        Explicacao preparada
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                        {unit.teacherExplanation}
                      </p>
                    </div>
                  )}
                  <Textarea
                    value={unit.note}
                    onChange={(event) => updateUnit({ note: event.target.value })}
                    placeholder="Explique o que compreendeu, registre duvidas, exemplos e conexoes..."
                    className="min-h-64 rounded-none bg-background/50 leading-7"
                  />
                  <div className="mt-2 text-right text-xs text-muted-foreground">
                    {unit.note.trim().length} caracteres
                  </div>
                </>
              )}
            </UnitSection>

            <UnitSection icon={BrainCircuit} eyebrow="Recuperacao ativa" title="Perguntas na hora">
              {mode === "teach" ? (
                <p className="text-sm leading-7 text-muted-foreground">
                  As perguntas nao ficam pre-montadas. O motor combina objetivos e historico de
                  tentativas para pedir explicacao, aplicacao, diagnostico, comparacao e conexao.
                </p>
              ) : (
                <>
                  {!question ? (
                    <Button className="rounded-none" onClick={generateQuestion}>
                      <Sparkles className="h-4 w-4" />
                      Gerar nova pergunta
                    </Button>
                  ) : (
                    <div className="border-l-2 border-primary/50 pl-5">
                      <p className="text-base leading-7">{question}</p>
                      <Textarea
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        placeholder="Responda com raciocinio, nao apenas com o resultado..."
                        className="mt-5 min-h-40 rounded-none bg-background/50 leading-7"
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          Minimo de 30 caracteres: {answer.trim().length}
                        </span>
                        <Button
                          className="rounded-none"
                          disabled={answer.trim().length < 30}
                          onClick={saveAttempt}
                        >
                          Registrar tentativa
                        </Button>
                      </div>
                    </div>
                  )}
                  {unit.attempts.length > 0 && (
                    <div className="mt-7 border-t border-foreground/15 pt-5">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Historico de tentativas
                      </div>
                      <div className="mt-4 space-y-4">
                        {[...unit.attempts].reverse().map((attempt) => (
                          <details key={attempt.id} className="border-l border-foreground/20 pl-4">
                            <summary className="cursor-pointer text-sm leading-6">
                              {attempt.question}
                            </summary>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                              {attempt.answer}
                            </p>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </UnitSection>

            <UnitSection icon={Sparkles} eyebrow="Aplicacao" title="Desafio ou projeto">
              {mode === "teach" ? (
                <Textarea
                  value={challengePrompt}
                  onChange={(event) => updateUnit({ challengePrompt: event.target.value })}
                  className="min-h-40 rounded-none bg-background/50 leading-7"
                />
              ) : (
                <>
                  <p className="border-l-2 border-accent/60 pl-5 text-base leading-8">
                    {challengePrompt}
                  </p>
                  <Textarea
                    value={unit.challengeEvidence}
                    onChange={(event) => updateUnit({ challengeEvidence: event.target.value })}
                    placeholder="Registre sua solucao, decisoes, links ou a localizacao do artefato produzido..."
                    className="mt-6 min-h-52 rounded-none bg-background/50 leading-7"
                  />
                  <div className="mt-2 text-right text-xs text-muted-foreground">
                    {unit.challengeEvidence.trim().length}/100 caracteres de evidencia
                  </div>
                </>
              )}
            </UnitSection>
          </div>

          <aside className="self-start xl:sticky xl:top-5">
            <section className="kos-panel p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Evidencias de dominio</h2>
              </div>
              <div className="mt-5 space-y-4">
                {evidence.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 border-b border-foreground/10 pb-4 last:border-0 last:pb-0"
                  >
                    {item.done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {unit.reviewDueAt && !unit.reviewCompletedAt && (
                <div className="mt-6 border-t border-foreground/15 pt-5">
                  <label className="block text-sm font-medium">
                    Data da revisao
                    <input
                      type="date"
                      value={unit.reviewDueAt}
                      onChange={(event) => updateUnit({ reviewDueAt: event.target.value })}
                      className="mt-2 h-11 w-full border border-input bg-background px-3"
                    />
                  </label>
                  <Button
                    className="mt-3 w-full rounded-none"
                    variant="outline"
                    disabled={!reviewAvailable}
                    onClick={() => updateUnit({ reviewCompletedAt: new Date().toISOString() })}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {reviewAvailable ? "Registrar revisao" : "Revisao ainda nao liberada"}
                  </Button>
                </div>
              )}
            </section>

            <section className="mt-5 border border-foreground/15 bg-card p-6">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Recompensa
                  </div>
                  <div className="mt-1 text-sm">{node.rewardLabel}</div>
                </div>
              </div>
              {mastered ? (
                linkedReward ? (
                  <Button
                    className="mt-5 w-full rounded-none"
                    onClick={() => void openAsset(linkedReward, true)}
                  >
                    <Download className="h-4 w-4" />
                    Abrir recompensa
                  </Button>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    Dominio alcancado. Nenhum arquivo de recompensa foi vinculado ainda.
                  </p>
                )
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <LockKeyhole className="h-4 w-4" />
                  Liberada com dominio completo
                </div>
              )}
            </section>

            <section className="mt-5 border-l border-foreground/15 pl-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Ultima atividade
              </div>
              <div className="mt-2 text-sm">
                {collection[nodeId]
                  ? new Date(unit.updatedAt).toLocaleString("pt-BR")
                  : "Unidade ainda nao iniciada"}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function UnitSection({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: typeof Target;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-y border-foreground/15 bg-card py-7 sm:px-7">
      <div className="flex items-center gap-3 text-primary">
        <Icon className="h-5 w-5" />
        <span className="text-[11px] uppercase tracking-[0.18em]">{eyebrow}</span>
      </div>
      <h2 className="mt-3 text-2xl font-medium">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MasteryMeter({
  mastery,
  mastered,
  prerequisitesComplete,
}: {
  mastery: number;
  mastered: boolean;
  prerequisitesComplete: boolean;
}) {
  return (
    <div className="border-l border-foreground/15 pl-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Dominio</div>
          <div className="serif mt-1 text-5xl tabular-nums">{mastery}%</div>
        </div>
        {mastered ? (
          <CheckCircle2 className="mb-2 h-7 w-7 text-emerald-400" />
        ) : prerequisitesComplete ? (
          <BrainCircuit className="mb-2 h-7 w-7 text-primary" />
        ) : (
          <LockKeyhole className="mb-2 h-7 w-7 text-amber-200" />
        )}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden bg-foreground/10">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${mastery}%` }} />
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        {mastered
          ? "Nucleo dominado e registrado na arvore"
          : prerequisitesComplete
            ? "Cada evidencia vale 20%"
            : "Evidencias podem avancar; desbloqueio aguarda pre-requisitos"}
      </div>
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
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-9 items-center gap-2 px-3 text-sm transition-colors ${
        selected ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-dashed border-foreground/20 px-5 py-7 text-center">
      <BookOpen className="mx-auto h-6 w-6 text-muted-foreground" />
      <div className="mt-3 text-sm font-medium">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
