import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Brain,
  Compass,
  FlaskConical,
  Gamepad2,
  Hammer,
  PenLine,
  Sparkles,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KOS — Knowledge Operating System" },
      {
        name: "description",
        content:
          "A calm, personal system to store, connect, and evolve a lifetime of knowledge — books, ideas, projects, games, and writing.",
      },
      { property: "og:title", content: "KOS — Knowledge Operating System" },
      {
        property: "og:description",
        content:
          "A calm, personal system to store, connect, and evolve a lifetime of knowledge.",
      },
    ],
  }),
  component: Home,
});

type ModuleId =
  | "library"
  | "knowledge"
  | "projects"
  | "games"
  | "writing"
  | "timeline"
  | "ai"
  | "lab";

type ContextItem = {
  label: string;
  title: string;
  meta?: string;
};

type ModuleDef = {
  id: ModuleId;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  count: string;
  pulse: string;
  primary: ContextItem;
  recent: ContextItem[];
  suggestions: string[];
};

const MODULES: ModuleDef[] = [
  {
    id: "library",
    name: "Library",
    tagline: "Books, reading, marginalia",
    icon: BookOpen,
    count: "248 volumes",
    pulse: "Reading 3",
    primary: {
      label: "Currently reading",
      title: "The Order of Time",
      meta: "Carlo Rovelli · chapter 6 of 13",
    },
    recent: [
      { label: "Annotation", title: "On the granularity of moments", meta: "2h ago" },
      { label: "Finished", title: "A Pattern Language", meta: "Christopher Alexander" },
      { label: "Highlight", title: "“Form follows the long now.”", meta: "Brand · Clock" },
    ],
    suggestions: [
      "Link Rovelli's time → your essay 'Slow Systems'",
      "Three notes echo Alexander's 253rd pattern",
    ],
  },
  {
    id: "knowledge",
    name: "Knowledge",
    tagline: "Concepts and their threads",
    icon: Brain,
    count: "1,402 concepts",
    pulse: "12 new links",
    primary: {
      label: "Recently explored",
      title: "Emergence",
      meta: "linked to 38 entities",
    },
    recent: [
      { label: "Concept", title: "Anti-fragility", meta: "Taleb · 2 projects" },
      { label: "Concept", title: "Stigmergy", meta: "ants → teams" },
      { label: "Concept", title: "Slow Media", meta: "draft essay" },
    ],
    suggestions: [
      "Emergence ↔ your project 'Field Notes'",
      "New bridge: Stigmergy ↔ Pattern Language",
    ],
  },
  {
    id: "projects",
    name: "Projects",
    tagline: "Work in motion",
    icon: Compass,
    count: "6 active",
    pulse: "2 nearing",
    primary: {
      label: "In focus",
      title: "Field Notes — v0.4",
      meta: "milestone in 4 days",
    },
    recent: [
      { label: "Update", title: "Refactored capture flow", meta: "yesterday" },
      { label: "Decision", title: "Drop graph view for v1", meta: "Mon" },
      { label: "Linked", title: "Concept: Slow Media", meta: "knowledge" },
    ],
    suggestions: [
      "Three open threads waiting on you",
      "Archive 'Atlas' — dormant 94 days",
    ],
  },
  {
    id: "games",
    name: "Games",
    tagline: "Worlds, hours, impressions",
    icon: Gamepad2,
    count: "94 played",
    pulse: "Playing 2",
    primary: {
      label: "Currently playing",
      title: "Death Stranding 2",
      meta: "37h · chapter 4",
    },
    recent: [
      { label: "Impression", title: "On solitude as a mechanic", meta: "3d ago" },
      { label: "Finished", title: "Outer Wilds", meta: "logged 41h" },
      { label: "Screenshot", title: "First dawn at Timber Hearth", meta: "media" },
    ],
    suggestions: [
      "Your Outer Wilds notes ↔ concept 'Loops'",
      "Add Death Stranding to timeline · 2026",
    ],
  },
  {
    id: "writing",
    name: "Writing",
    tagline: "Essays, drafts, reflections",
    icon: PenLine,
    count: "73 pieces",
    pulse: "4 drafts",
    primary: {
      label: "Open draft",
      title: "Slow Systems",
      meta: "1,840 words · last edit 14m ago",
    },
    recent: [
      { label: "Published", title: "On keeping a long now", meta: "May" },
      { label: "Fragment", title: "“A system is a slow promise.”", meta: "today" },
      { label: "Reply", title: "Letter to M.", meta: "draft" },
    ],
    suggestions: [
      "Slow Systems borrows from 6 of your notes",
      "Quiet thread: 9 fragments on 'attention'",
    ],
  },
  {
    id: "timeline",
    name: "Timeline",
    tagline: "Life, in seasons",
    icon: Clock3,
    count: "since 2014",
    pulse: "This week",
    primary: {
      label: "This season",
      title: "Winter, Lisbon",
      meta: "11 events · 3 projects",
    },
    recent: [
      { label: "Event", title: "Moved studios", meta: "Nov 14" },
      { label: "Trip", title: "Azores, six days", meta: "Oct" },
      { label: "Milestone", title: "KOS — first commit", meta: "Sep 02" },
    ],
    suggestions: [
      "10 years ago this week: first journal entry",
      "Cluster: 'reading + walking' — recurring",
    ],
  },
  {
    id: "ai",
    name: "Companion",
    tagline: "Quiet connections",
    icon: Sparkles,
    count: "always listening",
    pulse: "3 hunches",
    primary: {
      label: "A quiet observation",
      title: "Your last three reads share one idea.",
      meta: "Rovelli · Alexander · Brand → time as material",
    },
    recent: [
      { label: "Bridge", title: "Outer Wilds ↔ Order of Time", meta: "loops" },
      { label: "Echo", title: "“Slow promise” recurs in 4 notes", meta: "writing" },
      { label: "Nudge", title: "Field Notes hasn't moved in 4 days", meta: "projects" },
    ],
    suggestions: [
      "Open a thread between time, loops, and slowness?",
      "Surface dormant concept: 'Stewardship'",
    ],
  },
  {
    id: "lab",
    name: "Lab",
    tagline: "Half-formed, on purpose",
    icon: FlaskConical,
    count: "21 experiments",
    pulse: "1 brewing",
    primary: {
      label: "Tinkering with",
      title: "A reading-pace tracker",
      meta: "sketch · 2 entities linked",
    },
    recent: [
      { label: "Sketch", title: "Spatial map of concepts", meta: "raw" },
      { label: "Prompt", title: "What if notes had seasons?", meta: "open" },
      { label: "Experiment", title: "Voice-only capture", meta: "paused" },
    ],
    suggestions: [
      "Two experiments could merge: pace + seasons",
      "Promote 'spatial map' to a project?",
    ],
  },
];

function Home() {
  const [focusId, setFocusId] = useState<ModuleId>("library");
  const focused = useMemo(() => MODULES.find((m) => m.id === focusId)!, [focusId]);

  // Keyboard navigation: arrow keys move focus, mirroring console-style UX.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      const idx = MODULES.findIndex((m) => m.id === focusId);
      const cols = 4;
      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % MODULES.length;
      if (e.key === "ArrowLeft") next = (idx - 1 + MODULES.length) % MODULES.length;
      if (e.key === "ArrowDown") next = Math.min(MODULES.length - 1, idx + cols);
      if (e.key === "ArrowUp") next = Math.max(0, idx - cols);
      if (next !== idx) {
        e.preventDefault();
        setFocusId(MODULES[next].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusId]);

  return (
    <main className="ambient-field min-h-screen w-full">
      <TopBar />

      <div className="mx-auto w-full max-w-[1320px] px-8 pb-32 pt-10">
        <Greeting />

        {/* Primary layer: focus modules */}
        <section
          aria-label="Modules"
          className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4"
        >
          {MODULES.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              focused={m.id === focusId}
              anyFocused={Boolean(focusId)}
              onFocus={() => setFocusId(m.id)}
            />
          ))}
        </section>

        {/* Secondary layer: context panel */}
        <ContextPanel module={focused} />
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <header className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-8 pt-8">
      <div className="flex items-center gap-3">
        <div className="relative h-6 w-6">
          <div className="absolute inset-0 rounded-full bg-[var(--glow)] opacity-30 blur-md" />
          <div className="absolute inset-[3px] rounded-full border border-foreground/40" />
          <div className="absolute inset-[7px] rounded-full bg-foreground/80" />
        </div>
        <span className="serif text-lg leading-none">kos</span>
        <span className="ml-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Knowledge Operating System
        </span>
      </div>

      <div className="flex items-center gap-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span className="hidden md:inline">⌘K · search the system</span>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-[var(--glow)]" />
          <span>synced</span>
        </div>
      </div>
    </header>
  );
}

function Greeting() {
  const hour = new Date().getHours();
  const part =
    hour < 5 ? "Still here" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="animate-fade-up">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <h1 className="serif mt-3 text-5xl font-normal leading-[1.05] md:text-6xl">
        {part}.{" "}
        <span className="text-muted-foreground">Where would you like to think?</span>
      </h1>
    </div>
  );
}

function ModuleCard({
  module,
  focused,
  anyFocused,
  onFocus,
}: {
  module: ModuleDef;
  focused: boolean;
  anyFocused: boolean;
  onFocus: () => void;
}) {
  const Icon = module.icon;
  return (
    <motion.button
      type="button"
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onFocus}
      aria-pressed={focused}
      aria-label={`Focus ${module.name}`}
      initial={false}
      animate={{
        scale: focused ? 1.035 : anyFocused && !focused ? 0.97 : 1,
        opacity: focused ? 1 : anyFocused ? 0.55 : 1,
        y: focused ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.6 }}
      className={[
        "group relative aspect-[4/5] overflow-hidden rounded-3xl p-6 text-left",
        "bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] hairline",
        "backdrop-blur-xl transition-shadow duration-500",
        "focus:outline-none",
        focused ? "shadow-[var(--shadow-focus)]" : "shadow-[var(--shadow-soft)]",
      ].join(" ")}
    >
      {/* Focused aurora wash */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--glow) 18%, transparent), transparent 60%)",
        }}
      />
      {/* hairline ring on focus */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--glow) 35%, transparent)" }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <Icon className="h-5 w-5 text-foreground/85" strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {module.pulse}
          </span>
        </div>

        <div>
          <h3 className="serif text-3xl leading-none">{module.name}</h3>
          <p className="mt-3 max-w-[18ch] text-sm leading-relaxed text-muted-foreground">
            {module.tagline}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {module.count}
            </span>
            <motion.span
              initial={false}
              animate={{ x: focused ? 0 : -4, opacity: focused ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              className="text-foreground/80"
            >
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </motion.span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function ContextPanel({ module }: { module: ModuleDef }) {
  return (
    <section
      aria-label={`${module.name} context`}
      className="relative mt-14"
    >
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            In view
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={module.id + "-title"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="serif text-2xl"
            >
              {module.name}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-xs text-muted-foreground">
          use ← → ↑ ↓ or hover to shift focus
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* Primary spotlight */}
        <AnimatePresence mode="wait">
          <motion.article
            key={module.id + "-primary"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-6 rounded-3xl hairline bg-[color-mix(in_oklab,var(--surface-elevated)_85%,transparent)] p-8 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {module.primary.label}
            </p>
            <h2 className="serif mt-4 text-4xl leading-tight">{module.primary.title}</h2>
            {module.primary.meta && (
              <p className="mt-3 text-sm text-muted-foreground">{module.primary.meta}</p>
            )}
            <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-foreground/70">
              <span className="h-px w-8 bg-foreground/30" />
              enter to dwell
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Recent threads */}
        <div className="md:col-span-3">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Recent threads
          </p>
          <ul className="space-y-1">
            <AnimatePresence mode="popLayout">
              {module.recent.map((item, i) => (
                <motion.li
                  key={module.id + "-r-" + i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex cursor-default flex-col gap-1 rounded-2xl px-4 py-3 transition-colors hover:bg-[color-mix(in_oklab,var(--surface-elevated)_70%,transparent)]"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm leading-snug text-foreground/90">{item.title}</span>
                  {item.meta && (
                    <span className="text-xs text-muted-foreground">{item.meta}</span>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        {/* Companion suggestions */}
        <div className="md:col-span-3">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
            companion
          </div>
          <AnimatePresence mode="popLayout">
            <ul className="space-y-3">
              {module.suggestions.map((s, i) => (
                <motion.li
                  key={module.id + "-s-" + i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--surface)_60%,transparent)] p-4 text-sm leading-relaxed text-foreground/85"
                >
                  {s}
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        </div>
      </div>

      {/* Quiet footer */}
      <div className="mt-16 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted-foreground">
        <div className="flex items-center gap-3">
          <Hammer className="h-3 w-3" strokeWidth={1.5} />
          <span>a long, slow system</span>
        </div>
        <span>v0.1 · seed</span>
      </div>
    </section>
  );
}
