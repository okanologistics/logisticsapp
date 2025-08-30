'use client';

// Force dynamic rendering to prevent build-time database connections
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Settings, LogOut, Mail, Phone, Instagram, Camera, 
  TrendingUp, Wallet, Bike, Calendar, DollarSign, Target, 
  Bell, User, CreditCard, Activity, ChevronDown, Star,
  ArrowUpRight, ArrowDownRight, Clock, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { getInvestorData, updateInvestorProfile } from './actions';

interface InvestorStats {
  totalPayouts: number;
  totalReturn: number;
  remainingAmount: number;
  weeklyPayment: number;
}

interface InvestorData {
  id: string;
  email: string;
  phone: string;
  emailFull: string;
  phoneFull: string;
  full_name: string;
  monthly_return: number;
  profile_image?: string;
  total_investment?: number;
  number_of_bikes?: number;
  investment_status?: string;
  investment_date?: string;
  maturity_date?: string;
  next_payout_date?: string;
  account_number?: string;
}

interface Payment {
  id: string;
  amount: number;
  total_amount?: number;
  interest_amount?: number;
  principal_amount?: number;
  payout_frequency?: string;
  payment_type?: string;
  notes?: string;
  status: string;
  created_at: string;
  payment_date?: string;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function InvestorDashboard() {
  const [investor, setInvestor] = useState<InvestorData | null>(null);
  const [profilePicture, setProfilePicture] = useState('/placeholder-avatar.jpg');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<InvestorStats>({
    totalPayouts: 0,
    totalReturn: 0,
    remainingAmount: 0,
    weeklyPayment: 0
  });
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  // Function to load/refresh investor data
  const loadInvestorData = async () => {
    try {
      console.log('=== LOADING INVESTOR DATA ===');
      const data = await getInvestorData();
      console.log('getInvestorData returned:', data);
      console.log('Setting investor to:', data.investor);
      console.log('investor.profile_image:', data.investor.profile_image);
      
      setInvestor(data.investor);
      setNotifications(data.notifications);
      setPayments(data.payments);
      setStats(data.stats);
      setProfilePicture(data.investor.profile_image || '/placeholder-avatar.jpg');
      
      console.log('State updated - profilePicture set to:', data.investor.profile_image || '/placeholder-avatar.jpg');
    } catch (error: any) {
      console.error('loadInvestorData error:', error);
      if (error.message === 'Not authenticated') {
        router.push('/login');
      } else {
        toast.error('Failed to load investor data. Please try again.');
        setError('Failed to load investor data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvestorData();
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileUpdate = async (formData: FormData) => {
    try {
      const phone = formData.get('phone') as string;
      const full_name = formData.get('full_name') as string;
      
      // Include the current profile image to preserve it
      await updateInvestorProfile({ 
        phone, 
        full_name,
        profile_image: profilePicture !== '/placeholder-avatar.jpg' ? profilePicture : undefined
      });
      
      toast.success('Profile updated successfully');

      // Update local state
      if (investor) {
        setInvestor({
          ...investor,
          phone,
          phoneFull: phone,
          full_name
        });
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast.error('Failed to logout');
      // Still redirect even if API call fails, to clear local state
      router.push('/login');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }
  if (error) {
    return <div className="container mx-auto py-8"><Alert variant="destructive">{error}</Alert></div>;
  }
  if (!investor) {
    return <div className="container mx-auto py-8"><Alert>No investment data found.</Alert></div>;
  }

  // UI Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Okano Logistics</h1>
                <p className="text-sm text-gray-600">Investor Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-[#0A1D37] via-slate-800 to-[#0A1D37]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-orange-300/50 shadow-2xl transition-transform group-hover:scale-105">
                  <AvatarImage src={profilePicture || '/placeholder-avatar.jpg'} alt="Profile" />
                  <AvatarFallback className="text-2xl font-bold bg-orange-500/20 text-orange-100">
                    {investor?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-white mb-2">{investor?.full_name}</h2>
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-100 border-orange-400/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Investor
                    </Badge>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-100 border-orange-400/30">
                      <Star className="w-3 h-3 mr-1" />
                      Premium Member
                    </Badge>
                  </div>
                  <p className="text-orange-200 text-sm font-medium">ID: {investor?.id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-orange-400/20">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-orange-300" />
                      <div>
                        <p className="text-orange-200 text-sm">Email</p>
                        <p 
                          className="text-white font-medium cursor-pointer hover:text-orange-200 transition-colors"
                          onClick={() => setShowContact(!showContact)}
                        >
                          {showContact ? investor?.emailFull : investor?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-orange-400/20">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-orange-300" />
                      <div>
                        <p className="text-orange-200 text-sm">Phone</p>
                        <p 
                          className="text-white font-medium cursor-pointer hover:text-orange-200 transition-colors"
                          onClick={() => setShowContact(!showContact)}
                        >
                          {showContact ? investor?.phoneFull : investor?.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/70 backdrop-blur-sm border border-orange-100">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Investment Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Total Investment Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Total Investment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{(investor?.total_investment || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Returns Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Monthly Return</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{(investor?.monthly_return || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-orange-600">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+5.2% this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bikes Funded Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#0A1D37] to-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bike className="w-6 h-6 text-white" />
                    </div>
                    <Target className="w-5 h-5 text-[#0A1D37]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Bikes Funded</p>
                    <p className="text-2xl font-bold text-gray-900">{investor?.number_of_bikes || 0}</p>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Returns Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Total Returns</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>Next: </span>
                      <span className="font-medium">₦{((investor?.monthly_return || 0) / 4).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Investment Overview */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>Investment Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Expected Annual Yield</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₦{((investor?.monthly_return || 0) * 12).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Weekly Payment</p>
                      <p className="text-xl font-bold text-gray-900">
                        ₦{((investor?.monthly_return || 0) / 4).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress to Annual Target</span>
                        <span className="font-medium">
                          {Math.round((payments.reduce((sum, p) => sum + Number(p.amount), 0) / ((investor?.monthly_return || 1) * 12)) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (payments.reduce((sum, p) => sum + Number(p.amount), 0) / ((investor?.monthly_return || 1) * 12)) * 100)} 
                        className="h-3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          ₦{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total Paid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          ₦{(((investor?.monthly_return || 0) * 12) - payments.reduce((sum, p) => sum + Number(p.amount), 0)).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Remaining</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No recent notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-4 p-4 bg-orange-50/50 rounded-xl hover:bg-orange-50 transition-colors border border-orange-100/50">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Contact Links */}
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm font-medium text-gray-900 mb-4">Need Help?</p>
                    <div className="flex space-x-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href="mailto:support@okanologistics.com">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Support
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="tel:+2348000000000">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Us
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <span>Payment History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Payment Breakdown</TableHead>
                        <TableHead className="font-semibold">Total Amount</TableHead>
                        <TableHead className="font-semibold">Frequency</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No payment history available</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium">
                              {payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 
                               payment?.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Interest: ₦{(payment?.interest_amount || 0).toLocaleString()}
                                  </span>
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    Principal: ₦{(payment?.principal_amount || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₦{(payment?.total_amount || payment?.amount || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {payment?.payout_frequency || 'monthly'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={`${
                                  payment?.status === 'completed' 
                                    ? 'border-green-200 bg-green-50 text-green-700' 
                                    : payment?.status === 'pending'
                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                                }`}
                              >
                                {payment?.status ? (payment.status.charAt(0).toUpperCase() + payment.status.slice(1)) : 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {payment.notes || '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-8">
            {/* Profile Settings */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-orange-500" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form 
                  className="space-y-6" 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    const phone = formData.get('phone') as string;
                    const full_name = formData.get('full_name') as string;
                    
                    console.log('=== FORM SUBMISSION DEBUG ===');
                    console.log('Form submission - profilePicture state:', profilePicture);
                    console.log('Form submission - investor.profile_image from DB:', investor?.profile_image);
                    
                    try {
                      // ALWAYS preserve the current profile image from the database
                      // Don't update it unless we explicitly want to clear it
                      const preserveCurrentImage = investor?.profile_image;
                      
                      console.log('Form submission - preserving current profile_image:', preserveCurrentImage);
                      
                      const submissionData = { 
                        phone, 
                        full_name, 
                        profile_image: preserveCurrentImage
                      };
                      
                      console.log('Form submission - final submissionData:', JSON.stringify(submissionData, null, 2));
                      
                      await updateInvestorProfile(submissionData);
                      toast.success('Profile updated successfully!');
                      
                      // Refresh the dashboard data to ensure everything is in sync
                      await loadInvestorData();
                      
                    } catch (error) {
                      console.error('Profile update error:', error);
                      toast.error('Failed to update profile.');
                    }
                  }}
                >
                  {/* Profile Image Upload Section */}
                  <div className="flex justify-center mb-8">
                    <ProfileImageUpload
                      currentImage={profilePicture !== '/placeholder-avatar.jpg' ? profilePicture : undefined}
                      userInitials={investor?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      userName={investor?.full_name}
                      onImageChange={async (imagePath) => {
                        setProfilePicture(imagePath || '/placeholder-avatar.jpg');
                        // Refresh investor data to ensure it's in sync with the database
                        try {
                          await loadInvestorData();
                        } catch (error) {
                          console.error('Failed to refresh investor data after image update:', error);
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <Input 
                        id="full_name" 
                        name="full_name"
                        type="text" 
                        defaultValue={investor?.full_name} 
                        placeholder="Enter your full name"
                        className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue={investor?.emailFull} 
                        disabled 
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel" 
                        defaultValue={investor?.phoneFull}
                        placeholder="Enter your phone number"
                        className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_number" className="text-sm font-medium text-gray-700">
                        Account Number
                      </Label>
                      <Input 
                        id="account_number" 
                        type="text" 
                        defaultValue={investor?.account_number || 'N/A'}
                        disabled 
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Account Verified</p>
                        <p className="text-sm text-green-700">Your account is secure and verified</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900 mb-1">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Enabled via SMS</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900 mb-1">Last Login</p>
                      <p className="text-sm text-gray-600">Today at 2:30 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white/50 backdrop-blur-sm border-t border-white/20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Bike className="w-4 h-4 text-white" />
              </div>
              <p className="text-gray-600">
                &copy; {new Date().getFullYear()} Okano Logistics. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/terms" className="text-gray-600 hover:text-orange-500 transition-colors text-sm">
                Terms of Service
              </a>
              <a href="/privacy" className="text-gray-600 hover:text-orange-500 transition-colors text-sm">
                Privacy Policy
              </a>
              <div className="flex space-x-3">
                <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-orange-500">
                  <a href="https://instagram.com/okanologistics" target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
