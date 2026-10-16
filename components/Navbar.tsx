"use client";

import { useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import SawaflixLogo from "./SawaflixLogo";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });


  // Updated hrefs to match section IDs for scrolling
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Explore", href: "/dashboard" },
    { name: "Area Tory", href: "/dashboard/blogs" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${isScrolled
        ? "border-white/10 bg-[#100d1e]/85 shadow-lg backdrop-blur-md"
        : "border-transparent bg-transparent"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <SawaflixLogo className="scale-[0.78] origin-left" theme="dark" />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => {
                const isActive = link.href === "#home"
                  ? pathname === "/" || pathname === "/home"
                  : pathname?.startsWith(link.href);
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    scroll={true}
                    className={`rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-white/15 font-bold text-white" : "font-medium text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Buttons - Netflix Style */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="rounded-lg border border-white/50 bg-white/95 px-5 py-2 text-sm font-bold text-[#171326] shadow-sm transition-colors hover:bg-white"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="border-b border-white/10 bg-[#100d1e]/95 shadow-lg backdrop-blur-md md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block rounded-md px-3 py-2 text-base transition-colors ${link.href === "#home" ? "bg-white/15 font-bold text-white" : "font-medium text-white/75 hover:bg-white/10 hover:text-white"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <Link
                  href="/dashboard"
                  className="w-full rounded-lg border border-white/50 bg-white/95 px-4 py-2.5 text-center font-bold text-[#171326] transition-colors hover:bg-white"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
