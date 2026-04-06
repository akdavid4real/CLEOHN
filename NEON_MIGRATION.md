# Neon Database Migration - Vercel Setup

## ✅ Local Setup Complete
Your local environment is now using Neon PostgreSQL.

## 🚀 Vercel Environment Variables Update

You need to update your Vercel environment variables to use the new Neon database:

### 1. Go to Vercel Dashboard
https://vercel.com/akdavid4real/cleohn/settings/environment-variables

### 2. Update/Add These Variables:

**DATABASE_URL**
```
postgresql://neondb_owner:npg_j47bPcXBGgfa@ep-noisy-fog-acy8f2fp-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**Remove These (no longer needed):**
- DATABASE_AUTH_TOKEN (Turso only)

### 3. Keep These Variables (unchanged):
- SESSION_SECRET
- PAYSTACK_SECRET_KEY
- NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- NEXT_PUBLIC_BASE_URL
- NEXT_PUBLIC_APP_NAME

### 4. Redeploy
After updating environment variables, trigger a new deployment:
- Go to Deployments tab
- Click "Redeploy" on the latest deployment
- OR push a new commit (already done with the migration)

## 📝 Database Seeding

After deployment, you'll need to seed the Neon database:

```bash
# Seed admin user
pnpm seed

# Seed services
pnpm seed:services

# Seed featured packages (if needed)
pnpm seed:featured

# Seed products (if needed)
pnpm seed:products
```

## 🔍 Verify Connection

Test the connection locally:
```bash
pnpm dev
```

Visit http://localhost:3000 and check if the app loads correctly.

## ⚠️ Important Notes

1. **Neon Connection Pooling**: The URL uses `-pooler` which is optimized for serverless
2. **SSL Mode**: `sslmode=require` is mandatory for Neon connections
3. **No Auth Token**: Unlike Turso, Neon uses standard PostgreSQL connection strings
4. **Data Migration**: Your old Turso data is NOT automatically migrated. You need to re-seed or manually migrate data if needed.

## 🔄 If You Need to Migrate Data from Turso

If you have existing data in Turso that you want to keep:

1. Export data from Turso (use drizzle-kit or SQL dumps)
2. Transform the data if needed (SQLite → PostgreSQL differences)
3. Import into Neon using seed scripts or SQL

Let me know if you need help with data migration!
