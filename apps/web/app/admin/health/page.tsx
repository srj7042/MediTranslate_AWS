'use client';

import React from 'react';
import { Activity, Server, Cpu, Database, AlertTriangle } from 'lucide-react';

export default function AdminHealthPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#232F3E] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#FF9900]" /> Operational Health Dashboard
          </h1>
          <p className="text-xs text-[#5F6B7A] mt-1">
            Technical metrics, AWS API health, and pipeline telemetry (No patient data displayed)
          </p>
        </div>
        <span className="text-xs bg-[#232F3E] text-white px-3 py-1 rounded font-mono">
          Admin Authorization Required
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jobs Processed Today', val: '142', sub: '+12% vs avg' },
          { label: 'Pipeline Success Rate', val: '99.3%', sub: '0.7% retry rate' },
          { label: 'Median Processing Time', val: '3.4s', sub: 'Textract + Bedrock' },
          { label: 'Critical Mismatches Caught', val: '4', sub: 'Flagged by safety guard' }
        ].map((m, idx) => (
          <div key={idx} className="aws-card p-5 bg-white">
            <div className="text-xs text-gray-500 font-medium">{m.label}</div>
            <div className="text-2xl font-extrabold text-[#232F3E] mt-1">{m.val}</div>
            <div className="text-[11px] text-[#146EB4] mt-1 font-semibold">{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
