"use client";

const navItems = [
  { href: "/", label: "Inventory" },
  { href: "/chat", label: "Support Chat" },
  { href: "/insights", label: "Bug Insights" },
];

type TopNavProps = {
  currentPath: string;
};

export function TopNav({ currentPath }: TopNavProps) {
  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-full border border-white/60 bg-white/75 px-4 py-3 shadow-[0_20px_60px_rgba(31,41,55,0.08)] backdrop-blur">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-rust">
            InsightDesk
          </p>
          <p className="text-sm text-ink/60">
            Pharmacy inventory with support intelligence
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-ink text-sand"
                    : "border border-ink/10 bg-white/80 text-ink hover:border-rust hover:text-rust"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
