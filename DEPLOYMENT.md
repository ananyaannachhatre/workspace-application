# Deployment Guide

## Database Options

### Option 1: Vercel Postgres (Recommended)
- **Free tier**: 1GB storage, 60 connections
- **Easy setup**: One-click deployment
- **Auto-scaling**: Built-in performance optimization

### Option 2: Railway
- **Free tier**: 1GB storage, $5/month after
- **Simple**: Direct PostgreSQL deployment

### Option 3: Supabase
- **Free tier**: 500MB storage, 2 concurrent connections
- **Real-time**: Built-in real-time features

### Option 4: Neon
- **Free tier**: 3GB storage, 100 connections
- **Serverless**: Auto-scaling PostgreSQL

## Environment Variables for Production

```bash
# Authentication
NEXTAUTH_SECRET=your-super-secure-random-string-here
NEXTAUTH_URL=https://your-domain.vercel.app

# OAuth Providers
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
GITLAB_CLIENT_ID=your-production-gitlab-client-id
GITLAB_CLIENT_SECRET=your-production-gitlab-client-secret

# Database (choose one)
# Vercel Postgres
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Railway
DATABASE_URL=postgresql://user:password@host:6543/dbname

# Supabase
DATABASE_URL=postgresql://postgres.:[password]@db.[project-ref].supabase.co:5432/postgres

# Neon
DATABASE_URL=postgresql://[user]:[password]@[neon-hostname]/dbname
```

## Pre-Deployment Checklist

- [ ] Update OAuth redirect URIs in GitHub/GitLab
- [ ] Test database connection
- [ ] Set production NEXTAUTH_URL
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Update image domains in next.config.js if needed
