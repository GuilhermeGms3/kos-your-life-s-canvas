import type { PillarId } from "./types";

export type PillarRoom = {
  pillarId: PillarId;
  roomName: string;
  routeLabel: string;
  thesis: string;
  atmosphere: string;
  firstActions: string[];
  futureSystems: string[];
};

export const PILLAR_ROOMS: PillarRoom[] = [
  {
    pillarId: "knowledge",
    roomName: "Study Core",
    routeLabel: "Entrar no Study Core",
    thesis: "Transformar leitura, notas e conceitos em aprendizado revisavel.",
    atmosphere: "Camara silenciosa, azul fria, voltada para foco e recordacao ativa.",
    firstActions: ["Criar nota", "Adicionar livro", "Gerar perguntas", "Conectar conceitos"],
    futureSystems: ["PDF/EPUB reader", "Fichamentos", "Busca semantica", "Trilhas de estudo"],
  },
  {
    pillarId: "experience",
    roomName: "Experience Atlas",
    routeLabel: "Abrir atlas",
    thesis: "Guardar mundos vividos: jogos, filmes, series, viagens, shows e momentos.",
    atmosphere: "Galeria sensorial, com memorias e midias orbitando como lugares visitados.",
    firstActions: ["Registrar jogo", "Registrar filme/serie", "Salvar momento", "Marcar conquista"],
    futureSystems: [
      "Catalogo de jogos",
      "Watch history",
      "Diario de viagens",
      "Galeria de capturas",
    ],
  },
  {
    pillarId: "creation",
    roomName: "Creation Forge",
    routeLabel: "Abrir forja",
    thesis: "Reunir tudo que voce cria: textos, codigo, ideias, musica, arte e experimentos.",
    atmosphere: "Oficina luminosa, com projetos em movimento e ideias em estado bruto.",
    firstActions: ["Capturar ideia", "Abrir projeto", "Registrar experimento", "Guardar rascunho"],
    futureSystems: ["Projetos", "Journaling criativo", "Repositorios", "Banco de ideias"],
  },
  {
    pillarId: "memory",
    roomName: "Memory Vault",
    routeLabel: "Abrir cofre",
    thesis: "Preservar continuidade pessoal: diario, pessoas, familia, momentos e linha do tempo.",
    atmosphere: "Arquivo intimo e noturno, com luz baixa e sensacao de tempo preservado.",
    firstActions: ["Escrever diario", "Fixar momento", "Registrar pessoa", "Criar evento"],
    futureSystems: ["Linha do tempo", "Diario privado", "Mapa de pessoas", "Arquivo familiar"],
  },
  {
    pillarId: "discovery",
    roomName: "Discovery Engine",
    routeLabel: "Abrir motor",
    thesis: "Revelar conexoes entre livros, jogos, memorias, projetos, conceitos e padroes.",
    atmosphere: "Observatorio de relacoes, com linhas, ecos e sugestoes surgindo no escuro.",
    firstActions: ["Ver conexoes", "Revisar padroes", "Aceitar ponte", "Explorar insight"],
    futureSystems: ["Grafo", "Backlinks", "Sugestoes", "Busca por relacao"],
  },
  {
    pillarId: "legacy",
    roomName: "Legacy Archive",
    routeLabel: "Abrir arquivo",
    thesis: "Destilar principios, ensinamentos e sabedoria que merecem atravessar o tempo.",
    atmosphere: "Arquivo profundo, estavel, quase cerimonial, feito para o que permanece.",
    firstActions: ["Guardar principio", "Escrever ensinamento", "Curar colecao", "Preparar trilha"],
    futureSystems: ["Cartas futuras", "Trilhas para filhos", "Principios", "Colecoes curadas"],
  },
];

export function getPillarRoom(pillarId: PillarId) {
  return PILLAR_ROOMS.find((room) => room.pillarId === pillarId);
}
