"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type AuthUser = {
  id: string;
  email: string;
};

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        const payload = (await res.json()) as { user: AuthUser };
        setUser(payload.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [pathname]);

  const links = useMemo(() => {
    if (user) {
      return [
        { href: "/", label: "Welcome" },
        { href: "/setup", label: "Weekly Setup" },
        { href: "/status", label: "Status" },
        { href: "/history", label: "History" }
      ];
    }
    return [
      { href: "/", label: "Welcome" },
      { href: "/auth", label: "Log In" }
    ];
  }, [user]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/auth");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-moss/20 bg-sand/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="brand-script text-[0.95rem] leading-tight text-ink sm:text-xl">
            Synchria, Land of Synchronicities
          </span>
        </Link>
        <div className="-mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0 sm:pb-0">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs sm:text-sm ${active ? "bg-pine text-paper" : "text-ink hover:bg-paper"}`}
              >
                {link.label}
              </Link>
            );
          })}
          {!loading && user ? (
            <button
              type="button"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-ink hover:bg-paper sm:text-sm"
              onClick={logout}
            >
              Log Out
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
