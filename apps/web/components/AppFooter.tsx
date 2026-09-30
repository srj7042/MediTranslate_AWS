import React from 'react';
import Link from 'next/link';

export const AppFooter = () => {
  return (
    <footer className="bg-[#161E2D] text-gray-400 border-t border-[#232F3E] py-8 mt-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-white font-bold text-base mb-2">MediTranslate</div>
          <p className="text-xs text-gray-400 leading-relaxed">
            AWS-Native Medical Document Translation & Plain-Language Explanation System built for the AWS Zero to Shipped Hackathon 2026.
          </p>
          <div className="mt-3 text-xs text-[#FF9900] font-semibold">
            Architect & Lead Engineer: Suraj Jaiswal
          </div>
        </div>

        <div>
          <div className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Product</div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/translate" className="hover:text-white">Translate Document</Link></li>
            <li><Link href="/history" className="hover:text-white">Translation History</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
            <li><Link href="/status" className="hover:text-white">System Status</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Safety & Privacy</div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/safety" className="hover:text-white">Safety Policy & Guardrails</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Data Retention Policy</Link></li>
            <li><Link href="/admin/health" className="hover:text-white">Operational Health</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">AWS Architecture</div>
          <p className="text-xs leading-relaxed mb-2">
            Powered by Amazon Textract, Amazon Bedrock, AWS Step Functions, Amazon Cognito, and Supabase PostgreSQL.
          </p>
          <span className="inline-block bg-[#232F3E] text-xs text-[#FF9900] px-2.5 py-1 rounded border border-[#5F6B7A]/30">
            Hackathon Category: Social Good — Health
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 mt-8 pt-4 flex flex-col sm:flex-row justify-between text-xs text-gray-500">
        <div>© 2026 MediTranslate by Suraj Jaiswal. All rights reserved.</div>
        <div>AWS Zero to Shipped 2026 Hackathon Entry</div>
      </div>
    </footer>
  );
};
