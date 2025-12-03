# Netlify Deployment Guide

This guide walks you through deploying the Signup Coordinator application to Netlify.

## Prerequisites

- A [Netlify account](https://app.netlify.com/signup)
- A Supabase project with the database schema set up
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Connect Your Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the repository containing this project

### 2. Configure Build Settings

Netlify should automatically detect the build settings from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 20 (configured in netlify.toml)

### 3. Set Environment Variables

In the Netlify dashboard, navigate to:
**Site settings** → **Environment variables** → **Add a variable**

Add the following environment variables:

| Variable Name            | Description                        | Example                                   | Mark as Secret? |
| ------------------------ | ---------------------------------- | ----------------------------------------- | --------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL          | `https://xxxxx.supabase.co`               | No              |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | No              |

**Important:** Do NOT mark these as "secret" in Netlify. The anon key is designed to be public and embedded in client-side code. Netlify may warn about "exposed secrets" but this is a false positive - the Supabase anon key is meant to be public. Security is handled by Supabase Row Level Security policies, not by hiding this key.

**To find these values:**

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key** (NOT the service_role key!)

### 4. Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your application
3. Once complete, you'll receive a URL like `https://your-site-name.netlify.app`

### 5. Configure Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS

## Continuous Deployment

Once connected, Netlify will automatically:

- Deploy when you push to your main/master branch
- Create deploy previews for pull requests
- Run the build command and deploy the output

## Troubleshooting

### Build Fails

- Check the build logs in Netlify dashboard
- Verify all environment variables are set correctly
- Ensure your code builds locally with `npm run build`

### Environment Variables Not Working

- Environment variables must be prefixed with `VITE_` to be exposed to the client
- After adding/changing variables, trigger a new deploy
- Clear cache and retry deploy if needed

### 404 Errors on Page Refresh

- The `netlify.toml` file includes redirects for client-side routing
- If you still see 404s, verify the `[[redirects]]` section exists in netlify.toml

### Supabase Connection Issues

- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is running
- Ensure Row Level Security policies allow public access where needed

## Security Notes

1. **Never commit `.env` files** - They contain your actual keys
2. **Use environment variables** - Configure them in Netlify dashboard
3. **Supabase anon key is safe to expose** - It's designed for client-side use and will be visible in your bundled JavaScript. This is expected and secure.
4. **Row Level Security** - Ensure your Supabase RLS policies are properly configured - this is where your actual security comes from
5. **Never use the service_role key** - Only use the anon/public key in your frontend. The service_role key bypasses RLS and should only be used in secure backend environments.
6. **Netlify "exposed secrets" warning** - You can safely ignore warnings about the Supabase anon key being exposed. It's not actually a secret.

## Testing Your Deployment

After deployment:

1. Visit your Netlify URL
2. Create a test signup sheet
3. Verify you can claim items
4. Test the edit links (management and claim tokens)
5. Check that all routes work correctly (no 404s on refresh)

## Monitoring

- **Deploy logs**: Available in Netlify dashboard under "Deploys"
- **Function logs**: If using Netlify Functions (not currently used)
- **Analytics**: Enable Netlify Analytics for traffic insights

## Rollback

If a deployment has issues:

1. Go to **Deploys** in Netlify dashboard
2. Find a previous working deployment
3. Click the three dots → "Publish deploy"

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
