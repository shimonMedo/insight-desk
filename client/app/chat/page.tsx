"use client";

import { FormEvent, useState } from "react";
import { TopNav } from "../../components/TopNav";
import { getApiBaseUrl } from "../../lib/api";

type ChatResponse = {
  answer: string;
  source: string;
};

type TicketCreationResponse = {
  ticket: {
    id: string;
    status: string;
    triage: string;
    repeatCount: number;
    routeToInsights: boolean;
  };
};

const suggestedQuestions = [
  "Why did my shipment status stay pending after stock was removed?",
  "How do I know that a reorder was already placed?",
  "Where can I review unresolved support issues from chat?",
  "What should I do if inventory still looks wrong after an update?",
];

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState("");
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(
    null,
  );
  const [ticketMessage, setTicketMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion(nextQuestion?: string) {
    const value = (nextQuestion ?? question).trim();
    const apiUrl = getApiBaseUrl();

    if (!value) {
      setError("Please enter a support question first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setFeedback(null);
    setTicketMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: value,
        }),
      });

      if (!response.ok) {
        throw new Error("The support service could not answer right now.");
      }

      const data = (await response.json()) as ChatResponse;
      setQuestion(value);
      setAnswer(data.answer);
      setSource(data.source);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while contacting the support service.",
      );
      setAnswer("");
      setSource("");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitQuestion();
  }

  async function submitTicket() {
    if (!question || !answer) {
      return;
    }

    const apiUrl = getApiBaseUrl();

    setIsSubmittingTicket(true);
    setError("");
    setTicketMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuestion: question,
          aiAnswer: answer,
          wasHelpful: false,
        }),
      });

      if (!response.ok) {
        throw new Error("The escalation ticket could not be created.");
      }

      const data = (await response.json()) as TicketCreationResponse;
      setFeedback("not-helpful");
      setTicketMessage(
        data.ticket.routeToInsights
          ? `Ticket ${data.ticket.id.slice(0, 8)} was added to Insights for product review.`
          : data.ticket.repeatCount > 1
            ? `Ticket ${data.ticket.id.slice(0, 8)} was stored as repeated support friction and may be promoted to Insights.`
            : `Ticket ${data.ticket.id.slice(0, 8)} was stored for support follow-up.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while creating the escalation ticket.",
      );
    } finally {
      setIsSubmittingTicket(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <TopNav currentPath="/chat" />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-rust">
              Support Layer
            </p>
            <h1 className="text-4xl font-semibold text-ink">
              Inventory Support Assistant
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-ink/80">
              Ask inventory and workflow questions, get an AI-assisted answer,
              and escalate unresolved issues for human follow-up when needed.
            </p>
          </div>

          <article className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
              Why this matters
            </p>
            <p className="mt-3 text-sm leading-7 text-ink/70">
              This page is intentionally part of the same operational story.
              When the assistant cannot unblock the user, the failure becomes
              structured input for the insights workflow instead of a dead end.
            </p>
          </article>
        </section>

        <section className="grid gap-3 rounded-[1.75rem] border border-ink/10 bg-ink px-6 py-5 text-sand lg:grid-cols-3">
          <div className="rounded-[1.4rem] bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sand/50">
              Ask
            </p>
            <p className="mt-2 text-sm leading-7 text-sand/85">
              Submit an inventory or workflow question.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sand/50">
              Answer
            </p>
            <p className="mt-2 text-sm leading-7 text-sand/85">
              Use local knowledge and OpenAI when available.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sand/50">
              Escalate
            </p>
            <p className="mt-2 text-sm leading-7 text-sand/85">
              Send unresolved cases to the insights backlog.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink/70">
                  Ask an inventory support question
                </span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Example: Why did my shipment status stay pending?"
                  className="min-h-40 w-full rounded-3xl border border-ink/10 bg-sand px-5 py-4 text-base outline-none transition focus:border-rust"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-sand transition hover:bg-rust disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Checking knowledge..." : "Get support answer"}
                </button>
              </div>
            </form>

            {error ? (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 rounded-[2rem] border border-ink/10 bg-sand/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
                Support answer
              </p>
              <p className="mt-3 min-h-24 text-base leading-8 text-ink">
                {answer || "Your answer will appear here after you submit a question."}
              </p>
              {source ? (
                <p className="mt-3 text-sm text-ink/60">Source: {source}</p>
              ) : null}

              {answer ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedback("helpful")}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      feedback === "helpful"
                        ? "bg-moss text-white"
                        : "border border-ink/10 bg-white text-ink hover:border-moss"
                    }`}
                  >
                    Answer resolved it
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void submitTicket();
                    }}
                    disabled={isSubmittingTicket}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      feedback === "not-helpful"
                        ? "bg-rust text-white"
                        : "border border-ink/10 bg-white text-ink hover:border-rust"
                    }`}
                  >
                    {isSubmittingTicket
                      ? "Escalating issue..."
                      : "Escalate issue"}
                  </button>
                </div>
              ) : null}

              {ticketMessage ? (
                <p className="mt-4 text-sm text-moss">{ticketMessage}</p>
              ) : null}
            </div>
          </article>

          <aside className="space-y-4 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
                Suggested questions
              </p>
              <p className="text-sm leading-7 text-ink/70">
                Use one of these to test the support assistant flow.
              </p>
            </div>

            <div className="space-y-3">
              {suggestedQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuestion(item);
                    void submitQuestion(item);
                  }}
                  className="w-full rounded-3xl border border-ink/10 bg-sand/70 px-4 py-4 text-left text-sm leading-7 text-ink transition hover:border-rust hover:bg-sand"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-rust/15 bg-rust/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rust">
                Demo Tip
              </p>
              <p className="mt-2 text-sm leading-7 text-ink/70">
                For a strong demo, ask something slightly beyond the current
                knowledge base and then escalate it to show the full product
                loop.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
