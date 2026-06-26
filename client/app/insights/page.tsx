"use client";

import { useEffect, useState } from "react";
import { TopNav } from "../../components/TopNav";
import { getApiBaseUrl } from "../../lib/api";

type Ticket = {
  id: string;
  userQuestion: string;
  aiAnswer: string;
  wasHelpful: boolean | null;
  failureReason: string | null;
  suggestedFix: string | null;
  fixType: string | null;
  triage: string;
  repeatCount: number;
  surfaceReason: string | null;
  status: string;
  createdAt: string;
};

type TicketResponse = {
  tickets: Ticket[];
};

const statuses = ["new", "reviewed", "fixed"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InsightsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      const apiUrl = getApiBaseUrl();

      try {
        const response = await fetch(`${apiUrl}/api/tickets`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load support insights right now.");
        }

        const data = (await response.json()) as TicketResponse;
        setTickets(data.tickets);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong while loading the tickets.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadTickets();
  }, []);

  async function updateStatus(ticketId: string, status: string) {
    const apiUrl = getApiBaseUrl();

    setUpdatingId(ticketId);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Could not update the ticket status.");
      }

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status } : ticket,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while updating the ticket.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <TopNav currentPath="/insights" />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-rust">
              Internal Feedback Loop
            </p>
            <h1 className="text-4xl font-semibold text-ink">
              Bug Insights Dashboard
            </h1>
            <p className="max-w-4xl text-lg leading-8 text-ink/80">
              Review escalated support failures, inspect what the assistant
              answered, and decide what needs product, workflow, or UI follow-up.
            </p>
          </div>

          <article className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
              What to show in demo
            </p>
            <p className="mt-3 text-sm leading-7 text-ink/70">
              This screen is the differentiator. It shows that failed support
              interactions are not lost. Only repeated friction or clear
              product gaps are promoted here as trackable product follow-up.
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
              Total tickets
            </p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {tickets.length}
            </p>
          </article>
          <article className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
              New
            </p>
            <p className="mt-3 text-3xl font-semibold text-rust">
              {tickets.filter((ticket) => ticket.status === "new").length}
            </p>
          </article>
          <article className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
              Fixed
            </p>
            <p className="mt-3 text-3xl font-semibold text-moss">
              {tickets.filter((ticket) => ticket.status === "fixed").length}
            </p>
          </article>
        </section>

        <section className="grid gap-3 rounded-[1.75rem] border border-ink/10 bg-sand/80 px-6 py-5 lg:grid-cols-3">
          <div className="rounded-[1.4rem] bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
              Capture
            </p>
            <p className="mt-2 text-sm leading-7 text-ink/70">
              Failed support answers are first stored as structured tickets.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
              Analyze
            </p>
            <p className="mt-2 text-sm leading-7 text-ink/70">
              Triage and repeat detection decide what belongs in Insights.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
              Improve
            </p>
            <p className="mt-2 text-sm leading-7 text-ink/70">
              Suggested fixes and status changes turn friction into improvement.
            </p>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-sand/70 text-left text-sm uppercase tracking-[0.18em] text-ink/55">
                <tr>
                  <th className="px-5 py-4">Question</th>
                  <th className="px-5 py-4">Answer</th>
                  <th className="px-5 py-4">Failure reason</th>
                  <th className="px-5 py-4">Suggested fix</th>
                  <th className="px-5 py-4">Fix type</th>
                  <th className="px-5 py-4">Why surfaced</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-sm text-ink/60"
                    >
                      Loading escalated issues...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-sm text-ink/60"
                    >
                      No routed insight items yet. Repeated friction or clear
                      product gaps will appear here after escalation.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-ink/10 align-top">
                      <td className="px-5 py-4 text-sm leading-7 text-ink">
                        {ticket.userQuestion}
                      </td>
                      <td className="px-5 py-4 text-sm leading-7 text-ink/80">
                        {ticket.aiAnswer}
                      </td>
                      <td className="px-5 py-4 text-sm leading-7 text-ink/75">
                        {ticket.failureReason || "Not analyzed yet"}
                      </td>
                      <td className="px-5 py-4 text-sm leading-7 text-ink/75">
                        {ticket.suggestedFix || "No suggested fix yet"}
                      </td>
                      <td className="px-5 py-4 text-sm leading-7 text-ink/75">
                        {ticket.fixType || "Uncategorized"}
                      </td>
                      <td className="px-5 py-4 text-sm leading-7 text-ink/75">
                        <div>{ticket.surfaceReason || "Manual review"}</div>
                        <div className="text-xs text-ink/50">
                          {ticket.triage} · repeated {ticket.repeatCount}x
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={ticket.status}
                          onChange={(event) => {
                            void updateStatus(ticket.id, event.target.value);
                          }}
                          disabled={updatingId === ticket.id}
                          className="rounded-full border border-ink/10 bg-sand px-3 py-2 text-sm text-ink outline-none transition focus:border-rust"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm leading-7 text-ink/60">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
