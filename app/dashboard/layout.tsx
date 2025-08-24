export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { checkInvestorAuth } from '@/lib/auth';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-orange border-gray-200 border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default async function InvestorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { user, profile } = await checkInvestorAuth();
    console.log('Auth check result:', { user, profile });
    if (!user || !profile) {
      console.log('No user or profile found, redirecting to login');
      redirect('/login');
    }
  } catch (error) {
    console.error('Dashboard layout auth error:', error);
    redirect('/login');
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
}
