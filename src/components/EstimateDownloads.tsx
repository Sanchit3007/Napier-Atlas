'use client';

import { useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import { clsx } from 'clsx';
import EstimateReport from '@/components/EstimateReport';
import { estimateCsv, estimateFileName, formatEstimateDate, type EstimateExport } from '@/lib/estimate-export';

// "Save as CSV" downloads a spreadsheet file; "Save as PDF" prints a clean report the browser can save as a PDF.
export default function EstimateDownloads({
  estimate,
  compact = false,
  className,
}: Readonly<{ estimate: EstimateExport; compact?: boolean; className?: string }>) {
  const reportRef = useRef<HTMLDivElement>(null);
  const date = () => (estimate.savedAt ? new Date(estimate.savedAt) : new Date());

  const saveCsv = () => {
    // The invisible first character ("﻿") makes Excel show m³ and CO₂ correctly.
    const csv = estimateCsv(estimate, date(), window.location.origin);
    const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${estimateFileName(estimate, date())}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const savePdf = () => {
    const report = reportRef.current;
    if (!report) return;
    // Print only the report: copy it into a root that the print styles in globals.css show on its own.
    const root = document.createElement('div');
    root.id = 'print-root';
    root.innerHTML = report.innerHTML;
    root.querySelectorAll('[data-print-date]').forEach((el) => {
      if (!el.textContent) el.textContent = formatEstimateDate(date());
    });
    root.querySelectorAll<HTMLElement>('[data-print-link]').forEach((el) => {
      el.textContent = `${window.location.origin}${el.dataset.printLink}`;
    });
    document.body.append(root);

    const title = document.title;
    document.title = estimateFileName(estimate, date()); // default PDF file name
    document.documentElement.classList.add('printing');
    const cleanup = () => {
      root.remove();
      document.title = title;
      document.documentElement.classList.remove('printing');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const button = clsx(
    'inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 font-medium text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400',
    compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
  );

  return (
    <div className={clsx('grid grid-cols-2 gap-2', className)}>
      <button type="button" onClick={saveCsv} className={button}>
        <Download className="w-4 h-4" /> Save as CSV
      </button>
      <button type="button" onClick={savePdf} className={button}>
        <Printer className="w-4 h-4" /> Save as PDF
      </button>
      <div ref={reportRef} hidden>
        <EstimateReport estimate={estimate} />
      </div>
    </div>
  );
}
