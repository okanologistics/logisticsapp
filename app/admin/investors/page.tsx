'use client';

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { InvestorInput, Investor } from '@/types/database';

export default function AdminDashboard() {
  const router = useRouter();
  const [formData, setFormData] = useState<InvestorInput>({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    total_investment: 0,
    number_of_bikes: 0,
    investment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/admin/create-investor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add investor');
      }

      // Reset form and refresh data
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        total_investment: 0,
        number_of_bikes: 0,
        investment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        notes: ''
      });
      router.refresh();
    } catch (error) {
      console.error('Error adding investor:', error);
      setError(error instanceof Error ? error.message : 'Failed to add investor');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Investor</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_investment">Total Investment (₦)</Label>
              <Input
                id="total_investment"
                type="number"
                min="1400000"
                step="100000"
                value={formData.total_investment}
                onChange={(e) => setFormData({ ...formData, total_investment: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_bikes">Number of Bikes</Label>
              <Input
                id="number_of_bikes"
                type="number"
                min="1"
                value={formData.number_of_bikes}
                onChange={(e) => setFormData({ ...formData, number_of_bikes: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment_date">Investment Date</Label>
              <Input
                id="investment_date"
                type="date"
                value={formData.investment_date}
                onChange={(e) => setFormData({ ...formData, investment_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Investor Account Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
              <p className="text-sm text-gray-500">
                This password will be used by the investor to login to their dashboard
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              {error}
            </Alert>
          )}

          <Button type="submit" className="w-full mt-6">
            Create Investor Account
          </Button>
        </form>
      </Card>
    </div>
  );
}
