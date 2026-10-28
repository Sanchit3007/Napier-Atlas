'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { readHistoryKey, rememberHistoryKey } from '@/lib/history';

// This browser's history key: null if it has none yet, undefined while the page is still loading.
const noSubscription = () => () => {};
export function useHistoryKey() {
  return useSyncExternalStore(noSubscription, readHistoryKey, () => undefined);
}

// /history: send the visitor to their own history page, or explain how to start one.
export function HistoryRedirect() {
  const router = useRouter();
  const key = useHistoryKey();

  useEffect(() => {
    if (key) router.replace(`/history/${key}`);
  }, [key, router]);

  if (key !== null) return <p className="text-slate-400">Opening your history…</p>;
  return (
    <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center text-slate-400">
      No saved estimates on this browser yet. Try the{' '}
      <Link href="/#calculator" className="text-emerald-300 hover:text-emerald-200">
        Bio-CNG estimator
      </Link>{' '}
      and press “Save &amp; share this estimate”. If you saved estimates on another device, open your history link
      here.
    </div>
  );
}

// Opening a history link on a new device makes it this browser's history too.
export function RememberHistoryKey({ historyKey }: Readonly<{ historyKey: string }>) {
  useEffect(() => rememberHistoryKey(historyKey), [historyKey]);
  return null;
}

// Clearing the whole history asks for a second click instead of a browser dialog.
export function ClearHistoryButton({ action }: Readonly<{ action: () => Promise<void> }>) {
  const [armed, setArmed] = useState(false);
  const className =
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/50 text-sm font-medium text-slate-300 hover:text-red-300 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400';
  return (
    <form action={action}>
      {armed ? (
        <button type="submit" className={className}>
          Click again to clear all
        </button>
      ) : (
        <button type="button" onClick={() => setArmed(true)} className={className}>
          Clear all
        </button>
      )}
    </form>
  );
}
