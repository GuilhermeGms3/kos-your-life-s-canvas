import { useEffect } from "react";

import { useKosLocalState } from "./use-kos-local-state";
import type { AcademyState } from "./vault";
import type { LearningProfile, LearningProfileKind } from "./learning";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

export const DEFAULT_LEARNING_PROFILE: LearningProfile = {
  id: "self",
  name: "Meu perfil",
  kind: "self",
  createdAt: CREATED_AT,
};

export function getAcademyProfileFallback(profileId: string): AcademyState {
  const empty: AcademyState = { completedNodeIds: [], rewardAssetIds: {} };
  if (typeof window === "undefined" || profileId !== DEFAULT_LEARNING_PROFILE.id) {
    return empty;
  }

  const previousState = window.localStorage.getItem("kos.legacy.academy");
  if (!previousState) return empty;
  try {
    return JSON.parse(previousState) as AcademyState;
  } catch {
    return empty;
  }
}

function createProfileId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `profile-${Date.now().toString(36)}`;
}

export function useLearningProfiles() {
  const [profiles, setProfiles] = useKosLocalState<LearningProfile[]>("kos.learning.profiles", [
    DEFAULT_LEARNING_PROFILE,
  ]);
  const [activeProfileId, setActiveProfileId] = useKosLocalState(
    "kos.learning.activeProfile",
    DEFAULT_LEARNING_PROFILE.id,
  );

  useEffect(() => {
    if (profiles.some((profile) => profile.id === activeProfileId)) return;
    setActiveProfileId(profiles[0]?.id ?? DEFAULT_LEARNING_PROFILE.id);
  }, [activeProfileId, profiles, setActiveProfileId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const previousState = window.localStorage.getItem("kos.legacy.academy");
    const profileStateKey = `kos.legacy.academy.${DEFAULT_LEARNING_PROFILE.id}`;
    if (previousState && !window.localStorage.getItem(profileStateKey)) {
      window.localStorage.setItem(profileStateKey, previousState);
    }
  }, []);

  function createProfile(name: string, kind: LearningProfileKind = "child") {
    const cleanName = name.trim();
    if (!cleanName) return null;
    const profile: LearningProfile = {
      id: createProfileId(),
      name: cleanName,
      kind,
      createdAt: new Date().toISOString(),
    };
    setProfiles((current) => [...current, profile]);
    setActiveProfileId(profile.id);
    return profile;
  }

  const activeProfile =
    profiles.find((profile) => profile.id === activeProfileId) ??
    profiles[0] ??
    DEFAULT_LEARNING_PROFILE;

  return {
    profiles,
    activeProfile,
    activeProfileId: activeProfile.id,
    setActiveProfileId,
    createProfile,
  };
}
