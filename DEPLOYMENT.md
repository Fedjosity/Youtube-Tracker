# 🚀 Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project** - Your database should be set up and running

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with the following files:

- `vercel.json` (created)
- Updated `next.config.js`
- All your source code

## Step 2: Set Up Vercel

1. **Go to Vercel Dashboard**

   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's a Next.js project

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Optional Variables:

```
YOUTUBE_API_KEY=your_youtube_api_key
```

### How to Get These Values:

1. **Supabase Variables:**

   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and anon/public key
   - For service role key, go to Settings → API → Project API keys

2. **YouTube API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)

## Step 4: Deploy

1. **Deploy to Production**

   - Click "Deploy" in Vercel
   - Wait for the build to complete (usually 2-3 minutes)

2. **Check Deployment**
   - Vercel will provide a URL (e.g., `your-app.vercel.app`)
   - Test your application thoroughly

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## Step 6: Update Supabase Settings

1. **Update Auth Settings**

   - Go to your Supabase project
   - Navigate to Authentication → Settings → URL Configuration
   - Add your Vercel domain to:
     - Site URL: `https://your-app.vercel.app`
     - Redirect URLs: `https://your-app.vercel.app/auth/callback`

2. **Update RLS Policies**
   - Make sure all your RLS policies are applied
   - Test authentication flow

## Troubleshooting

### Common Issues:

1. **Build Failures**

   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Verify environment variables are set correctly

2. **Authentication Issues**

   - Verify Supabase URL configuration
   - Check redirect URLs in Supabase settings
   - Ensure environment variables are correct

3. **Database Connection Issues**
   - Verify Supabase project is active
   - Check RLS policies are applied
   - Ensure service role key has proper permissions

### Environment Variables Checklist:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `YOUTUBE_API_KEY` (optional)

### Post-Deployment Checklist:

- [ ] Authentication works (sign up/sign in)
- [ ] Database operations work (create/read/update/delete)
- [ ] File uploads work (if applicable)
- [ ] All pages load correctly
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## Support

If you encounter issues:

1. Check Vercel build logs
2. Verify environment variables
3. Test locally with production environment variables
4. Check Supabase logs for database issues
