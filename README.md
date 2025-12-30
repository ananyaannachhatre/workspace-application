# Workspace Application

A full-stack Next.js application for managing workspaces and tasks with authentication and authorization.

## Features

- **Authentication**: Sign up/Sign in with credentials, GitLab OAuth, or GitHub OAuth
- **Workspaces**: Create and manage multiple workspaces
- **Tasks**: Create, update, and delete tasks within workspaces
- **Authorization**: Users can only access their own workspaces
- **Protected Routes**: All workspace and task routes are protected

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Next-auth
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Backend**: Server Actions

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Create a PostgreSQL database
2. Copy `.env.example` to `.env` (if it exists) or create a `.env` file with the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/workspace_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# OAuth Providers (Optional - only if you want to use OAuth)
GITLAB_CLIENT_ID="your-gitlab-client-id"
GITLAB_CLIENT_SECRET="your-gitlab-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

3. Generate Prisma Client:
```bash
npm run db:generate
```

4. Push the schema to your database:
```bash
npm run db:push
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for workspaces, tasks, statistics and auth
│   ├── api/              # API routes (Next-auth)
│   ├── auth/             # Authentication pages
│   ├── workspaces/       # Workspace pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
├── components/
│   ├── auth/             # Authentication components
│   ├── workspaces/       # Workspace components
│   └── tasks/            # Task components
│   └── statistics/       # Statistics components
├── lib/
│   ├── auth.ts           # Next-auth configuration
│   ├── auth-helpers.ts   # Authentication helper
│   └── prisma.ts         # Prisma client instance
├── prisma/
│   └── schema.prisma     # Database schema
└── middleware.ts         # Route protection middleware
```

## Database Schema

- **User**: User accounts with authentication
- **Workspace**: Workspaces owned by users
- **Task**: Tasks belonging to workspaces

## Authentication Providers

1. **Credentials**: Email and password
2. **GitLab OAuth**: Sign in with Gitlab
3. **GitHub OAuth**: Sign in with GitHub

## Authorization

- All workspace and task routes are protected by middleware
- Users can only access workspaces they own
- Server actions verify workspace ownership before any operation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

