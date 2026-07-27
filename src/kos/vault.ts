import type { PillarId } from "./types";

export type VaultFileKind = "book" | "document" | "video" | "audio" | "image" | "archive" | "other";

export type VaultAsset = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  extension: string;
  kind: VaultFileKind;
  pillarId: PillarId;
  collection: string;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type VaultAssetInput = {
  pillarId: PillarId;
  collection: string;
  tags?: string[];
};

export type VideoAnnotation = {
  id: string;
  assetId: string;
  time: number;
  text: string;
  createdAt: string;
};

export type VideoProgress = {
  assetId: string;
  currentTime: number;
  duration: number;
  updatedAt: string;
};

export type AcademyState = {
  completedNodeIds: string[];
  rewardAssetIds: Record<string, string>;
};

export type AcademyNode = {
  id: string;
  disciplineId: string;
  subject: string;
  title: string;
  summary: string;
  level: number;
  prerequisites: string[];
  rewardType: "arquivo" | "aula" | "jogo" | "episodio" | "lembrete";
  rewardLabel: string;
  x: number;
  y: number;
  color: string;
};

export type AcademyDiscipline = {
  id: string;
  name: string;
  area: string;
  summary: string;
  color: string;
  nodes: AcademyNode[];
};
