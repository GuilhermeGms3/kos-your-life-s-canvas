import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CircleHelp,
  LibraryBig,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";

import {
  generateQuestionFromBook,
  generateQuestionFromNote,
  seedBooks,
  seedConcepts,
  seedGeneratedQuestions,
  seedNotes,
  type Book,
  type BookStatus,
  type Concept,
  type GeneratedQuestion,
  type Note,
} from "@/kos";
import { useKosLocalState } from "@/kos/use-kos-local-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Core · KOS" },
      {
        name: "description",
        content: "The first study workspace for notes, books, concepts, and generated questions.",
      },
    ],
  }),
  component: StudyCore,
});

const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  to_read: "Para ler",
  reading: "Lendo",
  paused: "Pausado",
  finished: "Concluido",
  abandoned: "Abandonado",
  reference: "Referencia",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function StudyCore() {
  const [notes, setNotes] = useKosLocalState<Note[]>("kos.study.notes", seedNotes);
  const [books, setBooks] = useKosLocalState<Book[]>("kos.study.books", seedBooks);
  const [concepts] = useKosLocalState<Concept[]>("kos.study.concepts", seedConcepts);
  const [questions, setQuestions] = useKosLocalState<GeneratedQuestion[]>(
    "kos.study.questions",
    seedGeneratedQuestions,
  );
  const [search, setSearch] = useState("");
  const [noteDraft, setNoteDraft] = useState({ title: "", content: "" });
  const [bookDraft, setBookDraft] = useState({ title: "", authors: "", categories: "" });
  const [activeSource, setActiveSource] = useState(seedNotes[0]?.id ?? "");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredNotes = useMemo(
    () =>
      notes.filter((note) =>
        `${note.title} ${note.content} ${note.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    [notes, normalizedSearch],
  );
  const filteredBooks = useMemo(
    () =>
      books.filter((book) =>
        `${book.title} ${book.authors.join(" ")} ${book.categories.join(" ")}`
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    [books, normalizedSearch],
  );

  const readingBooks = books.filter((book) => book.status === "reading");
  const latestQuestion = questions[0];

  function createNote() {
    const title = noteDraft.title.trim();
    const content = noteDraft.content.trim();
    if (!title || !content) return;

    const now = new Date().toISOString();
    const note: Note = {
      id: makeId("note"),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      tags: ["study-core"],
      linkedBookIds: [],
      linkedConceptIds: [],
      source: "Study Core",
    };

    setNotes([note, ...notes]);
    setActiveSource(note.id);
    setNoteDraft({ title: "", content: "" });
  }

  function createBook() {
    const title = bookDraft.title.trim();
    if (!title) return;

    const book: Book = {
      id: makeId("book"),
      title,
      authors: bookDraft.authors
        .split(",")
        .map((author) => author.trim())
        .filter(Boolean),
      status: "reading",
      categories: bookDraft.categories
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean),
      format: "unknown",
      owned: true,
    };

    setBooks([book, ...books]);
    setActiveSource(book.id);
    setBookDraft({ title: "", authors: "", categories: "" });
  }

  function generateQuestion() {
    const note = notes.find((item) => item.id === activeSource);
    const book = books.find((item) => item.id === activeSource);
    let question: GeneratedQuestion | undefined;
    if (note) question = generateQuestionFromNote(note);
    if (!question && book) question = generateQuestionFromBook(book);
    if (!question) return;

    setQuestions([question, ...questions]);
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_18%_8%,oklch(0.72_0.16_250_/_0.22),transparent_72%),radial-gradient(50%_50%_at_80%_20%,oklch(0.78_0.13_95_/_0.12),transparent_68%),linear-gradient(180deg,oklch(0.13_0.014_270),oklch(0.08_0.014_270))]" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(oklch(1_0_0_/_0.055)_1px,transparent_1px)] [background-size:4px_4px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-5 py-6 md:px-10 lg:px-12">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full border border-foreground/10 bg-foreground/[0.04]"
            >
              <Link to="/" aria-label="Voltar para o portal KOS">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                KOS · Study Core
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">Estudo vivo</h1>
            </div>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar notas, livros, conceitos..."
              aria-label="Buscar no Study Core"
              className="h-11 rounded-full border-foreground/10 bg-foreground/[0.04] pl-10"
            />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="min-h-[320px] overflow-hidden rounded-[28px] border border-foreground/10 bg-foreground/[0.045] p-6 shadow-[0_40px_120px_-70px_oklch(0_0_0)] backdrop-blur-xl md:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Primeiro nucleo funcional
                </div>
                <h2 className="serif mt-6 text-5xl leading-[0.92] md:text-7xl">
                  Guardar para lembrar.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                  Comece simples: escreva uma nota, registre um livro e gere perguntas a partir do
                  que voce acabou de colocar no KOS.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 md:w-[330px]">
                <Metric icon={NotebookPen} label="Notas" value={notes.length} />
                <Metric icon={LibraryBig} label="Livros" value={books.length} />
                <Metric icon={Brain} label="Conceitos" value={concepts.length} />
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <StudySignal
                title="Foco atual"
                value={readingBooks[0]?.title ?? "Sem livro em leitura"}
              />
              <StudySignal
                title="Ultima pergunta"
                value={latestQuestion?.question ?? "Gere a primeira pergunta"}
              />
              <StudySignal
                title="Proximo passo"
                value="Persistir fichamentos e sessoes de estudo"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-foreground/10 bg-foreground/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium">Perguntas rapidas</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Geradas a partir do material salvo.
                </p>
              </div>
              <Button onClick={generateQuestion} className="h-11 rounded-full">
                <CircleHelp className="h-4 w-4" />
                Gerar
              </Button>
            </div>

            <label className="mt-5 block text-sm text-muted-foreground" htmlFor="question-source">
              Fonte da pergunta
            </label>
            <select
              id="question-source"
              value={activeSource}
              onChange={(event) => setActiveSource(event.target.value)}
              className="mt-2 h-11 w-full rounded-full border border-foreground/10 bg-background/70 px-4 text-sm outline-none ring-offset-background focus:ring-1 focus:ring-ring"
            >
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  Nota · {note.title}
                </option>
              ))}
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  Livro · {book.title}
                </option>
              ))}
            </select>

            <div className="mt-5 space-y-3">
              {questions.slice(0, 4).map((question) => (
                <article
                  key={question.id}
                  className="rounded-2xl border border-foreground/10 bg-background/45 p-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {question.questionType.replace("_", " ")}
                  </div>
                  <p className="mt-2 text-sm leading-6">{question.question}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Composer
            title="Nova nota"
            icon={NotebookPen}
            primaryLabel="Salvar nota"
            onSubmit={createNote}
            disabled={!noteDraft.title.trim() || !noteDraft.content.trim()}
          >
            <Input
              value={noteDraft.title}
              onChange={(event) => setNoteDraft({ ...noteDraft, title: event.target.value })}
              placeholder="Titulo da nota"
              aria-label="Titulo da nota"
              className="h-11 bg-background/50"
            />
            <Textarea
              value={noteDraft.content}
              onChange={(event) => setNoteDraft({ ...noteDraft, content: event.target.value })}
              placeholder="Escreva o que voce quer lembrar, revisar ou conectar..."
              aria-label="Conteudo da nota"
              className="min-h-36 bg-background/50 text-base leading-7"
            />
          </Composer>

          <Composer
            title="Adicionar livro"
            icon={BookOpen}
            primaryLabel="Adicionar"
            onSubmit={createBook}
            disabled={!bookDraft.title.trim()}
          >
            <Input
              value={bookDraft.title}
              onChange={(event) => setBookDraft({ ...bookDraft, title: event.target.value })}
              placeholder="Titulo do livro"
              aria-label="Titulo do livro"
              className="h-11 bg-background/50"
            />
            <Input
              value={bookDraft.authors}
              onChange={(event) => setBookDraft({ ...bookDraft, authors: event.target.value })}
              placeholder="Autores separados por virgula"
              aria-label="Autores do livro"
              className="h-11 bg-background/50"
            />
            <Input
              value={bookDraft.categories}
              onChange={(event) => setBookDraft({ ...bookDraft, categories: event.target.value })}
              placeholder="Categorias separadas por virgula"
              aria-label="Categorias do livro"
              className="h-11 bg-background/50"
            />
          </Composer>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <LibraryPanel title="Notas recentes" icon={NotebookPen}>
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => setActiveSource(note.id)}
                className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.035] p-4 text-left transition-colors hover:bg-foreground/[0.07] focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-medium">{note.title}</h3>
                  <span className="text-[11px] text-muted-foreground">{note.tags[0]}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {note.content}
                </p>
              </button>
            ))}
          </LibraryPanel>

          <LibraryPanel title="Livros do nucleo" icon={LibraryBig}>
            {filteredBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => setActiveSource(book.id)}
                className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.035] p-4 text-left transition-colors hover:bg-foreground/[0.07] focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-medium">{book.title}</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                    {BOOK_STATUS_LABELS[book.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {book.authors.join(", ") || "Autor nao informado"}
                </p>
              </button>
            ))}
          </LibraryPanel>
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
      <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} />
      <div className="serif mt-6 text-4xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function StudySignal({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/35 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{title}</div>
      <p className="mt-2 line-clamp-2 text-sm leading-6">{value}</p>
    </div>
  );
}

function Composer({
  title,
  icon: Icon,
  children,
  primaryLabel,
  disabled,
  onSubmit,
}: {
  title: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
  primaryLabel: string;
  disabled: boolean;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-foreground/10 bg-foreground/[0.04] p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        <Button onClick={onSubmit} disabled={disabled} className="h-11 rounded-full">
          <Plus className="h-4 w-4" />
          {primaryLabel}
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function LibraryPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-foreground/10 bg-foreground/[0.04] p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} />
        <h2 className="text-lg font-medium">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
