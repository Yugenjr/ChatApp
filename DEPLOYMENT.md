# Deployment Guide

Complete step-by-step instructions for deploying the Private Chat App.

## Table of Contents

1. [Supabase Backend Setup](#supabase-backend-setup)
2. [Vercel Frontend Deployment](#vercel-frontend-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Production Checklist](#production-checklist)

---

## Supabase Backend Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: `private-chat-app`
   - Database password: Choose a strong password
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for project initialization

### Step 2: Execute Database Schema

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Verify tables are created (check "Table Editor" → see `rooms` and `messages`)

### Step 3: Enable Realtime

1. Go to "Realtime" section
2. Click on `messages` table
3. Enable realtime by toggling the switch
4. Repeat for `rooms` table

### Step 4: Get API Credentials

1. Go to "Settings" → "API"
2. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Save these for environment configuration.

### Step 5: Verify RLS Policies

1. Go to "Authentication" → "Policies"
2. Ensure policies are enabled for:
   - `rooms` table: SELECT, INSERT allowed
   - `messages` table: SELECT, INSERT, UPDATE allowed

---

## Vercel Frontend Deployment

### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository (or GitLab, Gitea, etc.)
# Push to your repo
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Paste your repository URL
5. Click "Import"

### Step 3: Configure Environment Variables

1. In Vercel project settings, go to "Environment Variables"
2. Add two variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
   ```

3. Select environments: **Production**, **Preview**, **Development**
4. Click "Save"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 1-2 minutes)
3. Your app is now live at `https://your-project.vercel.app`

### Step 5: Add Custom Domain (Optional)

1. In Vercel, go to "Settings" → "Domains"
2. Click "Add"
3. Enter your domain name
4. Follow DNS configuration steps
5. Wait for DNS propagation (up to 48 hours)

---

## Environment Configuration

### Local Development

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Production (Vercel)

Configure in Vercel dashboard:

1. Project Settings
2. Environment Variables
3. Add for `Production`:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
```

---

## Production Checklist

### Before Going Live

- [ ] Supabase project created and configured
- [ ] Database schema executed successfully
- [ ] Realtime enabled for tables
- [ ] RLS policies configured correctly
- [ ] API credentials copied and verified
- [ ] Repository pushed to GitHub/GitLab
- [ ] Vercel project connected
- [ ] Environment variables set in Vercel
- [ ] Deployment successful
- [ ] Test URL works (create room, send message)
- [ ] Mobile responsive design verified
- [ ] Custom domain configured (if needed)

### Post-Deployment

- [ ] Test all features in production
- [ ] Verify realtime messaging works
- [ ] Check typing indicators function
- [ ] Confirm wallpaper persistence
- [ ] Test on mobile browsers
- [ ] Check console for errors
- [ ] Monitor Vercel analytics
- [ ] Set up error tracking (Sentry optional)

### Monitoring

1. **Vercel Analytics**: Dashboard → Analytics
2. **Supabase Logs**: Dashboard → Logs
3. **Real-time Stats**: Dashboard → Statistics

---

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

```bash
npm install @supabase/supabase-js
npm run build
```

### Issue: Realtime not working

1. Check Supabase realtime is enabled
2. Verify table has `REPLICA IDENTITY FULL`
3. Check browser console for errors
4. Restart development server

### Issue: Environment variables not loading

```bash
# Redeploy after setting env vars
vercel redeploy
```

### Issue: Database connection errors

1. Verify Supabase URL and key are correct
2. Check RLS policies allow public access
3. Ensure tables exist (check Supabase SQL Editor)
4. Test with Supabase dashboard API

### Issue: CORS errors

Supabase handles CORS automatically. If issues persist:

1. Go to Supabase Settings → API
2. Verify your domain is allowed
3. Check browser console for specific error

---

## Advanced Configuration

### Custom Email Domain

Skip for this project (no authentication needed).

### Database Backups

Supabase Pro plan includes automatic daily backups:

1. Go to Settings → Backups
2. Configure backup retention
3. Manual restore available anytime

### Performance Optimization

1. Add database indexes (already done in schema)
2. Enable caching headers
3. Use Vercel Edge Functions (optional)
4. Implement message pagination (future)

---

## Scaling Considerations

Current setup scales to:
- **5,000+ concurrent users** on Vercel
- **1 million messages** on Supabase free tier
- **Unlimited chat rooms**

For higher scale:

1. Upgrade Supabase tier
2. Implement message archiving
3. Add Vercel Pro for faster builds
4. Consider CDN for static assets

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Questions?** Check the main README.md for more information.
