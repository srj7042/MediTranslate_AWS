'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, ShieldCheck, LogOut, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/v1/me`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#232F3E]">User Profile & Account</h1>

      <div className="aws-card p-6 bg-white space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-14 h-14 rounded-full bg-[#232F3E] text-[#FF9900] flex items-center justify-center font-bold text-xl">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="text-base font-bold text-[#161E2D]">{profile?.name || 'Suraj Jaiswal'}</div>
            <div className="text-xs text-gray-500">{profile?.email || 'suraj.jaiswal@example.com'}</div>
            <div className="text-[11px] text-[#146EB4] mt-0.5">Amazon Cognito Authenticated Account</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#F7F8FA] rounded border border-gray-200">
            <span className="text-gray-500">Preferred Target Language:</span>
            <div className="font-bold text-[#161E2D] mt-0.5">Hindi (हिंदी)</div>
          </div>

          <div className="p-3 bg-[#F7F8FA] rounded border border-gray-200">
            <span className="text-gray-500">Default Complexity:</span>
            <div className="font-bold text-[#161E2D] mt-0.5">Standard Medical Explanation</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button className="aws-btn-secondary text-xs flex items-center gap-1.5">
            <LogOut className="w-4 h-4" /> Sign Out Session
          </button>
          <button className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Delete Account & Data
          </button>
        </div>
      </div>
    </div>
  );
}
