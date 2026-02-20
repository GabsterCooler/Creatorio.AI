"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

function Header() {
  const [open, setOpen] = useState(false);

  return (
   <header className="w-full border-b border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-8 py-5 
                      flex justify-between items-center">

        <Link
          href="/"
          className="text-2xl font-light tracking-tight 
                     text-white hover:opacity-90 transition"
        >
          Creatorio.
          <span className="text-[#C6A75E]">
            AI
          </span>
        </Link>

        <nav className="hidden md:flex gap-10 text-sm tracking-wide">
          <Link
            href="/"
            className="text-zinc-300 hover:text-[#C6A75E] 
                       transition duration-300"
          >
            PC Builder AI
          </Link>

          <Link
            href="/about"
            className="text-zinc-300 hover:text-[#C6A75E] 
                       transition duration-300"
          >
            About
          </Link>
        </nav>

        <button
          className="md:hidden text-zinc-300 hover:text-[#C6A75E] 
                     transition duration-300"
          onClick={() => setOpen(!open)}
        >
          <motion.div
            initial={false}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="md:hidden overflow-hidden 
                       bg-[#0f0f12]/95 backdrop-blur-xl 
                       border-t border-[#C6A75E]/10"
          >
            <div className="flex flex-col px-8 py-6 gap-6 
                            text-zinc-300 text-base">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="hover:text-[#C6A75E] 
                           transition duration-300"
              >
                PC Builder AI
              </Link>

              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="hover:text-[#C6A75E] 
                           transition duration-300"
              >
                About
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;