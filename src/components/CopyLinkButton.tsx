'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

// Copies this page's link and shows "Link copied" for two seconds.
export default function CopyLinkButton({ label = 'Copy share link' }: Readonly<{ label?: string }>) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    // Without the query string, so a shared estimate doesn't show the "just saved" banner.
    await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-line hover:border-line text-sm font-medium text-ink transition-colors focus-visible:outline-2 focus-visible:outline-fern"
    >
      {copied ? <Check className="w-4 h-4 text-fern" /> : <Link2 className="w-4 h-4" />}
      {copied ? 'Link copied' : label}
    </button>
  );
}
