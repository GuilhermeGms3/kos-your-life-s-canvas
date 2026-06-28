import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Brain,
  Compass,
  FlaskConical,
  Gamepad2,
  PenLine,
  Sparkles,
  Clock3,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KOS — Knowledge Operating System" },
      {
        name: "description",
        content:
          "A calm, cinematic operating system for a lifetime of personal knowledge — books, ideas, projects, games, and writing.",
      },
      { property: "og:title", content: "KOS — Knowledge Operating System" },
      {
        property: "og:description",
        content:
          "A calm, cinematic operating system for a lifetime of personal knowledge.",
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

type ContextItem = { label: string; title: string; meta?: string };

type ModuleDef = {
  id: ModuleId;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  count: string;
  pulse: string;
  hue: string; // CSS color for tile accent
  primary: ContextItem;
  recent: ContextItem[];
  whisper: string;
};

const MODULES: ModuleDef[] = [
  {
    id: "library",
    name: "Library",
    tagline: "Books, reading, marginalia",
    icon: BookOpen,
    count: "248 volumes",
    pulse: "Reading 3",
    hue: "oklch(0.78 0.12 75)",
    primary: { label: "Currently reading", title: "The Order of Time", meta: "Carlo Rovelli · chapter 6 of 13" },
    recent: [
      { label: "Annotation", title: "On the granularity of moments", meta: "2h ago" },
      { label: "Finished", title: "A Pattern Language", meta: "Christopher Alexander" },
      { label: "Highlight", title: "“Form follows the long now.”", meta: "Brand · Clock" },
    ],
    whisper: "Three reads now share one idea — time as material.",
  },
  {
    id: "knowledge",
    name: "Knowledge",
    tagline: "Concepts and their threads",
    icon: Brain,
    count: "1,402 concepts",
    pulse: "12 new links",
    hue: "oklch(0.72 0.13 220)",
    primary: { label: "Recently explored", title: "Emergence", meta: "linked to 38 entities" },
    recent: [
      { label: "Concept", title: "Anti-fragility", meta: "Taleb · 2 projects" },
      { label: "Concept", title: "Stigmergy", meta: "ants → teams" },
      { label: "Concept", title: "Slow Media", meta: "draft essay" },
    ],
    whisper: "A new bridge: Stigmergy ↔ Pattern Language.",
  },
  {
    id: "projects",
    name: "Projects",
    tagline: "Work in motion",
    icon: Compass,
    count: "6 active",
    pulse: "2 nearing",
    hue: "oklch(0.74 0.13 150)",
    primary: { label: "In focus", title: "Field Notes — v0.4", meta: "milestone in 4 days" },
    recent: [
      { label: "Update", title: "Refactored capture flow", meta: "yesterday" },
      { label: "Decision", title: "Drop graph view for v1", meta: "Mon" },
      { label: "Linked", title: "Concept: Slow Media", meta: "knowledge" },
    ],
    whisper: "Three open threads are waiting on you.",
  },
  {
    id: "games",
    name: "Games",
    tagline: "Worlds, hours, impressions",
    icon: Gamepad2,
    count: "94 played",
    pulse: "Playing 2",
    hue: "oklch(0.7 0.16 300)",
    primary: { label: "Currently playing", title: "Death Stranding 2", meta: "37h · chapter 4" },
    recent: [
      { label: "Impression", title: "On solitude as a mechanic", meta: "3d ago" },
      { label: "Finished", title: "Outer Wilds", meta: "logged 41h" },
      { label: "Screenshot", title: "First dawn at Timber Hearth", meta: "media" },
    ],
    whisper: "Outer Wilds notes echo the concept 'Loops'.",
  },
  {
    id: "writing",
    name: "Writing",
    tagline: "Essays, drafts, reflections",
    icon: PenLine,
    count: "73 pieces",
    pulse: "4 drafts",
    hue: "oklch(0.82 0.09 60)",
    primary: { label: "Open draft", title: "Slow Systems", meta: "1,840 words · last edit 14m ago" },
    recent: [
      { label: "Published", title: "On keeping a long now", meta: "May" },
      { label: "Fragment", title: "“A system is a slow promise.”", meta: "today" },
      { label: "Reply", title: "Letter to M.", meta: "draft" },
    ],
    whisper: "Slow Systems quietly borrows from six of your notes.",
  },
  {
    id: "timeline",
    name: "Timeline",
    tagline: "Life, in seasons",
    icon: Clock3,
    count: "since 2014",
    pulse: "This week",
    hue: "oklch(0.72 0.1 25)",
    primary: { label: "This season", title: "Winter, Lisbon", meta: "11 events · 3 projects" },
    recent: [
      { label: "Event", title: "Moved studios", meta: "Nov 14" },
      { label: "Trip", title: "Azores, six days", meta: "Oct" },
      { label: "Milestone", title: "KOS — first commit", meta: "Sep 02" },
    ],
    whisper: "Ten years ago this week: your first journal entry.",
  },
  {
    id: "ai",
    name: "Companion",
    tagline: "Quiet connections",
    icon: Sparkles,
    count: "always listening",
    pulse: "3 hunches",
    hue: "oklch(0.8 0.1 200)",
    primary: { label: "A quiet observation", title: "Your last three reads share one idea.", meta: "Rovelli · Alexander · Brand → time as material" },
    recent: [
      { label: "Bridge", title: "Outer Wilds ↔ Order of Time", meta: "loops" },
      { label: "Echo", title: "“Slow promise” recurs in 4 notes", meta: "writing" },
      { label: "Nudge", title: "Field Notes hasn't moved in 4 days", meta: "projects" },
    ],
    whisper: "May I open a thread between time, loops, and slowness?",
  },
  {
    id: "lab",
    name: "Lab",
    tagline: "Half-formed, on purpose",
    icon: FlaskConical,
    count: "21 experiments",
    pulse: "1 brewing",
    hue: "oklch(0.74 0.14 340)",
    primary: { label: "Tinkering with", title: "A reading-pace tracker", meta: "sketch · 2 entities linked" },
    recent: [
      { label: "Sketch", title: "Spatial map of concepts", meta: "raw" },
      { label: "Prompt", title: "What if notes had seasons?", meta: "open" },
      { label: "Experiment", title: "Voice-only capture", meta: "paused" },
    ],
    whisper: "Two experiments could merge: pace + seasons.",
  },
];

const TILE_W = 280; // px
const TILE_GAP = 28;
const STRIDE = TILE_W + TILE_GAP;

function Home() {
  const [focusIdx, setFocusIdx] = useState(0);
  const focused = MODULES[focusIdx];
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(MODULES.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Center the focused tile in the viewport
  const offset = useMemo(() => {
    return -focusIdx * STRIDE;
  }, [focusIdx]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <CinematicBackdrop module={focused} />
      <TopBar />

      {/* Hero / focused module title */}
      <section className="relative z-10 mx-auto w-full max-w-[1600px] px-12 pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={focused.id + "-hero"}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              {focused.pulse} · {focused.count}
            </p>
            <h1 className="serif mt-4 text-7xl font-normal leading-[0.95] md:text-8xl">
              {focused.name}
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              {focused.tagline}.
            </p>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* PS5-style horizontal focus row, anchored at viewport center */}
      <section
        aria-label="Modules"
        className="relative z-10 mt-16 select-none"
        style={{ height: 360 }}
      >
        {/* Center marker line — anchors the focused tile */}
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          <div
            style={{
              width: TILE_W,
              transform: `translateY(0)`,
            }}
          />
        </div>

        <motion.div
          ref={rowRef}
          className="absolute left-1/2 top-0 flex"
          style={{ gap: TILE_GAP, transform: `translateX(-${TILE_W / 2}px)` }}
          animate={{ x: offset }}
          transition={{ type: "spring", stiffness: 180, damping: 26, mass: 0.7 }}
        >
          {MODULES.map((m, i) => (
            <Tile
              key={m.id}
              module={m}
              focused={i === focusIdx}
              distance={Math.abs(i - focusIdx)}
              onFocus={() => setFocusIdx(i)}
            />
          ))}
        </motion.div>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent" />
      </section>

      {/* Context expansion — same screen */}
      <ContextStrip module={focused} index={focusIdx} total={MODULES.length} />

      <FootBar />
    </main>
  );
}

function CinematicBackdrop({ module }: { module: ModuleDef }) {
  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={module.id + "-bg"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
      >
        {/* Large soft wash that picks up the focused module's hue */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 55% at 22% 18%, color-mix(in oklab, ${module.hue} 22%, transparent), transparent 70%),
                         radial-gradient(55% 50% at 82% 88%, color-mix(in oklab, ${module.hue} 14%, transparent), transparent 75%),
                         radial-gradient(70% 60% at 50% 110%, color-mix(in oklab, ${module.hue} 10%, transparent), transparent 75%)`,
            filter: "blur(20px)",
          }}
        />
        {/* fine grain */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(oklch(1 0 0 / 0.025) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        {/* base vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, transparent 40%, oklch(0.12 0.01 270 / 0.6) 100%)",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function TopBar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between px-12 pt-8">
      <div className="flex items-center gap-3">
        <div className="relative h-6 w-6">
          <div className="absolute inset-0 rounded-full bg-[var(--glow)] opacity-30 blur-md" />
          <div className="absolute inset-[3px] rounded-full border border-foreground/40" />
          <div className="absolute inset-[7px] rounded-full bg-foreground/80" />
        </div>
        <span className="serif text-lg leading-none">kos</span>
        <span className="ml-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Knowledge Operating System
        </span>
      </div>
      <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        <span className="hidden md:inline">◁ ▷ &nbsp; navigate</span>
        <span className="hidden md:inline">⏎ &nbsp; enter</span>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-[var(--glow)]" />
          <span>synced</span>
        </div>
      </div>
    </header>
  );
}

function Tile({
  module,
  focused,
  distance,
  onFocus,
}: {
  module: ModuleDef;
  focused: boolean;
  distance: number;
  onFocus: () => void;
}) {
  const Icon = module.icon;
  // Cinematic depth: scale + opacity falls off with distance from focus
  const scale = focused ? 1.08 : Math.max(0.86, 0.96 - distance * 0.025);
  const opacity = focused ? 1 : Math.max(0.32, 0.7 - distance * 0.12);
  const yLift = focused ? -12 : 0;

  return (
    <motion.button
      type="button"
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onFocus}
      aria-pressed={focused}
      aria-label={`Focus ${module.name}`}
      initial={false}
      animate={{ scale, opacity, y: yLift }}
      transition={{ type: "spring", stiffness: 200, damping: 26, mass: 0.7 }}
      style={{ width: TILE_W, height: 360 }}
      className="group relative shrink-0 origin-center rounded-[28px] text-left focus:outline-none"
    >
      {/* Tile body — cinematic glass */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[28px]"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--surface-elevated) 96%, transparent), color-mix(in oklab, var(--surface) 90%, transparent))",
          backdropFilter: "blur(18px) saturate(140%)",
          boxShadow: focused
            ? `0 40px 90px -30px color-mix(in oklab, ${module.hue} 50%, transparent), 0 0 0 1px color-mix(in oklab, ${module.hue} 40%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.05)`
            : "0 20px 50px -30px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.04), 0 0 0 1px oklch(1 0 0 / 0.06)",
          transition: "box-shadow 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* hue wash inside tile */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 70% at 0% 0%, color-mix(in oklab, ${module.hue} ${focused ? 28 : 10}%, transparent), transparent 65%)`,
            transition: "background 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        {/* top highlight */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.18), transparent)" }}
        />

        <div className="relative flex h-full flex-col justify-between p-7">
          <div className="flex items-start justify-between">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: `color-mix(in oklab, ${module.hue} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${module.hue} 40%, transparent)`,
              }}
            >
              <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: focused ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              {module.pulse}
            </span>
          </div>

          <div>
            <h3 className="serif text-5xl leading-none">{module.name}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{module.tagline}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {module.count}
              </span>
              <motion.span
                animate={{ opacity: focused ? 1 : 0, x: focused ? 0 : -6 }}
                transition={{ duration: 0.4 }}
                className="text-[10px] uppercase tracking-[0.22em]"
                style={{ color: module.hue }}
              >
                in focus
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Outer aura halo when focused */}
      <motion.div
        aria-hidden
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] blur-2xl"
        style={{ background: `radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, ${module.hue} 28%, transparent), transparent 70%)` }}
      />
    </motion.button>
  );
}

function ContextStrip({
  module,
  index,
  total,
}: {
  module: ModuleDef;
  index: number;
  total: number;
}) {
  return (
    <section
      aria-label={`${module.name} context`}
      className="relative z-10 mx-auto mt-12 w-full max-w-[1600px] px-12"
    >
      {/* Focus indicator dots — PS5/Apple TV style */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <motion.span
            key={i}
            animate={{
              width: i === index ? 28 : 6,
              opacity: i === index ? 1 : 0.35,
            }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="h-[3px] rounded-full"
            style={{ background: i === index ? module.hue : "var(--foreground)" }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={module.id + "-ctx"}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-12 gap-10"
        >
          {/* Primary spotlight */}
          <div className="col-span-12 md:col-span-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {module.primary.label}
            </p>
            <h2 className="serif mt-4 text-4xl leading-tight md:text-5xl">
              {module.primary.title}
            </h2>
            {module.primary.meta && (
              <p className="mt-3 text-sm text-muted-foreground">{module.primary.meta}</p>
            )}
          </div>

          {/* Recent threads — quiet inline list, no cards */}
          <div className="col-span-12 md:col-span-3">
            <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Recent
            </p>
            <ul className="space-y-4">
              {module.recent.map((item, i) => (
                <motion.li
                  key={module.id + "-r-" + i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-1"
                >
                  <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm leading-snug text-foreground/90">{item.title}</span>
                  {item.meta && (
                    <span className="text-xs text-muted-foreground">{item.meta}</span>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Companion whisper */}
          <div className="col-span-12 md:col-span-3">
            <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              <Sparkles className="h-3 w-3" strokeWidth={1.5} />
              companion
            </div>
            <p
              className="serif text-xl leading-snug"
              style={{ color: "color-mix(in oklab, var(--foreground) 90%, transparent)" }}
            >
              “{module.whisper}”
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function FootBar() {
  return (
    <footer className="relative z-10 mx-auto mt-20 flex w-full max-w-[1600px] items-center justify-between px-12 pb-10 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
      <span>a long, slow system</span>
      <span>v0.1 · seed</span>
    </footer>
  );
}
