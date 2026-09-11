"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ToolsMenu from "./ToolsMenu";

const CURRENCIES = [
  { code: "USD", symbol: "$", flag: "🇺🇸", label: "USD" },
  { code: "BRL", symbol: "R$", flag: "🇧🇷", label: "BRL" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", label: "EUR" },
];

// Array com os itens do menu
const NAV_LINKS = [
  { label: "Explorar", href: "/" },
  { label: "Oportunidades", href: "/oportunidades" },
  { label: "Mercados", href: "/mercados" },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Para saber qual menu está ativo

  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const match = document.cookie.match(/(^| )currency=([^;]+)/);
    if (match) {
      const savedCode = match[2];
      const found = CURRENCIES.find(c => c.code === savedCode);
      if (found) setCurrency(found);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCurrencyChange = (curr: typeof CURRENCIES[0]) => {
    setCurrency(curr);
    setIsCurrencyOpen(false);

    document.cookie = `currency=${curr.code}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <nav className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors relative z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Esquerda: Logo e Menus */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-emerald-600 dark:text-emerald-500 hover:opacity-80 transition-opacity">
            ArbitraCS {}
          </Link>

          {/* Menus de Navegação (Escondidos em telas muito pequenas) */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <ToolsMenu currency={currency} />
          </div>
        </div>

        {/* Direita: Seletores */}
        <div className="flex items-center gap-5">

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
            >
              <span className="text-xl leading-none">{currency.flag}</span>
              <svg className={`w-4 h-4 text-neutral-500 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden py-1">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800
                      ${currency.code === curr.code ? 'bg-neutral-50 dark:bg-neutral-800/50 text-emerald-600 dark:text-emerald-500 font-medium' : 'text-neutral-700 dark:text-neutral-300'}
                    `}
                  >
                    <span className="text-base leading-none">{curr.flag}</span>
                    {curr.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700"></div>

          {mounted ? (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none 
                ${theme === 'dark' ? 'bg-emerald-500' : 'bg-neutral-300'}`}
              aria-label="Alternar Tema"
            >
              <span
                className={`absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300
                  ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                    <circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
                  </svg>
                )}
              </span>
            </button>
          ) : (
            <div className="w-14 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
          )}

        </div>
      </div>
    </nav>
  );
}