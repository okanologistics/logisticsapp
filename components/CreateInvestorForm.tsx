'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(11, 'Phone number must be at least 11 digits'),
  total_investment: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Investment amount must be a positive number',
  }),
  number_of_bikes: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Number of bikes must be a positive number',
  }),
  payout_frequency: z.enum(['weekly', 'monthly']),
  status: z.enum(['pending', 'active', 'inactive']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof formSchema>;

interface InvestorData {
  user_id?: string;
  full_name: string;
  email: string;
  phone_number: string;
  total_investment: number;
  number_of_bikes: number;
  monthly_return: number;
  payout_frequency: string;
  investment_date: string;
  maturity_date: string;
  next_payout_date: string;
  status?: string;
}

type CreateInvestorFormProps = {
  onSubmit?: (data: any) => Promise<void>;
  onSuccess?: () => void;
};

export function CreateInvestorForm({ onSubmit, onSuccess }: CreateInvestorFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      total_investment: '',
      number_of_bikes: '',
      payout_frequency: 'monthly',
      status: 'pending',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      form.clearErrors();
      
      // Validate numeric fields before submission
      const total_investment = Number(data.total_investment);
      const number_of_bikes = Number(data.number_of_bikes);

      if (isNaN(total_investment) || total_investment <= 0) {
        form.setError('total_investment', { message: 'Invalid investment amount' });
        return;
      }

      if (isNaN(number_of_bikes) || number_of_bikes <= 0) {
        form.setError('number_of_bikes', { message: 'Invalid number of bikes' });
        return;
      }

      // Calculate dates based on business logic
      const investmentDate = new Date();
      const maturityDate = new Date();
      maturityDate.setFullYear(investmentDate.getFullYear() + 1); // 12 months maturity
      
      const nextPayoutDate = new Date(investmentDate);
      if (data.payout_frequency === 'weekly') {
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // Next week
      } else {
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1); // Next month
      }

      // Calculate total payout and monthly return based on business logic
      // Total payout = capital + 25% profit over 12 months
      const totalPayout = total_investment + (total_investment * 0.25);
      const monthly_return = totalPayout / 12;

      // If onSubmit prop is provided (admin dashboard), use it
      if (onSubmit) {
        await onSubmit({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone_number: data.phone_number || '',
          total_investment,
          number_of_bikes,
          monthly_return,
          payout_frequency: data.payout_frequency,
          investment_date: investmentDate.toISOString().split('T')[0],
          maturity_date: maturityDate.toISOString().split('T')[0],
          next_payout_date: nextPayoutDate.toISOString().split('T')[0],
          status: data.status
        });
        
        form.reset();
        onSuccess?.();
        return;
      }

      // Otherwise use the API endpoint (legacy behavior)
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone_number: data.phone_number || null,
          total_investment,
          number_of_bikes,
          monthly_return,
          payout_frequency: data.payout_frequency,
          investment_date: investmentDate.toISOString().split('T')[0],
          maturity_date: maturityDate.toISOString().split('T')[0],
          next_payout_date: nextPayoutDate.toISOString().split('T')[0]
        }),
      });

      let errorData;
      try {
        errorData = await userResponse.json();
      } catch (e) {
        if (!userResponse.ok) {
          throw new Error('Failed to create user account');
        }
        throw new Error('Invalid response from server');
      }

      if (!userResponse.ok) {
        console.error('Registration failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create user account');
      }

      const userData = errorData;
      console.log('User account created successfully:', userData);

      if (!userData || !userData.id) {
        throw new Error('Invalid user data received from server');
      }

      toast.success('Investor account created successfully');
      form.reset();
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating investor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create investor account';
      toast.error(errorMessage);
      // Re-enable form submission
      form.setError('root', { 
        type: 'submit',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 md:space-y-6 w-full max-w-2xl mx-auto p-2 md:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+234..." {...field} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="total_investment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Investment (₦)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="500000" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number_of_bikes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Bikes</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payout_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payout Frequency</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Display calculated return information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Investment Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-sm">
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Total Payout (Capital + 25% Profit):</p>
              <p className="font-semibold text-blue-700 text-sm md:text-base">
                ₦{form.watch('total_investment') ? (Number(form.watch('total_investment')) * 1.25).toLocaleString() : '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Monthly Return:</p>
              <p className="font-semibold text-blue-700 text-sm md:text-base">
                ₦{form.watch('total_investment') ? (Number(form.watch('total_investment')) * 1.25 / 12).toLocaleString() : '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Investment Period:</p>
              <p className="font-semibold text-blue-700 text-sm md:text-base">12 Months</p>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Status</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <Button type="submit" className="w-full sm:w-auto px-8" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Investor Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
