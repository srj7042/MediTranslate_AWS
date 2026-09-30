import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface SafetyBannerProps {
  overallSafetyStatus?: 'PASS' | 'WARNING' | 'BLOCKED' | string;
  ocrConfidence?: number;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ 
  overallSafetyStatus = 'PASS',
  ocrConfidence = 98.0
}) => {
  const isPass = overallSafetyStatus === 'PASS';
  const isWarn = overallSafetyStatus === 'WARNING';
  const isBlock = overallSafetyStatus === 'BLOCKED';

  return (
    <div className={`p-4 rounded-r-lg border-l-4 shadow-sm mb-6 ${
      isBlock 
        ? 'bg-red-50 border-red-600 text-red-950' 
        : isWarn 
        ? 'bg-amber-50 border-amber-500 text-amber-950' 
        : 'bg-emerald-50 border-emerald-500 text-emerald-950'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isBlock ? (
            <ShieldX className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          ) : isWarn ? (
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold">
                Clinical Safety Verification: {overallSafetyStatus}
              </h4>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                isBlock 
                  ? 'bg-red-100 text-red-800 border-red-300' 
                  : isWarn 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {overallSafetyStatus}
              </span>
            </div>
            
            <p className="text-xs mt-1 leading-relaxed">
              {isBlock ? (
                <span>
                  <strong>CRITICAL VALUE MISMATCH DETECTED:</strong> One or more generated medication instructions or clinical numbers differed from original document OCR text. Affected instructions are <strong>BLOCKED</strong>.
                </span>
              ) : isWarn ? (
                <span>
                  <strong>USER VERIFICATION REQUIRED:</strong> Document OCR confidence is below safety thresholds. Please review extracted values carefully against the original document image.
                </span>
              ) : (
                <span>
                  All clinical invariant safety checks passed. MediTranslate provides informational translation & plain-language accessibility summaries. Always verify instructions with your doctor.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[11px] text-gray-500">OCR Confidence</div>
          <div className="font-mono text-sm font-bold">{ocrConfidence.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};
