const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateCurrentInvestorPayments() {
  try {
    const dbConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root", 
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "okanodb"
    };

    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Find the current investor payments that need fixing
    const [payments] = await connection.query(`
      SELECT p.*, i.full_name, i.monthly_return 
      FROM payments p
      JOIN investors i ON p.investor_id = i.id
      WHERE i.id = '3e8ed762-33c4-4500-9257-d45263a437d2'
      AND (p.total_amount IS NULL OR p.interest_amount IS NULL OR p.principal_amount IS NULL)
    `);
    
    console.log(`💰 Found ${payments.length} payments to update for current investor`);
    
    for (const payment of payments) {
      console.log(`\n🔄 Updating payment ${payment.id}:`);
      console.log(`  Amount: ₦${payment.amount}`);
      console.log(`  Date: ${payment.payment_date}`);
      
      const totalAmount = payment.amount;
      const interestAmount = payment.amount; // All interest for monthly returns
      const principalAmount = 0;
      
      await connection.execute(`
        UPDATE payments 
        SET total_amount = ?, 
            interest_amount = ?, 
            principal_amount = ?,
            payment_type = COALESCE(payment_type, 'monthly_return'),
            payout_frequency = COALESCE(payout_frequency, 'monthly'),
            notes = COALESCE(notes, CONCAT('Monthly return payment - Updated on ', NOW()))
        WHERE id = ?
      `, [totalAmount, interestAmount, principalAmount, payment.id]);
      
      console.log(`✅ Updated: Total=₦${totalAmount}, Interest=₦${interestAmount}, Principal=₦${principalAmount}`);
    }
    
    // Now check all payments for this investor
    const [allPayments] = await connection.query(`
      SELECT p.payment_date, p.amount, p.total_amount, p.interest_amount, p.principal_amount,
             p.payment_type, p.payout_frequency, p.status, p.notes
      FROM payments p
      WHERE p.investor_id = '3e8ed762-33c4-4500-9257-d45263a437d2'
      ORDER BY p.payment_date DESC
    `);
    
    console.log(`\n📊 All payments for current investor (${allPayments.length} total):`);
    allPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. 📅 ${payment.payment_date}`);
      console.log(`   💰 Amount: ₦${payment.amount}`);
      console.log(`   📈 Interest: ₦${payment.interest_amount || 0}`);
      console.log(`   💼 Principal: ₦${payment.principal_amount || 0}`);
      console.log(`   🔄 ${payment.payout_frequency || 'monthly'} ${payment.payment_type || 'monthly_return'}`);
      console.log(`   ✅ Status: ${payment.status}`);
      if (payment.notes) {
        console.log(`   📝 Notes: ${payment.notes}`);
      }
    });

    await connection.end();
    console.log('\n🎉 Current investor payment update completed!');
    
  } catch (error) {
    console.error('❌ Current investor payment update failed:', error);
  }
}

updateCurrentInvestorPayments();
