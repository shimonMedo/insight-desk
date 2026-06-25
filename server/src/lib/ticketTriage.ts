type TriageLevel =
  | "support_guidance"
  | "needs_human_support"
  | "product_gap"
  | "bug_candidate";

type TicketAnalysisInput = {
  fixType: string;
  triage: string;
  productArea: string;
  issueKind: string;
  userQuestion?: string;
  aiAnswer?: string;
  failureReason?: string;
};

type ExistingTopicStats = {
  count: number;
};

type TicketRouting = {
  topicKey: string;
  triage: TriageLevel;
  repeatCount: number;
  routeToInsights: boolean;
  surfaceReason: string | null;
};

const supportedTriages: TriageLevel[] = [
  "support_guidance",
  "needs_human_support",
  "product_gap",
  "bug_candidate",
];

const supportedProductAreas = [
  "inventory_dashboard",
  "reorder_workflow",
  "shipment_status",
  "support_chat",
  "insights_dashboard",
  "knowledge_content",
  "general_workflow",
] as const;

const supportedIssueKinds = [
  "missing_guidance",
  "navigation_confusion",
  "status_explanation",
  "workflow_gap",
  "ui_visibility",
  "state_sync",
  "repeated_question",
  "feature_gap",
] as const;

type SupportedProductArea = (typeof supportedProductAreas)[number];
type SupportedIssueKind = (typeof supportedIssueKinds)[number];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function normalizeSupportedValue<T extends readonly string[]>(
  value: string,
  supportedValues: T,
  fallback: T[number],
): T[number] {
  return supportedValues.includes(value as T[number])
    ? (value as T[number])
    : fallback;
}

function matchesAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

function buildSignalText(analysis: TicketAnalysisInput) {
  return [
    analysis.userQuestion,
    analysis.aiAnswer,
    analysis.failureReason,
    analysis.fixType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferProductArea(analysis: TicketAnalysisInput): SupportedProductArea {
  const signalText = buildSignalText(analysis);

  if (matchesAny(signalText, ["shipment", "pending status", "shipment status"])) {
    return "shipment_status";
  }

  if (
    matchesAny(signalText, [
      "reorder",
      "low-stock",
      "low stock",
      "threshold",
      "ordered state",
    ])
  ) {
    return "reorder_workflow";
  }

  if (matchesAny(signalText, ["insights dashboard", "open support requests", "unresolved support issues"])) {
    return "insights_dashboard";
  }

  if (matchesAny(signalText, ["support assistant", "chat", "escalate"])) {
    return "support_chat";
  }

  if (matchesAny(signalText, ["inventory update", "inventory board", "inventory dashboard", "medication"])) {
    return "inventory_dashboard";
  }

  if (matchesAny(signalText, ["knowledge base", "documentation", "help content"])) {
    return "knowledge_content";
  }

  return normalizeSupportedValue(
    analysis.productArea,
    supportedProductAreas,
    "general_workflow",
  );
}

function inferIssueKind(analysis: TicketAnalysisInput): SupportedIssueKind {
  const signalText = buildSignalText(analysis);

  if (matchesAny(signalText, ["shortcut", "badge", "button", "visible", "show up", "appear"])) {
    return "ui_visibility";
  }

  if (
    matchesAny(signalText, [
      "where can i",
      "how can i find",
      "link directly",
      "dashboard is",
      "navigate",
      "navigation",
    ])
  ) {
    return "navigation_confusion";
  }

  if (matchesAny(signalText, ["status", "pending", "ordered", "what it contains", "what does"])) {
    return "status_explanation";
  }

  if (matchesAny(signalText, ["sync", "delay", "refresh", "not updated", "still wrong"])) {
    return "state_sync";
  }

  if (matchesAny(signalText, ["does not exist", "workflow", "process", "step", "action panel"])) {
    return "workflow_gap";
  }

  if (matchesAny(signalText, ["repeated", "again", "same issue"])) {
    return "repeated_question";
  }

  if (matchesAny(signalText, ["missing feature", "not available", "cannot do this"])) {
    return "feature_gap";
  }

  return normalizeSupportedValue(
    analysis.issueKind,
    supportedIssueKinds,
    "missing_guidance",
  );
}

export function normalizeTriage(value: string): TriageLevel {
  if (supportedTriages.includes(value as TriageLevel)) {
    return value as TriageLevel;
  }

  return "needs_human_support";
}

export function buildTopicKey(analysis: TicketAnalysisInput) {
  const triage = normalizeTriage(analysis.triage);
  const productArea = inferProductArea(analysis);
  const issueKind = inferIssueKind(analysis);

  return slugify(`${triage}-${productArea}-${issueKind}`) || "needs-human-support";
}

export function buildTicketRouting(
  analysis: TicketAnalysisInput,
  existingTopicStats: ExistingTopicStats,
): TicketRouting {
  const triage = normalizeTriage(analysis.triage);
  const topicKey = buildTopicKey(analysis);
  const repeatCount = existingTopicStats.count + 1;

  const routeToInsights =
    triage === "product_gap" ||
    triage === "bug_candidate" ||
    repeatCount >= 2;

  let surfaceReason: string | null = null;

  if (triage === "bug_candidate") {
    surfaceReason = "Classified as a likely product or workflow bug.";
  } else if (triage === "product_gap") {
    surfaceReason = "Classified as a product or UX gap worth reviewing.";
  } else if (repeatCount >= 2) {
    surfaceReason = "Similar support friction has appeared more than once.";
  }

  return {
    topicKey,
    triage,
    repeatCount,
    routeToInsights,
    surfaceReason,
  };
}
