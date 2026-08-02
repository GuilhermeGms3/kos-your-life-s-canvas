import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  DatabaseBackup,
  Download,
  FileArchive,
  HardDrive,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { KosSystemNav } from "@/components/kos-system-nav";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createKosBackup, inspectKosBackup, restoreKosBackup, type KosBackupSummary } from "@/kos";

export const Route = createFileRoute("/system/backup")({
  head: () => ({
    meta: [
      { title: "Backup e restauracao - KOS" },
      {
        name: "description",
        content: "Exporte e restaure os estados e arquivos locais do KOS.",
      },
    ],
  }),
  component: BackupRoom,
});

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function backupFileName() {
  return `kos-backup-${new Date().toISOString().slice(0, 10)}.kos.zip`;
}

function BackupRoom() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "inspect" | "restore" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<KosBackupSummary | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function exportBackup() {
    setBusy("export");
    setError("");
    setMessage("");
    try {
      const blob = await createKosBackup();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = backupFileName();
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("Pacote criado. Guarde uma copia fora deste computador quando puder.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel criar o backup.");
    } finally {
      setBusy(null);
    }
  }

  async function selectBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSummary(null);
    setConfirmed(false);
    setError("");
    setMessage("");
    if (!file) return;

    setBusy("inspect");
    try {
      setSummary(await inspectKosBackup(file));
    } catch (cause) {
      setSelectedFile(null);
      setError(cause instanceof Error ? cause.message : "O arquivo nao pode ser inspecionado.");
    } finally {
      setBusy(null);
    }
  }

  async function restoreBackup() {
    if (!selectedFile || !summary || !confirmed) return;
    setBusy("restore");
    setError("");
    try {
      await restoreKosBackup(selectedFile);
      setMessage("Restauracao concluida. Recarregando o KOS...");
      window.setTimeout(() => window.location.assign("/"), 800);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel restaurar o backup.");
      setBusy(null);
    }
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_10%,rgba(44,124,255,0.13),transparent_32%)]" />
      <div className="relative mx-auto w-full max-w-[1500px] px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.05]"
            >
              <Link to="/vault" aria-label="Voltar ao Cofre">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                KOS / Integridade
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">Backup e restauracao</h1>
            </div>
          </div>
          <KosSystemNav active="vault" />
        </header>

        <section className="mt-10 grid border-y border-foreground/10 lg:grid-cols-2">
          <article className="py-8 lg:border-r lg:border-foreground/10 lg:pr-10">
            <div className="flex items-center gap-3 text-primary">
              <DatabaseBackup className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Saida segura</span>
            </div>
            <h2 className="mt-5 text-3xl font-medium">Empacotar o KOS inteiro</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              O pacote inclui notas, progresso, configuracoes, perfis e todos os arquivos binarios
              guardados no Cofre. Ele pode crescer conforme sua biblioteca cresce.
            </p>
            <Button
              size="lg"
              className="mt-7 min-h-12 rounded-none px-6"
              disabled={busy !== null}
              onClick={() => void exportBackup()}
            >
              <Download className="h-4 w-4" />
              {busy === "export" ? "Montando pacote..." : "Exportar pacote KOS"}
            </Button>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <BackupFact icon={ShieldCheck} label="Estados" value="localStorage KOS" />
              <BackupFact icon={HardDrive} label="Arquivos" value="IndexedDB" />
              <BackupFact icon={FileArchive} label="Formato" value=".kos.zip" />
            </div>
          </article>

          <article className="py-8 lg:pl-10">
            <div className="flex items-center gap-3 text-primary">
              <ArchiveRestore className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                Entrada controlada
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-medium">Restaurar um pacote</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              O pacote e verificado antes da restauracao. Ao confirmar, o estado e o Cofre atuais
              serao substituidos pelo conteudo escolhido.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".zip,.kos"
              className="hidden"
              onChange={(event) => void selectBackup(event)}
            />
            <Button
              variant="outline"
              size="lg"
              className="mt-7 min-h-12 rounded-none bg-surface px-6"
              disabled={busy !== null}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {busy === "inspect" ? "Verificando..." : "Escolher pacote"}
            </Button>

            {summary ? (
              <div className="mt-7 border border-foreground/15 bg-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{selectedFile?.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Exportado em {new Date(summary.exportedAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 border-y border-foreground/10 py-4 text-sm">
                  <div>
                    <strong className="block text-xl">{summary.assetCount}</strong> arquivos
                  </div>
                  <div>
                    <strong className="block text-xl">{summary.stateCount}</strong> estados
                  </div>
                  <div>
                    <strong className="block text-xl">{formatBytes(summary.totalBytes)}</strong>{" "}
                    originais
                  </div>
                </div>
                <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6">
                  <Checkbox
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked === true)}
                    className="mt-1"
                  />
                  <span>Entendo que os dados KOS atuais serao substituidos por este pacote.</span>
                </label>
                <Button
                  variant="destructive"
                  className="mt-5 min-h-11 w-full rounded-none"
                  disabled={!confirmed || busy !== null}
                  onClick={() => void restoreBackup()}
                >
                  <ArchiveRestore className="h-4 w-4" />
                  {busy === "restore" ? "Restaurando..." : "Restaurar e substituir"}
                </Button>
              </div>
            ) : null}
          </article>
        </section>

        {(message || error) && (
          <div
            role="status"
            className={`mt-6 border px-5 py-4 text-sm ${
              error
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
            }`}
          >
            {error || message}
          </div>
        )}

        <p className="mt-8 max-w-3xl text-xs leading-6 text-muted-foreground">
          O backup protege a instalacao deste navegador. Ate o NAS entrar em cena, mantenha copias
          periodicas em outro disco ou servico confiavel; o navegador sozinho nao e um arquivo
          permanente.
        </p>
      </div>
    </main>
  );
}

function BackupFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="border-l border-foreground/15 pl-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
