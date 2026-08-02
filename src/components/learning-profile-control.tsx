import { Plus, UserRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LearningProfile, LearningProfileKind } from "@/kos";

export function LearningProfileControl({
  profiles,
  activeProfileId,
  onSelect,
  onCreate,
  compact = false,
}: {
  profiles: LearningProfile[];
  activeProfileId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string, kind?: LearningProfileKind) => LearningProfile | null;
  compact?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function addProfile() {
    if (!onCreate(name, "child")) return;
    setName("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative">
        <span className="sr-only">Perfil de aprendizagem</span>
        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={activeProfileId}
          onChange={(event) => onSelect(event.target.value)}
          className={`border border-foreground/15 bg-surface pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
            compact ? "h-10" : "h-11"
          }`}
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id} className="bg-background">
              {profile.name}
            </option>
          ))}
        </select>
      </label>
      {adding ? (
        <div className="flex min-w-[260px] gap-2">
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addProfile();
              if (event.key === "Escape") setAdding(false);
            }}
            placeholder="Nome do novo perfil"
            className="h-10 rounded-none bg-surface"
          />
          <Button
            type="button"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={addProfile}
            aria-label="Criar perfil"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-none bg-surface"
          onClick={() => setAdding(true)}
          aria-label="Adicionar perfil"
          title="Adicionar perfil"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
