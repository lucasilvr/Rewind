"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "@/components/Topbar/Topbar";
import styles from "./AppShell.module.css";

// Telas com layout próprio, sem topbar nem moldura.
const ROUTES_WITHOUT_SHELL = ["/login", "/cadastro"];

/** Topbar + área de conteúdo com degradê e cantos arredondados, usada em todo o app. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (ROUTES_WITHOUT_SHELL.some((route) => pathname.startsWith(route))) {
    return children;
  }

  return (
    <div className={styles.shell}>
      <Topbar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
