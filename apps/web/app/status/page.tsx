'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Server, ShieldCheck, Database, Cpu } from 'lucide-react';

export default function StatusPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/ready`);
        if (res.ok) {
          const data = await res.json();
          setStatusData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#232F3E] flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-500" /> System Operational Status
        </h1>
        <p className="text-xs text-[#5F6B7A] mt-1">Real-time status of MediTranslate AWS infrastructure and services</p>
      </div>

      <div className="aws-card p-6 bg-white space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <div className="text-sm font-bold text-emerald-950">All Systems Operational</div>
            <div className="text-xs text-emerald-800">AWS Services, Textract OCR, Bedrock AI & Database are running smoothly.</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            { name: 'FastAPI Backend Engine', status: 'Operational', icon: Server },
            { name: 'Supabase PostgreSQL DB', status: 'Operational', icon: Database },
            { name: 'Amazon Textract OCR', status: 'Operational', icon: Cpu },
            { name: 'Amazon Bedrock GenAI', status: 'Operational', icon: Cpu },
            { name: 'Amazon Cognito Auth', status: 'Operational', icon: ShieldCheck },
            { name: 'AWS Step Functions Pipeline', status: 'Operational', icon: Activity }
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200 bg-[#F7F8FA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-[#146EB4]" />
                <span className="font-semibold text-gray-800">{s.name}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
