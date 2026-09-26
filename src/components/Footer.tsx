import React from "react";

export function Footer() {
  return (
    <footer className="w-full text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 py-3 px-4 border-t border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md transition-colors select-none">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span>© {new Date().getFullYear()} <strong className="font-semibold text-slate-700 dark:text-slate-300">Sankalp</strong></span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <a
          href="https://github.com/Sankalp170212"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
        >
          GitHub
        </a>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <a
          href="https://www.linkedin.com/in/sankalppatil19923"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium underline underline-offset-4 transition-colors"
        >
          LinkedIn
        </a>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          StickyMind AI
        </span>
      </div>
    </footer>
  );
}

export default Footer;
