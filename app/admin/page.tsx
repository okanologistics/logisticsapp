'use client';

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <p>Redirecting to admin dashboard...</p>
      </div>
    </div>
  );
}