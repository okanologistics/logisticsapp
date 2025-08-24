'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InvestorForm from '@/components/InvestorForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Investor, InvestorUpdateInput } from '@/types/database';

export default function EditInvestorPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);
  const [investorId, setInvestorId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setInvestorId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (investorId) {
      loadInvestor();
    }
  }, [investorId]);

  const loadInvestor = async () => {
    if (!investorId) return;
    
    try {
      const response = await fetch(`/api/admin/investors/${investorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch investor');
      }
      const data = await response.json();
      setInvestor(data);
    } catch (error) {
      console.error('Error loading investor:', error);
      toast.error('Failed to load investor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: InvestorUpdateInput) => {
    try {
      const response = await fetch(`/api/admin/investors/${investorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update investor');

      toast.success('Investor updated successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error updating investor:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-[400px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Investor not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Investor</h1>
          <p className="text-gray-500">{investor.full_name}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <InvestorForm 
        initialData={investor}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}
