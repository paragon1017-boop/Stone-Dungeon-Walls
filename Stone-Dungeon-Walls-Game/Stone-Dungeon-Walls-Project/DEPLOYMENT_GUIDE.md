# 🚀 Deployment Guide - Shining in the Darkness

## Quick Deployment Options

### Option 1: Replit (Easiest - Recommended!)

**Steps:**
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl" → "Import from GitHub" or "Upload"
3. Upload this entire project folder
4. Replit will automatically:
   - Detect it's a Node.js project
   - Install dependencies
   - Provision PostgreSQL database
   - Set up authentication
5. Click the green "Run" button
6. Your game is live! 🎮

**That's it!** Replit handles everything automatically.

---

### Option 2: Vercel + Neon (Modern Stack)

**Requirements:**
- Vercel account (free)
- Neon PostgreSQL account (free)

**Steps:**

1. **Set up database:**
   ```bash
   # Sign up at neon.tech
   # Create a new project
   # Copy your DATABASE_URL
   ```

2. **Modify for Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # In project root
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   ```
   DATABASE_URL=your_neon_url
   SESSION_SECRET=random_secret_key_here
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

---

### Option 3: Railway (One-Click Deploy)

**Steps:**
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-provisions PostgreSQL
6. Set environment variables:
   - `SESSION_SECRET=your_secret`
7. Deploy!

---

### Option 4: Heroku (Traditional)

**Steps:**

1. **Install Heroku CLI**
2. **Create app:**
   ```bash
   heroku create your-app-name
   heroku addons:create heroku-postgresql:essential-0
   ```

3. **Set config:**
   ```bash
   heroku config:set SESSION_SECRET=$(openssl rand -hex 32)
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

---

### Option 5: Local Development (Testing)

**For testing before deployment:**

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cat > .env << 'ENVFILE'
DATABASE_URL=postgresql://user:password@localhost:5432/dungeon_db
SESSION_SECRET=your_secret_key_here
NODE_ENV=development
ENVFILE

# 3. Set up local PostgreSQL
# Install PostgreSQL, then:
createdb dungeon_db

# 4. Push database schema
npm run db:push

# 5. Run development server
npm run dev

# 6. Open browser to http://localhost:5000
```

---

## Environment Variables Needed

All deployment options need these:

```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=random_secret_here_32_chars_minimum
NODE_ENV=production
```

**For Replit Auth (if using Replit):**
```bash
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc
```

---

## Post-Deployment Checklist

After deploying:

- [ ] Test user registration/login
- [ ] Create a character
- [ ] Enter dungeon (check 3D rendering)
- [ ] Fight a monster (check sprites load)
- [ ] Save game (check persistence)
- [ ] Check mini-map (press M)
- [ ] Check equipment (press E)
- [ ] Test combat system
- [ ] Verify database saves

---

## Troubleshooting

**Problem: Build fails**
- Check Node.js version (needs 20+)
- Run `npm install` locally first
- Check build logs

**Problem: Database connection fails**
- Verify DATABASE_URL format
- Check database is running
- Run `npm run db:push`

**Problem: Auth doesn't work**
- For Replit: ensure REPL_ID is set
- For others: might need to modify auth system
- Check SESSION_SECRET is set

**Problem: Static files not loading**
- Check vite.config.ts paths
- Verify build completed
- Check server/static.ts

**Problem: Monster sprites don't show**
- Check client/src/assets/monsters/ has all PNGs
- Verify file names match exactly
- Check browser console for 404s

---

## Performance Tips

**For production:**
1. Enable gzip compression
2. Use CDN for static assets
3. Enable PostgreSQL connection pooling
4. Set up Redis for sessions (optional)
5. Use environment-specific configs

---

## Custom Domain

**Replit:**
- Upgrade to Hacker plan
- Link custom domain in settings

**Vercel:**
- Add domain in project settings
- Update DNS records

**Railway:**
- Add custom domain in settings
- Point CNAME to Railway

---

## Need Help?

- **Replit**: Easiest, works out of the box
- **Vercel/Railway**: Modern, scalable
- **Heroku**: Traditional, reliable
- **Local**: For testing only

**Recommended for beginners: Replit** ✨

Your game is ready - just pick an option and deploy!
