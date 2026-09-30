'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Trash2, ArrowLeft, FileText, CheckCircle2, ShieldAlert, Sparkles, AlertCircle, ShieldX, Link as LinkIcon, Lock } from 'lucide-react';
import { SafetyBanner } from '@/components/SafetyBanner';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { WarningCard } from '@/components/WarningCard';

export default function JobResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [showEvidence, setShowEvidence] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/v1/jobs/${jobId}/result`);
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        }
      } catch (e) {
        console.error('Failed to fetch translation result:', e);
      } finally {
        setLoading(false);
      }
    }
    if (jobId) fetchResult();
  }, [jobId]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this translation job and all associated files?')) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/v1/jobs/${jobId}`, { method: 'DELETE' });
      router.push('/translate');
    }
  };

  const handleDownloadPDF = () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.open(`${API_BASE}/v1/jobs/${jobId}/export-pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FF9900]/10 text-[#FF9900] flex items-center justify-center mx-auto animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="text-base font-bold text-[#232F3E]">Loading Medical Translation Result...</div>
        <p className="text-xs text-gray-500">Running Textract OCR & Deterministic Clinical Invariant Safety Validator</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-[#232F3E]">Translation Result Not Found</h2>
        <button onClick={() => router.push('/translate')} className="aws-btn-primary mt-4 text-xs">
          Start New Translation
        </button>
      </div>
    );
  }

  const isBlocked = result.overall_safety_status === 'BLOCKED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <button onClick={() => router.push('/translate')} className="text-xs text-gray-500 hover:text-[#FF9900] flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Translate
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#232F3E]">Translation Result</h1>
            <ConfidenceBadge confidence={result.ocr_confidence} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Job ID: <span className="font-mono">{jobId}</span> | Document Type: <span className="font-semibold text-gray-800">{result.document_type}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowEvidence(!showEvidence)} 
            className="aws-btn-secondary text-xs flex items-center gap-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#FF9900]" /> 
            {showEvidence ? 'Hide Source Evidence' : 'Show Source Evidence'}
          </button>
          <button onClick={handleDownloadPDF} className="aws-btn-primary text-xs flex items-center gap-1.5 shadow">
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
          <button onClick={handleDelete} className="aws-btn-secondary text-xs flex items-center gap-1.5 bg-red-800 hover:bg-red-900 text-white border-0">
            <Trash2 className="w-4 h-4" /> Delete Job
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <SafetyBanner 
        overallSafetyStatus={result.overall_safety_status} 
        ocrConfidence={result.ocr_confidence} 
      />

      {/* Warning Card */}
      <WarningCard warnings={result.critical_warnings} />

      {/* Main Dual View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Original OCR Extracted */}
        <div className="lg:col-span-5 aws-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-[#232F3E] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF9900]" /> Original OCR Extracted Text
            </h3>
            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">Amazon Textract</span>
          </div>
          <div className="bg-[#F7F8FA] p-4 rounded-lg font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap max-h-[550px] overflow-y-auto border border-gray-200">
            {result.original_text}
          </div>
        </div>

        {/* Right Column: AI Translation & Plain Language Explanation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plain Language Summary */}
          <div className="aws-card p-5 bg-white border-l-4 border-l-[#146EB4]">
            <h3 className="text-xs font-bold text-[#146EB4] uppercase tracking-wider mb-1">Plain-Language Summary</h3>
            <p className="text-sm text-gray-800 leading-relaxed">{result.summary}</p>
          </div>

          {/* Medications Card */}
          {result.medications && result.medications.length > 0 && (
            <div className="aws-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="font-bold text-sm text-[#232F3E]">
                  Medications Extracted ({result.medications.length})
                </h3>
                <span className="text-xs text-gray-500">Source Evidence Tracing</span>
              </div>
              <div className="divide-y divide-gray-100">
                {result.medications.map((m: any, i: number) => {
                  const blocked = m.is_blocked;
                  return (
                    <div key={i} className={`py-3.5 first:pt-0 last:pb-0 space-y-2 ${blocked ? 'opacity-90' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#161E2D]">{m.name}</span>
                          {blocked && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                              <Lock className="w-3 h-3" /> BLOCKED
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                          blocked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20'
                        }`}>
                          {m.dosage}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-0.5">
                        <div><span className="text-gray-400">Frequency:</span> {m.frequency}</div>
                        <div><span className="text-gray-400">Duration:</span> {m.duration || 'N/A'}</div>
                      </div>

                      {blocked ? (
                        <div className="text-xs bg-red-50 text-red-900 p-2.5 rounded border border-red-200 flex items-start gap-2">
                          <ShieldX className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold">INSTRUCTION BLOCKED BY CLINICAL VALIDATOR</div>
                            <div className="text-[11px] text-red-700 mt-0.5">{m.block_reason || 'Critical dosage mismatch detected.'}</div>
                          </div>
                        </div>
                      ) : (
                        m.instructions && (
                          <div className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-200/60">
                            <strong>Instructions:</strong> {m.instructions}
                          </div>
                        )
                      )}

                      {/* Evidence Source Link */}
                      {showEvidence && m.evidence && (
                        <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between font-mono">
                          <span className="flex items-center gap-1.5 truncate">
                            <LinkIcon className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>OCR Line {m.evidence.line_number}: "{m.evidence.text}"</span>
                          </span>
                          <span className="text-emerald-600 font-sans text-[10px] font-semibold shrink-0 ml-2">
                            {m.evidence.confidence}% conf
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tests and Results */}
          {result.tests_and_results && result.tests_and_results.length > 0 && (
            <div className="aws-card p-6 bg-white space-y-4">
              <h3 className="font-bold text-sm text-[#232F3E] border-b border-gray-100 pb-2">
                Lab Tests & Printed Reference Ranges
              </h3>
              <div className="divide-y divide-gray-100 text-xs">
                {result.tests_and_results.map((t: any, idx: number) => (
                  <div key={idx} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{t.name}</span>
                      <span className="font-mono font-semibold text-gray-800">{t.value} {t.unit || ''}</span>
                    </div>
                    {t.printed_reference_range && (
                      <div className="text-gray-500 text-[11px]">
                        Printed Report Reference Range: <span className="font-mono">{t.printed_reference_range}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Translated Content */}
          <div className="aws-card p-6 bg-white space-y-3">
            <h3 className="font-bold text-sm text-[#232F3E] border-b border-gray-100 pb-2">
              Full Translated Content ({result.target_language.toUpperCase()})
            </h3>
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-[#F7F8FA] p-4 rounded-lg border border-gray-200">
              {result.translated_text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
