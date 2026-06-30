import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  GraduationCap,
  FileText,
  FileType,
  Atom,
  Sigma,
  Cpu,
  Brain,
  Gamepad2,
  Film,
  Plane,
  CalendarDays,
  Trophy,
  Image as ImageIcon,
  Clapperboard,
  Sparkles as SparklesIcon,
  PenLine,
  ScrollText,
  Code2,
  FolderKanban,
  Lightbulb,
  FlaskConical,
  Palette,
  Music,
  Clock3,
  NotebookPen,
  Users,
  Heart,
  Star,
  Network,
  Telescope,
  GitBranch,
  Link2,
  Compass,
  BookMarked,
  Feather,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KOS — Knowledge Operating System" },
      {
        name: "description",
        content:
          "A cinematic operating system for a lifetime of knowledge, experience, creation, memory, discovery, and legacy.",
      },
    ],
  }),
  component: Home,
});

/* ---------- types ---------- */

type PillarId =
  | "knowledge"
  | "experience"
  | "creation"
  | "memory"
  | "discovery"
  | "legacy";

type Domain = {
  id: string;
  name: string;
  blurb: string;
  count: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

type RecentEntity = {
  kind: string;
  title: string;
  meta: string;
};

type Pillar = {
  id: PillarId;
  index: string; // "01"
  name: string;
  purpose: string;
  tagline: string;
  toneLabel: string; // "DEEP VIOLET · GENERATIVE ENERGY"
  hue: string; // oklch base
  hue2: string; // secondary
  domains: Domain[];
  recent: RecentEntity[];
};

/* ---------- data ---------- */

const PILLARS: Pillar[] = [
  {
    id: "knowledge",
    index: "01",
    name: "Knowledge",
    purpose: "Structured learning and intellectual growth.",
    tagline: "What you've studied, read, understood.",
    toneLabel: "COOL BLUE-VIOLET · ANALYTICAL",
    hue: "oklch(0.7 0.16 265)",
    hue2: "oklch(0.6 0.18 240)",
    domains: [
      { id: "books", name: "Books", blurb: "Volumes read, in flight, shelved.", count: 248, icon: BookOpen },
      { id: "courses", name: "Courses", blurb: "Long-form study.", count: 17, icon: GraduationCap },
      { id: "articles", name: "Articles", blurb: "Essays, papers, posts.", count: 612, icon: FileText },
      { id: "pdfs", name: "PDFs", blurb: "Documents and references.", count: 84, icon: FileType },
      { id: "concepts", name: "Concepts", blurb: "Ideas you've internalised.", count: 1402, icon: Brain },
      { id: "math", name: "Mathematics", blurb: "Proofs, problems, methods.", count: 96, icon: Sigma },
      { id: "physics", name: "Physics", blurb: "Laws, intuitions, models.", count: 73, icon: Atom },
      { id: "programming", name: "Programming", blurb: "Languages, paradigms, craft.", count: 134, icon: Cpu },
      { id: "psychology", name: "Psychology", blurb: "Mind, behaviour, self.", count: 58, icon: Brain },
    ],
    recent: [
      { kind: "BOOK", title: "The Order of Time", meta: "Rovelli · ch. 6 of 13" },
      { kind: "CONCEPT", title: "Emergence", meta: "linked to 38 entities" },
      { kind: "PAPER", title: "Attention Is All You Need", meta: "annotated · 2025" },
      { kind: "COURSE", title: "Linear Algebra — MIT 18.06", meta: "lecture 12" },
      { kind: "ARTICLE", title: "Slow Media Manifesto", meta: "read · saved" },
      { kind: "CONCEPT", title: "Anti-fragility", meta: "Taleb · 2 projects" },
    ],
  },
  {
    id: "experience",
    index: "02",
    name: "Experience",
    purpose: "Lived reality and emotional memory.",
    tagline: "Life experiences and consumption — what you watched, played, walked through, felt.",
    toneLabel: "WARM MAGENTA-PURPLE · EMOTIONAL",
    hue: "oklch(0.7 0.2 330)",
    hue2: "oklch(0.6 0.22 350)",
    domains: [
      { id: "games", name: "Games", blurb: "Worlds inhabited.", count: 38, icon: Gamepad2 },
      { id: "movies", name: "Movies", blurb: "Films and series watched.", count: 211, icon: Film },
      { id: "travel", name: "Travel", blurb: "Journeys taken.", count: 14, icon: Plane },
      { id: "events", name: "Events", blurb: "Shows, concerts, gatherings.", count: 27, icon: CalendarDays },
      { id: "achievements", name: "Achievements", blurb: "Milestones earned.", count: 9, icon: Trophy },
      { id: "screenshots", name: "Screenshots", blurb: "Visual fragments.", count: 1284, icon: ImageIcon },
      { id: "clips", name: "Clips", blurb: "Short moments captured.", count: 67, icon: Clapperboard },
      { id: "moments", name: "Personal Moments", blurb: "Small, marked, kept.", count: 152, icon: SparklesIcon },
    ],
    recent: [
      { kind: "GAME", title: "Dark Souls III", meta: "Played · 78h · platinum" },
      { kind: "FILM", title: "Solaris (1972)", meta: "Tarkovsky · watched 3x" },
      { kind: "JOURNEY", title: "Kyoto — November", meta: "11 days · 248 photographs" },
      { kind: "CLIP", title: "Aurora over Tromsø", meta: "recorded · 02:14" },
      { kind: "ALBUM", title: "In Rainbows", meta: "Radiohead · 312 plays" },
      { kind: "ACHIEVEMENT", title: "First Marathon", meta: "Berlin · 04:21:08" },
    ],
  },
  {
    id: "creation",
    index: "03",
    name: "Creation",
    purpose: "Expression. Production. Output.",
    tagline: "What you've made, written, designed, composed.",
    toneLabel: "DEEP VIOLET · GENERATIVE ENERGY",
    hue: "oklch(0.68 0.22 300)",
    hue2: "oklch(0.55 0.24 295)",
    domains: [
      { id: "writing", name: "Writing", blurb: "Drafts and finished prose.", count: 73, icon: PenLine },
      { id: "essays", name: "Essays", blurb: "Long-form arguments.", count: 19, icon: ScrollText },
      { id: "code", name: "Code", blurb: "Repos and snippets.", count: 42, icon: Code2 },
      { id: "projects", name: "Projects", blurb: "Work in motion.", count: 6, icon: FolderKanban },
      { id: "ideas", name: "Ideas", blurb: "Seeds, half-formed.", count: 211, icon: Lightbulb },
      { id: "experiments", name: "Experiments", blurb: "Things tried, things learned.", count: 21, icon: FlaskConical },
      { id: "designs", name: "Designs", blurb: "Sketches, frames, systems.", count: 88, icon: Palette },
      { id: "music", name: "Music", blurb: "Compositions and stems.", count: 12, icon: Music },
    ],
    recent: [
      { kind: "PROJECT", title: "KOS — prototype v0.1", meta: "active · 38 commits" },
      { kind: "ESSAY", title: "On Attention as Currency", meta: "draft · 2,140 words" },
      { kind: "CODE", title: "graph-walker", meta: "Rust · open source" },
      { kind: "DESIGN", title: "Ambient UI explorations", meta: "Figma · 24 frames" },
      { kind: "MUSIC", title: "Untitled — A minor", meta: "sketch · 03:42" },
      { kind: "IDEA", title: "Memory as terrain", meta: "captured 03:11 AM" },
    ],
  },
  {
    id: "memory",
    index: "04",
    name: "Memory",
    purpose: "Continuity of identity over time.",
    tagline: "Personal history — moments, people, the throughline.",
    toneLabel: "DARK INDIGO · NOSTALGIC",
    hue: "oklch(0.55 0.16 270)",
    hue2: "oklch(0.4 0.14 275)",
    domains: [
      { id: "timeline", name: "Timeline Events", blurb: "Life, laid out in seasons.", count: 412, icon: Clock3 },
      { id: "diary", name: "Diary Entries", blurb: "Days as written.", count: 1864, icon: NotebookPen },
      { id: "people", name: "People", blurb: "Who walked with you.", count: 184, icon: Users },
      { id: "family", name: "Family", blurb: "The closest orbit.", count: 22, icon: Heart },
      { id: "moments", name: "Important Moments", blurb: "Pinned forever.", count: 64, icon: Star },
    ],
    recent: [
      { kind: "EVENT", title: "Moved to Lisbon", meta: "Nov 14, 2024" },
      { kind: "PERSON", title: "Letters with M.", meta: "12 entries · 6 years" },
      { kind: "MOMENT", title: "Grandfather's last summer", meta: "marked · 1998" },
      { kind: "DIARY", title: "On a quiet Sunday", meta: "1,204 words · today" },
      { kind: "FAMILY", title: "Sister's wedding", meta: "Porto · June" },
      { kind: "EVENT", title: "First job · Day 1", meta: "Sep 02, 2014" },
    ],
  },
  {
    id: "discovery",
    index: "05",
    name: "Discovery",
    purpose: "A knowledge connection engine.",
    tagline: "Patterns the system has noticed across your life.",
    toneLabel: "LUMINOUS PURPLE · CONNECTION",
    hue: "oklch(0.78 0.18 310)",
    hue2: "oklch(0.7 0.2 290)",
    domains: [
      { id: "connections", name: "Connections", blurb: "Entities the system has bridged.", count: 312, icon: Link2 },
      { id: "patterns", name: "Patterns", blurb: "Recurring shapes in your thought.", count: 47, icon: Network },
      { id: "insights", name: "Cross-Domain Insights", blurb: "Ideas that crossed worlds.", count: 28, icon: Telescope },
      { id: "suggestions", name: "Relationship Suggestions", blurb: "Bridges waiting to be made.", count: 14, icon: GitBranch },
    ],
    recent: [
      { kind: "CONNECTION", title: "Outer Wilds ↔ The Order of Time", meta: "shared concept: loops" },
      { kind: "PATTERN", title: "“Slow promise” recurs in 4 essays", meta: "writing · 2024–2026" },
      { kind: "INSIGHT", title: "Stigmergy ↔ Pattern Language", meta: "ants → architecture" },
      { kind: "SUGGESTION", title: "Bridge: Rovelli ↔ Brand", meta: "time as material" },
      { kind: "PATTERN", title: "Three reads share one idea", meta: "time, granularity" },
      { kind: "CONNECTION", title: "Kyoto trip ↔ essay on attention", meta: "stillness" },
    ],
  },
  {
    id: "legacy",
    index: "06",
    name: "Legacy",
    purpose: "What remains and is passed forward.",
    tagline: "Curated wisdom — principles, teachings, things worth keeping.",
    toneLabel: "DEEP STABLE PURPLE-BLACK · ENDURING",
    hue: "oklch(0.5 0.12 295)",
    hue2: "oklch(0.35 0.1 290)",
    domains: [
      { id: "principles", name: "Principles", blurb: "Rules you live by.", count: 24, icon: Compass },
      { id: "teachings", name: "Teachings", blurb: "Lessons offered to others.", count: 18, icon: BookMarked },
      { id: "lessons", name: "Life Lessons", blurb: "Hard-won understandings.", count: 41, icon: Feather },
      { id: "shared", name: "Shared Knowledge", blurb: "Distilled and public.", count: 9, icon: Network },
      { id: "wisdom", name: "Curated Wisdom", blurb: "What you'd hand to a stranger.", count: 33, icon: Star },
    ],
    recent: [
      { kind: "PRINCIPLE", title: "Build for the long now.", meta: "since 2019" },
      { kind: "LESSON", title: "Patience compounds.", meta: "noted · re-noted" },
      { kind: "TEACHING", title: "On reading slowly", meta: "shared · 412 reads" },
      { kind: "WISDOM", title: "Solitude is a workshop.", meta: "kept" },
      { kind: "SHARED", title: "A letter to my future self", meta: "open · 2034" },
      { kind: "PRINCIPLE", title: "Make less, deeper.", meta: "central" },
    ],
  },
];

/* ---------- layout consts ---------- */

const TILE_W = 320;
const TILE_H = 420;
const TILE_GAP = 32;
const STRIDE = TILE_W + TILE_GAP;

/* ---------- root ---------- */

function Home() {
  const [focusIdx, setFocusIdx] = useState(2); // Creation, like the reference
  const [environment, setEnvironment] = useState<PillarId | null>(null);
  const focused = PILLARS[focusIdx];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (environment) {
        if (e.key === "Escape") setEnvironment(null);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(PILLARS.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        setEnvironment(PILLARS[focusIdx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusIdx, environment]);

  const offset = useMemo(() => -focusIdx * STRIDE, [focusIdx]);
  const activePillar = environment
    ? PILLARS.find((p) => p.id === environment)!
    : focused;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <GalaxyBackdrop pillar={activePillar} />
      <Starfield />
      <TopBar pillar={activePillar} />

      {/* HOME — six pillars */}
      <AnimatePresence mode="wait">
        {!environment && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <SubBar />
            <PillarRow
              focusIdx={focusIdx}
              offset={offset}
              onFocus={setFocusIdx}
              onEnter={(id) => setEnvironment(id)}
            />
            <ContextStrip pillar={focused} index={focusIdx} total={PILLARS.length} />
            <FootBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENVIRONMENT — single pillar deep view */}
      <AnimatePresence mode="wait">
        {environment && (
          <Environment
            key={environment}
            pillar={activePillar}
            onClose={() => setEnvironment(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* ---------- backdrop ---------- */

function GalaxyBackdrop({ pillar }: { pillar: Pillar }) {
  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={pillar.id + "-bg"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(70% 60% at 30% 30%, color-mix(in oklab, ${pillar.hue} 22%, transparent), transparent 70%),
              radial-gradient(55% 55% at 80% 80%, color-mix(in oklab, ${pillar.hue2} 18%, transparent), transparent 75%),
              radial-gradient(90% 70% at 50% 110%, color-mix(in oklab, ${pillar.hue} 10%, transparent), transparent 80%),
              radial-gradient(120% 80% at 50% 0%, transparent 40%, oklch(0.08 0.02 280) 100%)
            `,
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(oklch(1 0 0 / 0.03) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function Starfield() {
  // Deterministic star positions to avoid hydration mismatch
  const stars = useMemo(() => {
    const arr: { x: number; y: number; s: number; o: number; d: number }[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 120; i++) {
      arr.push({
        x: rand() * 100,
        y: rand() * 100,
        s: rand() * 1.6 + 0.4,
        o: rand() * 0.6 + 0.15,
        d: rand() * 6 + 3,
      });
    }
    return arr;
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {stars.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            opacity: st.o,
            boxShadow: "0 0 4px oklch(1 0 0 / 0.4)",
          }}
          animate={{ opacity: [st.o * 0.5, st.o, st.o * 0.5] }}
          transition={{ duration: st.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ---------- chrome ---------- */

function TopBar({ pillar }: { pillar: Pillar }) {
  const [time, setTime] = useState(() => formatTime(new Date()));
  useEffect(() => {
    const t = setInterval(() => setTime(formatTime(new Date())), 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between px-12 pt-8">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-foreground/5">
          <span className="serif text-sm leading-none">K</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] tracking-[0.42em]">K O S</span>
          <span className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
            Knowledge Operating System
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="hidden md:inline">{pillar.toneLabel}</span>
        <span>{time}</span>
      </div>
    </header>
  );
}

function SubBar() {
  return (
    <div className="relative z-10 mx-auto mt-6 flex w-full max-w-[1600px] items-center justify-between px-12 text-[10px] uppercase tracking-[0.32em] text-muted-foreground/80">
      <span>Six Pillars · One Mind</span>
      <span className="hidden md:inline">◁ ▷ focus · ⏎ enter</span>
    </div>
  );
}

function FootBar() {
  return (
    <footer className="relative z-10 mx-auto mt-16 flex w-full max-w-[1600px] items-center justify-between px-12 pb-10 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      <span>a long, slow system</span>
      <span>v0.1 · seed</span>
    </footer>
  );
}

function formatTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

/* ---------- pillar row ---------- */

function PillarRow({
  focusIdx,
  offset,
  onFocus,
  onEnter,
}: {
  focusIdx: number;
  offset: number;
  onFocus: (i: number) => void;
  onEnter: (id: PillarId) => void;
}) {
  return (
    <section
      aria-label="Pillars"
      className="relative z-10 mt-16 select-none"
      style={{ height: TILE_H + 60 }}
    >
      <motion.div
        className="absolute left-1/2 top-0 flex"
        style={{ gap: TILE_GAP, transform: `translateX(-${TILE_W / 2}px)` }}
        animate={{ x: offset }}
        transition={{ type: "spring", stiffness: 170, damping: 26, mass: 0.75 }}
      >
        {PILLARS.map((p, i) => (
          <PillarTile
            key={p.id}
            pillar={p}
            focused={i === focusIdx}
            distance={Math.abs(i - focusIdx)}
            onFocus={() => onFocus(i)}
            onEnter={() => onEnter(p.id)}
          />
        ))}
      </motion.div>

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
}

function PillarTile({
  pillar,
  focused,
  distance,
  onFocus,
  onEnter,
}: {
  pillar: Pillar;
  focused: boolean;
  distance: number;
  onFocus: () => void;
  onEnter: () => void;
}) {
  const scale = focused ? 1.08 : Math.max(0.84, 0.94 - distance * 0.03);
  const opacity = focused ? 1 : Math.max(0.28, 0.62 - distance * 0.12);
  const yLift = focused ? -10 : 0;

  return (
    <motion.button
      type="button"
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={() => (focused ? onEnter() : onFocus())}
      onDoubleClick={onEnter}
      aria-pressed={focused}
      aria-label={`${pillar.name} pillar`}
      initial={false}
      animate={{ scale, opacity, y: yLift }}
      transition={{ type: "spring", stiffness: 200, damping: 26, mass: 0.7 }}
      style={{ width: TILE_W, height: TILE_H }}
      className="group relative shrink-0 origin-center rounded-[24px] text-left focus:outline-none"
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[24px]"
        style={{
          background: `linear-gradient(165deg,
            color-mix(in oklab, ${pillar.hue} 22%, oklch(0.16 0.02 275)) 0%,
            color-mix(in oklab, ${pillar.hue2} 14%, oklch(0.12 0.02 275)) 100%)`,
          backdropFilter: "blur(20px) saturate(140%)",
          boxShadow: focused
            ? `0 50px 110px -30px color-mix(in oklab, ${pillar.hue} 60%, transparent),
               0 0 0 1px color-mix(in oklab, ${pillar.hue} 55%, transparent),
               inset 0 1px 0 oklch(1 0 0 / 0.08)`
            : `0 30px 60px -40px oklch(0 0 0 / 0.8),
               inset 0 1px 0 oklch(1 0 0 / 0.04),
               0 0 0 1px oklch(1 0 0 / 0.05)`,
          transition: "box-shadow 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* signature internal nebula art */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(80% 60% at 30% 20%, color-mix(in oklab, ${pillar.hue} ${focused ? 55 : 25}%, transparent), transparent 65%),
              radial-gradient(70% 70% at 80% 90%, color-mix(in oklab, ${pillar.hue2} ${focused ? 40 : 15}%, transparent), transparent 70%)
            `,
            transition: "background 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        {/* top hairline */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.18), transparent)" }}
        />

        <div className="relative flex h-full flex-col justify-between p-7">
          <div className="flex items-start justify-between">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[11px]"
              style={{
                background: `color-mix(in oklab, ${pillar.hue} 25%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${pillar.hue} 50%, transparent)`,
              }}
            >
              {pillar.name[0]}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                {pillar.index}
              </span>
              <motion.span
                animate={{ opacity: focused ? 1 : 0 }}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em]"
                style={{ color: pillar.hue }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: pillar.hue, boxShadow: `0 0 8px ${pillar.hue}` }}
                />
                Focus
              </motion.span>
            </div>
          </div>

          <div>
            <h3 className="serif text-5xl leading-[0.95]">{pillar.name}</h3>
            <p className="mt-3 text-[12px] text-muted-foreground/90">{pillar.purpose}</p>
            <motion.div
              animate={{ width: focused ? 56 : 24, opacity: focused ? 1 : 0.5 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 h-[2px] rounded-full"
              style={{ background: pillar.hue }}
            />
          </div>
        </div>
      </div>

      {/* outer halo */}
      <motion.div
        aria-hidden
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[36px] blur-3xl"
        style={{
          background: `radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, ${pillar.hue} 35%, transparent), transparent 70%)`,
        }}
      />
    </motion.button>
  );
}

/* ---------- context strip (below row) ---------- */

function ContextStrip({
  pillar,
  index,
  total,
}: {
  pillar: Pillar;
  index: number;
  total: number;
}) {
  const recent = pillar.recent;
  return (
    <section
      aria-label={`${pillar.name} context`}
      className="relative z-10 mx-auto mt-12 w-full max-w-[1600px] px-12"
    >
      {/* focus dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ width: i === index ? 32 : 6, opacity: i === index ? 1 : 0.3 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="h-[3px] rounded-full"
            style={{ background: i === index ? pillar.hue : "var(--foreground)" }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pillar.id + "-ctx"}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            <span>
              Context · <span style={{ color: pillar.hue }}>{pillar.name}</span> ·{" "}
              {pillar.domains.length} domains · {pillar.toneLabel}
            </span>
            <span className="hidden md:inline">⏎ enter · open</span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {recent.map((it, i) => (
              <motion.div
                key={pillar.id + i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl p-4"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--surface-elevated) 70%, transparent), color-mix(in oklab, var(--surface) 60%, transparent))",
                  boxShadow:
                    "inset 0 1px 0 oklch(1 0 0 / 0.04), 0 0 0 1px oklch(1 0 0 / 0.05)",
                }}
              >
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.22em]"
                  style={{
                    background: `color-mix(in oklab, ${pillar.hue} 18%, transparent)`,
                    color: "color-mix(in oklab, var(--foreground) 90%, transparent)",
                    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${pillar.hue} 35%, transparent)`,
                  }}
                >
                  {it.kind}
                </span>
                <div className="mt-3 text-[14px] leading-snug text-foreground/95">{it.title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{it.meta}</div>
                <div
                  aria-hidden
                  className="mt-3 h-[2px] w-8 rounded-full"
                  style={{ background: pillar.hue, opacity: 0.7 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ---------- environment (deep pillar view) ---------- */

function Environment({
  pillar,
  onClose,
}: {
  pillar: Pillar;
  onClose: () => void;
}) {
  return (
    <motion.section
      key={pillar.id + "-env"}
      initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.01, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto w-full max-w-[1600px] px-12 pt-2"
    >
      {/* return bar */}
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
        <button
          type="button"
          onClick={onClose}
          className="group flex items-center gap-3 rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-2 transition-colors hover:bg-foreground/[0.07]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>Return to KOS · Six Pillars</span>
        </button>
        <span>Esc · return</span>
      </div>

      {/* title block */}
      <div className="mt-10 flex items-end justify-between gap-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-base serif"
              style={{
                background: `color-mix(in oklab, ${pillar.hue} 28%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${pillar.hue} 55%, transparent)`,
              }}
            >
              {pillar.name[0]}
            </div>
            <div className="flex flex-col text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              <span>Pillar · {pillar.index} · Environment</span>
              <span>{pillar.toneLabel}</span>
            </div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="serif mt-6 text-7xl leading-[0.95] md:text-8xl"
          >
            {pillar.name}
          </motion.h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">{pillar.tagline}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Domains</div>
          <div className="serif mt-2 text-6xl leading-none">{pillar.domains.length}</div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            {pillar.domains.reduce((a, d) => a + d.count, 0).toLocaleString()} entities
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="mt-10 h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${pillar.hue} 50%, transparent), transparent)`,
        }}
      />

      {/* domains grid */}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {pillar.domains.map((d, i) => (
          <DomainCard key={d.id} pillar={pillar} domain={d} index={i} />
        ))}
      </div>

      {/* recent in pillar */}
      <div className="mt-16 flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
        <span>Recent in {pillar.name}</span>
        <span>{pillar.recent.length} entities · most recent first</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
        {pillar.recent.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl p-4"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--surface-elevated) 70%, transparent), color-mix(in oklab, var(--surface) 55%, transparent))",
              boxShadow:
                "inset 0 1px 0 oklch(1 0 0 / 0.04), 0 0 0 1px oklch(1 0 0 / 0.05)",
            }}
          >
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.22em]"
              style={{
                background: `color-mix(in oklab, ${pillar.hue} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${pillar.hue} 35%, transparent)`,
              }}
            >
              {it.kind}
            </span>
            <div className="mt-3 text-[14px] leading-snug">{it.title}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{it.meta}</div>
          </motion.div>
        ))}
      </div>

      <div className="h-16" />
    </motion.section>
  );
}

function DomainCard({
  pillar,
  domain,
  index,
}: {
  pillar: Pillar;
  domain: Domain;
  index: number;
}) {
  const Icon = domain.icon;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.05 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl p-5 text-left focus:outline-none"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--surface-elevated) 80%, transparent), color-mix(in oklab, var(--surface) 60%, transparent))",
        boxShadow:
          "inset 0 1px 0 oklch(1 0 0 / 0.05), 0 0 0 1px oklch(1 0 0 / 0.06), 0 20px 40px -30px oklch(0 0 0 / 0.6)",
        minHeight: 158,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(90% 80% at 100% 0%, color-mix(in oklab, ${pillar.hue} 22%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklab, ${pillar.hue} 20%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${pillar.hue} 45%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {domain.count.toLocaleString()}
        </span>
      </div>
      <div className="relative mt-6">
        <div className="text-[18px] leading-tight">{domain.name}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{domain.blurb}</div>
        <div
          aria-hidden
          className="mt-3 h-[2px] w-6 rounded-full opacity-70 transition-all duration-500 group-hover:w-12"
          style={{ background: pillar.hue }}
        />
      </div>
    </motion.button>
  );
}
