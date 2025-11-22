# 🚀 Deploy to Netlify - Step by Step

## Your code is pushed to GitHub! ✅

Now let's deploy via Netlify's web interface (much easier than the buggy CLI):

## Steps:

### 1. Go to Netlify
Open: https://app.netlify.com

### 2. Create New Site
Click **"Add new site"** → **"Import an existing project"**

### 3. Connect to GitHub
- Select **"Deploy with GitHub"**
- Authorize Netlify if needed
- Search for: **Snackify2.0**
- Click on your repo

### 4. Configure Build Settings
Netlify should auto-detect from your `netlify.toml`, but verify:

```
Build command: npm run build
Publish directory: dist/snack-request-app
```

### 5. Deploy!
Click **"Deploy site"**

Netlify will:
- Install dependencies
- Build your Angular app
- Deploy to a `.netlify.app` URL

## Your Configuration (Already Set Up!)

Your `netlify.toml` includes:
- ✅ SPA redirects (all routes → index.html)
- ✅ Security headers
- ✅ Cache optimization
- ✅ Node 18 environment

## After Deployment

1. **Get your URL**: Something like `https://snackify-[random].netlify.app`
2. **Test the app**: Make sure it connects to your Heroku backend
3. **Optional**: Set up custom domain in Netlify settings

## Environment Variables

Your production environment is already configured:
- `environment.prod.ts` → Points to Heroku backend
- Angular automatically uses production config when building

## Troubleshooting

If deployment fails:
- Check build logs in Netlify dashboard
- Verify Node version (set to 18 in netlify.toml)
- Make sure `dist/snack-request-app` exists after build

## Next Steps

Once deployed:
1. Visit your Netlify URL
2. Test login/register
3. Verify backend connection to Heroku
4. (Optional) Set up custom domain

---

**Your backend is already on Heroku and ready to go!** 🎉
