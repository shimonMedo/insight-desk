import OpenAI from "openai";
import { findBestKnowledgeMatch, findKnowledgeMatches } from "./knowledge";

type ChatResult = {
  answer: string;
  source: string;
};

type TicketAnalysis = {
  failureReason: string;
  suggestedFix: string;
  fixType: string;
  triage: string;
  productArea: string;
  issueKind: string;
};

let openAiClient: OpenAI | null | undefined;

function getOpenAiClient() {
  if (openAiClient !== undefined) {
    return openAiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  openAiClient = apiKey ? new OpenAI({ apiKey }) : null;
  return openAiClient;
}

function fallbackTicketAnalysis(): TicketAnalysis {
  return {
    failureReason: "The answer did not resolve the user's problem.",
    suggestedFix:
      "Review the workflow explanation and clarify the next step in the UI or help content.",
    fixType: "Needs review",
    triage: "needs_human_support",
    productArea: "general_workflow",
    issueKind: "missing_guidance",
  };
}

export async function generateChatAnswerWithOpenAi(
  question: string,
): Promise<ChatResult | null> {
  const client = getOpenAiClient();

  if (!client) {
    return null;
  }

  try {
    const matches = findKnowledgeMatches(question, 3);
    const bestMatch = findBestKnowledgeMatch(question);
    const context =
      matches.length > 0
        ? matches
            .map(
              (match, index) =>
                `Knowledge source ${index + 1}: ${match.title}\n${match.content}`,
            )
            .join("\n\n")
        : "No strong knowledge document was found. If the answer is uncertain, say that the issue should be escalated for human follow-up.";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are the support assistant for InsightDesk, a pharmacy inventory platform. Answer in a professional support tone. Use only the provided context, do not invent screens or actions that are not described, prefer concrete next steps inside the current product, and if the context is not strong enough say so clearly and recommend escalation for human follow-up.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `Question: ${question}\n\nContext:\n${context}\n\n` +
                "Respond with: 1) the likely explanation, 2) the next action inside InsightDesk, and 3) when escalation is appropriate if the issue remains unresolved.",
            },
          ],
        },
      ],
    });

    const answer = response.output_text.trim();

    if (!answer) {
      return null;
    }

    return {
      answer,
      source: bestMatch
        ? `OpenAI + local knowledge: ${bestMatch.title}`
        : "OpenAI fallback",
    };
  } catch (error) {
    console.warn("OpenAI chat fallback triggered:", error);
    return null;
  }
}

export async function generateTicketAnalysisWithOpenAi(
  userQuestion: string,
  aiAnswer: string,
): Promise<TicketAnalysis> {
  const client = getOpenAiClient();

  if (!client) {
    return fallbackTicketAnalysis();
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You analyze failed support interactions for InsightDesk. Be conservative and professional. Do not classify an issue as a product gap or bug candidate unless the failure clearly points to missing product behavior, misleading UI, broken workflow, or repeated friction. Return strict JSON with keys: failureReason, suggestedFix, fixType, triage, productArea, issueKind. triage must be one of: support_guidance, needs_human_support, product_gap, bug_candidate. productArea must be one of: inventory_dashboard, reorder_workflow, shipment_status, support_chat, insights_dashboard, knowledge_content, general_workflow. issueKind must be one of: missing_guidance, navigation_confusion, status_explanation, workflow_gap, ui_visibility, state_sync, repeated_question, feature_gap.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `User question: ${userQuestion}\n` +
                `AI answer: ${aiAnswer}\n` +
                "Explain why the answer may have failed, suggest the likely improvement, classify the issue, and choose the most stable productArea and issueKind so similar future cases map to the same group. Prefer support_guidance when the answer mainly needs clearer wording. Use product_gap or bug_candidate only when the product itself likely needs improvement.",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "ticket_analysis",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              failureReason: { type: "string" },
              suggestedFix: { type: "string" },
              fixType: { type: "string" },
              triage: { type: "string" },
              productArea: { type: "string" },
              issueKind: { type: "string" },
            },
            required: [
              "failureReason",
              "suggestedFix",
              "fixType",
              "triage",
              "productArea",
              "issueKind",
            ],
          },
          strict: true,
        },
      },
    });

    const parsed = JSON.parse(response.output_text) as TicketAnalysis;

    return {
      failureReason: parsed.failureReason,
      suggestedFix: parsed.suggestedFix,
      fixType: parsed.fixType,
      triage: parsed.triage,
      productArea: parsed.productArea,
      issueKind: parsed.issueKind,
    };
  } catch (error) {
    console.warn("OpenAI ticket analysis fallback triggered:", error);
    return fallbackTicketAnalysis();
  }
}
