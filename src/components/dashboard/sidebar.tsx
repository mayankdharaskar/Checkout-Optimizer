"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Analytics" },
  { href: "/dashboard/campaigns", label: "Campaigns" },
  { href: "/dashboard/campaigns/new", label: "New campaign" },
  { href: "/dashboard/settings", label: "Embed SDK" },
];

export function DashboardSidebar({ storeName }: { storeName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-950 px-4 py-6 text-white">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-widest text-zinc-400">
          Checkout Optimizer
        </p>
        <p className="mt-1 text-lg font-semibold">{storeName}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-indigo-600 text-white"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        className="mt-4 w-full text-zinc-300 hover:bg-zinc-800 hover:text-white"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </Button>
    </aside>
  );
}
