import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// Types
interface User {
  id: string;
  email: string;
  role?: string;
  password: string;
}

interface Profile {
  id: string;
  user_id: string;
  role: string;
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
}

interface Investor {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  total_investment: number;
  number_of_bikes: number;
  monthly_return: number;
  total_return: number;
  interest_earned: number;
  investment_date: string;
  maturity_date: string;
  next_payout_date: string;
  last_payout_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Database configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "okanodb"
};

// Create connection pool
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

export const db = {
  // User management
  async findUserByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(
      `SELECT u.*, p.role 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.email = ?`,
      [email]
    );
    return (rows as User[])[0] || null;
  },

  async getUserWithProfile(userId: string): Promise<(User & { role: string }) | null> {
    const [rows] = await pool.execute(
      `SELECT u.*, p.role 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [userId]
    );
    return (rows as (User & { role: string })[])[0] || null;
  },

  async createUser(data: { email: string; password: string; role: string; name?: string }): Promise<mysql.ResultSetHeader> {
    const id = uuidv4();
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
      [id, data.email, data.password]
    );
    
    await this.createProfile(id, data.role);
    return result;
  },

  // Profile management
  async createProfile(userId: string, role: string): Promise<void> {
    await pool.execute(
      'INSERT INTO profiles (id, user_id, role) VALUES (?, ?, ?)',
      [uuidv4(), userId, role]
    );
  },

  async updateProfile(userId: string, data: Partial<Profile>): Promise<void> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    await pool.execute(
      `UPDATE profiles SET ${fields} WHERE user_id = ?`,
      [...values, userId]
    );
  },

  // Investor management
  async getInvestorData(userId: string) {
    const [rows] = await pool.execute(
      `SELECT 
        i.*,
        u.email,
        p.full_name,
        p.phone_number,
        p.avatar_url
       FROM investors i
       JOIN users u ON i.user_id = u.id
       JOIN profiles p ON u.id = p.user_id
       WHERE i.user_id = ?`,
      [userId]
    );

    const investor = (rows as any[])[0];
    if (!investor) return null;

    const [notificationsRows] = await pool.execute(
      `SELECT * FROM notifications 
       WHERE investor_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [investor.id]
    );

    const [paymentsRows] = await pool.execute(
      `SELECT * FROM payments 
       WHERE investor_id = ?
       ORDER BY payment_date DESC`,
      [investor.id]
    );

    return {
      investor,
      notifications: notificationsRows,
      payments: paymentsRows
    };
  },

  async getInvestors(): Promise<Investor[]> {
    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT i.*, u.email, p.full_name, p.phone_number
       FROM investors i
       JOIN users u ON i.user_id = u.id
       JOIN profiles p ON u.id = p.user_id
       ORDER BY i.created_at DESC`,
      []
    );
    return rows as Investor[];
  },

  // Database utilities
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute("SELECT 1");
      connection.release();
      return true;
    } catch (error) {
      console.error("Database connection check failed:", error);
      return false;
    }
  }
};

// Test the connection initially
pool.getConnection()
  .then(connection => {
    console.log("Database connection successful");
    connection.release();
  })
  .catch(error => {
    console.error("Database connection failed:", error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Export types for use in other files
export type { User, Investor };
