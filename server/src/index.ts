import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { readEnv } from "./config/env";
import { getChatAnswer } from "./lib/chat";
import { getMedicationStatus } from "./lib/medications";
import { generateTicketAnalysisWithOpenAi } from "./lib/openai";
import { prisma } from "./lib/prisma";
import { buildTicketRouting, buildTopicKey } from "./lib/ticketTriage";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const env = readEnv();
const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "insightdesk-server",
  });
});

app.get("/api/medications", async (_request, response) => {
  const medications = await prisma.medication.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  response.json({
    medications: medications.map((medication) => ({
      ...medication,
      status: getMedicationStatus(medication),
    })),
  });
});

app.patch("/api/medications/:id/ship", async (request, response) => {
  const medicationId = request.params.id;
  const amount =
    typeof request.body?.amount === "number" && request.body.amount > 0
      ? Math.floor(request.body.amount)
      : 1;

  const existingMedication = await prisma.medication.findUnique({
    where: { id: medicationId },
  });

  if (!existingMedication) {
    response.status(404).json({ error: "Medication not found." });
    return;
  }

  const nextQuantity = Math.max(0, existingMedication.quantity - amount);
  const medication = await prisma.medication.update({
    where: { id: medicationId },
    data: {
      quantity: nextQuantity,
      reorderStatus:
        nextQuantity <= existingMedication.reorderThreshold &&
        existingMedication.reorderStatus === "none"
          ? "pending"
          : existingMedication.reorderStatus,
    },
  });

  response.json({
    medication: {
      ...medication,
      status: getMedicationStatus(medication),
    },
  });
});

app.patch("/api/medications/:id/restock", async (request, response) => {
  const medicationId = request.params.id;
  const amount =
    typeof request.body?.amount === "number" && request.body.amount > 0
      ? Math.floor(request.body.amount)
      : 10;

  const existingMedication = await prisma.medication.findUnique({
    where: { id: medicationId },
  });

  if (!existingMedication) {
    response.status(404).json({ error: "Medication not found." });
    return;
  }

  const medication = await prisma.medication.update({
    where: { id: medicationId },
    data: {
      quantity: existingMedication.quantity + amount,
      reorderStatus: "none",
    },
  });

  response.json({
    medication: {
      ...medication,
      status: getMedicationStatus(medication),
    },
  });
});

app.patch("/api/medications/:id/reorder", async (request, response) => {
  const medicationId = request.params.id;

  const existingMedication = await prisma.medication.findUnique({
    where: { id: medicationId },
  });

  if (!existingMedication) {
    response.status(404).json({ error: "Medication not found." });
    return;
  }

  const medication = await prisma.medication.update({
    where: { id: medicationId },
    data: {
      reorderStatus: "ordered",
    },
  });

  response.json({
    medication: {
      ...medication,
      status: getMedicationStatus(medication),
    },
  });
});

app.post("/api/chat", async (request, response) => {
  const question =
    typeof request.body?.question === "string" ? request.body.question.trim() : "";

  if (!question) {
    response.status(400).json({
      error: "Question is required.",
    });
    return;
  }

  const reply = await getChatAnswer(question);

  response.json(reply);
});

app.post("/api/tickets", async (request, response) => {
  const userQuestion =
    typeof request.body?.userQuestion === "string"
      ? request.body.userQuestion.trim()
      : "";
  const aiAnswer =
    typeof request.body?.aiAnswer === "string"
      ? request.body.aiAnswer.trim()
      : "";
  const wasHelpful =
    typeof request.body?.wasHelpful === "boolean"
      ? request.body.wasHelpful
      : null;

  if (!userQuestion || !aiAnswer || wasHelpful !== false) {
    response.status(400).json({
      error:
        "userQuestion, aiAnswer, and wasHelpful=false are required to create a ticket.",
    });
    return;
  }

  const analysis = await generateTicketAnalysisWithOpenAi(
    userQuestion,
    aiAnswer,
  );
  const topicKey = buildTopicKey({
    ...analysis,
    userQuestion,
    aiAnswer,
  });
  const existingTopicCount = await prisma.ticket.count({
    where: {
      topicKey,
    },
  });

  const routing = buildTicketRouting(
    {
      ...analysis,
      userQuestion,
      aiAnswer,
    },
    {
    count: existingTopicCount,
    },
  );

  const ticket = await prisma.ticket.create({
    data: {
      userQuestion,
      aiAnswer,
      wasHelpful,
      failureReason: analysis.failureReason,
      suggestedFix: analysis.suggestedFix,
      fixType: analysis.fixType,
      triage: routing.triage,
      topicKey: routing.topicKey,
      repeatCount: routing.repeatCount,
      routeToInsights: routing.routeToInsights,
      surfaceReason: routing.surfaceReason,
    },
  });

  response.status(201).json({
    ticket,
  });
});

app.get("/api/tickets", async (request, response) => {
  const includeAll = request.query.scope === "all";
  const tickets = await prisma.ticket.findMany({
    where: includeAll
      ? undefined
      : {
          routeToInsights: true,
        },
    orderBy: {
      createdAt: "desc",
    },
  });

  response.json({ tickets });
});

app.get("/api/tickets/summary", async (_request, response) => {
  const [total, open] = await Promise.all([
    prisma.ticket.count({
      where: {
        routeToInsights: true,
      },
    }),
    prisma.ticket.count({
      where: {
        routeToInsights: true,
        status: {
          not: "fixed",
        },
      },
    }),
  ]);

  response.json({
    total,
    open,
    fixed: total - open,
  });
});

app.patch("/api/tickets/:id", async (request, response) => {
  const ticketId = request.params.id;
  const status =
    typeof request.body?.status === "string" ? request.body.status.trim() : "";

  if (!ticketId || !status) {
    response.status(400).json({
      error: "Ticket id and status are required.",
    });
    return;
  }

  const ticket = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status,
    },
  });

  response.json({ ticket });
});

app.listen(env.port, () => {
  console.log(`InsightDesk server running on http://localhost:${env.port}`);
});
