export type KindleWorkflowStatus = "inbox" | "converted" | "review" | "approved" | "sent" | "issue";

export type EpubInspection = {
  validPackage: boolean;
  hasNavigation: boolean;
  textCharacters: number;
  wordCount: number;
  documentCount: number;
  imageCount: number;
  verdict: "pass" | "warning" | "fail";
  findings: string[];
  inspectedAt: string;
};

export type KindleQualityChecklist = {
  textReadable: boolean;
  navigationWorks: boolean;
  imagesAcceptable: boolean;
  formattingAcceptable: boolean;
  testedOnKindle: boolean;
};

export type KindleBookRecord = {
  assetId: string;
  sourceAssetId?: string;
  status: KindleWorkflowStatus;
  target: "epub" | "azw3";
  inspection?: EpubInspection;
  checklist: KindleQualityChecklist;
  notes: string;
  updatedAt: string;
  sentAt?: string;
};

export const EMPTY_KINDLE_CHECKLIST: KindleQualityChecklist = {
  textReadable: false,
  navigationWorks: false,
  imagesAcceptable: false,
  formattingAcceptable: false,
  testedOnKindle: false,
};
