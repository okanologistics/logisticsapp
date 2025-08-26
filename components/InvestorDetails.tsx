'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Edit, DollarSign } from 'lucide-react';
import type { InvestorDetails as InvestorDetailsType } from '@/app/admin/dashboard/actions';
import { getInvestorPayments, addPaymentRecord, updateInvestmentDetails } from '@/app/admin/dashboard/actions';

interface InvestorDetailsProps {
  investor: InvestorDetailsType;
  payments?: any[];
  onUpdate?: () => void;
}

export function InvestorDetails({ investor, payments = [], onUpdate }: InvestorDetailsProps) {
  const [paymentHistory, setPaymentHistory] = useState(payments);
  const [showEditInvestment, setShowEditInvestment] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Investment editing state
  const [investmentData, setInvestmentData] = useState<{
    total_investment: number;
    number_of_bikes: number;
    monthly_return: number;
    investment_status: 'pending' | 'active' | 'inactive';
    maturity_date: string;
    next_payout_date: string;
  }>({
    total_investment: investor.total_investment || 0,
    number_of_bikes: investor.number_of_bikes || 0,
    monthly_return: investor.monthly_return || 0,
    investment_status: (investor.status as 'pending' | 'active' | 'inactive') || 'pending',
    maturity_date: investor.maturity_date || '',
    next_payout_date: investor.next_payout_date || '',
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    payout_frequency: 'monthly' as 'weekly' | 'monthly',
    payment_date: new Date().toISOString().split('T')[0],
    status: 'completed' as 'pending' | 'completed' | 'failed',
    notes: '',
    custom_total_amount: 0,
    custom_interest_amount: 0,
    custom_principal_amount: 0,
    use_custom_amounts: false, // Toggle between auto-calculated and custom amounts
    allow_duplicate: false, // Allow overriding duplicate protection
  });

  // Calculate payment breakdown based on frequency
  const calculatePaymentBreakdown = (frequency: 'weekly' | 'monthly') => {
    const totalInvestment = investor.total_investment || 0;
    
    // Validate investment amount
    if (totalInvestment <= 0) {
      return {
        interestAmount: 0,
        principalAmount: 0,
        totalAmount: 0,
        frequency
      };
    }
    
    const totalProfit = totalInvestment * 0.25; // 25% profit over the investment period
    const periods = frequency === 'weekly' ? 52 : 12; // 52 weeks or 12 months
    
    // Calculate per-period amounts with proper rounding
    const interestPerPeriod = Math.round((totalProfit / periods) * 100) / 100;
    const principalPerPeriod = Math.round((totalInvestment / periods) * 100) / 100;
    const totalPerPeriod = Math.round((interestPerPeriod + principalPerPeriod) * 100) / 100;
    
    return {
      interestAmount: interestPerPeriod,
      principalAmount: principalPerPeriod,
      totalAmount: totalPerPeriod,
      frequency,
      // Additional info for transparency
      totalInvestment,
      totalProfit,
      periods,
      expectedTotalPayout: Math.round((totalInvestment + totalProfit) * 100) / 100
    };
  };

  // Calculate individual return components
  const calculateReturns = () => {
    const totalInvestment = investor.total_investment || 0;
    const annualReturn = totalInvestment * 0.25; // 25% annual return
    
    return {
      weeklyReturn: annualReturn / 52, // Weekly return (profit only)
      monthlyReturn: annualReturn / 12, // Monthly return (profit only) 
      annualReturn: annualReturn, // Annual return (profit only)
      principalAmount: totalInvestment, // Original investment
      totalPayout: totalInvestment + annualReturn // Principal + profit
    };
  };

  const returns = calculateReturns();

  // Initialize custom amounts with calculated values
  const initializeCustomAmounts = (frequency: 'weekly' | 'monthly') => {
    const breakdown = calculatePaymentBreakdown(frequency);
    setPaymentData(prev => ({
      ...prev,
      custom_total_amount: breakdown.totalAmount,
      custom_interest_amount: breakdown.interestAmount,
      custom_principal_amount: breakdown.principalAmount,
    }));
  };

  // Load payment history
  const loadPaymentHistory = async () => {
    try {
      console.log('Loading payment history for investor:', investor.id);
      const payments = await getInvestorPayments(investor.id);
      console.log('Received payments:', payments);
      setPaymentHistory(payments);
    } catch (error) {
      console.error('Error loading payment history:', error);
      setPaymentHistory([]);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investor.id]);

  async function handleUpdateInvestment() {
    setLoading(true);
    try {
      await updateInvestmentDetails(investor.id, investmentData);
      toast.success('Investment details updated successfully');
      setShowEditInvestment(false);
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update investment details');
      console.error('Error updating investment:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPayment() {
    setLoading(true);
    try {
      let amountData;
      
      if (paymentData.use_custom_amounts) {
        // Use custom amounts entered by admin
        amountData = {
          totalAmount: paymentData.custom_total_amount,
          interestAmount: paymentData.custom_interest_amount,
          principalAmount: paymentData.custom_principal_amount,
        };
      } else {
        // Use auto-calculated amounts
        const breakdown = calculatePaymentBreakdown(paymentData.payout_frequency);
        amountData = {
          totalAmount: breakdown.totalAmount,
          interestAmount: breakdown.interestAmount,
          principalAmount: breakdown.principalAmount,
        };
      }
      
      await addPaymentRecord(investor.id, {
        total_amount: amountData.totalAmount,
        interest_amount: amountData.interestAmount,
        principal_amount: amountData.principalAmount,
        payout_frequency: paymentData.payout_frequency,
        payment_date: paymentData.payment_date,
        status: paymentData.status,
        notes: paymentData.notes,
        allow_duplicate: paymentData.allow_duplicate,
      });
      
      toast.success('Payment recorded and notifications sent successfully');
      setShowAddPayment(false);
      setPaymentData({
        payout_frequency: 'monthly',
        payment_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        notes: '',
        custom_total_amount: 0,
        custom_interest_amount: 0,
        custom_principal_amount: 0,
        use_custom_amounts: false,
      });
      loadPaymentHistory();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      
      // Handle specific error messages
      if (error.message.includes('Payment already exists')) {
        toast.error(error.message);
      } else if (error.message.includes('No investor found')) {
        toast.error('Investor record not found. Please contact support.');
      } else {
        toast.error('Failed to record payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Basic Information */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Investor Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-xs md:text-sm text-gray-500">Full Name</p>
            <p className="font-medium text-sm md:text-base">{investor.full_name}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Email</p>
            <p className="font-medium text-sm md:text-base break-all">{investor.email}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Phone Number</p>
            <p className="font-medium text-sm md:text-base">{investor.phone_number || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Status</p>
            <Badge variant={investor.status === 'active' ? 'default' : 'secondary'}>
              {investor.status}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Investment Details */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-3">
          <h3 className="text-lg md:text-xl font-semibold">Investment Details</h3>
          <Dialog open={showEditInvestment} onOpenChange={setShowEditInvestment}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="self-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Investment
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[500px] mx-2">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">Edit Investment Details</DialogTitle>
                <DialogDescription className="text-sm">
                  Update the investor&apos;s investment information and financial details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_investment" className="text-sm">Total Investment (₦)</Label>
                    <Input
                      id="total_investment"
                      type="number"
                      value={investmentData.total_investment}
                      onChange={(e) => setInvestmentData({
                        ...investmentData,
                        total_investment: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="number_of_bikes" className="text-sm">Number of Bikes</Label>
                    <Input
                      id="number_of_bikes"
                      type="number"
                      value={investmentData.number_of_bikes}
                      onChange={(e) => setInvestmentData({
                        ...investmentData,
                        number_of_bikes: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly_return" className="text-sm">Monthly Return (₦)</Label>
                    <Input
                      id="monthly_return"
                      type="number"
                      value={investmentData.monthly_return}
                      onChange={(e) => setInvestmentData({
                        ...investmentData,
                        monthly_return: Number(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="investment_status" className="text-sm">Status</Label>
                    <Select
                      value={investmentData.investment_status}
                      onValueChange={(value: 'pending' | 'active' | 'inactive') => setInvestmentData({
                        ...investmentData,
                        investment_status: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maturity_date" className="text-sm">Maturity Date</Label>
                    <Input
                      id="maturity_date"
                      type="date"
                      value={investmentData.maturity_date}
                      onChange={(e) => setInvestmentData({
                        ...investmentData,
                        maturity_date: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_payout_date" className="text-sm">Next Payout Date</Label>
                    <Input
                      id="next_payout_date"
                      type="date"
                      value={investmentData.next_payout_date}
                      onChange={(e) => setInvestmentData({
                        ...investmentData,
                        next_payout_date: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditInvestment(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateInvestment}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Investment'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div>
            <p className="text-xs md:text-sm text-gray-500">Total Investment</p>
            <p className="font-medium text-sm md:text-base">{formatCurrency(investor.total_investment || 0)}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Number of Bikes</p>
            <p className="font-medium text-sm md:text-base">{investor.number_of_bikes || 0}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Principal Amount</p>
            <p className="font-medium text-sm md:text-base">{formatCurrency(returns.principalAmount)}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Weekly Return</p>
            <p className="font-medium text-sm md:text-base text-green-600">{formatCurrency(returns.weeklyReturn)}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Monthly Return</p>
            <p className="font-medium text-sm md:text-base text-green-600">{formatCurrency(returns.monthlyReturn)}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Expected Annual Return</p>
            <p className="font-medium text-sm md:text-base text-green-600">{formatCurrency(returns.annualReturn)}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Total Payout</p>
            <p className="font-medium text-sm md:text-base text-blue-600">{formatCurrency(returns.totalPayout)}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Investment Date</p>
            <p className="font-medium text-sm md:text-base">{formatDate(investor.investment_date)}</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Total Returns Paid</p>
            <p className="font-medium text-sm md:text-base">{formatCurrency(investor.total_returns || 0)}</p>
          </div>
          {investor.maturity_date && (
            <div>
              <p className="text-xs md:text-sm text-gray-500">Maturity Date</p>
              <p className="font-medium text-sm md:text-base">{formatDate(investor.maturity_date)}</p>
            </div>
          )}
          {investor.next_payout_date && (
            <div>
              <p className="text-sm text-gray-500">Next Payout Date</p>
              <p className="font-medium">{formatDate(investor.next_payout_date)}</p>
            </div>
          )}
          {investor.last_payment && (
            <div>
              <p className="text-xs md:text-sm text-gray-500">Last Payment Date</p>
              <p className="font-medium text-sm md:text-base">{formatDate(investor.last_payment)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4 gap-3">
          <h3 className="text-lg md:text-xl font-semibold">Payment History</h3>
          <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
            <DialogTrigger asChild>
              <Button size="sm" className="self-start">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] mx-2 overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">Add Payment Record</DialogTitle>
                <DialogDescription className="text-sm">
                  Record a new payment for this investor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2 px-1">
                <div>
                  <Label htmlFor="payout_frequency" className="text-sm">Payout Frequency</Label>
                  <Select
                    value={paymentData.payout_frequency}
                    onValueChange={(value: 'weekly' | 'monthly') => {
                      setPaymentData({ 
                        ...paymentData, 
                        payout_frequency: value
                      });
                      
                      // Update custom amounts if using custom mode
                      if (paymentData.use_custom_amounts) {
                        initializeCustomAmounts(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly Payout</SelectItem>
                      <SelectItem value="monthly">Monthly Payout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-3">Payment Breakdown Preview:</p>
                    {(() => {
                      const breakdown = calculatePaymentBreakdown(paymentData.payout_frequency);
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-blue-600">Total Investment:</p>
                              <p className="font-medium">₦{(investor.total_investment || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-600">Total Profit (25%):</p>
                              <p className="font-medium">₦{((investor.total_investment || 0) * 0.25).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="border-t pt-3">
                            <p className="font-semibold text-blue-800 mb-2">{paymentData.payout_frequency.charAt(0).toUpperCase() + paymentData.payout_frequency.slice(1)} Payment Breakdown:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div className="bg-green-100 p-2 rounded">
                                <p className="text-green-600">Interest</p>
                                <p className="font-bold text-green-800">₦{breakdown.interestAmount.toLocaleString()}</p>
                              </div>
                              <div className="bg-orange-100 p-2 rounded">
                                <p className="text-orange-600">Principal</p>
                                <p className="font-bold text-orange-800">₦{breakdown.principalAmount.toLocaleString()}</p>
                              </div>
                              <div className="bg-blue-100 p-2 rounded">
                                <p className="text-blue-600">Total</p>
                                <p className="font-bold text-blue-800">₦{breakdown.totalAmount.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Custom Amount Toggle */}
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="use_custom_amounts"
                    checked={paymentData.use_custom_amounts}
                    onChange={(e) => {
                      const useCustom = e.target.checked;
                      if (useCustom) {
                        initializeCustomAmounts(paymentData.payout_frequency);
                      }
                      setPaymentData({
                        ...paymentData,
                        use_custom_amounts: useCustom
                      });
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="use_custom_amounts" className="text-sm font-medium">
                    Edit payment amounts manually
                  </Label>
                </div>

                {/* Custom Amount Inputs */}
                {paymentData.use_custom_amounts && (
                  <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-3">Custom Payment Amounts:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="custom_interest" className="text-xs">Interest Amount (₦)</Label>
                        <Input
                          id="custom_interest"
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentData.custom_interest_amount}
                          onChange={(e) => {
                            const interestAmount = Number(e.target.value);
                            setPaymentData({
                              ...paymentData,
                              custom_interest_amount: interestAmount,
                              custom_total_amount: interestAmount + paymentData.custom_principal_amount
                            });
                          }}
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="custom_principal" className="text-xs">Principal Amount (₦)</Label>
                        <Input
                          id="custom_principal"
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentData.custom_principal_amount}
                          onChange={(e) => {
                            const principalAmount = Number(e.target.value);
                            setPaymentData({
                              ...paymentData,
                              custom_principal_amount: principalAmount,
                              custom_total_amount: paymentData.custom_interest_amount + principalAmount
                            });
                          }}
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="custom_total" className="text-xs">Total Amount (₦)</Label>
                        <Input
                          id="custom_total"
                          type="number"
                          min="0"
                          step="0.01"
                          value={paymentData.custom_total_amount}
                          onChange={(e) => {
                            setPaymentData({
                              ...paymentData,
                              custom_total_amount: Number(e.target.value)
                            });
                          }}
                          className="text-sm font-semibold"
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                      <strong>Note:</strong> Custom amounts will override the calculated breakdown. Ensure amounts are accurate before saving.
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      payment_date: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_status">Status</Label>
                  <Select
                    value={paymentData.status}
                    onValueChange={(value: 'pending' | 'completed' | 'failed') => 
                      setPaymentData({ ...paymentData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_notes">Notes (Optional)</Label>
                  <Textarea
                    id="payment_notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      notes: e.target.value
                    })}
                    rows={3}
                  />
                </div>
                
                {/* Duplicate Override Checkbox */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allow_duplicate"
                      checked={paymentData.allow_duplicate}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        allow_duplicate: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="allow_duplicate" className="text-sm font-medium">
                      Allow duplicate payment on same date
                    </Label>
                  </div>
                  {paymentData.allow_duplicate && (
                    <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 p-2 rounded flex items-center space-x-2">
                      <span>⚠️</span>
                      <span>Warning: This will allow adding multiple payments for the same date</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPayment(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPayment}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? 'Processing...' : 'Record Payment'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Payment Breakdown</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory && paymentHistory.length > 0 ? (
                paymentHistory.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Interest: ₦{(payment.interest_amount || 0).toLocaleString()}
                          </span>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Principal: ₦{(payment.principal_amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₦{(payment.total_amount || payment.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.payout_frequency || 'monthly'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        payment.status === 'completed' ? 'default' : 
                        payment.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No payment history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {paymentHistory && paymentHistory.length > 0 ? (
            paymentHistory.map((payment: any) => (
              <div key={payment.id} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">₦{(payment.total_amount || payment.amount || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
                  </div>
                  <Badge variant={
                    payment.status === 'completed' ? 'default' : 
                    payment.status === 'pending' ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {payment.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Interest: ₦{(payment.interest_amount || 0).toLocaleString()}
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Principal: ₦{(payment.principal_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {payment.payout_frequency || 'monthly'} payout
                  </Badge>
                  {payment.notes && payment.notes !== '-' && (
                    <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8 border rounded-lg text-sm">
              No payment history available
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
