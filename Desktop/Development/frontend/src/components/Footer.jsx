import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-slate-400">
          © {new Date().getFullYear()} BidVerse. Built for academic + portfolio use.
        </div>
        <div className="text-xs text-slate-500">
          React • Vite • Tailwind • Django REST • WebSockets
        </div>
      </div>
    </footer>
  );
}

