import JSZip from "jszip";

import type { VaultAsset } from "./vault";
import { getVaultAssetBlob, listVaultAssets, replaceVaultContents } from "./vault-store";

const BACKUP_FORMAT = "kos-backup";
const BACKUP_VERSION = 1;
const KOS_STORAGE_PREFIX = "kos.";

export type KosBackupManifest = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  localStorage: Record<string, string>;
  assets: VaultAsset[];
  files: Record<string, string>;
};

export type KosBackupSummary = {
  exportedAt: string;
  assetCount: number;
  stateCount: number;
  totalBytes: number;
};

function collectKosLocalStorage() {
  const entries: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(KOS_STORAGE_PREFIX)) continue;
    const value = localStorage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return entries;
}

function isVaultAsset(value: unknown): value is VaultAsset {
  if (!value || typeof value !== "object") return false;
  const asset = value as Partial<VaultAsset>;
  return (
    typeof asset.id === "string" &&
    typeof asset.name === "string" &&
    typeof asset.size === "number" &&
    typeof asset.mimeType === "string" &&
    typeof asset.kind === "string" &&
    typeof asset.pillarId === "string" &&
    Array.isArray(asset.tags)
  );
}

function validateManifest(value: unknown): KosBackupManifest {
  if (!value || typeof value !== "object") {
    throw new Error("O manifesto do backup nao e valido.");
  }

  const manifest = value as Partial<KosBackupManifest>;
  if (
    manifest.format !== BACKUP_FORMAT ||
    manifest.version !== BACKUP_VERSION ||
    typeof manifest.exportedAt !== "string" ||
    !manifest.localStorage ||
    typeof manifest.localStorage !== "object" ||
    !Array.isArray(manifest.assets) ||
    !manifest.assets.every(isVaultAsset) ||
    !manifest.files ||
    typeof manifest.files !== "object"
  ) {
    throw new Error("Este arquivo nao e um backup KOS compativel.");
  }

  for (const key of Object.keys(manifest.localStorage)) {
    if (!key.startsWith(KOS_STORAGE_PREFIX)) {
      throw new Error(`O manifesto contem uma chave de armazenamento nao permitida: ${key}`);
    }
  }

  return manifest as KosBackupManifest;
}

async function readBackup(file: Blob) {
  const zip = await JSZip.loadAsync(file);
  const manifestEntry = zip.file("manifest.json");
  if (!manifestEntry) throw new Error("O pacote nao possui manifest.json.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(await manifestEntry.async("string"));
  } catch {
    throw new Error("O manifesto do backup esta corrompido.");
  }

  return { zip, manifest: validateManifest(parsed) };
}

export async function createKosBackup() {
  const assets = await listVaultAssets();
  const zip = new JSZip();
  const files: Record<string, string> = {};

  for (const asset of assets) {
    const blob = await getVaultAssetBlob(asset.id);
    if (!blob) throw new Error(`Nao foi possivel ler "${asset.name}" no Cofre.`);
    const path = `vault/${asset.id}.blob`;
    files[asset.id] = path;
    zip.file(path, blob);
  }

  const manifest: KosBackupManifest = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    localStorage: collectKosLocalStorage(),
    assets,
    files,
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export async function inspectKosBackup(file: Blob): Promise<KosBackupSummary> {
  const { manifest } = await readBackup(file);
  return {
    exportedAt: manifest.exportedAt,
    assetCount: manifest.assets.length,
    stateCount: Object.keys(manifest.localStorage).length,
    totalBytes: manifest.assets.reduce((total, asset) => total + asset.size, 0),
  };
}

export async function restoreKosBackup(file: Blob) {
  const { zip, manifest } = await readBackup(file);
  const blobs = new Map<string, Blob>();

  for (const asset of manifest.assets) {
    const path = manifest.files[asset.id];
    const entry = path ? zip.file(path) : null;
    if (!entry) throw new Error(`O pacote nao contem o arquivo "${asset.name}".`);
    const bytes = await entry.async("arraybuffer");
    blobs.set(asset.id, new Blob([bytes], { type: asset.mimeType }));
  }

  await replaceVaultContents(manifest.assets, blobs);

  const currentKosKeys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(KOS_STORAGE_PREFIX)) currentKosKeys.push(key);
  }
  currentKosKeys.forEach((key) => localStorage.removeItem(key));
  Object.entries(manifest.localStorage).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });

  return {
    assetCount: manifest.assets.length,
    stateCount: Object.keys(manifest.localStorage).length,
  };
}
