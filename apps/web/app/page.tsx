'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Shield, Cpu, ArrowRight, CheckCircle2, Lock, Sparkles, Globe2, FileCheck2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#146EB4]/10 border border-[#146EB4]/20 text-[#146EB4] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> AWS Zero to Shipped Hackathon 2026 | Social Good — Health
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#232F3E] tracking-tight leading-tight">
              Understand medical documents in <span className="text-[#FF9900]">your language</span>.
            </h1>

            <p className="text-lg text-[#5F6B7A] leading-relaxed">
              Upload a prescription, lab report, or discharge summary. MediTranslate extracts, translates, and explains medical content while preserving critical drug dosages and clinical wording.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/translate" className="aws-btn-primary flex items-center gap-2 text-base px-6 py-3 shadow-md">
                Translate a Document <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/how-it-works" className="aws-btn-secondary flex items-center gap-2 text-base px-6 py-3">
                See How It Works
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-[#5F6B7A] border-t border-gray-200">
              <div className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-600" /> Private S3 Direct Upload</div>
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-[#146EB4]" /> Deterministic Dosage Guard</div>
              <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-[#FF9900]" /> Amazon Bedrock + Textract</div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aws-card p-6 bg-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-xs font-mono text-gray-400">MediTranslate Result Preview</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-[#F7F8FA] p-3 rounded border border-gray-200">
                  <div className="text-gray-500 font-medium mb-1">OCR Extracted (English):</div>
                  <div className="font-mono text-gray-800">Rx: Amoxicillin 500 mg — Take 1 capsule twice daily for 7 days</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                  <div className="text-emerald-800 font-bold mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Translation (Hindi):
                  </div>
                  <div className="text-emerald-950 font-medium leading-relaxed">
                    अमोक्सिसिलिन 500 मिलीग्राम — भोजन के बाद 7 दिनों के लिए दिन में दो बार 1 कैप्सूल लें।
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <div className="text-amber-900 font-bold mb-1">Deterministic Value Verification:</div>
                  <div className="text-amber-800">Dosage 500 mg matches original OCR extraction with 100% confidence.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Documents */}
      <section className="bg-white border-y border-[#D5DBDB] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-[#232F3E]">Supported Medical Documents</h2>
            <p className="text-sm text-[#5F6B7A] mt-1">Built specifically for structured patient healthcare records</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Prescriptions", desc: "Extract drug names, dosage (mg/mL), and daily frequency instructions." },
              { title: "Lab Reports", desc: "Interpret blood tests, urine tests, and diagnostic measurement ranges." },
              { title: "Discharge Summaries", desc: "Translate hospital care notes, post-discharge instructions, and follow-ups." },
              { title: "Vaccination Records", desc: "Understand immunization history, booster schedules, and vaccine names." }
            ].map((doc, idx) => (
              <div key={idx} className="aws-card p-5 hover:border-[#FF9900] transition-colors">
                <FileCheck2 className="w-8 h-8 text-[#FF9900] mb-3" />
                <h3 className="font-bold text-sm text-[#161E2D]">{doc.title}</h3>
                <p className="text-xs text-[#5F6B7A] mt-1 leading-relaxed">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Snapshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="aws-card bg-[#232F3E] text-white p-8">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold text-[#FF9900] uppercase tracking-wider">AWS Native Architecture</span>
            <h2 className="text-2xl font-bold mt-1 mb-3">Engineered for Social Good & Safety</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              MediTranslate combines Amazon Textract OCR, Amazon Bedrock GenAI models, AWS Step Functions workflows, and Supabase PostgreSQL to process documents without compromising on clinical accuracy or patient privacy.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#161E2D] p-3 rounded border border-gray-700">
                <div className="text-[#FF9900] font-bold">Amazon Textract</div>
                <div className="text-gray-400">OCR Text Extraction</div>
              </div>
              <div className="bg-[#161E2D] p-3 rounded border border-gray-700">
                <div className="text-[#FF9900] font-bold">Amazon Bedrock</div>
                <div className="text-gray-400">LLM Medical Translation</div>
              </div>
              <div className="bg-[#161E2D] p-3 rounded border border-gray-700">
                <div className="text-[#FF9900] font-bold">Step Functions</div>
                <div className="text-gray-400">State Machine Pipeline</div>
              </div>
              <div className="bg-[#161E2D] p-3 rounded border border-gray-700">
                <div className="text-[#FF9900] font-bold">Supabase Postgres</div>
                <div className="text-gray-400">App Metadata Storage</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
