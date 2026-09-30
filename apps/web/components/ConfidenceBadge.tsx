import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const ConfidenceBadge = ({ confidence }: { confidence?: number }) => {
  const conf = confidence ?? 98.0;

  if (conf >= 90) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" /> High OCR Confidence ({conf}%)
      </span>
    );
  }
  if (conf >= 75) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3.5 h-3.5" /> Moderate OCR Confidence ({conf}%)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
      <AlertCircle className="w-3.5 h-3.5" /> Low OCR Confidence ({conf}%)
    </span>
  );
};
