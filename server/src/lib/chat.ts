import { buildKnowledgeAnswer } from "./knowledge";
import { generateChatAnswerWithOpenAi } from "./openai";

type ChatReply = {
  answer: string;
  source: string;
};

export async function getChatAnswer(question: string): Promise<ChatReply> {
  const openAiAnswer = await generateChatAnswerWithOpenAi(question);

  if (openAiAnswer) {
    return openAiAnswer;
  }

  return buildKnowledgeAnswer(question);
}
