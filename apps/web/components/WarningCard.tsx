import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface WarningProps {
  warnings: Array<{
    field: string;
    extracted_value: string;
    translated_value: string;
    issue: string;
    severity?: string;
    blocked_item_type?: string;
    blocked_item_name?: string;
  }>;
}

export const WarningCard: React.FC<WarningProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  const blockCount = warnings.filter(w => w.severity === 'BLOCK').length;
  const warnCount = warnings.length - blockCount;

  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-red-200 pb-2 mb-3">
        <div className="flex items-center gap-2 text-red-950 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Deterministic Safety Invariant Discrepancies ({warnings.length})
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {blockCount > 0 && (
            <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">
              {blockCount} BLOCKED
            </span>
          )}
          {warnCount > 0 && (
            <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded text-[11px]">
              {warnCount} WARNING
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-red-800 mb-3 leading-relaxed">
        Our non-generative clinical validator detected discrepancies between original OCR document text and AI model translation output. Affected clinical instructions have been blocked to prevent dangerous dosage alterations.
      </p>

      <div className="space-y-2.5">
        {warnings.map((w, idx) => {
          const isBlock = w.severity === 'BLOCK';
          return (
            <div 
              key={idx} 
              className={`p-3 rounded border text-xs bg-white ${
                isBlock ? 'border-red-300 border-l-4 border-l-red-600' : 'border-amber-300 border-l-4 border-l-amber-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900">{w.field}</span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  isBlock ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {w.severity || 'BLOCK'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                <div>
                  <span className="text-gray-500 font-sans">Document OCR:</span>{' '}
                  <span className="font-semibold text-gray-900">{w.extracted_value}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-sans">AI Output:</span>{' '}
                  <span className="font-semibold text-gray-900">{w.translated_value}</span>
                </div>
              </div>

              <div className="text-red-700 font-medium text-[11px] mt-1.5 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>{w.issue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
