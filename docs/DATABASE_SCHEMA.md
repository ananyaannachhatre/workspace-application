# Database Schema and Foreign Key Relationships

## Overview

The database uses PostgreSQL with Prisma ORM. All foreign key relationships are properly configured with cascade delete to maintain referential integrity.

## Foreign Key Relationships

### 1. Account → User
- **Field**: `Account.userId` → `User.id`
- **Relationship**: One-to-Many (One User can have many Accounts)
- **Cascade**: `onDelete: Cascade` - When a User is deleted, all their Accounts are deleted
- **Purpose**: Links authentication accounts (credentials, OAuth) to users

### 2. Workspace → User
- **Field**: `Workspace.ownerId` → `User.id`
- **Relationship**: One-to-Many (One User can own many Workspaces)
- **Cascade**: `onDelete: Cascade` - When a User is deleted, all their Workspaces are deleted
- **Purpose**: Links workspaces to their owners

### 3. Task → Workspace
- **Field**: `Task.workspaceId` → `Workspace.id`
- **Relationship**: One-to-Many (One Workspace can have many Tasks)
- **Cascade**: `onDelete: Cascade` - When a Workspace is deleted, all its Tasks are deleted
- **Purpose**: Links tasks to their parent workspace

## Automatic Account Creation

When a new user registers with credentials:
1. A `User` record is created
2. An `Account` record is automatically created with:
   - `type`: "credentials"
   - `provider`: "credentials"
   - `providerAccountId`: user's email
   - `userId`: reference to the User

OAuth providers (Google, GitHub) automatically create Account records through Next-auth's PrismaAdapter.

## Verification

Run the following commands to verify database setup:

```bash
# Test database connection
npm run db:test

# Verify foreign key relationships
npm run db:verify

# Migrate existing users to have Account records (if needed)
npm run db:migrate-users
```

## Database Schema Diagram

```
User
├── id (PK)
├── email (unique)
├── password
└── ...

Account
├── id (PK)
├── userId (FK → User.id) [CASCADE DELETE]
├── provider
├── providerAccountId
└── ...

Workspace
├── id (PK)
├── ownerId (FK → User.id) [CASCADE DELETE]
├── name
└── ...

Task
├── id (PK)
├── workspaceId (FK → Workspace.id) [CASCADE DELETE]
├── title
├── status
└── ...
```

## Data Integrity

All foreign key constraints ensure:
- **Referential Integrity**: Cannot create records with invalid foreign keys
- **Cascade Deletes**: Deleting a parent automatically deletes all children
- **Data Consistency**: All relationships are maintained at the database level

