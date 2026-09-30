'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, ArrowRight, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { SafetyBanner } from '@/components/SafetyBanner';
import { PipelineProgress } from '@/components/PipelineProgress';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' }
];

interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export default function TranslatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('hi');
  const [complexity, setComplexity] = useState('standard');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: '1', label: 'Create Job', status: 'pending' },
    { id: '2', label: 'Upload to S3', status: 'pending' },
    { id: '3', label: 'Textract OCR', status: 'pending' },
    { id: '4', label: 'Bedrock Translation', status: 'pending' },
    { id: '5', label: 'Critical Value Guard', status: 'pending' }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds maximum allowed limit of 10 MB.');
        return;
      }
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleTranslate = async () => {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      // Step 1: Create Job
      setPipelineSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'active' } : s));
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const createRes = await fetch(`${API_BASE}/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_language: targetLang,
          explanation_complexity: complexity,
          guest_session_id: 'guest-session-' + Date.now()
        })
      });
      if (!createRes.ok) throw new Error('Failed to create translation job.');
      const jobData = await createRes.json();
      const jobId = jobData.id;

      setPipelineSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'active' } : s));

      // Step 2: Get Presigned Upload URL
      const urlRes = await fetch(`${API_BASE}/v1/jobs/${jobId}/upload-url`, {
        method: 'POST'
      });
      if (!urlRes.ok) throw new Error('Failed to issue S3 presigned upload URL.');
      
      setPipelineSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'completed' } : i === 2 ? { ...s, status: 'active' } : s));

      // Step 3: Trigger Start Processing
      setPipelineSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'completed' } : i === 3 ? { ...s, status: 'active' } : s));
      const startRes = await fetch(`${API_BASE}/v1/jobs/${jobId}/start`, {
        method: 'POST'
      });
      if (!startRes.ok) throw new Error('Processing pipeline error.');

      setPipelineSteps(prev => prev.map((s, i) => ({ ...s, status: 'completed' })));

      // Redirect to result viewer
      router.push(`/jobs/${jobId}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during translation processing.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#232F3E]">Translate a Medical Document</h1>
        <p className="text-xs text-[#5F6B7A] mt-1">
          Upload prescriptions, lab reports, or discharge notes for AI translation & plain-language explanation.
        </p>
      </div>

      <SafetyBanner />

      {isUploading && <PipelineProgress steps={pipelineSteps} />}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="aws-card p-6 space-y-6 bg-white shadow-sm">
        {/* File Dropzone */}
        <div>
          <label className="block text-xs font-bold text-[#161E2D] mb-2 uppercase tracking-wider">
            1. Select Medical Document (PDF, PNG, JPG)
          </label>
          <div className="border-2 border-dashed border-[#D5DBDB] hover:border-[#FF9900] transition-colors rounded-lg p-8 text-center bg-[#F7F8FA]">
            <input
              type="file"
              id="doc-file-input"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="doc-file-input" className="cursor-pointer space-y-3 block">
              <div className="w-12 h-12 rounded-full bg-[#146EB4]/10 text-[#146EB4] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              {file ? (
                <div className="text-sm font-semibold text-[#161E2D] flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF9900]" />
                  {file.name} <span className="text-xs text-gray-500 font-normal">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <div className="text-sm font-semibold text-[#161E2D]">
                    Click to browse or drag & drop your medical document
                  </div>
                  <div className="text-xs text-gray-400">PDF, PNG, or JPG up to 10 MB</div>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#161E2D] mb-2 uppercase tracking-wider">
              2. Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full border border-[#D5DBDB] rounded-md p-2.5 text-sm bg-white text-[#161E2D] focus:ring-2 focus:ring-[#FF9900] outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#161E2D] mb-2 uppercase tracking-wider">
              3. Explanation Level
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full border border-[#D5DBDB] rounded-md p-2.5 text-sm bg-white text-[#161E2D] focus:ring-2 focus:ring-[#FF9900] outline-none"
            >
              <option value="standard">Standard (Clear medical explanation)</option>
              <option value="simple">Simple (Easy grade 6 reading level)</option>
            </select>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Auto-deletes after retention window
          </div>
          <button
            onClick={handleTranslate}
            disabled={isUploading}
            className="aws-btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing Workflow...
              </>
            ) : (
              <>
                Translate Document <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
