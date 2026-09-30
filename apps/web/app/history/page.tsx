'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, FileText, Download, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';

export default function HistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/v1/history`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Delete this translation record and associated files?')) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/v1/jobs/${jobId}`, { method: 'DELETE' });
      fetchHistory();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#232F3E] flex items-center gap-2">
            <History className="w-6 h-6 text-[#FF9900]" /> Translation History
          </h1>
          <p className="text-xs text-[#5F6B7A] mt-1">
            Review your processed medical translation jobs and downloadable PDF reports.
          </p>
        </div>

        <button onClick={fetchHistory} className="aws-btn-secondary text-xs flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="aws-card bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading history records...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <div className="text-sm font-bold text-gray-700">No Translation Jobs Found</div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              You haven't translated any medical documents yet. Start your first translation now.
            </p>
            <Link href="/translate" className="aws-btn-primary inline-block text-xs mt-2">
              Translate a Document
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#232F3E] text-white">
                  <th className="p-3 font-semibold">Job ID</th>
                  <th className="p-3 font-semibold">Document Type</th>
                  <th className="p-3 font-semibold">Language</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">OCR Confidence</th>
                  <th className="p-3 font-semibold">Created</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono text-gray-600">{j.id.slice(0, 8)}...</td>
                    <td className="p-3 font-medium text-gray-800">{j.document_type || 'Prescription'}</td>
                    <td className="p-3 uppercase font-semibold text-[#146EB4]">{j.target_language}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3"><ConfidenceBadge confidence={j.ocr_confidence} /></td>
                    <td className="p-3 text-gray-500">{new Date(j.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-2">
                      <Link href={`/jobs/${j.id}`} className="text-[#146EB4] hover:underline inline-flex items-center gap-1 font-semibold">
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button onClick={() => handleDeleteJob(j.id)} className="text-red-600 hover:text-red-800 font-semibold ml-2">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
