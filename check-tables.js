const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT)
  });
  
  console.log('=== Users with investor role ===');
  const [users] = await conn.execute(`
    SELECT u.id, u.email, p.full_name, p.role 
    FROM users u 
    JOIN profiles p ON u.id = p.user_id 
    WHERE p.role = 'investor'
  `);
  console.table(users);
  
  console.log('=== Investor records ===');
  const [investors] = await conn.execute('SELECT id, user_id, full_name, email FROM investors');
  console.table(investors);
  
  console.log('=== Investment details ===');
  const [details] = await conn.execute('SELECT id, investor_id, total_investment FROM investment_details LIMIT 5');
  console.table(details);
  
  await conn.end();
})();
