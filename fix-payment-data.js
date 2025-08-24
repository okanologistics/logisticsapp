const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixPaymentData() {
  try {
    const dbConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root", 
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "okanodb"
    };

    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    // First, let's see what payment data we currently have
    const [payments] = await connection.query(`
      SELECT id, investor_id, amount, total_amount, interest_amount, principal_amount, 
             payment_date, payment_type, status, notes 
      FROM payments
    `);
    
    console.log('💰 Current payment data:');
    payments.forEach(payment => {
      console.log(`  - ID: ${payment.id}`);
      console.log(`    Amount: ₦${payment.amount || 0}`);
      console.log(`    Total: ₦${payment.total_amount || 0}`);
      console.log(`    Interest: ₦${payment.interest_amount || 0}`);
      console.log(`    Principal: ₦${payment.principal_amount || 0}`);
      console.log(`    Date: ${payment.payment_date}`);
      console.log(`    Status: ${payment.status}`);
      console.log('');
    });

    // Update existing payments with proper breakdown
    console.log('🔄 Updating payment breakdown data...');
    
    for (const payment of payments) {
      if (!payment.interest_amount || !payment.principal_amount) {
        // For monthly returns, typically it's all interest
        // For principal payments, it would be different
        let interestAmount = payment.amount;
        let principalAmount = 0;
        let totalAmount = payment.amount;
        
        if (payment.payment_type === 'principal_payment') {
          interestAmount = 0;
          principalAmount = payment.amount;
        }
        
        await connection.execute(`
          UPDATE payments 
          SET total_amount = ?, 
              interest_amount = ?, 
              principal_amount = ?,
              payment_type = COALESCE(payment_type, 'monthly_return'),
              payout_frequency = COALESCE(payout_frequency, 'monthly')
          WHERE id = ?
        `, [totalAmount, interestAmount, principalAmount, payment.id]);
        
        console.log(`✅ Updated payment ${payment.id}: Interest=₦${interestAmount}, Principal=₦${principalAmount}`);
      }
    }

    // Add more sample payments with proper dates and breakdown
    console.log('🔄 Adding additional sample payments...');
    
    const [investors] = await connection.query('SELECT id, monthly_return FROM investors');
    
    for (const investor of investors) {
      const monthlyReturn = investor.monthly_return || 280000;
      
      // Add payments for the last few months
      const paymentDates = [
        '2024-08-15',
        '2024-07-15', 
        '2024-06-15',
        '2024-05-15'
      ];
      
      for (let i = 0; i < paymentDates.length; i++) {
        const paymentId = `payment-${investor.id}-${i + 10}`;
        const paymentDate = paymentDates[i];
        
        try {
          await connection.execute(`
            INSERT IGNORE INTO payments (
              id, investor_id, amount, total_amount, interest_amount, principal_amount,
              payment_date, payment_type, payout_frequency, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            paymentId,
            investor.id,
            monthlyReturn,
            monthlyReturn,
            monthlyReturn, // All interest for monthly returns
            0, // No principal
            paymentDate,
            'monthly_return',
            'monthly',
            'completed',
            `Monthly return payment for ${paymentDate}`
          ]);
          
          console.log(`✅ Added payment for ${investor.id} on ${paymentDate}: ₦${monthlyReturn}`);
        } catch (error) {
          // Payment might already exist, skip
          console.log(`ℹ️  Payment ${paymentId} already exists or error:`, error.message);
        }
      }
    }

    // Check final results
    const [finalPayments] = await connection.query(`
      SELECT COUNT(*) as count FROM payments 
      WHERE interest_amount > 0 OR principal_amount > 0
    `);
    
    console.log(`\n📊 Payments with proper breakdown: ${finalPayments[0].count}`);
    
    // Show sample of updated data
    const [samplePayments] = await connection.query(`
      SELECT p.payment_date, p.amount, p.interest_amount, p.principal_amount, 
             p.payment_type, p.payout_frequency, p.status, p.notes,
             i.full_name
      FROM payments p
      JOIN investors i ON p.investor_id = i.id
      ORDER BY p.payment_date DESC
      LIMIT 5
    `);
    
    console.log('\n💰 Sample updated payments:');
    samplePayments.forEach(payment => {
      console.log(`  📅 ${payment.payment_date} - ${payment.full_name}`);
      console.log(`     💰 Total: ₦${payment.amount}`);
      console.log(`     📈 Interest: ₦${payment.interest_amount}`);
      console.log(`     💼 Principal: ₦${payment.principal_amount}`);
      console.log(`     🔄 ${payment.payout_frequency} ${payment.payment_type}`);
      console.log(`     ✅ Status: ${payment.status}`);
      console.log('');
    });

    await connection.end();
    console.log('🎉 Payment data fix completed!');
    
  } catch (error) {
    console.error('❌ Payment data fix failed:', error);
  }
}

fixPaymentData();
