export type UserRole = 'admin' | 'investor';

export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image?: string;
  last_login?: string;
}

export type InvestorFormMode = 'create' | 'edit';

export type InvestorFormProps = {
  initialData?: Investor;
  mode: InvestorFormMode;
  onSubmit: (data: InvestorInput) => Promise<void>;
}

export type Investor = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image?: string;
  total_investment: number;
  number_of_bikes: number;
  monthly_return: number;
  total_return: number;
  interest_earned: number;
  investment_date: string;
  maturity_date: string;
  next_payout_date: string;
  last_payout_date?: string;
  status: 'pending' | 'active' | 'inactive';
  notes?: string;
  payments?: Payment[];
}

export type Payment = {
  id: string;
  created_at: string;
  investor_id: string;
  amount: number;
  total_amount: number;
  interest_amount: number;
  principal_amount: number;
  payment_date: string;
  payment_type: string;
  payout_frequency: 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
}

export type InvestorInput = {
  full_name: string;
  email: string;
  phone_number?: string;
  password?: string;
  total_investment: number;
  number_of_bikes: number;
  monthly_return?: number;
  investment_date?: string;
  maturity_date?: string;
  maturity_period?: number;
  next_payout_date?: string;
  payout_frequency?: 'weekly' | 'monthly';
  status?: 'active' | 'inactive' | 'pending';
  notes?: string;
};

export type InvestorUpdateInput = Omit<Partial<Investor>, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
