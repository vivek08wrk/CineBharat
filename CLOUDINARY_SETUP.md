# Cloudinary Setup Guide for CineBharat

## Why Cloudinary?
- **Persistent Storage**: Files survive deployments (unlike Render's ephemeral filesystem)
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **CDN**: Fast image delivery globally
- **Automatic Optimization**: Images optimized for web automatically

## Setup Steps

### 1. Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up with email or Google
3. Verify your email address

### 2. Get Your Credentials
1. Log in to Cloudinary Dashboard: https://console.cloudinary.com/
2. You'll see your credentials on the dashboard:
   - **Cloud Name**: e.g., `dxxxxxx`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz123`

### 3. Add Credentials to Local `.env`
```bash
# Add these to Backend/.env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Add Credentials to Render
1. Go to Render Dashboard: https://dashboard.render.com
2. Select your CineBharat backend service
3. Go to **Environment** tab
4. Add three new environment variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
5. Click **Save Changes** (will trigger auto-deploy)

### 5. Test Upload
1. Wait for Render deployment to complete
2. Go to your admin panel: https://cinebharat-admin-p1rgsqsyv-vivek08wrks-projects.vercel.app
3. Add a new movie with a poster image
4. Check Cloudinary dashboard → Media Library to see uploaded images

## Image Organization
- All images are stored in the `cinebharat` folder in Cloudinary
- Images are automatically optimized (quality: auto, format: auto)
- Max file size: 10MB per image

## What Changed
- ✅ Images now upload to Cloudinary (persistent CDN storage)
- ✅ Database stores full Cloudinary URLs (e.g., `https://res.cloudinary.com/...`)
- ✅ No more missing images after Render deploys
- ✅ Faster image loading via Cloudinary CDN

## Migration Note
Old movies with local filenames will still work through the API_BASE fallback. New uploads will use Cloudinary URLs automatically.
