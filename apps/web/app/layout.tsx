import './globals.css';
import type { Metadata } from 'next';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';

export const metadata: Metadata = {
  title: 'MediTranslate — AWS-Native Medical Document Translation & Explanation',
  description: 'Understand prescriptions, lab reports, and medical notes across languages with Amazon Textract and Amazon Bedrock. Architected by Suraj Jaiswal for AWS Zero to Shipped 2026.',
  keywords: ['AWS', 'MediTranslate', 'Medical Translation', 'Amazon Bedrock', 'Amazon Textract', 'Health Tech', 'Social Good'],
  authors: [{ name: 'Suraj Jaiswal' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#161E2D]">
        <AppHeader />
        <main className="flex-grow">
          {children}
        </main>
        <AppFooter />
      </body>
    </html>
  );
}
