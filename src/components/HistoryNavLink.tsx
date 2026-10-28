'use client';

import Link from 'next/link';
import { History } from 'lucide-react';
import { useHistoryKey } from '@/components/HistoryClient';

// Points at this browser's own history page once it has one; /history explains what to do otherwise.
export default function HistoryNavLink() {
  const key = useHistoryKey();

  return (
    <Link href={key ? `/history/${key}` : '/history'} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
      <History className="w-4 h-4 text-emerald-500" /> View History
    </Link>
  );
}
