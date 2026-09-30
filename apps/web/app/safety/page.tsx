import React from 'react';
import { ShieldCheck, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import { SafetyBanner } from '@/components/SafetyBanner';

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#232F3E]">Safety & Clinical Guardrails</h1>
        <p className="text-sm text-[#5F6B7A] mt-1">Our commitment to informational safety, medical accuracy, and privacy</p>
      </div>

      <SafetyBanner />

      <div className="aws-card p-6 bg-white space-y-4 text-xs text-gray-700 leading-relaxed">
        <h3 className="font-bold text-sm text-[#232F3E]">What MediTranslate Is and Is Not</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
            <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> MediTranslate IS:
            </h4>
            <ul className="space-y-1 text-emerald-900">
              <li>• A medical document translation tool</li>
              <li>• A plain-language explanation assistant</li>
              <li>• An accessibility bridge for non-native speakers</li>
              <li>• A deterministic dosage verification system</li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded border border-red-200">
            <h4 className="font-bold text-red-950 mb-2 flex items-center gap-1.5 text-sm">
              <AlertCircle className="w-4 h-4 text-red-600" /> MediTranslate IS NOT:
            </h4>
            <ul className="space-y-1 text-red-900">
              <li>• A diagnostic system</li>
              <li>• A doctor or clinician replacement</li>
              <li>• A prescription generator</li>
              <li>• A medication recommender engine</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
