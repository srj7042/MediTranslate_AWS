'use client';

import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Eye } from 'lucide-react';

export default function SettingsPage() {
  const [retentionDays, setRetentionDays] = useState(7);
  const [contrast, setContrast] = useState('normal');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#232F3E] flex items-center gap-2">
        <Settings className="w-6 h-6 text-[#FF9900]" /> Application Settings
      </h1>

      <div className="aws-card p-6 bg-white space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#161E2D] mb-3 uppercase tracking-wider">Privacy & Retention</h3>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Automatic File Deletion Window (Days)
          </label>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            className="w-full sm:w-64 border border-[#D5DBDB] rounded-md p-2 text-xs bg-white text-[#161E2D]"
          >
            <option value={1}>1 Day (Strict Privacy)</option>
            <option value={7}>7 Days (Default Standard)</option>
            <option value={30}>30 Days (Extended Review)</option>
          </select>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-bold text-[#161E2D] mb-3 uppercase tracking-wider">Accessibility Controls</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-[#FF9900]" />
              <span>Enable High Contrast Mode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-[#FF9900]" />
              <span>Reduced Motion & Animation</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button className="aws-btn-primary text-xs flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
