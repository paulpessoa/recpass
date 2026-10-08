"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILITY_LABEL, venueById } from "@/lib/data";
import { useLocation, useProfile, useShared } from "@/lib/client";
import { festivalNow, fmtMin } from "@/lib/engine";
import { VoiceCall } from "./VoiceCall";

const NAV = [
  { href: "/", label: "Agora", icon: "⚡" },
  { href: "/mapa", label: "Mapa", icon: "🗺️" },
  { href: "/agente", label: "Agente", icon: "💬" },
  { href: "/perfil", label: "Perfil", icon: "🧬" },
];

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const path = usePathname();
  const [profile] = useProfile();
  const [loc] = useLocation();
  const { state, at, online } = useShared();
  const here = loc ? venueById(loc.venueId) : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-[1000] bg-[#123b8c] px-4 pb-3 pt-3 text-white shadow">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f26b1d] text-base font-black">R</span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">Rota Livre</span>
              <span className="block text-[10px] opacity-80">REC&apos;n&apos;Play · Bairro do Recife</span>
            </span>
          </Link>
          <div className="text-right">
            <div className="font-mono text-sm font-semibold">{fmtMin(festivalNow(state, at))}</div>
            <div className="text-[10px] opacity-80">{online ? "ao vivo" : "offline"}</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Link href="/perfil" className="truncate rounded-full bg-white/15 px-2.5 py-1">
            {profile ? `${profile.avatar} ${profile.name} · ${MOBILITY_LABEL[profile.mobility].icon}` : "👤 Escolher perfil"}
          </Link>
          {here && <span className="truncate rounded-full bg-white/15 px-2.5 py-1">📍 {here.short}</span>}
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        {title && <h1 className="mb-3 text-xl font-bold">{title}</h1>}
        {children}
      </main>

      <VoiceCall />

      <nav className="fixed inset-x-0 bottom-0 z-[1000] mx-auto max-w-md border-t border-black/5 bg-white/95 backdrop-blur">
        <ul className="grid grid-cols-4">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`flex flex-col items-center py-2 text-[11px] ${active ? "font-bold text-[#123b8c]" : "text-gray-500"}`}
                >
                  <span className="text-lg leading-none">{n.icon}</span>
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
