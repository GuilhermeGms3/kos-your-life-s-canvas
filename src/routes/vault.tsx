import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowLeft,
  BookMarked,
  BookOpen,
  Download,
  File,
  FileText,
  Film,
  Image,
  Music,
  Package,
  Save,
  Search,
  Upload,
} from "lucide-react";
import type { ComponentType, ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { KosSystemNav } from "@/components/kos-system-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getVaultAssetBlob,
  PILLARS,
  useVaultAssets,
  type PillarId,
  type VaultAsset,
  type VaultFileKind,
} from "@/kos";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Cofre de Arquivos - KOS" },
      {
        name: "description",
        content: "Arquivo local para livros, documentos, videos, audio e outros materiais do KOS.",
      },
    ],
  }),
  component: FileVault,
});

const KIND_LABELS: Record<"all" | VaultFileKind, string> = {
  all: "Tudo",
  book: "Livros",
  document: "Documentos",
  video: "Videos",
  audio: "Audio",
  image: "Imagens",
  archive: "Pacotes",
  other: "Outros",
};

const KIND_ICONS: Record<VaultFileKind, ComponentType<{ className?: string }>> = {
  book: BookOpen,
  document: FileText,
  video: Film,
  audio: Music,
  image: Image,
  archive: Package,
  other: File,
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function FileVault() {
  const { assets, loading, error, addFiles, updateAsset } = useVaultAssets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeKind, setActiveKind] = useState<"all" | VaultFileKind>("all");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadPillar, setUploadPillar] = useState<PillarId>("knowledge");
  const [uploadCollection, setUploadCollection] = useState("Entrada");
  const [uploadTags, setUploadTags] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [editDraft, setEditDraft] = useState({
    collection: "",
    tags: "",
    description: "",
    pillarId: "knowledge" as PillarId,
  });

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const kindMatches = activeKind === "all" || asset.kind === activeKind;
      const searchMatches =
        !query ||
        `${asset.name} ${asset.collection} ${asset.tags.join(" ")} ${asset.description}`
          .toLowerCase()
          .includes(query);
      return kindMatches && searchMatches;
    });
  }, [activeKind, assets, search]);

  const selected =
    assets.find((asset) => asset.id === selectedId) ?? filteredAssets[0] ?? assets[0];

  useEffect(() => {
    if (!selected) return;
    setSelectedId(selected.id);
    setEditDraft({
      collection: selected.collection,
      tags: selected.tags.join(", "),
      description: selected.description,
      pillarId: selected.pillarId,
    });
  }, [selected]);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    try {
      const tags = parseTags(uploadTags);
      await addFiles(files, {
        pillarId: uploadPillar,
        collection: uploadCollection,
        tags,
      });
      setUploadTags("");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function saveMetadata() {
    if (!selected) return;
    await updateAsset({
      ...selected,
      collection: editDraft.collection.trim() || "Entrada",
      tags: parseTags(editDraft.tags),
      description: editDraft.description.trim(),
      pillarId: editDraft.pillarId,
    });
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <VaultAmbient />
      <div className="relative mx-auto w-full max-w-[1720px] px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.05]"
            >
              <Link to="/" aria-label="Voltar ao inicio">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                KOS / Arquivo local
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">Cofre de Arquivos</h1>
            </div>
          </div>
          <div className="flex flex-col gap-3 xl:items-end">
            <KosSystemNav active="vault" />
            <Button
              asChild
              variant="outline"
              className="self-start rounded-full bg-surface xl:self-end"
            >
              <Link to="/library/kindle">
                <BookMarked className="h-4 w-4" />
                Oficina Kindle
              </Link>
            </Button>
          </div>
        </header>

        <section className="mt-9 grid gap-6 border-y border-foreground/10 py-6 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Destino do proximo upload
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium">Pilar</span>
                <select
                  value={uploadPillar}
                  onChange={(event) => setUploadPillar(event.target.value as PillarId)}
                  className="mt-2 h-12 w-full rounded-md border border-input bg-background/45 px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PILLARS.map((pillar) => (
                    <option key={pillar.id} value={pillar.id} className="bg-background">
                      {pillar.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-medium">Colecao</span>
                <Input
                  value={uploadCollection}
                  onChange={(event) => setUploadCollection(event.target.value)}
                  className="mt-2 h-12 bg-background/45 text-base"
                />
              </label>
            </div>
          </div>
          <label>
            <span className="text-sm font-medium">Tags iniciais</span>
            <Input
              value={uploadTags}
              onChange={(event) => setUploadTags(event.target.value)}
              placeholder="estudo, fisica, referencia"
              className="mt-2 h-12 bg-background/45 text-base"
            />
          </label>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-12 w-full rounded-full px-6 xl:w-auto"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Guardando..." : "Adicionar arquivos"}
            </Button>
          </div>
        </section>

        <section className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label="Tipos de arquivo"
          >
            {Object.entries(KIND_LABELS).map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                onClick={() => setActiveKind(kind as "all" | VaultFileKind)}
                aria-pressed={activeKind === kind}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  activeKind === kind
                    ? "border-primary/40 bg-primary/15"
                    : "border-foreground/10 bg-foreground/[0.035] text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar nome, colecao ou tag..."
              aria-label="Buscar no Cofre"
              className="h-12 rounded-full bg-background/45 pl-11 text-base"
            />
          </div>
        </section>

        <section className="mt-7 grid gap-6 pb-16 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Acervo
                </div>
                <h2 className="mt-2 text-xl font-medium">{KIND_LABELS[activeKind]}</h2>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">
                {filteredAssets.length} arquivos
              </span>
            </div>

            {error && (
              <p role="alert" className="mt-6 text-sm text-destructive">
                {error}
              </p>
            )}
            {loading ? (
              <p className="py-12 text-sm text-muted-foreground">Abrindo o Cofre...</p>
            ) : filteredAssets.length ? (
              <div className="divide-y divide-foreground/10">
                {filteredAssets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    selected={asset.id === selected?.id}
                    onSelect={() => setSelectedId(asset.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14">
                <Archive className="h-8 w-8 text-muted-foreground" strokeWidth={1.4} />
                <h2 className="mt-5 text-xl font-medium">Este espaco ainda esta vazio</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Adicione PDFs, ebooks, videos, imagens, audio ou qualquer outro arquivo.
                </p>
              </div>
            )}
          </div>

          <aside className="border-t border-foreground/10 pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            {selected ? (
              <>
                <AssetPreview asset={selected} />
                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium">Pilar</span>
                    <select
                      value={editDraft.pillarId}
                      onChange={(event) =>
                        setEditDraft({ ...editDraft, pillarId: event.target.value as PillarId })
                      }
                      className="mt-2 h-12 w-full rounded-md border border-input bg-foreground/[0.04] px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PILLARS.map((pillar) => (
                        <option key={pillar.id} value={pillar.id} className="bg-background">
                          {pillar.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Colecao</span>
                    <Input
                      value={editDraft.collection}
                      onChange={(event) =>
                        setEditDraft({ ...editDraft, collection: event.target.value })
                      }
                      className="mt-2 h-12 bg-foreground/[0.04] text-base"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Tags</span>
                    <Input
                      value={editDraft.tags}
                      onChange={(event) => setEditDraft({ ...editDraft, tags: event.target.value })}
                      className="mt-2 h-12 bg-foreground/[0.04] text-base"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Descricao</span>
                    <Textarea
                      value={editDraft.description}
                      onChange={(event) =>
                        setEditDraft({ ...editDraft, description: event.target.value })
                      }
                      className="mt-2 min-h-28 bg-foreground/[0.04] text-base leading-7"
                    />
                  </label>
                  <Button onClick={() => void saveMetadata()} className="h-12 w-full rounded-full">
                    <Save className="h-4 w-4" />
                    Salvar organizacao
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecione um arquivo para ver detalhes.
              </p>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function AssetRow({
  asset,
  selected,
  onSelect,
}: {
  asset: VaultAsset;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = KIND_ICONS[asset.kind];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid min-h-20 w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 px-2 py-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring ${
        selected ? "bg-foreground/[0.08]" : "hover:bg-foreground/[0.035]"
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.05]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{asset.name}</div>
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {asset.collection} / {asset.tags.join(", ") || "sem tags"}
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        <div>{KIND_LABELS[asset.kind]}</div>
        <div className="mt-1 tabular-nums">{formatBytes(asset.size)}</div>
      </div>
    </button>
  );
}

function AssetPreview({ asset }: { asset: VaultAsset }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";
    void getVaultAssetBlob(asset.id).then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl("");
    };
  }, [asset.id]);

  const download = () => {
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = asset.name;
    anchor.click();
  };

  return (
    <section aria-label={`Visualizacao de ${asset.name}`}>
      <div className="aspect-video overflow-hidden rounded-[24px] border border-foreground/10 bg-foreground/[0.035]">
        {!url ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Preparando arquivo...
          </div>
        ) : asset.kind === "image" ? (
          <img
            src={url}
            alt={asset.description || asset.name}
            className="h-full w-full object-contain"
          />
        ) : asset.kind === "video" ? (
          <video src={url} controls className="h-full w-full bg-black object-contain" />
        ) : asset.kind === "audio" ? (
          <div className="flex h-full items-center px-6">
            <audio src={url} controls className="w-full" />
          </div>
        ) : asset.mimeType === "application/pdf" ? (
          <iframe src={url} title={asset.name} className="h-full w-full" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <File className="h-8 w-8 text-muted-foreground" />
            <p className="mt-4 line-clamp-2 text-sm">{asset.name}</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {KIND_LABELS[asset.kind]} / {formatBytes(asset.size)}
          </div>
          <h2 className="mt-2 text-lg font-medium">{asset.name}</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={download}
          disabled={!url}
          aria-label={`Baixar ${asset.name}`}
          className="h-11 w-11 shrink-0 rounded-full"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

function VaultAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_14%_8%,oklch(0.62_0.12_205_/_0.18),transparent_72%),radial-gradient(52%_48%_at_90%_20%,oklch(0.72_0.1_105_/_0.1),transparent_70%),linear-gradient(180deg,oklch(0.14_0.014_270),oklch(0.075_0.012_270)_82%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(oklch(1_0_0_/_0.045)_1px,transparent_1px)] [background-size:4px_4px]" />
      <div className="absolute left-1/2 top-[22%] h-[52rem] w-[52rem] -translate-x-1/2 rounded-full border border-foreground/[0.035]" />
    </div>
  );
}
