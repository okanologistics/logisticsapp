# 🚀 Vercel Deployment Checklist

## Pre-Deployment Setup

### ✅ Current Status
- [x] Code optimized for Vercel
- [x] Next.js 15 compatibility fixed
- [x] TypeScript errors resolved
- [x] Build passes locally
- [x] Database migration scripts ready

### ⚠️ Pending Setup
- [ ] Cloud database configured
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Deployed to Vercel

## Step 1: Set Up Cloud Database

### Option A: PlanetScale (Recommended)
1. **Sign up**: Go to [planetscale.com](https://planetscale.com)
2. **Create database**: Name it `okanodb`
3. **Get credentials**: Copy connection string
4. **Format**: `mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}`

### Option B: Railway
1. **Sign up**: Go to [railway.app](https://railway.app)
2. **New Project** → **Add MySQL**
3. **Get credentials** from Variables tab
4. **Connect**: Use provided connection details

### Option C: Aiven
1. **Sign up**: Go to [aiven.io](https://aiven.io)
2. **Create MySQL service**
3. **Get connection string**
4. **Download SSL certificate** if required

## Step 2: Test Database Connection

After getting your database credentials:

1. **Update environment variables**:
   ```bash
   MYSQL_HOST=your-database-host
   MYSQL_USER=your-username
   MYSQL_PASSWORD=your-password
   MYSQL_DATABASE=okanodb
   ```

2. **Test connection locally**:
   ```bash
   node test-db-connection.js
   ```

3. **If successful, run migration**:
   ```bash
   npm run migrate
   ```

## Step 3: Configure Vercel Environment Variables

In your Vercel dashboard, add these variables:

```bash
# Database
MYSQL_HOST=your-database-host
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=okanodb

# Security
JWT_SECRET=your-super-secure-32-character-jwt-secret-key

# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NODE_ENV=production

# Email (Optional)
SMTP_HOST=mail.okanologistics.com
SMTP_PORT=587
SMTP_USER=contact@okanologistics.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=admin@okanologistics.com
```

## Step 4: Deploy to Vercel

### Method A: Vercel CLI
```bash
# Install CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts to configure
```

### Method B: GitHub Integration
1. **Push code** to GitHub repository
2. **Connect** repository to Vercel
3. **Configure** environment variables in dashboard
4. **Deploy** automatically on push

## Step 5: Post-Deployment Setup

1. **Run database migration** (if not done locally):
   - Access Vercel Functions tab
   - Create a one-time function to run migration
   - Or run migration locally pointing to production DB

2. **Test the application**:
   - Visit your Vercel URL
   - Try logging in with admin credentials
   - Test investor dashboard
   - Verify payment data display

3. **Change admin password**:
   - Login: admin@okanologistics.com / admin123
   - Change password immediately

## Database Migration Commands

```bash
# Test connection first
node test-db-connection.js

# Run full migration
npm run migrate

# Or run manually
node migrate-database.js
```

## Troubleshooting

### Common Issues:
1. **SSL Connection Error**:
   - Add `?ssl=true` to connection string
   - Or set `ssl: { rejectUnauthorized: false }`

2. **Connection Timeout**:
   - Check host address format
   - Verify network access
   - Check firewall rules

3. **Authentication Failed**:
   - Verify username/password
   - Check database name
   - Ensure user has proper permissions

4. **Build Errors on Vercel**:
   - Check environment variables are set
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

### Support Commands:
```bash
# Check build locally
npm run build

# Test database connection
node test-db-connection.js

# Run type checking
npm run type-check

# Check for lint errors
npm run lint
```

## Default Admin Credentials
After migration:
- **Email**: admin@okanologistics.com
- **Password**: admin123
- **⚠️ Change immediately after first login!**

## Files Ready for Deployment
- ✅ `migrate-database.js` - Database setup
- ✅ `test-db-connection.js` - Connection testing
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - Detailed guide
- ✅ `package.json` - Updated with migration scripts
- ✅ All Next.js files optimized for Vercel

## Next Steps
1. Choose and set up your database provider
2. Test the connection
3. Run database migration
4. Deploy to Vercel
5. Configure environment variables
6. Test production deployment
