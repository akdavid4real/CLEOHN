#!/bin/bash

# Seed admin user on Vercel production
# Run this after deploying to Vercel

echo "Seeding admin user on production..."

# Install Vercel CLI if not installed
# npm i -g vercel

# Run the seed script on Vercel
vercel env pull .env.production
tsx scripts/seed-admin.ts

echo "✅ Admin user seeded on production!"
echo "Email: admin@cleohn.com"
echo "Password: Admin123!"
