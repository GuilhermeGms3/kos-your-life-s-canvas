export type LearningProfileKind = "self" | "child";

export type LearningProfile = {
  id: string;
  name: string;
  kind: LearningProfileKind;
  createdAt: string;
};

export type LearningAttempt = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
};

export type LearningUnitState = {
  nodeId: string;
  profileId: string;
  materialAssetIds: string[];
  primaryAssetId: string;
  note: string;
  teacherExplanation: string;
  customObjectives: string[];
  challengePrompt: string;
  challengeEvidence: string;
  materialStudied: boolean;
  reviewDueAt: string;
  reviewCompletedAt: string;
  attempts: LearningAttempt[];
  updatedAt: string;
};

export type LearningUnitTemplate = {
  nodeId: string;
  introduction: string;
  objectives: string[];
  challenge: string;
  relationships: string[];
  estimatedSessions: number;
};

export type LearningUnitCollection = Record<string, LearningUnitState>;
