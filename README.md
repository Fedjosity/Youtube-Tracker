# YouTube Collaboration Tracker

A production-ready Next.js 14 application for managing YouTube video collaborations, tracking submissions, and analyzing team performance.

## Features

- **Authentication**: Google OAuth via Supabase Auth
- **Role-based Access**: Admin and Editor roles with proper permissions
- **YouTube Integration**: Automatic metadata fetching via YouTube Data API v3
- **Status Tracking**: Complete workflow from Draft → Published
- **Analytics**: Comprehensive dashboard with charts and KPIs
- **Gamification**: Achievement badges and leaderboards
- **Admin Tools**: User management and review queue
- **Data Export**: CSV export functionality

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth interactions
- **YouTube**: YouTube Data API v3 for video metadata

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for YouTube API and OAuth)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd youtube-collaboration-tracker
npm install
```

### 2. Supabase Setup

1. Create a new project at [Supabase](https://app.supabase.com)
2. In your Supabase dashboard:
   - Go to Settings → API
   - Copy your Project URL and anon public key
   - Copy your service role secret key

### 3. Google Cloud Setup

#### YouTube Data API v3:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the API key to YouTube Data API v3

#### Google OAuth (for Supabase):
1. In Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

### 4. Configure Supabase Authentication

1. In Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth Client ID and Client Secret
4. Set redirect URL: `http://localhost:3000/auth/callback`

### 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

### 6. Database Setup

The database migrations will be applied automatically. They include:
- User profiles with role management
- Submissions with YouTube metadata
- Comments system with threading
- Achievement badges and gamification
- Audit logs for admin actions
- Row Level Security (RLS) policies

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

### For Editors:
1. Sign in with Google
2. Submit YouTube videos or Drive links
3. Track submission status through the workflow
4. View personal analytics and badges
5. Comment on submissions

### For Admins:
1. All editor features plus:
2. Review and approve submissions
3. Manage user roles
4. Access comprehensive analytics
5. Export data to CSV
6. View audit logs

## API Endpoints

- `POST /api/submissions` - Create new submission
- `GET /api/youtube/metadata` - Fetch YouTube video metadata
- `PATCH /api/admin/submissions` - Update submission status (admin only)
- `PATCH /api/admin/users` - Update user roles (admin only)
- `GET /api/export/csv` - Export data to CSV
- `POST /api/test-data` - Create test data (development only)

## Deployment

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Update Supabase redirect URLs for production
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables from `.env.local.example` in your production environment.

## Database Schema

The application uses the following main tables:
- `profiles` - User data and role management
- `submissions` - Video submissions with metadata
- `comments` - Comment system for submissions
- `badges` - Achievement badge definitions
- `user_badges` - User badge awards
- `audit_logs` - Admin action tracking

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (RBAC)
- Admin-only routes protected by middleware
- User data isolation through RLS policies
- Audit logging for all admin actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.