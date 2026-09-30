import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export const PipelineProgress = ({ steps }: { steps: Step[] }) => {
  return (
    <div className="aws-card p-6 mb-8">
      <h3 className="text-sm font-bold text-[#161E2D] mb-4 uppercase tracking-wider">AWS Processing Pipeline</h3>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((s, idx) => (
          <div
            key={s.id}
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 transition-all ${
              s.status === 'completed'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                : s.status === 'active'
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-sm animate-pulse'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">
              {s.status === 'completed' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : s.status === 'active' ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              ) : (
                idx + 1
              )}
            </div>
            <span className="truncate">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
