'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Activity, User, Settings, History } from 'lucide-react';

export const AppHeader = () => {
  return (
    <header className="bg-[#232F3E] text-white border-b border-[#161E2D] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#FF9900] flex items-center justify-center text-[#161E2D] font-bold text-xl shadow">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
              MediTranslate
              <span className="text-xs bg-[#146EB4] text-white px-2 py-0.5 rounded font-normal">AWS 2026</span>
            </div>
            <div className="text-xs text-gray-400">Social Good — Health | Lane: Community</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/translate" className="hover:text-[#FF9900] transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Translate Document
          </Link>
          <Link href="/history" className="hover:text-[#FF9900] transition-colors flex items-center gap-1.5">
            <History className="w-4 h-4" /> History
          </Link>
          <Link href="/how-it-works" className="hover:text-[#FF9900] transition-colors">
            How It Works
          </Link>
          <Link href="/safety" className="hover:text-[#FF9900] transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#FF9900]" /> Safety
          </Link>
          <Link href="/status" className="hover:text-[#FF9900] transition-colors flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> Status
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/translate"
            className="aws-btn-primary text-xs sm:text-sm flex items-center gap-1.5 shadow"
          >
            Translate Now
          </Link>
          <Link href="/profile" className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-[#161E2D]">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
