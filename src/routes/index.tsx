import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
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
import {
  INITIAL_PILLAR_INDEX,
  PILLARS,
  getPillarRoom,
  type KosDomain,
  type KosIconName,
  type Pillar,
  type PillarId,
} from "@/kos";

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

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

const KOS_ICONS: Record<KosIconName, IconComponent> = {
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  "file-text": FileText,
  "file-type": FileType,
  atom: Atom,
  sigma: Sigma,
  cpu: Cpu,
  brain: Brain,
  gamepad: Gamepad2,
  film: Film,
  plane: Plane,
  "calendar-days": CalendarDays,
  trophy: Trophy,
  image: ImageIcon,
  clapperboard: Clapperboard,
  sparkles: SparklesIcon,
  "pen-line": PenLine,
  "scroll-text": ScrollText,
  code: Code2,
  "folder-kanban": FolderKanban,
  lightbulb: Lightbulb,
  flask: FlaskConical,
  palette: Palette,
  music: Music,
  clock: Clock3,
  "notebook-pen": NotebookPen,
  users: Users,
  heart: Heart,
  star: Star,
  network: Network,
  telescope: Telescope,
  "git-branch": GitBranch,
  link: Link2,
  compass: Compass,
  "book-marked": BookMarked,
  feather: Feather,
};

/* ---------- layout consts ---------- */

const TILE_W = 320;
const TILE_H = 420;
const TILE_GAP = 32;
const STRIDE = TILE_W + TILE_GAP;

/* ---------- root ---------- */

function Home() {
  const [focusIdx, setFocusIdx] = useState(INITIAL_PILLAR_INDEX);
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
  const activePillar = environment ? PILLARS.find((p) => p.id === environment)! : focused;

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
            backgroundImage: "radial-gradient(oklch(1 0 0 / 0.03) 1px, transparent 1px)",
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
        <Link
          to="/study"
          className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-2 text-foreground/90 transition-colors hover:bg-foreground/[0.08] focus:outline-none focus:ring-1 focus:ring-ring"
        >
          Study Core
        </Link>
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
          style={{
            background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.18), transparent)",
          }}
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

function ContextStrip({ pillar, index, total }: { pillar: Pillar; index: number; total: number }) {
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
                  boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.04), 0 0 0 1px oklch(1 0 0 / 0.05)",
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

function Environment({ pillar, onClose }: { pillar: Pillar; onClose: () => void }) {
  const room = getPillarRoom(pillar.id);

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
          {room && (
            <div className="mt-7">
              {pillar.id === "knowledge" ? (
                <Link
                  to="/study"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-foreground/10 bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {room.routeLabel}
                </Link>
              ) : (
                <Link
                  to="/pillars/$pillarId"
                  params={{ pillarId: pillar.id }}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-foreground/10 bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {room.routeLabel}
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            Domains
          </div>
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
              boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.04), 0 0 0 1px oklch(1 0 0 / 0.05)",
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
  domain: KosDomain;
  index: number;
}) {
  const Icon = KOS_ICONS[domain.icon];
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
