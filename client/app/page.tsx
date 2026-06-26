"use client";

import { useEffect, useState } from "react";
import { TopNav } from "../components/TopNav";
import { getApiBaseUrl } from "../lib/api";

type Medication = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderThreshold: number;
  reorderStatus: string;
  status: string;
};

type MedicationResponse = {
  medications: Medication[];
};

type TicketSummaryResponse = {
  total: number;
  open: number;
  fixed: number;
};

function statusClassName(status: string) {
  if (status === "Needs Reorder") {
    return "bg-rust/15 text-rust";
  }

  if (status === "Low Stock") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Ordered") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-moss/15 text-moss";
}

export default function HomePage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [openSupportIssues, setOpenSupportIssues] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    async function loadMedications() {
      const apiUrl = getApiBaseUrl();

      try {
        const [medicationsResponse, ticketsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/medications`, {
            cache: "no-store",
          }),
          fetch(`${apiUrl}/api/tickets/summary`, {
            cache: "no-store",
          }),
        ]);

        if (!medicationsResponse.ok || !ticketsResponse.ok) {
          throw new Error("Could not load inventory data.");
        }

        const medicationsData =
          (await medicationsResponse.json()) as MedicationResponse;
        const ticketsData = (await ticketsResponse.json()) as TicketSummaryResponse;

        setMedications(medicationsData.medications);
        setOpenSupportIssues(ticketsData.open);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong while loading inventory data.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMedications();
  }, []);

  async function runInventoryAction(
    medicationId: string,
    action: "ship" | "restock" | "reorder",
  ) {
    const apiUrl = getApiBaseUrl();

    setActiveAction(`${medicationId}:${action}`);
    setError("");

    try {
      const payload =
        action === "ship"
          ? { amount: 1 }
          : action === "restock"
            ? { amount: 20 }
            : {};

      const response = await fetch(
        `${apiUrl}/api/medications/${medicationId}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`Could not ${action} this medication.`);
      }

      const data = (await response.json()) as { medication: Medication };
      setMedications((current) =>
        current.map((item) =>
          item.id === medicationId ? data.medication : item,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while updating the inventory.",
      );
    } finally {
      setActiveAction(null);
    }
  }

  const totalItems = medications.length;
  const lowStockItems = medications.filter(
    (item) =>
      item.quantity <= item.reorderThreshold && item.reorderStatus !== "ordered",
  ).length;
  const orderedItems = medications.filter(
    (item) => item.reorderStatus === "ordered",
  ).length;
  const inventorySummary = [
    {
      label: "Total Items",
      value: String(totalItems),
      note: "Tracked in active inventory",
    },
    {
      label: "Low Stock",
      value: String(lowStockItems),
      note: "Need attention soon",
    },
    {
      label: "Ordered",
      value: String(orderedItems),
      note: "Replenishment already placed",
    },
    {
      label: "Open Support Issues",
      value: String(openSupportIssues),
      note: "Tracked through chat escalation",
    },
  ];
  const actionFeed = [
    "Operations teams manage stock directly from the main board.",
    "Support chat handles workflow questions inside the same product.",
    "Failed answers become trackable product and UI insights.",
  ];

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <TopNav currentPath="/" />

        <header>
          <section className="flex flex-col gap-8 rounded-[2rem] border border-ink/10 bg-white/70 px-8 py-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-rust">
                  Demo Overview
                </p>
                <h1 className="text-5xl font-semibold leading-tight text-ink">
                  Inventory operations that learn from support failures.
                </h1>
                <p className="text-lg leading-8 text-ink/80">
                  InsightDesk combines a pharmacy inventory workspace, an
                  AI-powered help desk, and a feedback loop that turns repeated
                  support friction into product fixes.
                </p>
              </div>

              <nav className="flex flex-wrap gap-3">
                <a
                  href="/chat"
                  className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-sand transition hover:bg-rust"
                >
                  Open Support Assistant
                </a>
                <a
                  href="/insights"
                  className="inline-flex rounded-full border border-ink/10 px-5 py-3 text-sm font-medium text-ink transition hover:border-rust hover:text-rust"
                >
                  Review Bug Insights
                </a>
              </nav>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {inventorySummary.map((item) => (
                <article
                  key={item.label}
                  className="rounded-3xl border border-ink/10 bg-sand/60 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-ink">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {item.note}
                  </p>
                </article>
              ))}
            </section>

            <section className="grid gap-3 rounded-[1.75rem] border border-ink/10 bg-ink px-6 py-6 text-sand lg:grid-cols-3">
              {actionFeed.map((item, index) => (
                <div key={item} className="rounded-[1.5rem] bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-sand/50">
                    Step 0{index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-sand/85">{item}</p>
                </div>
              ))}
            </section>
          </section>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <article className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
                  Inventory Overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">
                  Inventory control board
                </h2>
              </div>
              <span className="rounded-full bg-sand px-3 py-2 text-xs uppercase tracking-[0.18em] text-ink/55">
                Live Demo
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-sand/70 text-left text-sm uppercase tracking-[0.18em] text-ink/55">
                  <tr>
                    <th className="px-6 py-4">Medication</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-sm text-ink/60"
                      >
                        Loading inventory data...
                      </td>
                    </tr>
                  ) : (
                    medications.map((row) => (
                      <tr key={row.sku} className="border-t border-ink/10 align-top">
                        <td className="px-6 py-4 text-sm font-medium text-ink">
                          {row.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-ink/70">{row.sku}</td>
                        <td className="px-6 py-4 text-sm text-ink/70">
                          {row.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-ink/70">
                          <div>{row.quantity}</div>
                          <div className="text-xs text-ink/45">
                            Reorder at {row.reorderThreshold}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-2 text-xs font-medium ${statusClassName(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                void runInventoryAction(row.id, "ship");
                              }}
                              disabled={activeAction === `${row.id}:ship`}
                              className="rounded-full border border-ink/10 px-3 py-2 text-xs font-medium text-ink transition hover:border-rust hover:text-rust disabled:opacity-60"
                            >
                              Remove 1 unit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void runInventoryAction(row.id, "restock");
                              }}
                              disabled={activeAction === `${row.id}:restock`}
                              className="rounded-full border border-ink/10 px-3 py-2 text-xs font-medium text-ink transition hover:border-moss hover:text-moss disabled:opacity-60"
                            >
                              Add 20 units
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void runInventoryAction(row.id, "reorder");
                              }}
                              disabled={activeAction === `${row.id}:reorder`}
                              className="rounded-full border border-ink/10 px-3 py-2 text-xs font-medium text-ink transition hover:border-sky-600 hover:text-sky-700 disabled:opacity-60"
                            >
                              Reorder placed
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-[2rem] border border-ink/10 bg-ink px-6 py-6 text-sand shadow-lg">
              <p className="text-xs uppercase tracking-[0.24em] text-sand/60">
                AI Support
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Give operations teams a faster path to answers.
              </h2>
              <p className="mt-3 text-sm leading-7 text-sand/75">
                The support assistant uses local knowledge and OpenAI to answer
                common inventory questions. If the answer fails, the issue can
                be escalated for human follow-up.
              </p>
              <a
                href="/chat"
                className="mt-5 inline-flex rounded-full border border-sand/20 px-4 py-2 text-sm font-medium text-sand transition hover:border-sand/60 hover:bg-sand/10"
              >
                Launch support assistant
              </a>
            </article>

            <article className="rounded-[2rem] border border-ink/10 bg-white px-6 py-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
                Bug Insights
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">
                Turn repeated support issues into product fixes.
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink/70">
                Escalated conversations are stored as structured tickets so
                repeated friction can become UI, workflow, and product fixes.
              </p>
              <a
                href="/insights"
                className="mt-5 inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-rust hover:text-rust"
              >
                Open bug insights
              </a>
            </article>

            <article className="rounded-[2rem] border border-ink/10 bg-sand/75 px-6 py-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
                Demo Path
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                <li>1. Update a medication that is already close to its reorder threshold.</li>
                <li>2. Open the support assistant and ask what the team should do next.</li>
                <li>3. Escalate the case if the answer does not fully resolve the workflow.</li>
                <li>4. Review the new ticket in Insights and show how it becomes a product signal.</li>
              </ol>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
