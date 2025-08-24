'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Edit, User, FileText, AlertTriangle } from 'lucide-react';
import InvestorForm from '@/components/InvestorForm';
import type { Investor, Payment, InvestorInput } from '@/types/database';

export default function InvestorDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
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
      loadInvestorData();
    }
  }, [investorId]);

  const loadInvestorData = async () => {
    if (!investorId) return;
    
    try {
      setLoading(true);
      setError('');

      // Get investor details
      const investorResponse = await fetch(`/api/admin/investors/${investorId}`);
      if (!investorResponse.ok) {
        throw new Error('Failed to load investor data');
      }
      const investorData = await investorResponse.json();
      setInvestor(investorData.investor);

      // Get payment history
      const paymentsResponse = await fetch(`/api/admin/investors/${investorId}/payments`);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }

    } catch (error: any) {
      console.error('Error loading investor data:', error);
      setError(error.message || 'Failed to load investor data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvestor = async (data: InvestorInput) => {
    try {
      setError('');
      const response = await fetch(`/api/admin/update-investor?id=${investorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update investor');
      }

      setShowEditDialog(false);
      loadInvestorData();
    } catch (error) {
      console.error('Error updating investor:', error);
      setError(error instanceof Error ? error.message : 'Failed to update investor');
    }
  };

  const handleSendEmail = async () => {
    try {
      setError('');
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investorIds: [investorId],
          subject: emailSubject,
          message: emailMessage,
          sendToAll: false
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      // Reset form and close dialog
      setEmailSubject('');
      setEmailMessage('');
      setShowEmailDialog(false);
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error instanceof Error ? error.message : 'Failed to send email');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="w-8 h-8 border-2 border-t-orange border-gray-200 rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading investor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">{error}</Alert>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="container mx-auto py-8">
        <Alert>Investor not found</Alert>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Investor Details</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Investor
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="payments">
            <FileText className="mr-2 h-4 w-4" />
            Payment History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Investor Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Full Name</Label>
                      <p className="font-medium">{investor.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Email</Label>
                      <p className="font-medium">{investor.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Phone Number</Label>
                      <p className="font-medium">{investor.phone_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Status</Label>
                      <p className="font-medium">
                        <span className={`px-2 py-1 rounded text-xs ${investor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {investor.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Investment Details</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Total Investment</Label>
                      <p className="font-medium">₦{investor.total_investment.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Number of Bikes</Label>
                      <p className="font-medium">{investor.number_of_bikes}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Monthly Return</Label>
                      <p className="font-medium">₦{investor.monthly_return.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Investment Date</Label>
                      <p className="font-medium">{new Date(investor.investment_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Maturity Date</Label>
                      <p className="font-medium">{new Date(investor.maturity_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Next Payout Date</Label>
                      <p className="font-medium">{new Date(investor.next_payout_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {investor.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <p className="text-gray-700">{investor.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No payment history found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">₦{payment.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className="capitalize">{payment.payment_type.replace('_', ' ')}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{payment.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-2xl backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-navy-600/5 pointer-events-none" />
          <DialogHeader className="relative z-10 pb-6 border-b border-gray-200/60">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-navy-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                <Edit className="h-5 w-5 text-white" />
              </div>
              Edit Investor Profile
            </DialogTitle>
          </DialogHeader>
          <div className="relative z-10 overflow-y-auto max-h-[calc(90vh-120px)] px-1">
            <InvestorForm 
              initialData={investor} 
              onSubmit={handleUpdateInvestor} 
              mode="edit" 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-2xl backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-orange-500/5 pointer-events-none" />
          <DialogHeader className="relative z-10 pb-6 border-b border-gray-200/60">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-navy-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              Send Email to {investor.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="relative z-10 overflow-y-auto max-h-[calc(90vh-120px)] px-1">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-medium text-gray-700">Subject</Label>
                <Input
                  id="subject"
                  className="h-12"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-base font-medium text-gray-700">Message</Label>
                <Textarea
                  id="message"
                  className="min-h-[120px]"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write your message to the investor..."
                  rows={6}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/60">
              <Button 
                variant="outline" 
                onClick={() => setShowEmailDialog(false)}
                className="hover:bg-gray-100 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
