import { useCallback, useEffect, useState } from "react";

import type { VaultAsset, VaultAssetInput, VaultFileKind } from "./vault";

const DB_NAME = "kos-vault";
const DB_VERSION = 1;
const ASSET_STORE = "assets";
const BLOB_STORE = "blobs";

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
  });
}

function openVaultDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Este navegador nao oferece armazenamento IndexedDB."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(ASSET_STORE)) {
        const assets = database.createObjectStore(ASSET_STORE, { keyPath: "id" });
        assets.createIndex("kind", "kind");
        assets.createIndex("pillarId", "pillarId");
        assets.createIndex("createdAt", "createdAt");
      }
      if (!database.objectStoreNames.contains(BLOB_STORE)) {
        database.createObjectStore(BLOB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Nao foi possivel abrir o Cofre."));
  });
}

function extensionOf(name: string) {
  const extension = name.includes(".") ? name.split(".").pop() : "";
  return extension?.toLowerCase() ?? "";
}

export function inferVaultKind(file: Pick<File, "name" | "type">): VaultFileKind {
  const extension = extensionOf(file.name);
  if (["epub", "mobi", "azw", "azw3"].includes(extension)) return "book";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("image/")) return "image";
  if (
    file.type === "application/pdf" ||
    file.type.startsWith("text/") ||
    ["doc", "docx", "odt", "rtf", "md", "txt", "csv"].includes(extension)
  ) {
    return "document";
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) return "archive";
  return "other";
}

export async function listVaultAssets() {
  const database = await openVaultDatabase();
  try {
    const transaction = database.transaction(ASSET_STORE, "readonly");
    const assets = await requestResult(
      transaction.objectStore(ASSET_STORE).getAll() as IDBRequest<VaultAsset[]>,
    );
    return assets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } finally {
    database.close();
  }
}

export async function addVaultFiles(files: File[], input: VaultAssetInput) {
  const database = await openVaultDatabase();
  const transaction = database.transaction([ASSET_STORE, BLOB_STORE], "readwrite");
  const assetStore = transaction.objectStore(ASSET_STORE);
  const blobStore = transaction.objectStore(BLOB_STORE);
  const now = new Date().toISOString();
  const assets: VaultAsset[] = [];

  for (const file of files) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const asset: VaultAsset = {
      id,
      name: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      extension: extensionOf(file.name),
      kind: inferVaultKind(file),
      pillarId: input.pillarId,
      collection: input.collection.trim() || "Entrada",
      tags: input.tags ?? [],
      description: "",
      createdAt: now,
      updatedAt: now,
    };

    assetStore.put(asset);
    blobStore.put(file, id);
    assets.push(asset);
  }

  await transactionDone(transaction);
  database.close();
  return assets;
}

export async function updateVaultAsset(asset: VaultAsset) {
  const database = await openVaultDatabase();
  try {
    const transaction = database.transaction(ASSET_STORE, "readwrite");
    transaction.objectStore(ASSET_STORE).put({
      ...asset,
      updatedAt: new Date().toISOString(),
    });
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

export async function getVaultAssetBlob(id: string) {
  const database = await openVaultDatabase();
  try {
    const transaction = database.transaction(BLOB_STORE, "readonly");
    return await requestResult(transaction.objectStore(BLOB_STORE).get(id) as IDBRequest<Blob>);
  } finally {
    database.close();
  }
}

export function useVaultAssets() {
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setAssets(await listVaultAssets());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel carregar o Cofre.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addFiles = useCallback(
    async (files: File[], input: VaultAssetInput) => {
      const added = await addVaultFiles(files, input);
      await reload();
      return added;
    },
    [reload],
  );

  const updateAsset = useCallback(
    async (asset: VaultAsset) => {
      await updateVaultAsset(asset);
      await reload();
    },
    [reload],
  );

  return { assets, loading, error, addFiles, updateAsset, reload };
}
