import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clapperboard,
  Clock3,
  FileVideo,
  Pause,
  Play,
  Plus,
  Upload,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { KosSystemNav } from "@/components/kos-system-nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getVaultAssetBlob,
  useVaultAssets,
  type VaultAsset,
  type VideoAnnotation,
  type VideoProgress,
} from "@/kos";
import { useKosLocalState } from "@/kos/use-kos-local-state";

export const Route = createFileRoute("/study_/media")({
  head: () => ({
    meta: [
      { title: "Estudio de Video - KOS" },
      {
        name: "description",
        content: "Estudo de videos locais com retomada e anotacoes temporais.",
      },
    ],
  }),
  component: MediaStudio,
});

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function MediaStudio() {
  const { assets, loading, addFiles } = useVaultAssets();
  const videoAssets = useMemo(() => assets.filter((asset) => asset.kind === "video"), [assets]);
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedSecond = useRef(-1);
  const [selectedId, setSelectedId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [annotationDraft, setAnnotationDraft] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [annotations, setAnnotations] = useKosLocalState<VideoAnnotation[]>(
    "kos.study.media.annotations",
    [],
  );
  const [progress, setProgress] = useKosLocalState<VideoProgress[]>("kos.study.media.progress", []);

  const selected = videoAssets.find((asset) => asset.id === selectedId) ?? videoAssets[0];
  const selectedAnnotations = annotations
    .filter((annotation) => annotation.assetId === selected?.id)
    .sort((a, b) => a.time - b.time);
  const savedProgress = progress.find((item) => item.assetId === selected?.id);

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);

  useEffect(() => {
    if (!selected) {
      setVideoUrl("");
      return;
    }

    let objectUrl = "";
    void getVaultAssetBlob(selected.id).then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      setVideoUrl(objectUrl);
    });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setVideoUrl("");
    };
  }, [selected]);

  async function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("video/"),
    );
    if (!files.length) return;
    const added = await addFiles(files, {
      pillarId: "knowledge",
      collection: "Videos de estudo",
      tags: ["video", "estudo"],
    });
    setSelectedId(added[0]?.id ?? "");
    event.target.value = "";
  }

  function saveProgress(time: number, total: number) {
    if (!selected) return;
    const next: VideoProgress = {
      assetId: selected.id,
      currentTime: time,
      duration: total,
      updatedAt: new Date().toISOString(),
    };
    setProgress([next, ...progress.filter((item) => item.assetId !== selected.id)]);
  }

  function addAnnotation() {
    const text = annotationDraft.trim();
    if (!text || !selected) return;
    const annotation: VideoAnnotation = {
      id: `annotation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      assetId: selected.id,
      time: videoRef.current?.currentTime ?? currentTime,
      text,
      createdAt: new Date().toISOString(),
    };
    setAnnotations([...annotations, annotation]);
    setAnnotationDraft("");
  }

  function seekTo(time: number) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    videoRef.current.pause();
    setCurrentTime(time);
  }

  function togglePlayback() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <MediaAmbient />
      <div className="relative mx-auto w-full max-w-[1720px] px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.05]"
            >
              <Link to="/study" aria-label="Voltar ao Study Core">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                KOS / Study Core
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">Estudio de Video</h1>
            </div>
          </div>
          <KosSystemNav active="media" />
        </header>

        <section className="mt-8 flex flex-col gap-4 border-y border-foreground/10 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Retomar atividade
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Videos do Cofre, progresso local e um sumario temporal construido por voce.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={uploadRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => uploadRef.current?.click()}
              className="h-11 rounded-full border-foreground/10 bg-foreground/[0.04]"
            >
              <Upload className="h-4 w-4" />
              Adicionar video
            </Button>
            <Button asChild variant="ghost" className="h-11 rounded-full">
              <Link to="/vault">Abrir Cofre</Link>
            </Button>
          </div>
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <div className="aspect-video overflow-hidden border border-foreground/10 bg-black">
              {selected && videoUrl ? (
                <video
                  ref={videoRef}
                  key={selected.id}
                  src={videoUrl}
                  controls
                  className="h-full w-full object-contain"
                  onLoadedMetadata={(event) => {
                    const total = event.currentTarget.duration;
                    setDuration(total);
                    if (savedProgress?.currentTime) {
                      event.currentTarget.currentTime = Math.min(
                        savedProgress.currentTime,
                        Math.max(total - 1, 0),
                      );
                      setCurrentTime(event.currentTarget.currentTime);
                    }
                  }}
                  onTimeUpdate={(event) => {
                    const time = event.currentTarget.currentTime;
                    const second = Math.floor(time);
                    setCurrentTime(time);
                    if (second % 5 === 0 && second !== lastSavedSecond.current) {
                      lastSavedSecond.current = second;
                      saveProgress(time, event.currentTarget.duration);
                    }
                  }}
                  onPlay={() => setPlaying(true)}
                  onPause={(event) => {
                    setPlaying(false);
                    saveProgress(event.currentTarget.currentTime, event.currentTarget.duration);
                  }}
                  onEnded={(event) => {
                    setPlaying(false);
                    saveProgress(event.currentTarget.duration, event.currentTarget.duration);
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <FileVideo className="h-10 w-10 text-muted-foreground" strokeWidth={1.4} />
                  <h2 className="mt-5 text-xl font-medium">Nenhum video no Cofre</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Adicione um arquivo de video para iniciar uma sessao com anotacoes temporais.
                  </p>
                </div>
              )}
            </div>

            {selected && (
              <>
                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {selected.collection}
                    </div>
                    <h2 className="mt-2 text-2xl font-medium">{selected.name}</h2>
                    <div className="mt-2 flex gap-3 text-xs tabular-nums text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>/</span>
                      <span>{formatTime(duration)}</span>
                      {savedProgress && <span>retomada salva</span>}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={togglePlayback}
                    variant="outline"
                    className="h-11 rounded-full"
                  >
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {playing ? "Pausar" : "Reproduzir"}
                  </Button>
                </div>

                <section className="mt-7 border-y border-foreground/10 py-6">
                  <label className="block">
                    <span className="text-sm font-medium">
                      Anotacao em {formatTime(currentTime)}
                    </span>
                    <Textarea
                      value={annotationDraft}
                      onChange={(event) => setAnnotationDraft(event.target.value)}
                      placeholder="O que aconteceu neste ponto? Qual conceito, duvida ou conexao apareceu?"
                      className="mt-3 min-h-28 bg-background/45 text-base leading-7"
                    />
                  </label>
                  <Button
                    type="button"
                    onClick={addAnnotation}
                    disabled={!annotationDraft.trim()}
                    className="mt-4 h-11 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                    Fixar no tempo
                  </Button>
                </section>
              </>
            )}

            <section className="mt-7">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Videos no Cofre
              </div>
              {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Carregando videos...</p>
              ) : (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-4">
                  {videoAssets.map((asset) => (
                    <VideoTile
                      key={asset.id}
                      asset={asset}
                      selected={asset.id === selected?.id}
                      onSelect={() => setSelectedId(asset.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="border-t border-foreground/10 pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Sumario vivo
                </div>
                <h2 className="mt-2 text-xl font-medium">Linha de anotacoes</h2>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {selectedAnnotations.length} pontos
              </span>
            </div>

            {selectedAnnotations.length ? (
              <div className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10">
                {selectedAnnotations.map((annotation, index) => (
                  <button
                    key={annotation.id}
                    type="button"
                    onClick={() => seekTo(annotation.time)}
                    className="grid w-full grid-cols-[64px_1fr] gap-4 py-5 text-left transition-colors hover:bg-foreground/[0.035] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs tabular-nums text-primary">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatTime(annotation.time)}
                      </div>
                      <div className="mt-2 text-[10px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{annotation.text}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 border-y border-foreground/10 py-10">
                <Clapperboard className="h-7 w-7 text-muted-foreground" />
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Pause em um ponto importante e fixe sua primeira anotacao temporal.
                </p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function VideoTile({
  asset,
  selected,
  onSelect,
}: {
  asset: VaultAsset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-28 w-56 shrink-0 flex-col justify-between rounded-[20px] border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
        selected ? "border-primary/45 bg-primary/10" : "border-foreground/10 bg-foreground/[0.035]"
      }`}
    >
      <FileVideo className="h-5 w-5" />
      <div>
        <div className="line-clamp-1 text-sm font-medium">{asset.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">{asset.collection}</div>
      </div>
    </button>
  );
}

function MediaAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(64%_54%_at_14%_8%,oklch(0.65_0.16_28_/_0.16),transparent_72%),radial-gradient(48%_46%_at_88%_18%,oklch(0.68_0.14_250_/_0.12),transparent_72%),linear-gradient(180deg,oklch(0.14_0.014_270),oklch(0.075_0.012_270)_82%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(oklch(1_0_0_/_0.045)_1px,transparent_1px)] [background-size:4px_4px]" />
    </div>
  );
}
