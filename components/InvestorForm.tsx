'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import type { InvestorInput, Investor, InvestorFormProps } from '@/types/database';

export default function InvestorForm({ initialData, onSubmit, mode }: InvestorFormProps) {
  const [formData, setFormData] = useState<InvestorInput>({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone_number: initialData?.phone_number || '',
    total_investment: initialData?.total_investment || 1400000,
    number_of_bikes: initialData?.number_of_bikes || 1,
    investment_date: initialData?.investment_date || new Date().toISOString().split('T')[0],
    maturity_period: 12,
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
    ...(mode === 'edit' ? {} : { password: '' })
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyReturn = (investment: number) => {
    // 25% annual return divided by 12 months = 2.083% monthly return
    return investment * 0.25 / 12; // 25% annual return distributed monthly
  };

  const calculateWeeklyReturn = (investment: number) => {
    // 25% annual return divided by 52 weeks = 0.481% weekly return
    return investment * 0.25 / 52; // 25% annual return distributed weekly
  };

  const calculateExpectedAnnualReturn = (investment: number) => {
    // 25% annual return
    return investment * 0.25;
  };

  const calculatePrincipalReturn = (investment: number) => {
    // Principal amount - the original investment
    return investment;
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              onChange={(e) => setFormData({ 
                ...formData, 
                total_investment: Number(e.target.value)
              })}
              required
            />
            <div className="text-sm text-gray-600 mt-1 space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="font-medium text-gray-700">Returns (Profit Only):</p>
                  <p>Weekly Return: ₦{calculateWeeklyReturn(Number(formData.total_investment)).toLocaleString()}</p>
                  <p>Monthly Return: ₦{calculateMonthlyReturn(Number(formData.total_investment)).toLocaleString()}</p>
                  <p>Expected Annual Return: ₦{calculateExpectedAnnualReturn(Number(formData.total_investment)).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Principal:</p>
                  <p>Principal Amount: ₦{calculatePrincipalReturn(Number(formData.total_investment)).toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Total Payout: ₦{(calculatePrincipalReturn(Number(formData.total_investment)) + calculateExpectedAnnualReturn(Number(formData.total_investment))).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
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

          {mode === 'edit' && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Account Password</Label>
              <Input
                id="password"
                type="password"
                value={(formData as InvestorInput).password || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  password: e.target.value 
                } as InvestorInput)}
                required={mode === 'create'}
                minLength={6}
              />
              <p className="text-sm text-gray-500">
                This password will be used by the investor to login
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Add any additional notes about the investor or investment..."
          />
        </div>

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'edit' ? 'Update Investor' : 'Create Investor'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
