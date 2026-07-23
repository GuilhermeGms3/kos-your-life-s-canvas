import type { Book, Concept, GeneratedQuestion, Note, ReadingNote, StudySession } from "./types";

export const seedNotes: Note[] = [
  {
    id: "note-study-core-001",
    title: "O KOS deve ensinar, nao apenas guardar",
    content:
      "A primeira versao precisa ajudar a estudar de verdade: registrar, revisar, perguntar e conectar. Guardar sem retornar aprendizado vira arquivo morto.",
    createdAt: "2026-07-23T19:00:00.000Z",
    updatedAt: "2026-07-23T19:00:00.000Z",
    tags: ["kos", "study-core", "visao"],
    linkedBookIds: [],
    linkedConceptIds: ["concept-second-brain", "concept-active-recall"],
    source: "Fase 0",
  },
];

export const seedBooks: Book[] = [
  {
    id: "book-order-of-time",
    title: "The Order of Time",
    authors: ["Carlo Rovelli"],
    status: "reading",
    categories: ["fisica", "tempo", "filosofia"],
    format: "physical",
    owned: true,
    notes: "Livro semente para testar fichamentos, conceitos e perguntas.",
  },
];

export const seedReadingNotes: ReadingNote[] = [
  {
    id: "reading-note-time-001",
    bookId: "book-order-of-time",
    title: "Tempo como experiencia e nao apenas medida",
    summary:
      "A leitura pode conectar fisica, memoria e percepcao. O KOS deve ser capaz de aproximar essas areas.",
    keyIdeas: ["tempo", "percepcao", "memoria", "fisica"],
    quotes: [],
    reflections: ["O mesmo conceito pode viver em ciencia, filosofia e experiencia pessoal."],
    linkedConceptIds: ["concept-time", "concept-memory"],
    createdAt: "2026-07-23T19:00:00.000Z",
    updatedAt: "2026-07-23T19:00:00.000Z",
  },
];

export const seedConcepts: Concept[] = [
  {
    id: "concept-second-brain",
    name: "Segundo cerebro",
    description: "Sistema externo para guardar, recuperar e conectar conhecimento pessoal.",
    aliases: ["second brain", "cerebro externo"],
    tags: ["kos", "organizacao", "conhecimento"],
    linkedNoteIds: ["note-study-core-001"],
    linkedBookIds: [],
    relatedConceptIds: ["concept-active-recall"],
  },
  {
    id: "concept-active-recall",
    name: "Recordacao ativa",
    description: "Tecnica de estudo baseada em tentar lembrar antes de rever a resposta.",
    aliases: ["active recall"],
    tags: ["estudo", "memoria"],
    linkedNoteIds: ["note-study-core-001"],
    linkedBookIds: [],
    relatedConceptIds: ["concept-second-brain"],
  },
  {
    id: "concept-time",
    name: "Tempo",
    description: "Conceito fisico, filosofico e experiencial que conecta estudo e memoria.",
    aliases: [],
    tags: ["fisica", "filosofia"],
    linkedNoteIds: [],
    linkedBookIds: ["book-order-of-time"],
    relatedConceptIds: ["concept-memory"],
  },
  {
    id: "concept-memory",
    name: "Memoria",
    description: "Continuidade pessoal preservada em notas, experiencias e relacoes.",
    aliases: [],
    tags: ["identidade", "estudo"],
    linkedNoteIds: [],
    linkedBookIds: ["book-order-of-time"],
    relatedConceptIds: ["concept-time"],
  },
];

export const seedStudySessions: StudySession[] = [
  {
    id: "session-kos-001",
    title: "Definir o nucleo de estudo do KOS",
    targetType: "free",
    startedAt: "2026-07-23T19:00:00.000Z",
    notesCreated: ["note-study-core-001"],
    summary: "A Fase 1 deve priorizar estudo, notas, livros e perguntas.",
    nextSteps: ["Criar notas persistidas", "Criar catalogo de livros", "Gerar perguntas rapidas"],
  },
];

export const seedGeneratedQuestions: GeneratedQuestion[] = [
  {
    id: "question-study-core-001",
    promptSourceType: "note",
    promptSourceId: "note-study-core-001",
    question: "Como o KOS pode transformar uma nota salva em aprendizado revisavel?",
    questionType: "open_reflection",
    createdAt: "2026-07-23T19:00:00.000Z",
  },
];
