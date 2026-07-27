import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookCheck,
  BookOpen,
  Cable,
  Check,
  ChevronRight,
  CircleX,
  Download,
  ExternalLink,
  FileSearch,
  HardDrive,
  LoaderCircle,
  RefreshCw,
  Send,
  Upload,
  WandSparkles,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { KosSystemNav } from "@/components/kos-system-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EMPTY_KINDLE_CHECKLIST,
  getVaultAssetBlob,
  inspectEpub,
  useVaultAssets,
  type KindleBookRecord,
  type KindleQualityChecklist,
  type VaultAsset,
} from "@/kos";
import { useKosLocalState } from "@/kos/use-kos-local-state";

export const Route = createFileRoute("/library/kindle")({
  head: () => ({
    meta: [
      { title: "Oficina Kindle - KOS" },
      {
        name: "description",
        content: "Organize, converta, valide e envie livros ao Kindle sem perder o controle.",
      },
    ],
  }),
  component: KindleWorkshop,
});

const BRIDGE_URL = "http://127.0.0.1:43117";
const SUPPORTED_EXTENSIONS = ["pdf", "doc", "docx", "odt", "rtf", "epub", "azw3", "mobi"];
const STATUS_LABELS = {
  inbox: "Entrada",
  converted: "Convertido",
  review: "Em revisao",
  approved: "Aprovado",
  sent: "No Kindle",
  issue: "Com problema",
} as const;

type BridgeStatus = {
  online: boolean;
  calibreFound: boolean;
  executable?: string;
};

type KosDirectoryHandle = {
  name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<KosDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<KosFileHandle>;
  values(): AsyncIterableIterator<KosDirectoryHandle | KosFileHandle>;
};

type KosFileHandle = {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{
    write(data: Blob): Promise<void>;
    close(): Promise<void>;
  }>;
};

function isRelevantBook(asset: VaultAsset) {
  return SUPPORTED_EXTENSIONS.includes(asset.extension);
}

function initialRecord(assetId: string): KindleBookRecord {
  return {
    assetId,
    status: "inbox",
    target: "epub",
    checklist: { ...EMPTY_KINDLE_CHECKLIST },
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function KindleWorkshop() {
  const { assets, addFiles } = useVaultAssets();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useKosLocalState<KindleBookRecord[]>(
    "kos.library.kindle.workflow",
    [],
  );
  const [selectedId, setSelectedId] = useState("");
  const [bridge, setBridge] = useState<BridgeStatus | null>(null);
  const [busy, setBusy] = useState<"upload" | "inspect" | "convert" | "send" | null>(null);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [kindleDirectory, setKindleDirectory] = useState<KosDirectoryHandle | null>(null);
  const [kindleFiles, setKindleFiles] = useState<string[]>([]);

  const books = useMemo(() => assets.filter(isRelevantBook), [assets]);
  const selected = books.find((asset) => asset.id === selectedId) ?? books[0];
  const record = selected
    ? (records.find((item) => item.assetId === selected.id) ?? initialRecord(selected.id))
    : null;
  const counts = useMemo(
    () =>
      records.reduce<Record<string, number>>((result, item) => {
        result[item.status] = (result[item.status] ?? 0) + 1;
        return result;
      }, {}),
    [records],
  );

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);

  async function checkBridge() {
    try {
      const response = await fetch(`${BRIDGE_URL}/health`);
      setBridge((await response.json()) as BridgeStatus);
    } catch {
      setBridge({ online: false, calibreFound: false });
    }
  }

  useEffect(() => {
    void checkBridge();
  }, []);

  function saveRecord(next: KindleBookRecord) {
    setRecords((current) => {
      const exists = current.some((item) => item.assetId === next.assetId);
      const stamped = { ...next, updatedAt: new Date().toISOString() };
      return exists
        ? current.map((item) => (item.assetId === next.assetId ? stamped : item))
        : [...current, stamped];
    });
  }

  async function uploadBooks(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setBusy("upload");
    setMessage("");
    try {
      const added = await addFiles(files, {
        pillarId: "knowledge",
        collection: "Kindle / Entrada",
        tags: ["kindle", "triagem"],
      });
      setRecords((current) => [
        ...current,
        ...added
          .map((asset) => initialRecord(asset.id))
          .filter((candidate) => !current.some((item) => item.assetId === candidate.assetId)),
      ]);
      setSelectedId(added[0]?.id ?? "");
      setMessage(`${added.length} arquivo(s) recolhido(s) da area de trabalho.`);
      event.target.value = "";
    } finally {
      setBusy(null);
    }
  }

  async function inspectSelected() {
    if (!selected || selected.extension !== "epub" || !record) return;
    setBusy("inspect");
    setMessage("");
    try {
      const inspection = await inspectEpub(await getVaultAssetBlob(selected.id));
      saveRecord({
        ...record,
        status: inspection.verdict === "fail" ? "issue" : "review",
        inspection,
        checklist: {
          ...record.checklist,
          textReadable: inspection.textCharacters >= 1000,
          navigationWorks: inspection.hasNavigation,
        },
      });
      setMessage(
        inspection.verdict === "fail"
          ? "A inspecao encontrou sinais de uma conversao quebrada."
          : "Estrutura e texto do EPUB foram inspecionados.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function convertSelected(target: "epub" | "azw3") {
    if (!selected || !record) return;
    setBusy("convert");
    setMessage("");
    try {
      const blob = await getVaultAssetBlob(selected.id);
      const form = new FormData();
      form.append("file", new File([blob], selected.name, { type: selected.mimeType }));
      form.append("target", target);
      form.append("title", title);
      form.append("author", author);
      const response = await fetch(`${BRIDGE_URL}/convert`, { method: "POST", body: form });
      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "O Calibre nao conseguiu converter este livro.");
      }
      const outputName = decodeURIComponent(
        response.headers.get("X-KOS-Filename") ?? `${selected.name}.${target}`,
      );
      const outputBlob = await response.blob();
      const [converted] = await addFiles(
        [
          new File([outputBlob], outputName, {
            type: target === "epub" ? "application/epub+zip" : "application/octet-stream",
          }),
        ],
        {
          pillarId: "knowledge",
          collection: "Kindle / Convertidos",
          tags: ["kindle", "calibre", "aguardando-revisao"],
        },
      );
      let inspection;
      if (target === "epub") inspection = await inspectEpub(outputBlob);
      saveRecord({
        ...initialRecord(converted.id),
        sourceAssetId: selected.id,
        target,
        status:
          inspection?.verdict === "fail" ? "issue" : target === "epub" ? "review" : "converted",
        inspection,
        checklist: {
          ...EMPTY_KINDLE_CHECKLIST,
          textReadable: Boolean(inspection && inspection.textCharacters >= 1000),
          navigationWorks: Boolean(inspection?.hasNavigation),
        },
      });
      setSelectedId(converted.id);
      setMessage(`${outputName} foi criado e guardado no Cofre.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "A conversao falhou.");
    } finally {
      setBusy(null);
    }
  }

  function updateChecklist(key: keyof KindleQualityChecklist, checked: boolean) {
    if (!record) return;
    const checklist = { ...record.checklist, [key]: checked };
    const approved =
      checklist.textReadable &&
      checklist.navigationWorks &&
      checklist.imagesAcceptable &&
      checklist.formattingAcceptable;
    saveRecord({
      ...record,
      checklist,
      status: approved && record.status !== "sent" ? "approved" : record.status,
    });
  }

  async function connectKindle() {
    const picker = (
      window as Window & {
        showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<KosDirectoryHandle>;
      }
    ).showDirectoryPicker;
    if (!picker) {
      setMessage("Este navegador nao permite conectar pastas. Use Chrome ou Edge no computador.");
      return;
    }
    try {
      const chosen = await picker({ mode: "readwrite" });
      let documents = chosen;
      if (chosen.name.toLowerCase() !== "documents") {
        documents = await chosen.getDirectoryHandle("documents");
      }
      setKindleDirectory(documents);
      await refreshKindleFiles(documents);
      setMessage(`Kindle conectado: pasta ${documents.name}.`);
    } catch {
      setMessage("A conexao foi cancelada ou a pasta documents nao foi encontrada.");
    }
  }

  async function refreshKindleFiles(directory = kindleDirectory) {
    if (!directory) return;
    const names: string[] = [];
    for await (const entry of directory.values()) {
      if ("kind" in entry && entry.kind === "file") names.push(entry.name);
    }
    setKindleFiles(names.sort((a, b) => a.localeCompare(b)));
  }

  async function sendToKindleUsb() {
    if (!selected || !record || !kindleDirectory) return;
    if (!["azw3", "mobi", "pdf"].includes(selected.extension)) {
      setMessage("Para USB direto, gere AZW3. EPUB deve passar pelo Send to Kindle.");
      return;
    }
    setBusy("send");
    try {
      const fileHandle = await kindleDirectory.getFileHandle(selected.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(await getVaultAssetBlob(selected.id));
      await writable.close();
      await refreshKindleFiles();
      saveRecord({
        ...record,
        status: "sent",
        sentAt: new Date().toISOString(),
      });
      setMessage(`${selected.name} foi copiado para o Kindle.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Nao foi possivel escrever no Kindle.");
    } finally {
      setBusy(null);
    }
  }

  async function downloadSelected() {
    if (!selected) return;
    const url = URL.createObjectURL(await getVaultAssetBlob(selected.id));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = selected.name;
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
              <Link to="/vault" aria-label="Voltar ao Cofre">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                KOS / Biblioteca / Dispositivo
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">Oficina Kindle</h1>
            </div>
          </div>
          <KosSystemNav active="vault" />
        </header>

        <section className="mt-9 grid border-y border-foreground/15 md:grid-cols-4">
          {[
            ["01", "Recolher", "PDF, Word ou EPUB"],
            ["02", "Converter", "Calibre 64 local"],
            ["03", "Validar", "Texto, indice e formato"],
            ["04", "Enviar", "Kindle ou Amazon"],
          ].map(([number, label, detail]) => (
            <div
              key={number}
              className="border-foreground/15 px-5 py-5 md:border-r last:border-r-0"
            >
              <div className="text-xs text-accent">{number}</div>
              <div className="mt-2 text-base font-medium">{label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{detail}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)_360px]">
          <aside className="kos-panel min-w-0">
            <div className="border-b border-foreground/15 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Fila de trabalho
                  </div>
                  <div className="mt-1 text-sm">
                    {books.length} arquivos / {counts.issue ?? 0} com problema
                  </div>
                </div>
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => uploadRef.current?.click()}
                  aria-label="Adicionar livros"
                >
                  {busy === "upload" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={uploadRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.odt,.rtf,.epub,.azw3,.mobi"
                  multiple
                  className="hidden"
                  onChange={uploadBooks}
                />
              </div>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {books.length === 0 ? (
                <div className="p-7 text-sm leading-6 text-muted-foreground">
                  Recolha os livros soltos. Cada arquivo passara a ter estado, revisao e destino.
                </div>
              ) : (
                books.map((asset) => {
                  const item = records.find((candidate) => candidate.assetId === asset.id);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedId(asset.id)}
                      className={`grid w-full grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-foreground/10 p-4 text-left transition-colors ${
                        selected?.id === asset.id ? "bg-surface-elevated" : "hover:bg-surface"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center border border-foreground/15 bg-card">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{asset.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {STATUS_LABELS[item?.status ?? "inbox"]} / {asset.extension.toUpperCase()}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            {!selected || !record ? (
              <div className="kos-panel flex min-h-[560px] items-center justify-center p-8 text-center">
                <div>
                  <BookOpen className="mx-auto h-8 w-8 text-accent" />
                  <h2 className="mt-5 text-2xl font-light">Nenhum livro na bancada</h2>
                  <Button className="mt-6 rounded-full" onClick={() => uploadRef.current?.click()}>
                    Recolher arquivos
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <article className="kos-panel p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-[0.2em] text-accent">
                        {STATUS_LABELS[record.status]}
                      </div>
                      <h2 className="mt-3 break-words text-2xl font-light md:text-4xl">
                        {selected.name}
                      </h2>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {selected.extension.toUpperCase()} / {selected.collection}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full bg-surface"
                      onClick={() => void downloadSelected()}
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <label>
                      <span className="text-sm">Titulo para conversao</span>
                      <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder={selected.name.replace(/\.[^.]+$/, "")}
                        className="mt-2 h-12 bg-surface"
                      />
                    </label>
                    <label>
                      <span className="text-sm">Autor</span>
                      <Input
                        value={author}
                        onChange={(event) => setAuthor(event.target.value)}
                        placeholder="Autor do livro"
                        className="mt-2 h-12 bg-surface"
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-foreground/15 pt-6">
                    {selected.extension === "epub" && (
                      <Button
                        className="rounded-full"
                        onClick={() => void inspectSelected()}
                        disabled={busy !== null}
                      >
                        <FileSearch className="h-4 w-4" />
                        Inspecionar EPUB
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="rounded-full bg-surface"
                      onClick={() => void convertSelected("epub")}
                      disabled={!bridge?.calibreFound || busy !== null}
                    >
                      <WandSparkles className="h-4 w-4" />
                      Gerar EPUB
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full bg-surface"
                      onClick={() => void convertSelected("azw3")}
                      disabled={!bridge?.calibreFound || busy !== null}
                    >
                      <WandSparkles className="h-4 w-4" />
                      Gerar AZW3 para USB
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => saveRecord({ ...record, status: "issue" })}
                    >
                      <CircleX className="h-4 w-4" />
                      Marcar problema
                    </Button>
                  </div>
                </article>

                <article className="kos-panel p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <BookCheck className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-medium">Controle de qualidade</h2>
                  </div>

                  {record.inspection ? (
                    <div
                      className={`mt-6 border-l-2 p-5 ${
                        record.inspection.verdict === "pass"
                          ? "border-emerald-400 bg-emerald-400/10"
                          : record.inspection.verdict === "warning"
                            ? "border-amber-300 bg-amber-300/10"
                            : "border-destructive bg-destructive/10"
                      }`}
                    >
                      <div className="grid gap-4 sm:grid-cols-4">
                        <Metric
                          label="Palavras"
                          value={formatNumber(record.inspection.wordCount)}
                        />
                        <Metric
                          label="Caracteres"
                          value={formatNumber(record.inspection.textCharacters)}
                        />
                        <Metric label="Capitulos" value={String(record.inspection.documentCount)} />
                        <Metric label="Imagens" value={String(record.inspection.imageCount)} />
                      </div>
                      <div className="mt-5 space-y-2 text-sm leading-6">
                        {record.inspection.findings.map((finding) => (
                          <div key={finding} className="flex gap-2">
                            {record.inspection?.verdict === "pass" ? (
                              <Check className="mt-1 h-4 w-4 shrink-0" />
                            ) : (
                              <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
                            )}
                            {finding}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 border border-dashed border-foreground/20 p-5 text-sm text-muted-foreground">
                      A inspecao automatica esta disponivel para EPUB. PDF e Word precisam primeiro
                      passar pela conversao.
                    </div>
                  )}

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        ["textReadable", "O texto esta presente e selecionavel"],
                        ["navigationWorks", "O indice abre os capitulos corretos"],
                        ["imagesAcceptable", "Capas e imagens estao legiveis"],
                        ["formattingAcceptable", "Paragrafos e titulos estao normais"],
                        ["testedOnKindle", "Abri e folheei no Paperwhite"],
                      ] as [keyof KindleQualityChecklist, string][]
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex min-h-12 cursor-pointer items-center gap-3 border border-foreground/15 bg-surface px-4 py-3"
                      >
                        <input
                          type="checkbox"
                          checked={record.checklist[key]}
                          onChange={(event) => updateChecklist(key, event.target.checked)}
                          className="h-4 w-4 accent-[var(--glow)]"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </article>
              </>
            )}
          </div>

          <aside className="space-y-6">
            <div className="kos-panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Calibre Desktop
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        bridge?.calibreFound ? "bg-emerald-400" : "bg-amber-300"
                      }`}
                    />
                    {bridge?.calibreFound ? "Conversor encontrado" : "Bridge local desligado"}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-11 w-11 rounded-full"
                  onClick={() => void checkBridge()}
                  aria-label="Verificar Calibre"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {!bridge?.calibreFound && (
                <div className="mt-4 border-l-2 border-amber-300 bg-amber-300/10 p-4 text-sm leading-6">
                  Rode <code className="text-foreground">npm run calibre:bridge</code> para permitir
                  conversoes pelo Calibre 64 instalado.
                </div>
              )}
            </div>

            <div className="kos-panel p-5">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-accent" />
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Kindle USB
                  </div>
                  <div className="mt-1 text-sm">
                    {kindleDirectory
                      ? `${kindleFiles.length} arquivos encontrados`
                      : "Desconectado"}
                  </div>
                </div>
              </div>
              <Button className="mt-5 w-full rounded-full" onClick={() => void connectKindle()}>
                <Cable className="h-4 w-4" />
                {kindleDirectory ? "Reconectar pasta" : "Conectar Kindle"}
              </Button>
              {selected && (
                <Button
                  variant="outline"
                  className="mt-3 w-full rounded-full bg-surface"
                  disabled={!kindleDirectory || busy !== null}
                  onClick={() => void sendToKindleUsb()}
                >
                  <Send className="h-4 w-4" />
                  Copiar para documents
                </Button>
              )}
              {kindleFiles.length > 0 && (
                <div className="mt-5 max-h-44 space-y-2 overflow-y-auto border-t border-foreground/15 pt-4">
                  {kindleFiles.slice(0, 30).map((name) => (
                    <div key={name} className="truncate text-xs text-muted-foreground">
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="kos-panel p-5">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-accent" />
                <div className="text-sm font-medium">Enviar EPUB pela Amazon</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Para EPUB, use o Send to Kindle. A Amazon processa o arquivo para leitura no
                Paperwhite.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-full bg-surface">
                <a href="https://www.amazon.com/sendtokindle" target="_blank" rel="noreferrer">
                  Abrir Send to Kindle
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </aside>
        </section>

        {message && (
          <div
            aria-live="polite"
            className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,620px)] -translate-x-1/2 border border-foreground/20 bg-popover px-5 py-4 text-sm shadow-2xl"
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-light">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
    </div>
  );
}
