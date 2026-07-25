import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CalendarClock,
  CircleHelp,
  Edit3,
  LibraryBig,
  NotebookPen,
  Plus,
  Save,
  Search,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Core · KOS" },
      {
        name: "description",
        content: "A PS5-inspired study chamber for notes, books, concepts, and active recall.",
      },
    ],
  }),
  component: StudyCore,
});

type StudyMode = "chamber" | "library" | "forge";
type ComposerMode = "note" | "book" | "edit-note" | null;
type FocusItem =
  | {
      type: "note";
      id: string;
      title: string;
      subtitle: string;
      body: string;
      meta: string;
      details: string[];
    }
  | {
      type: "book";
      id: string;
      title: string;
      subtitle: string;
      body: string;
      meta: string;
      details: string[];
    };

const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  to_read: "Para ler",
  reading: "Lendo",
  paused: "Pausado",
  finished: "Concluido",
  abandoned: "Abandonado",
  reference: "Referencia",
};

const MODES: Array<{
  id: StudyMode;
  label: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  ambient: string;
}> = [
  {
    id: "chamber",
    label: "Study Chamber",
    title: "Camara de estudo",
    subtitle: "Notas, leitura e foco imediato.",
    icon: NotebookPen,
    ambient: "oklch(0.72 0.15 250)",
  },
  {
    id: "library",
    label: "Library Orbit",
    title: "Orbita da biblioteca",
    subtitle: "Livros, acervo e materiais em circulacao.",
    icon: LibraryBig,
    ambient: "oklch(0.78 0.12 110)",
  },
  {
    id: "forge",
    label: "Question Forge",
    title: "Forja de perguntas",
    subtitle: "Transforme conteudo salvo em recordacao ativa.",
    icon: CircleHelp,
    ambient: "oklch(0.72 0.2 320)",
  },
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatShortDate(value?: string) {
  if (!value) return "sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function StudyCore() {
  const [notes, setNotes] = useKosLocalState<Note[]>("kos.study.notes", seedNotes);
  const [books, setBooks] = useKosLocalState<Book[]>("kos.study.books", seedBooks);
  const [concepts] = useKosLocalState<Concept[]>("kos.study.concepts", seedConcepts);
  const [questions, setQuestions] = useKosLocalState<GeneratedQuestion[]>(
    "kos.study.questions",
    seedGeneratedQuestions,
  );
  const [mode, setMode] = useState<StudyMode>("chamber");
  const [composer, setComposer] = useState<ComposerMode>(null);
  const [search, setSearch] = useState("");
  const [noteDraft, setNoteDraft] = useState({ title: "", content: "", tags: "" });
  const [editNoteDraft, setEditNoteDraft] = useState({
    id: "",
    title: "",
    content: "",
    tags: "",
  });
  const [bookDraft, setBookDraft] = useState({ title: "", authors: "", categories: "" });
  const [activeSource, setActiveSource] = useState(seedNotes[0]?.id ?? "");

  const currentMode = MODES.find((item) => item.id === mode) ?? MODES[0];
  const normalizedSearch = search.trim().toLowerCase();

  const focusItems = useMemo(() => {
    const noteItems: FocusItem[] = notes.map((note) => ({
      type: "note",
      id: note.id,
      title: note.title,
      subtitle: note.source ?? "Study Core",
      body: note.content,
      meta: `${note.tags.length} tags · ${note.linkedConceptIds.length} conceitos`,
      details: [
        `Criada ${formatShortDate(note.createdAt)}`,
        `Atualizada ${formatShortDate(note.updatedAt)}`,
        note.tags.length ? `Tags: ${note.tags.join(", ")}` : "Sem tags",
      ],
    }));
    const bookItems: FocusItem[] = books.map((book) => ({
      type: "book",
      id: book.id,
      title: book.title,
      subtitle: book.authors.join(", ") || "Autor nao informado",
      body: book.notes ?? `Status: ${BOOK_STATUS_LABELS[book.status]}`,
      meta: `${BOOK_STATUS_LABELS[book.status]} · ${book.categories.join(", ") || "sem categoria"}`,
      details: [
        BOOK_STATUS_LABELS[book.status],
        book.format.toUpperCase(),
        book.categories.length ? `Categorias: ${book.categories.join(", ")}` : "Sem categoria",
      ],
    }));

    const sourceItems =
      mode === "chamber"
        ? [...noteItems, ...bookItems]
        : mode === "library"
          ? bookItems
          : [...noteItems, ...bookItems];

    if (!normalizedSearch) return sourceItems;
    return sourceItems.filter((item) =>
      `${item.title} ${item.subtitle} ${item.body} ${item.meta}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [books, mode, normalizedSearch, notes]);

  const activeItem = focusItems.find((item) => item.id === activeSource) ?? focusItems[0];
  const activeIndex = activeItem ? focusItems.findIndex((item) => item.id === activeItem.id) : -1;
  const latestQuestion = questions[0];
  const readingBooks = books.filter((book) => book.status === "reading");
  const activeNote =
    activeItem?.type === "note" ? notes.find((note) => note.id === activeItem.id) : undefined;

  useEffect(() => {
    if (focusItems.length > 0 && !focusItems.some((item) => item.id === activeSource)) {
      setActiveSource(focusItems[0].id);
    }
  }, [activeSource, focusItems]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === "Escape" && composer) {
        event.preventDefault();
        setComposer(null);
        return;
      }

      if (composer) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveFocus(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveFocus(-1);
      } else if (event.key === "1") {
        setMode("chamber");
      } else if (event.key === "2") {
        setMode("library");
      } else if (event.key === "3") {
        setMode("forge");
      } else if (event.key.toLowerCase() === "n") {
        setComposer("note");
      } else if (event.key.toLowerCase() === "b") {
        setComposer("book");
      } else if (event.key.toLowerCase() === "e") {
        if (activeNote) openEditNote(activeNote);
      } else if (event.key.toLowerCase() === "q") {
        generateQuestion();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function selectItem(item: FocusItem) {
    setActiveSource(item.id);
  }

  function moveFocus(direction: -1 | 1) {
    if (focusItems.length === 0) return;
    const currentIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextIndex = Math.min(focusItems.length - 1, Math.max(0, currentIndex + direction));
    setActiveSource(focusItems[nextIndex].id);
  }

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
      tags: parseCsv(noteDraft.tags).length ? parseCsv(noteDraft.tags) : ["study-core"],
      linkedBookIds: [],
      linkedConceptIds: [],
      source: "Study Chamber",
    };

    setNotes([note, ...notes]);
    setActiveSource(note.id);
    setNoteDraft({ title: "", content: "", tags: "" });
    setComposer(null);
    setMode("chamber");
  }

  function openEditNote(note: Note) {
    setEditNoteDraft({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags.join(", "),
    });
    setComposer("edit-note");
  }

  function updateNote() {
    const title = editNoteDraft.title.trim();
    const content = editNoteDraft.content.trim();
    if (!editNoteDraft.id || !title || !content) return;

    const now = new Date().toISOString();
    setNotes(
      notes.map((note) =>
        note.id === editNoteDraft.id
          ? {
              ...note,
              title,
              content,
              tags: parseCsv(editNoteDraft.tags),
              updatedAt: now,
            }
          : note,
      ),
    );
    setActiveSource(editNoteDraft.id);
    setComposer(null);
    setMode("chamber");
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
      notes: "Entrada criada manualmente no Study Core.",
    };

    setBooks([book, ...books]);
    setActiveSource(book.id);
    setBookDraft({ title: "", authors: "", categories: "" });
    setComposer(null);
    setMode("library");
  }

  function generateQuestion() {
    const note = notes.find((item) => item.id === activeSource);
    const book = books.find((item) => item.id === activeSource);
    let question: GeneratedQuestion | undefined;
    if (note) question = generateQuestionFromNote(note);
    if (!question && book) question = generateQuestionFromBook(book);
    if (!question) return;

    setQuestions([question, ...questions]);
    setMode("forge");
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <AmbientScene color={currentMode.ambient} mode={mode} />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1720px] flex-col px-5 py-5 md:px-9 lg:px-12">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full border border-foreground/10 bg-foreground/[0.05] backdrop-blur-xl"
            >
              <Link to="/" aria-label="Voltar para o portal KOS">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                KOS · Study Core
              </div>
              <h1 className="serif mt-1 text-4xl leading-none md:text-6xl">{currentMode.title}</h1>
            </div>
          </div>

          <div className="relative w-full md:max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar no seu nucleo de estudo..."
              aria-label="Buscar no Study Core"
              className="h-12 rounded-full border-foreground/10 bg-background/45 pl-11 text-base backdrop-blur-xl"
            />
          </div>
        </header>

        <nav className="mt-7 flex gap-3 overflow-x-auto pb-2" aria-label="Modos do Study Core">
          {MODES.map((item) => {
            const Icon = item.icon;
            const selected = item.id === mode;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`flex min-h-12 shrink-0 items-center gap-3 rounded-full border px-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring ${
                  selected
                    ? "border-primary/45 bg-primary/15 text-foreground shadow-[0_0_36px_-18px_var(--glow)]"
                    : "border-foreground/10 bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                <span className="text-[11px] text-muted-foreground">{MODES.indexOf(item) + 1}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <section className="mt-7 grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm leading-6 text-muted-foreground">{currentMode.subtitle}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  <span>{notes.length} notas</span>
                  <span>{books.length} livros</span>
                  <span>{concepts.length} conceitos</span>
                  <span>{questions.length} perguntas</span>
                </div>
              </div>
              <div className="hidden gap-2 md:flex">
                <Button onClick={() => setComposer("note")} className="h-11 rounded-full">
                  <NotebookPen className="h-4 w-4" />
                  Nova nota
                </Button>
                <Button
                  onClick={() => setComposer("book")}
                  variant="outline"
                  className="h-11 rounded-full border-foreground/10 bg-foreground/[0.04]"
                >
                  <BookOpen className="h-4 w-4" />
                  Livro
                </Button>
              </div>
            </div>

            <FocusRail
              items={focusItems}
              activeId={activeItem?.id}
              mode={mode}
              activeIndex={activeIndex}
              onSelect={selectItem}
            />

            <section className="mt-5 grid gap-4 md:grid-cols-3">
              <Signal
                icon={BookOpen}
                title="Em leitura"
                value={readingBooks[0]?.title ?? "Nenhum livro ativo"}
              />
              <Signal
                icon={CircleHelp}
                title="Ultima pergunta"
                value={latestQuestion?.question ?? "Gere uma pergunta do item focado"}
              />
              <Signal
                icon={Brain}
                title="Conceitos"
                value={concepts
                  .slice(0, 3)
                  .map((concept) => concept.name)
                  .join(" · ")}
              />
            </section>
          </div>

          <ContextPanel
            item={activeItem}
            activeIndex={activeIndex}
            totalItems={focusItems.length}
            mode={mode}
            questions={questions}
            onCreateNote={() => setComposer("note")}
            onCreateBook={() => setComposer("book")}
            onEditNote={activeNote ? () => openEditNote(activeNote) : undefined}
            onGenerateQuestion={generateQuestion}
          />
        </section>

        <div className="mt-4 flex gap-2 md:hidden">
          <Button onClick={() => setComposer("note")} className="h-11 flex-1 rounded-full">
            <NotebookPen className="h-4 w-4" />
            Nova nota
          </Button>
          <Button
            onClick={() => setComposer("book")}
            variant="outline"
            className="h-11 flex-1 rounded-full border-foreground/10 bg-foreground/[0.04]"
          >
            <BookOpen className="h-4 w-4" />
            Livro
          </Button>
        </div>
      </div>

      {composer && (
        <ComposerPanel
          mode={composer}
          noteDraft={noteDraft}
          editNoteDraft={editNoteDraft}
          bookDraft={bookDraft}
          onClose={() => setComposer(null)}
          onNoteDraft={setNoteDraft}
          onEditNoteDraft={setEditNoteDraft}
          onBookDraft={setBookDraft}
          onCreateNote={createNote}
          onUpdateNote={updateNote}
          onCreateBook={createBook}
        />
      )}
    </main>
  );
}

function AmbientScene({ color, mode }: { color: string; mode: StudyMode }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: `
            radial-gradient(70% 62% at 18% 12%, color-mix(in oklab, ${color} 28%, transparent), transparent 70%),
            radial-gradient(46% 50% at 84% 22%, color-mix(in oklab, ${color} 14%, transparent), transparent 72%),
            linear-gradient(180deg, oklch(0.15 0.014 270), oklch(0.08 0.012 270) 76%)
          `,
        }}
      />
      <div className="absolute inset-x-[-10%] bottom-[-16%] h-[42%] rotate-[-2deg] border-t border-foreground/10 bg-[linear-gradient(90deg,transparent,oklch(1_0_0_/_0.055),transparent)] blur-[1px]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(oklch(1_0_0_/_0.04)_1px,transparent_1px),radial-gradient(oklch(1_0_0_/_0.045)_1px,transparent_1px)] [background-size:100%_92px,4px_4px]" />
      <div className="absolute left-1/2 top-[18%] h-[48rem] w-[48rem] -translate-x-1/2 rounded-full border border-foreground/[0.035]" />
      <div className="absolute left-1/2 top-[22%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border border-foreground/[0.035]" />
      <div className="absolute bottom-8 left-1/2 h-px w-[84%] -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
      <div className="absolute bottom-10 left-1/2 flex w-[78%] -translate-x-1/2 justify-between opacity-35">
        {Array.from({ length: mode === "library" ? 18 : 12 }).map((_, index) => (
          <span
            key={index}
            className="h-16 w-px bg-gradient-to-b from-foreground/30 to-transparent"
          />
        ))}
      </div>
    </div>
  );
}

function FocusRail({
  items,
  activeId,
  activeIndex,
  mode,
  onSelect,
}: {
  items: FocusItem[];
  activeId?: string;
  activeIndex: number;
  mode: StudyMode;
  onSelect: (item: FocusItem) => void;
}) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!activeId) return;
    itemRefs.current[activeId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeId]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-[28px] border border-foreground/10 bg-foreground/[0.04] text-muted-foreground backdrop-blur-xl">
        Nada encontrado nesse modo.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8 pt-4">
      <div className="flex min-h-[390px] gap-5 pr-6">
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(node) => {
                itemRefs.current[item.id] = node;
              }}
              type="button"
              onClick={() => onSelect(item)}
              className={`group relative flex h-[340px] w-[260px] shrink-0 flex-col justify-between overflow-hidden rounded-[30px] border p-6 text-left transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-ring md:h-[370px] md:w-[310px] ${
                active
                  ? "-translate-y-3 scale-[1.035] border-primary/45 bg-foreground/[0.09] shadow-[0_42px_120px_-55px_var(--glow)]"
                  : "border-foreground/10 bg-foreground/[0.04] opacity-65 hover:-translate-y-1 hover:opacity-95"
              }`}
              style={{
                transformOrigin: "center bottom",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(80% 55% at 30% 12%, color-mix(in oklab, ${
                    mode === "library"
                      ? "oklch(0.78 0.12 110)"
                      : mode === "forge"
                        ? "oklch(0.72 0.2 320)"
                        : "oklch(0.72 0.15 250)"
                  } ${active ? 34 : 16}%, transparent), transparent 70%)`,
                }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-foreground/10 bg-background/35">
                  {item.type === "note" ? (
                    <NotebookPen className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                  {item.type === "note" ? "Nota" : "Livro"}
                </div>
                <h2 className="serif mt-3 text-4xl leading-[0.95]">{item.title}</h2>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
              <div className="relative flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="line-clamp-1">{item.subtitle}</span>
                <span
                  className={`h-2 w-2 rounded-full ${active ? "bg-primary" : "bg-foreground/25"}`}
                />
              </div>
              {active && (
                <div className="absolute inset-x-6 bottom-3 h-[2px] overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContextPanel({
  item,
  activeIndex,
  totalItems,
  mode,
  questions,
  onCreateNote,
  onCreateBook,
  onEditNote,
  onGenerateQuestion,
}: {
  item?: FocusItem;
  activeIndex: number;
  totalItems: number;
  mode: StudyMode;
  questions: GeneratedQuestion[];
  onCreateNote: () => void;
  onCreateBook: () => void;
  onEditNote?: () => void;
  onGenerateQuestion: () => void;
}) {
  return (
    <aside className="rounded-[30px] border border-foreground/10 bg-background/45 p-5 shadow-[0_36px_100px_-75px_oklch(0_0_0)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
            Contexto
          </div>
          <h2 className="mt-1 text-xl font-medium">{item?.title ?? "Sem foco"}</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.05]">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1">
          {item?.type === "book" ? "Livro" : "Nota"}
        </span>
        <span className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1">
          {Math.max(activeIndex + 1, 0)} / {totalItems}
        </span>
        {item?.meta && (
          <span className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-1">
            {item.meta}
          </span>
        )}
      </div>

      <p className="mt-5 min-h-20 text-sm leading-7 text-muted-foreground">
        {item?.body ?? "Selecione uma nota ou livro no trilho para ver detalhes e gerar perguntas."}
      </p>

      {item?.details && (
        <div className="mt-4 grid gap-2">
          {item.details.map((detail) => (
            <div
              key={detail}
              className="flex min-h-10 items-center gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-3 text-xs text-muted-foreground"
            >
              <CalendarClock className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
              <span className="line-clamp-1">{detail}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-2">
        <Button onClick={onGenerateQuestion} className="h-12 rounded-full">
          <CircleHelp className="h-4 w-4" />
          Gerar pergunta
        </Button>
        {onEditNote && (
          <Button
            onClick={onEditNote}
            variant="outline"
            className="h-11 rounded-full border-foreground/10 bg-foreground/[0.04]"
          >
            <Edit3 className="h-4 w-4" />
            Editar nota
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onCreateNote}
            variant="outline"
            className="h-11 rounded-full border-foreground/10 bg-foreground/[0.04]"
          >
            <NotebookPen className="h-4 w-4" />
            Nota
          </Button>
          <Button
            onClick={onCreateBook}
            variant="outline"
            className="h-11 rounded-full border-foreground/10 bg-foreground/[0.04]"
          >
            <BookOpen className="h-4 w-4" />
            Livro
          </Button>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Perguntas recentes</h3>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {mode}
          </span>
        </div>
        <div className="space-y-3">
          {questions.slice(0, 4).map((question) => (
            <article
              key={question.id}
              className="rounded-2xl border border-foreground/10 bg-foreground/[0.035] p-4"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {question.questionType.replace("_", " ")}
              </div>
              <p className="mt-2 text-sm leading-6">{question.question}</p>
            </article>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ComposerPanel({
  mode,
  noteDraft,
  editNoteDraft,
  bookDraft,
  onClose,
  onNoteDraft,
  onEditNoteDraft,
  onBookDraft,
  onCreateNote,
  onUpdateNote,
  onCreateBook,
}: {
  mode: Exclude<ComposerMode, null>;
  noteDraft: { title: string; content: string; tags: string };
  editNoteDraft: { id: string; title: string; content: string; tags: string };
  bookDraft: { title: string; authors: string; categories: string };
  onClose: () => void;
  onNoteDraft: (draft: { title: string; content: string; tags: string }) => void;
  onEditNoteDraft: (draft: { id: string; title: string; content: string; tags: string }) => void;
  onBookDraft: (draft: { title: string; authors: string; categories: string }) => void;
  onCreateNote: () => void;
  onUpdateNote: () => void;
  onCreateBook: () => void;
}) {
  const isNote = mode === "note";
  const isEditNote = mode === "edit-note";
  const notePanelDraft = isEditNote ? editNoteDraft : noteDraft;
  const notePanelUpdate = isEditNote ? onEditNoteDraft : onNoteDraft;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-background/55 p-4 backdrop-blur-md md:items-center">
      <section className="w-full max-w-3xl rounded-[30px] border border-foreground/10 bg-background/90 p-5 shadow-[0_40px_140px_-70px_oklch(0_0_0)] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
              {isNote || isEditNote ? "Study Chamber" : "Library Orbit"}
            </div>
            <h2 className="serif mt-1 text-4xl leading-none">
              {isEditNote ? "Editar nota" : isNote ? "Nova nota" : "Novo livro"}
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full border border-foreground/10 bg-foreground/[0.04]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isNote || isEditNote ? (
          <div className="mt-6 space-y-3">
            <Input
              value={notePanelDraft.title}
              onChange={(event) =>
                notePanelUpdate({ ...notePanelDraft, title: event.target.value })
              }
              placeholder="Titulo da nota"
              aria-label="Titulo da nota"
              className="h-12 bg-foreground/[0.04] text-base"
            />
            <div className="relative">
              <Tags className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={notePanelDraft.tags}
                onChange={(event) =>
                  notePanelUpdate({ ...notePanelDraft, tags: event.target.value })
                }
                placeholder="Tags separadas por virgula"
                aria-label="Tags da nota"
                className="h-12 bg-foreground/[0.04] pl-10 text-base"
              />
            </div>
            <Textarea
              value={notePanelDraft.content}
              onChange={(event) =>
                notePanelUpdate({ ...notePanelDraft, content: event.target.value })
              }
              placeholder="Escreva o que voce quer lembrar, revisar ou conectar..."
              aria-label="Conteudo da nota"
              className="min-h-52 bg-foreground/[0.04] text-base leading-7"
            />
            <Button
              onClick={isEditNote ? onUpdateNote : onCreateNote}
              disabled={!notePanelDraft.title.trim() || !notePanelDraft.content.trim()}
              className="h-12 w-full rounded-full"
            >
              {isEditNote ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEditNote ? "Salvar alteracoes" : "Salvar nota"}
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <Input
              value={bookDraft.title}
              onChange={(event) => onBookDraft({ ...bookDraft, title: event.target.value })}
              placeholder="Titulo do livro"
              aria-label="Titulo do livro"
              className="h-12 bg-foreground/[0.04] text-base"
            />
            <Input
              value={bookDraft.authors}
              onChange={(event) => onBookDraft({ ...bookDraft, authors: event.target.value })}
              placeholder="Autores separados por virgula"
              aria-label="Autores do livro"
              className="h-12 bg-foreground/[0.04] text-base"
            />
            <Input
              value={bookDraft.categories}
              onChange={(event) => onBookDraft({ ...bookDraft, categories: event.target.value })}
              placeholder="Categorias separadas por virgula"
              aria-label="Categorias do livro"
              className="h-12 bg-foreground/[0.04] text-base"
            />
            <Button
              onClick={onCreateBook}
              disabled={!bookDraft.title.trim()}
              className="h-12 w-full rounded-full"
            >
              <Plus className="h-4 w-4" />
              Adicionar livro
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function Signal({
  icon: Icon,
  title,
  value,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  value: string;
}) {
  return (
    <article className="min-h-32 rounded-[24px] border border-foreground/10 bg-foreground/[0.04] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.6} />
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{title}</div>
      </div>
      <p className="mt-5 line-clamp-2 text-sm leading-6">{value}</p>
    </article>
  );
}
