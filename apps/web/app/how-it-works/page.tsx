import React from 'react';
import { ArrowRight, Upload, Cpu, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#232F3E]">How MediTranslate Works</h1>
        <p className="text-sm text-[#5F6B7A] mt-1">End-to-end multi-stage AWS serverless document processing architecture</p>
      </div>

      <div className="space-y-6">
        {[
          { step: "01", title: "Direct Secure Presigned S3 Upload", desc: "Your document is uploaded straight from your browser to a private, encrypted S3 bucket using short-lived presigned URLs. No file body passes through public web servers." },
          { step: "02", title: "Amazon Textract Medical OCR", desc: "Textract extracts raw document text, block layouts, tables, and line confidences without altering character sequences." },
          { step: "03", title: "Amazon Bedrock Structured Translation", desc: "Bedrock AI translates medical terminology and formats explanations into strict JSON schema contracts while system prompts isolate untrusted document content." },
          { step: "04", title: "Deterministic Critical Value Verification", desc: "A separate Python post-processing engine checks drug names, dosage numbers (e.g. 500 mg vs 50 mg), frequencies, and measurement units against original OCR text to catch hallucinations." },
          { step: "05", title: "Side-by-Side Result & PDF Export", desc: "View original extracted text alongside translated explanations, or download a server-generated PDF report for clinician reference." }
        ].map((s, idx) => (
          <div key={idx} className="aws-card p-6 bg-white flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FF9900] text-[#161E2D] font-bold text-sm flex items-center justify-center shrink-0">
              {s.step}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#232F3E]">{s.title}</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
