export type PillarId = "knowledge" | "experience" | "creation" | "memory" | "discovery" | "legacy";

export type KosIconName =
  | "book-open"
  | "graduation-cap"
  | "file-text"
  | "file-type"
  | "atom"
  | "sigma"
  | "cpu"
  | "brain"
  | "gamepad"
  | "film"
  | "plane"
  | "calendar-days"
  | "trophy"
  | "image"
  | "clapperboard"
  | "sparkles"
  | "pen-line"
  | "scroll-text"
  | "code"
  | "folder-kanban"
  | "lightbulb"
  | "flask"
  | "palette"
  | "music"
  | "clock"
  | "notebook-pen"
  | "users"
  | "heart"
  | "star"
  | "network"
  | "telescope"
  | "git-branch"
  | "link"
  | "compass"
  | "book-marked"
  | "feather";

export type KosDomain = {
  id: string;
  name: string;
  blurb: string;
  count: number;
  icon: KosIconName;
};

export type RecentEntity = {
  kind: string;
  title: string;
  meta: string;
};

export type PillarRecordStatus = "active" | "archived";

export type PillarRecord = {
  id: string;
  pillarId: PillarId;
  domainId: string;
  kind: string;
  title: string;
  details: string;
  tags: string[];
  status: PillarRecordStatus;
  createdAt: string;
  updatedAt: string;
};

export type Pillar = {
  id: PillarId;
  index: string;
  name: string;
  purpose: string;
  tagline: string;
  toneLabel: string;
  hue: string;
  hue2: string;
  domains: KosDomain[];
  recent: RecentEntity[];
};

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  linkedBookIds: string[];
  linkedConceptIds: string[];
  source?: string;
};

export type BookStatus = "to_read" | "reading" | "paused" | "finished" | "abandoned" | "reference";

export type BookFormat = "physical" | "pdf" | "epub" | "audio" | "unknown";

export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  status: BookStatus;
  categories: string[];
  format: BookFormat;
  owned: boolean;
  location?: string;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
};

export type ReadingNote = {
  id: string;
  bookId: string;
  title: string;
  summary: string;
  keyIdeas: string[];
  quotes: string[];
  reflections: string[];
  linkedConceptIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Concept = {
  id: string;
  name: string;
  description: string;
  aliases: string[];
  tags: string[];
  linkedNoteIds: string[];
  linkedBookIds: string[];
  relatedConceptIds: string[];
};

export type StudySession = {
  id: string;
  title: string;
  targetType: "note" | "book" | "concept" | "free";
  targetId?: string;
  startedAt: string;
  endedAt?: string;
  notesCreated: string[];
  summary?: string;
  nextSteps: string[];
};

export type GeneratedQuestion = {
  id: string;
  promptSourceType: "note" | "book" | "reading_note" | "concept" | "session";
  promptSourceId: string;
  question: string;
  questionType: "review" | "comprehension" | "connection" | "open_reflection";
  createdAt: string;
  answeredAt?: string;
  answer?: string;
};
