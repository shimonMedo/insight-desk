import fs from "fs";
import path from "path";

type KnowledgeDocument = {
  fileName: string;
  title: string;
  content: string;
  score: number;
};

const knowledgeDirectory = path.join(process.cwd(), "data", "knowledge");
const ignoredTokens = new Set([
  "what",
  "when",
  "where",
  "which",
  "with",
  "from",
  "that",
  "this",
  "have",
  "your",
  "will",
  "about",
  "after",
  "before",
  "into",
  "them",
  "they",
  "does",
  "need",
  "show",
  "next",
  "item",
  "page",
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !ignoredTokens.has(token));
}

function readKnowledgeFiles() {
  if (!fs.existsSync(knowledgeDirectory)) {
    return [];
  }

  return fs
    .readdirSync(knowledgeDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(knowledgeDirectory, fileName);
      const rawContent = fs.readFileSync(fullPath, "utf8");
      const [firstLine, ...restLines] = rawContent.split(/\r?\n/);
      const title = firstLine.replace(/^#\s*/, "").trim() || fileName;

      return {
        fileName,
        title,
        content: restLines.join(" ").trim(),
      };
    });
}

function scoreDocument(questionTokens: string[], documentText: string) {
  const normalizedDocument = normalizeText(documentText);

  return questionTokens.reduce((score, token) => {
    return normalizedDocument.includes(token) ? score + 1 : score;
  }, 0);
}

function summarizeContent(content: string) {
  const cleanContent = content.replace(/\s+/g, " ").trim();

  if (cleanContent.length <= 320) {
    return cleanContent;
  }

  return `${cleanContent.slice(0, 317).trim()}...`;
}

export function findKnowledgeMatches(
  question: string,
  limit = 3,
): KnowledgeDocument[] {
  const questionTokens = tokenize(question);

  if (questionTokens.length === 0) {
    return [];
  }

  return readKnowledgeFiles()
    .map((document) => ({
      ...document,
      score: scoreDocument(
        questionTokens,
        `${document.title} ${document.content} ${document.fileName}`,
      ),
    }))
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function findBestKnowledgeMatch(question: string): KnowledgeDocument | null {
  return findKnowledgeMatches(question, 1)[0] ?? null;
}

export function buildKnowledgeAnswer(question: string) {
  const matches = findKnowledgeMatches(question, 2);
  const bestMatch = matches[0];

  if (!bestMatch) {
    return {
      answer:
        "I could not find a strong match in the local knowledge base yet. This kind of case should be escalated so the team can review the gap and improve the support flow.",
      source: "Local knowledge fallback",
    };
  }

  const combinedContent = matches.map((match) => summarizeContent(match.content));

  return {
    answer: combinedContent.join("\n\n"),
    source:
      matches.length > 1
        ? `Local knowledge: ${matches.map((match) => match.title).join(" + ")}`
        : `Local knowledge: ${bestMatch.title}`,
  };
}
