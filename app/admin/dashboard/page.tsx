'use client';

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UserPlus, Edit, Users, DollarSign, Bike,
  Eye, Search, RefreshCcw, CheckCircle, XCircle, Trash2, LogOut
} from 'lucide-react';
import { CreateInvestorForm } from '@/components/CreateInvestorForm';
import { CreateAdminForm } from '@/components/CreateAdminForm';
import InvestorForm from '@/components/InvestorForm';
import { InvestorDetails } from '@/components/InvestorDetails';
import { 
  createInvestor, 
  getDashboardData, 
  updateInvestorStatus, 
  updateInvestor, 
  deleteInvestor, 
  getInvestorPayments,
  createAdminAccount,
  getAdminUsers,
  promoteInvestorToAdmin,
  demoteAdminToInvestor,
  type DashboardStats, 
  type InvestorDetails as InvestorDetailsType 
} from './actions';
import type { Investor, InvestorInput } from '@/types/database';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [investors, setInvestors] = useState<InvestorDetailsType[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestors: 0,
    activeInvestors: 0,
    totalBikes: 0,
    totalInvestment: 0,
    monthlyReturns: 0
  });
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorDetailsType | null>(null);
  const [selectedInvestorPayments, setSelectedInvestorPayments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [showAdminListDialog, setShowAdminListDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [investorToDelete, setInvestorToDelete] = useState<InvestorDetailsType | null>(null);
  const [investorToPromote, setInvestorToPromote] = useState<{ id: string; name: string } | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setError('');
      setCheckingAdmin(true);
      
      // Check admin access
      const checkAdminResponse = await fetch('/api/auth/check-admin');
      if (!checkAdminResponse.ok) {
        setIsAdmin(false);
        throw new Error('Admin access required');
      }
      setIsAdmin(true);
      
      // Get current user session
      const sessionResponse = await fetch('/api/auth/check-session');
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData.user?.id) {
          setCurrentUserId(sessionData.user.id);
        }
      }
      
      // Load dashboard data
      const { stats: dashboardStats, investors: investorList } = await getDashboardData();
      setStats(dashboardStats);
      setInvestors(investorList);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setCheckingAdmin(false);
    }
  }

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = 
      (investor.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (investor.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || investor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleStatusUpdate(id: string, newStatus: string) {
    try {
      await updateInvestorStatus(id, newStatus);
      toast.success(`Investor status updated to ${newStatus}`);
      loadDashboardData();
    } catch (error) {
      console.error('Status update failed:', error);
      toast.error('Failed to update investor status');
    }
  }

  async function handleDeleteInvestor(id: string, investorName: string) {
    try {
      await deleteInvestor(id);
      toast.success(`Investor "${investorName}" deleted successfully`);
      setShowDeleteDialog(false);
      setInvestorToDelete(null);
      loadDashboardData();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete investor');
    }
  }

  async function handleViewDetails(investor: InvestorDetailsType) {
    setSelectedInvestor(investor);
    try {
      const payments = await getInvestorPayments(investor.id);
      setSelectedInvestorPayments(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setSelectedInvestorPayments([]);
    }
    setShowDetailsDialog(true);
  }

  function confirmDeleteInvestor(investor: InvestorDetailsType) {
    setInvestorToDelete(investor);
    setShowDeleteDialog(true);
  }

  async function handleCreateInvestor(data: InvestorInput) {
    try {
      await createInvestor(data);
      toast.success('Investor created successfully');
      setShowCreateDialog(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error creating investor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create investor');
    }
  }

  async function handleEditInvestor(data: InvestorInput) {
    try {
      if (!selectedInvestor) return;
      await updateInvestor(selectedInvestor.id, data);
      toast.success('Investor updated successfully');
      setShowEditDialog(false);
      setSelectedInvestor(null);
      loadDashboardData();
    } catch (error) {
      console.error('Edit failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update investor');
    }
  }

  async function handleCreateAdmin(data: { email: string; password: string; full_name: string; phone_number?: string }) {
    try {
      await createAdminAccount(data);
      toast.success('Admin account created successfully');
      setShowCreateAdminDialog(false);
      loadAdminUsers(); // Refresh admin list if open
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create admin account');
    }
  }

  async function loadAdminUsers() {
    try {
      const admins = await getAdminUsers();
      setAdminUsers(admins);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast.error('Failed to load admin users');
    }
  }

  async function handlePromoteToAdmin(investorUserId: string, investorName: string) {
    // Show confirmation dialog instead of promoting directly
    setInvestorToPromote({ id: investorUserId, name: investorName });
    setShowPromoteDialog(true);
  }

  async function confirmPromoteToAdmin() {
    if (!investorToPromote) return;
    
    try {
      await promoteInvestorToAdmin(investorToPromote.id);
      toast.success(`${investorToPromote.name} has been promoted to admin`);
      loadDashboardData(); // Refresh the investor list
      loadAdminUsers(); // Refresh admin list if open
    } catch (error) {
      console.error('Error promoting to admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to promote to admin');
    } finally {
      setShowPromoteDialog(false);
      setInvestorToPromote(null);
    }
  }

  async function handleDemoteToInvestor(adminUserId: string, adminName: string) {
    try {
      await demoteAdminToInvestor(adminUserId, currentUserId);
      toast.success(`${adminName} has been demoted to investor`);
      loadDashboardData(); // Refresh the investor list
      loadAdminUsers(); // Refresh admin list
    } catch (error) {
      console.error('Error demoting to investor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to demote to investor');
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        toast.success('Logged out successfully');
        window.location.href = '/login';
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error during logout');
    }
  };

  // Loading states
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50/90 p-8">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCcw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Checking admin privileges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50/90 p-8">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>This area is restricted to administrators only.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/90 p-8">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCcw className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Loading dashboard data...</p>
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2 self-start sm:self-auto"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Total Investors</p>
              <h3 className="text-lg md:text-2xl font-bold">{stats.totalInvestors}</h3>
            </div>
            <Users className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Active Investors</p>
              <h3 className="text-lg md:text-2xl font-bold">{stats.activeInvestors}</h3>
            </div>
            <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Total Bikes</p>
              <h3 className="text-lg md:text-2xl font-bold">{stats.totalBikes}</h3>
            </div>
            <Bike className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Total Investment</p>
              <h3 className="text-lg md:text-2xl font-bold">₦{isNaN(stats.totalInvestment) ? '0' : (stats.totalInvestment / 1000000).toFixed(1)}M</h3>
            </div>
            <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-500">Monthly Returns</p>
              <h3 className="text-lg md:text-2xl font-bold">₦{isNaN(stats.monthlyReturns) ? '0' : (stats.monthlyReturns / 1000000).toFixed(1)}M</h3>
            </div>
            <RefreshCcw className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search investors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Admin Management Button */}
          <Button 
            variant="outline"
            onClick={() => {
              loadAdminUsers();
              setShowAdminListDialog(true);
            }}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 w-full sm:w-auto"
          >
            <Users className="mr-2 h-4 w-4" />
            <span className="sm:inline">Manage Admins</span>
          </Button>
          
          {/* Add Investor Button */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" /> 
                <span className="sm:inline">Add Investor</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-2xl backdrop-blur-sm mx-2">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-navy-600/5 pointer-events-none" />
            <DialogHeader className="relative z-10 pb-4 md:pb-6 border-b border-gray-200/60">
              <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-navy-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                  <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                Add New Investor
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2 text-sm md:text-base leading-relaxed">
                Create a new investor profile with their investment details and account information.
              </DialogDescription>
            </DialogHeader>
            <div className="relative z-10 overflow-y-auto max-h-[calc(90vh-120px)] px-1">
              <CreateInvestorForm 
                onSubmit={handleCreateInvestor}
                onSuccess={() => setShowCreateDialog(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Admin Management Dialog */}
      <Dialog open={showAdminListDialog} onOpenChange={setShowAdminListDialog}>
        <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Admin Management
            </DialogTitle>
            <DialogDescription>
              Manage admin users and create new admin accounts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Admin Users</h3>
              <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Admin Account</DialogTitle>
                    <DialogDescription>
                      Create a new administrator account with full access
                    </DialogDescription>
                  </DialogHeader>
                  <CreateAdminForm onSubmit={handleCreateAdmin} />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {adminUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Loading admin users...</p>
              ) : (
                <div className="space-y-2">
                  {adminUsers.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{admin.full_name}</p>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                        {admin.phone_number && (
                          <p className="text-sm text-gray-500">{admin.phone_number}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Admin</Badge>
                        {admin.id !== currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoteToInvestor(admin.id, admin.full_name)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Demote
                          </Button>
                        )}
                        {admin.id === currentUserId && (
                          <Badge variant="outline" className="text-blue-600">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investors Table/Cards */}
      <div className="block">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Bikes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell>{investor.full_name}</TableCell>
                    <TableCell>{investor.email}</TableCell>
                    <TableCell>₦{(investor.total_investment / 1000000).toFixed(1)}M</TableCell>
                    <TableCell>{investor.number_of_bikes}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          investor.status === 'active' ? 'default' :
                          investor.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {investor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {investor.last_payment ? format(new Date(investor.last_payment), 'MMM d, yyyy') : 'No payments'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDetails(investor)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedInvestor(investor);
                            setShowEditDialog(true);
                          }}
                          title="Edit Investor"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePromoteToAdmin(investor.id, investor.full_name || 'Unknown')}
                          title="Promote to Admin"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          <span className="text-xs">Admin</span>
                        </Button>
                        <Select
                          value={investor.status}
                          onValueChange={(newStatus) => handleStatusUpdate(investor.id, newStatus)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => confirmDeleteInvestor(investor)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Investor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvestors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {searchQuery ? 'No investors found matching your search.' : 'No investors found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {filteredInvestors.map((investor) => (
            <Card key={investor.id} className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{investor.full_name}</h3>
                    <p className="text-sm text-gray-600">{investor.email}</p>
                  </div>
                  <Badge 
                    variant={
                      investor.status === 'active' ? 'default' :
                      investor.status === 'pending' ? 'secondary' : 'destructive'
                    }
                    className="ml-2"
                  >
                    {investor.status}
                  </Badge>
                </div>

                {/* Investment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Investment</p>
                    <p className="font-semibold">₦{(investor.total_investment / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bikes</p>
                    <p className="font-semibold">{investor.number_of_bikes}</p>
                  </div>
                </div>

                {/* Last Payment */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Last Payment</p>
                  <p className="text-sm">
                    {investor.last_payment ? format(new Date(investor.last_payment), 'MMM d, yyyy') : 'No payments'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <div className="flex gap-2 flex-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(investor)}
                      className="flex items-center gap-1 flex-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden xs:inline">View</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedInvestor(investor);
                        setShowEditDialog(true);
                      }}
                      className="flex items-center gap-1 flex-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden xs:inline">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePromoteToAdmin(investor.id, investor.full_name || 'Unknown')}
                      className="flex items-center gap-1 flex-1 text-blue-600 hover:text-blue-700"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden xs:inline">Admin</span>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={investor.status}
                      onValueChange={(newStatus) => handleStatusUpdate(investor.id, newStatus)}
                    >
                      <SelectTrigger className="w-full sm:w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => confirmDeleteInvestor(investor)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredInvestors.length === 0 && (
            <Card className="p-8">
              <div className="text-center text-gray-500">
                {searchQuery ? 'No investors found matching your search.' : 'No investors found.'}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-2xl backdrop-blur-sm mx-2">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-navy-600/5 pointer-events-none" />
          <DialogHeader className="relative z-10 pb-4 md:pb-6 border-b border-gray-200/60">
            <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-navy-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                <Eye className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              Investor Details
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-sm md:text-base leading-relaxed">
              Complete information about the investor&apos;s profile, investments, and payment history.
            </DialogDescription>
          </DialogHeader>
          <div className="relative z-10 overflow-y-auto max-h-[calc(95vh-120px)] px-1">
            {selectedInvestor && (
              <InvestorDetails 
                investor={selectedInvestor} 
                payments={selectedInvestorPayments} 
                onUpdate={() => {
                  loadDashboardData();
                  // Refresh the selected investor data
                  handleViewDetails(selectedInvestor);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-2xl backdrop-blur-sm mx-2">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-navy-600/5 pointer-events-none" />
          <DialogHeader className="relative z-10 pb-4 md:pb-6 border-b border-gray-200/60">
            <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-navy-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                <Edit className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              Edit Investor
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-base leading-relaxed">
              Update investor information, investment details, and account settings.
            </DialogDescription>
          </DialogHeader>
          <div className="relative z-10 overflow-y-auto max-h-[calc(90vh-120px)] px-1">
            {selectedInvestor && (
              <InvestorForm
                mode="edit"
                initialData={{
                  id: selectedInvestor.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  user_id: selectedInvestor.id,
                  full_name: selectedInvestor.full_name || '',
                  email: selectedInvestor.email || '',
                  phone_number: selectedInvestor.phone_number || '',
                  total_investment: selectedInvestor.total_investment || 0,
                  number_of_bikes: selectedInvestor.number_of_bikes || 0,
                  monthly_return: selectedInvestor.monthly_return || selectedInvestor.return_rate || 0,
                  total_return: selectedInvestor.total_returns || 0,
                  interest_earned: selectedInvestor.total_returns || 0,
                  investment_date: selectedInvestor.investment_date || new Date().toISOString().split('T')[0],
                  maturity_date: selectedInvestor.maturity_date || '',
                  next_payout_date: selectedInvestor.next_payout_date || '',
                  last_payout_date: selectedInvestor.last_payment || undefined,
                  status: selectedInvestor.status as 'pending' | 'active' | 'inactive',
                  notes: '',
                  payments: []
                }}
                onSubmit={handleEditInvestor}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50/30 border-0 shadow-2xl backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 pointer-events-none" />
          <AlertDialogHeader className="relative z-10">
            <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              Delete Investor Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 leading-relaxed mt-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-red-800 mb-2">
                  Are you sure you want to delete investor &quot;{investorToDelete?.full_name}&quot;?
                </p>
                <p className="text-red-700 text-sm">
                  This action cannot be undone and will permanently delete:
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  Investor profile and account information
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  Investment details and transaction history
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  All payment records and financial data
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  All related system data and logs
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="relative z-10 pt-6 border-t border-red-200/60">
            <AlertDialogCancel className="hover:bg-gray-100 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => investorToDelete && handleDeleteInvestor(
                investorToDelete.id, 
                investorToDelete.full_name || investorToDelete.email || 'Unknown Investor'
              )}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote to Admin Confirmation Dialog */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-2xl backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-orange-500/5 pointer-events-none" />
          <AlertDialogHeader className="relative z-10">
            <AlertDialogTitle className="text-xl font-bold text-blue-600 flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              Promote to Admin
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 leading-relaxed mt-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-blue-800 mb-2">
                  Are you sure you want to promote &quot;{investorToPromote?.name}&quot; to admin?
                </p>
                <p className="text-blue-700 text-sm">
                  This will grant them full administrative access to the system.
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-800 mb-2">Admin privileges include:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    View and manage all investor accounts
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    Process payments and financial transactions
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    Access sensitive system data and reports
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    Create and manage other admin accounts
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="relative z-10 pt-6 border-t border-blue-200/60">
            <AlertDialogCancel className="hover:bg-gray-100 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPromoteToAdmin}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
            >
              <Users className="mr-2 h-4 w-4" />
              Promote to Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
