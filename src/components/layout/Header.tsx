"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, X } from "lucide-react";
import { moreNavigation, navigation, type NavItem, type NavLink } from "@/config/navigation";
import { SearchBox } from "@/components/search/SearchBox";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { TopBar } from "./TopBar";
import { Wordmark } from "./Wordmark";

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

function MegaPanel({ item, links, onClose, align = "left" }: { item?: NavItem; links: NavLink[]; onClose: () => void; align?: "left" | "right" }) {
  const wide = links.length > 8;
  return (
    <div
      className={cn(
        "glass-panel anim-menu absolute top-full mt-1 p-3",
        wide ? "left-1/2 w-[38rem] -translate-x-1/2" : align === "right" ? "right-0 w-[23rem]" : "left-0 w-[23rem]",
      )}
    >
      <ul className={cn("grid gap-0.5", wide && "grid-cols-3")}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onClose} className="block rounded-[var(--radius-md)] px-3 py-2 hover:bg-surface-2">
              <span className="block text-[0.95rem] font-semibold text-ink">{link.label}</span>
              {link.description && <span className="block text-sm leading-snug text-muted">{link.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
      {item && (
        <Link href={item.href} onClick={onClose} className="link-text mt-2 block px-3 pb-1 text-sm">
          All of {item.label}
        </Link>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const headerRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(true);
  // Transparent glass over the home slider; solid glass once the page scrolls past it, or when a menu is open.
  const overlay = pathname === "/" && overHero && !mobileOpen;

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    // Lets the home hero slide up underneath the header.
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`));
    observer.observe(header);
    const onScroll = () => setOverHero(window.scrollY < window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Closes menus on any navigation, including the logo, search results and the Back button.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  const closeAll = useCallback(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((event.key === "k" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") closeAll();
    };
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    // The mobile menu doesn't exist at desktop widths, so it mustn't keep the page locked after a resize.
    const desktop = window.matchMedia("(min-width: 80rem)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    desktop.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [closeAll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  // showModal gives a real focus trap and returns focus to the trigger on close.
  useEffect(() => {
    const dialog = searchDialog.current;
    if (searchOpen && dialog && !dialog.open) dialog.showModal();
  }, [searchOpen]);

  const hoverOpen = (label: string | null) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenMenu(label), label ? 60 : 180);
  };

  return (
    <header
      ref={headerRef}
      data-overlay={overlay}
      // Over the photo slider the header uses the dark tokens, so text and menus stay readable on any image.
      data-theme={overlay ? "dark" : undefined}
      className={cn(
        "site-header no-print sticky top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color] duration-300",
        overlay ? "border-white/15 bg-[linear-gradient(180deg,rgb(4_16_22/0.62),rgb(4_16_22/0.18))]" : "border-line bg-[color-mix(in_oklab,var(--surface)_82%,transparent)]",
      )}
    >
      <TopBar />
      <div aria-hidden className="scroll-progress absolute inset-x-0 -bottom-px h-0.5 bg-accent" />

      <div className="container-x flex h-[4.25rem] items-center justify-between gap-3">
        <Wordmark className="text-[1.75rem]" onDark={overlay} />

        <nav ref={navRef} aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              const expanded = openMenu === item.label;
              return (
                <li
                  key={item.label}
                  className="relative"
                  onPointerEnter={(event) => event.pointerType === "mouse" && item.groups && hoverOpen(item.label)}
                  onPointerLeave={(event) => event.pointerType === "mouse" && item.groups && hoverOpen(null)}
                >
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpenMenu(null)}
                      className={cn(
                        "relative flex h-11 items-center px-2.5 text-[0.94rem] font-[560] transition-colors hover:text-brand",
                        item.groups && "pr-0.5",
                        active ? "text-brand" : "text-ink-2",
                      )}
                    >
                      {item.short ?? item.label}
                      {active && <span aria-hidden className="absolute inset-x-2.5 bottom-1 h-0.5 rounded bg-accent" />}
                    </Link>
                    {item.groups && (
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={`Show ${item.label} links`}
                        onClick={() => setOpenMenu(expanded ? null : item.label)}
                        className="flex h-11 w-5 cursor-pointer items-center justify-center text-muted hover:text-brand"
                      >
                        <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} aria-hidden />
                      </button>
                    )}
                  </div>
                  {expanded && <MegaPanel item={item} links={item.groups?.flatMap((group) => group.links) ?? []} onClose={() => setOpenMenu(null)} />}
                </li>
              );
            })}
            <li
              className="relative"
              onPointerEnter={(event) => event.pointerType === "mouse" && hoverOpen("More")}
              onPointerLeave={(event) => event.pointerType === "mouse" && hoverOpen(null)}
            >
              <button
                type="button"
                aria-expanded={openMenu === "More"}
                onClick={() => setOpenMenu(openMenu === "More" ? null : "More")}
                className={cn(
                  "flex h-11 cursor-pointer items-center gap-0.5 px-2.5 text-[0.94rem] font-[560] text-ink-2 transition-colors hover:text-brand",
                  moreNavigation.some((link) => isActive(pathname, link.href)) && "text-brand",
                )}
              >
                More
                <ChevronDown className={cn("size-3.5 transition-transform", openMenu === "More" && "rotate-180")} aria-hidden />
              </button>
              {openMenu === "More" && <MegaPanel links={moreNavigation} align="right" onClose={() => setOpenMenu(null)} />}
            </li>
          </ul>
        </nav>

        <div className="flex items-center">
          <button type="button" className="icon-btn" aria-label="Search (press /)" onClick={() => setSearchOpen(true)}>
            <Search className="size-5" aria-hidden />
          </button>
          <Link href="/saved" className="icon-btn max-xs:hidden" aria-label="Saved destinations and passport">
            <Heart className="size-5" aria-hidden />
          </Link>
          {/* On the narrowest phones the theme menu moves into the mobile menu, so the bar fits. */}
          <div className="max-xs:hidden">
            <ThemeToggle />
          </div>
          <UserMenu />
          <button
            type="button"
            className="icon-btn xl:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Mobile" className="scroll-thin anim-menu max-h-[calc(100dvh-var(--header-h,6.5rem))] overflow-y-auto overscroll-contain border-t border-line bg-surface xl:hidden">
          <div className="container-x flex items-center justify-between border-b border-line py-2 xs:hidden">
            <span className="font-semibold">Theme</span>
            <ThemeToggle />
          </div>
          <ul className="container-x py-2">
            {navigation.map((item) => {
              const links = item.groups?.flatMap((group) => group.links) ?? [];
              const expanded = mobileGroup === item.label;
              return (
                <li key={item.label} className="border-b border-line last:border-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={closeAll}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className={cn("flex min-h-12 flex-1 items-center font-semibold", isActive(pathname, item.href) ? "text-brand" : "text-ink")}
                    >
                      {item.label}
                    </Link>
                    {links.length > 0 && (
                      <button
                        type="button"
                        className="icon-btn"
                        aria-expanded={expanded}
                        aria-label={`Show ${item.label} links`}
                        onClick={() => setMobileGroup(expanded ? null : item.label)}
                      >
                        <ChevronDown className={cn("size-5 transition-transform", expanded && "rotate-180")} aria-hidden />
                      </button>
                    )}
                  </div>
                  {expanded && (
                    <ul className="anim-menu grid grid-cols-1 pb-2 xs:grid-cols-2">
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} onClick={closeAll} className="flex min-h-11 items-center pl-3 text-ink-2">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
            {moreNavigation.map((link) => (
              <li key={link.href} className="border-b border-line last:border-0">
                <Link
                  href={link.href}
                  onClick={closeAll}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn("flex min-h-12 items-center font-semibold", isActive(pathname, link.href) ? "text-brand" : "text-ink")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {searchOpen && (
        <dialog
          ref={searchDialog}
          aria-label="Search"
          onClose={() => setSearchOpen(false)}
          className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-4 pt-[9vh] text-ink backdrop:bg-[rgb(8_20_26/0.55)]"
          onPointerDown={(event) => event.target === event.currentTarget && setSearchOpen(false)}
        >
          <div className="glass-panel anim-pop mx-auto max-w-xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="px-1 font-semibold">Search Tour India</p>
              <button type="button" className="icon-btn" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
        </dialog>
      )}
    </header>
  );
}
