# Okano Logistics App

A Next.js application for logistics services and bike investment platform.

## Features

- User authentication and registration
- Investment dashboard
- Admin panel
- Profile management
- Email notifications
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: MySQL
- **Authentication**: JWT
- **Email**: Nodemailer
- **Deployment**: Vercel

## Getting Started

### Requirements

- Node.js 18+
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd logisticsapp
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Fill in your environment variables in the `.env` file.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment to Vercel

### Database Setup

1. A Vercel account
2. A remote MySQL database (Vercel doesn't support local databases)

### Deployment Steps

1. **Prepare your database**: Ensure your MySQL database is accessible from external connections.

2. **Push to GitHub**:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Import the project
   - Add environment variables in Vercel dashboard

4. **Environment Variables in Vercel**:

   Add these variables in your Vercel project settings:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_BASE_URL`
   - `EMAIL_HOST` (optional)
   - `EMAIL_USER` (optional)
   - `EMAIL_PASSWORD` (optional)

5. **Deploy**: Vercel will automatically deploy your app.

## Project Structure

```text
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
├── lib/                # Utility functions and configurations
├── public/             # Static assets
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── ...config files
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## License

Private - All rights reserved.
