"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { HeartIcon, HomeIcon, UserIcon } from "@/components/icons/icons";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import styles from "./Topbar.module.css";

// TODO: trocar pelo username do usuário logado quando a sessão estiver integrada ao backend.
const CURRENT_USERNAME = "daniel";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: HomeIcon, isActive: (pathname) => pathname === "/" },
  {
    href: `/profile/${CURRENT_USERNAME}/favorites`,
    label: "Favoritos",
    icon: HeartIcon,
    isActive: (pathname) => pathname === `/profile/${CURRENT_USERNAME}/favorites`,
  },
  {
    href: `/profile/${CURRENT_USERNAME}`,
    label: "Perfil",
    icon: UserIcon,
    isActive: (pathname) =>
      pathname.startsWith(`/profile/${CURRENT_USERNAME}`) && !pathname.endsWith("/favorites"),
  },
];

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand} aria-label="Rewind, página inicial">
        <Image src="/logo.svg" alt="" width={28} height={28} priority />
        <span className={styles.brandName}>Rewind</span>
      </Link>

      <SearchBar />

      <nav className={styles.nav} aria-label="Navegação principal">
        {NAV_ITEMS.map(({ href, label, icon: NavIcon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={active ? `${styles.navButton} ${styles.navButtonActive}` : styles.navButton}
            >
              <NavIcon size={20} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
