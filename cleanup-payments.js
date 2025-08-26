require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function cleanupDuplicatePayments() {
  console.log('Database config:', {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
  });

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "20.224.239.134",
    user: process.env.MYSQL_USER || "root", 
    password: process.env.MYSQL_PASSWORD || "okanologistics@123!",
    database: process.env.MYSQL_DATABASE || "okanodb",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    ssl: process.env.NODE_ENV === 'production' && process.env.MYSQL_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 60000,
    multipleStatements: true
  });

  try {
    console.log('🧹 Cleaning up duplicate payments...');
    
    // Find duplicate payments (same investor_id, same date, same amount)
    const [duplicates] = await pool.query(`
      SELECT 
        investor_id, 
        DATE(payment_date) as payment_date, 
        total_amount,
        COUNT(*) as count,
        GROUP_CONCAT(id) as payment_ids
      FROM payments 
      WHERE status = 'completed'
      GROUP BY investor_id, DATE(payment_date), total_amount
      HAVING count > 1
    `);

    console.log(`Found ${duplicates.length} groups of duplicate payments`);

    for (const dup of duplicates) {
      console.log(`\nDuplicate group: Investor ${dup.investor_id}, Date: ${dup.payment_date}, Amount: ${dup.total_amount}`);
      console.log(`Payment IDs: ${dup.payment_ids}`);
      console.log(`Count: ${dup.count}`);
      
      // Keep the first payment and delete the rest
      const paymentIds = dup.payment_ids.split(',');
      const idsToDelete = paymentIds.slice(1); // Keep first, delete rest
      
      if (idsToDelete.length > 0) {
        console.log(`Deleting ${idsToDelete.length} duplicate payments...`);
        await pool.query(
          `DELETE FROM payments WHERE id IN (${idsToDelete.map(() => '?').join(',')})`,
          idsToDelete
        );
        console.log('✅ Duplicates deleted');
      }
    }

    // Fix payments with zero breakdown amounts
    console.log('\n🔧 Fixing payments with zero breakdown amounts...');
    const [zeroBreakdowns] = await pool.query(`
      SELECT id, total_amount, interest_amount, principal_amount
      FROM payments 
      WHERE (interest_amount = 0 OR principal_amount = 0) 
        AND total_amount > 0
        AND status = 'completed'
    `);

    console.log(`Found ${zeroBreakdowns.length} payments with zero breakdown amounts`);

    for (const payment of zeroBreakdowns) {
      console.log(`\nFixing payment ID: ${payment.id}, Total: ${payment.total_amount}`);
      
      // For monthly returns, typically 20% is interest and 80% is principal
      // But let's use a more realistic breakdown: 20% interest, 80% principal
      const totalAmount = parseFloat(payment.total_amount);
      const interestAmount = Math.round((totalAmount * 0.20) * 100) / 100;
      const principalAmount = Math.round((totalAmount * 0.80) * 100) / 100;
      
      await pool.query(`
        UPDATE payments 
        SET interest_amount = ?, principal_amount = ?
        WHERE id = ?
      `, [interestAmount, principalAmount, payment.id]);
      
      console.log(`Updated: Interest: ${interestAmount}, Principal: ${principalAmount}`);
    }

    console.log('\n📊 Final payment summary...');
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(total_amount) as total_amount,
        SUM(interest_amount) as total_interest,
        SUM(principal_amount) as total_principal
      FROM payments 
      WHERE status = 'completed'
    `);

    console.log('Payment Summary:', {
      totalPayments: summary[0].total_payments,
      totalAmount: parseFloat(summary[0].total_amount || 0),
      totalInterest: parseFloat(summary[0].total_interest || 0),
      totalPrincipal: parseFloat(summary[0].total_principal || 0)
    });

    await pool.end();
    console.log('✅ Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    await pool.end();
  }
}

cleanupDuplicatePayments();
