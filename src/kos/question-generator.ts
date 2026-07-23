import type { Book, GeneratedQuestion, Note } from "./types";

const REVIEW_STARTERS = [
  "Explique com suas palavras",
  "O que voce lembraria daqui a uma semana sobre",
  "Qual e a ideia mais importante escondida em",
];

const CONNECTION_STARTERS = [
  "Com qual outro tema do KOS isso se conecta",
  "Que ponte voce faria entre isso e sua vida pratica",
  "Que outro livro, memoria ou projeto conversa com",
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function pick(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateQuestionFromNote(note: Note): GeneratedQuestion {
  const starter = Math.random() > 0.45 ? pick(REVIEW_STARTERS) : pick(CONNECTION_STARTERS);

  return {
    id: makeId("question"),
    promptSourceType: "note",
    promptSourceId: note.id,
    question: `${starter} "${note.title}"?`,
    questionType:
      starter.includes("conecta") || starter.includes("ponte") || starter.includes("conversa")
        ? "connection"
        : "review",
    createdAt: new Date().toISOString(),
  };
}

export function generateQuestionFromBook(book: Book): GeneratedQuestion {
  const author = book.authors[0] ? ` de ${book.authors[0]}` : "";

  return {
    id: makeId("question"),
    promptSourceType: "book",
    promptSourceId: book.id,
    question: `Que pergunta voce faria para testar se realmente entendeu "${book.title}"${author}?`,
    questionType: "comprehension",
    createdAt: new Date().toISOString(),
  };
}
