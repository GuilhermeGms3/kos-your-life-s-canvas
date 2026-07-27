import type { PillarId } from "./types";

export type PillarCaptureCopy = {
  eyebrow: string;
  action: string;
  titleLabel: string;
  titlePlaceholder: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  defaultKind: string;
};

export const PILLAR_CAPTURE_COPY: Record<PillarId, PillarCaptureCopy> = {
  knowledge: {
    eyebrow: "Captura de conhecimento",
    action: "Registrar conhecimento",
    titleLabel: "Titulo",
    titlePlaceholder: "O que voce aprendeu?",
    detailsLabel: "Nota",
    detailsPlaceholder: "Registre a ideia com suas proprias palavras.",
    defaultKind: "KNOWLEDGE",
  },
  experience: {
    eyebrow: "Captura de experiencia",
    action: "Registrar experiencia",
    titleLabel: "Experiencia",
    titlePlaceholder: "Jogo, filme, viagem ou momento",
    detailsLabel: "Impressao",
    detailsPlaceholder: "O que aconteceu e o que ficou com voce?",
    defaultKind: "EXPERIENCE",
  },
  creation: {
    eyebrow: "Captura criativa",
    action: "Capturar criacao",
    titleLabel: "Ideia ou projeto",
    titlePlaceholder: "O que esta nascendo?",
    detailsLabel: "Estado atual",
    detailsPlaceholder: "Descreva a ideia, o rascunho ou o proximo gesto.",
    defaultKind: "CREATION",
  },
  memory: {
    eyebrow: "Captura de memoria",
    action: "Preservar memoria",
    titleLabel: "Memoria",
    titlePlaceholder: "O que merece ser lembrado?",
    detailsLabel: "Relato",
    detailsPlaceholder: "Pessoas, lugar, contexto e por que isso importa.",
    defaultKind: "MEMORY",
  },
  discovery: {
    eyebrow: "Captura de descoberta",
    action: "Registrar descoberta",
    titleLabel: "Conexao ou padrao",
    titlePlaceholder: "O que se conectou?",
    detailsLabel: "Hipotese",
    detailsPlaceholder: "Explique a relacao e onde ela apareceu.",
    defaultKind: "DISCOVERY",
  },
  legacy: {
    eyebrow: "Captura de legado",
    action: "Guardar ensinamento",
    titleLabel: "Principio ou ensinamento",
    titlePlaceholder: "O que deve atravessar o tempo?",
    detailsLabel: "Contexto",
    detailsPlaceholder: "Explique o principio e quando ele deve ser lembrado.",
    defaultKind: "LEGACY",
  },
};
