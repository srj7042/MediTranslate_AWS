import React from 'react';
import { Lock, Shield, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-[#232F3E]">Privacy & Data Retention Policy</h1>

      <div className="aws-card p-6 bg-white space-y-4 text-xs text-gray-700 leading-relaxed">
        <h3 className="font-bold text-sm text-[#232F3E]">Data Minimization & Short Retention</h3>
        <p>
          MediTranslate operates on strict privacy and data minimization principles. Medical documents uploaded for processing are stored temporarily in private, encrypted S3 buckets and automatically deleted after the configured retention window (default 7 days).
        </p>

        <h3 className="font-bold text-sm text-[#232F3E] pt-2">Encryption in Transit & At Rest</h3>
        <p>
          All browser data transmissions use TLS 1.3 HTTPS encryption. Files in S3 are encrypted at rest using AWS KMS (Key Management Service). Supabase PostgreSQL application metadata is protected behind server-side authentication headers.
        </p>
      </div>
    </div>
  );
}
