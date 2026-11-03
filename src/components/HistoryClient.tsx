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

  if (key !== null) return <p className="text-ink-muted">Opening your history…</p>;
  return (
    <div className="rounded-3xl border border-dashed border-line p-10 text-center text-ink-muted">
      No saved estimates on this browser yet. Try the{' '}
      <Link href="/#calculator" className="text-fern hover:text-fern-dark">
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
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line hover:border-red-500/50 text-sm font-medium text-ink hover:text-red-800 transition-colors focus-visible:outline-2 focus-visible:outline-fern';
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
