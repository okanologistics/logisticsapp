'use client';

import { useRouter } from 'next/navigation';
import InvestorForm from '@/components/InvestorForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { InvestorInput } from '@/types/database';

export default function CreateInvestorPage() {
  const router = useRouter();

  const handleSubmit = async (data: InvestorInput) => {
    try {
      const response = await fetch('/api/admin/create-investor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create investor');
      }

      toast.success('Investor created successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error creating investor:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create New Investor</h1>
          <p className="text-gray-500">Add a new investor to the platform</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <InvestorForm 
        onSubmit={(data: InvestorInput) => handleSubmit(data)}
        mode="create"
      />
    </div>
  );
}
