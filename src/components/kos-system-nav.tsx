import { Link } from "@tanstack/react-router";
import { Archive, Brain, Clapperboard, GraduationCap, Home } from "lucide-react";

const ITEMS = [
  { id: "home", label: "Inicio", to: "/", icon: Home },
  { id: "study", label: "Estudo", to: "/study", icon: Brain },
  { id: "vault", label: "Cofre", to: "/vault", icon: Archive },
  { id: "media", label: "Video", to: "/study/media", icon: Clapperboard },
  { id: "academy", label: "Academia", to: "/legacy/academy", icon: GraduationCap },
] as const;

export type KosSystemArea = (typeof ITEMS)[number]["id"];

export function KosSystemNav({ active }: { active: KosSystemArea }) {
  return (
    <nav
      aria-label="Areas principais do KOS"
      className="flex max-w-full gap-2 overflow-x-auto pb-2"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const selected = item.id === active;
        return (
          <Link
            key={item.id}
            to={item.to}
            aria-current={selected ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
              selected
                ? "border-foreground/30 bg-surface-elevated text-foreground"
                : "border-foreground/15 bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
