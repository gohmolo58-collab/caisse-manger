# Deployment Guide - Caisse Manager Pro

## Pre-Deployment Checklist

- [ ] All dependencies installed
- [ ] Application tested locally
- [ ] MongoDB connection working
- [ ] Environment variables configured
- [ ] Default passwords changed
- [ ] Code pushed to GitHub

## Option 1: Deploy to Render (Backend) + Vercel (Frontend)

### Step 1: Prepare Your Repository

1. Create a GitHub repository
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit - Caisse Manager Pro"
git remote add origin https://github.com/yourusername/caisse-manager.git
git push -u origin main
```

### Step 2: Setup MongoDB Atlas (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `myFirstDatabase` with `caisse-manager`

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/caisse-manager?retryWrites=true&w=majority
```

### Step 3: Deploy Backend to Render

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: caisse-manager-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `PORT`: 5000
   - `MONGODB_URI`: (your Atlas connection string)
   - `JWT_SECRET`: (generate a secure random string)
   - `NODE_ENV`: production

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://caisse-manager-api.onrender.com`)

### Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - `VITE_API_URL`: (your Render backend URL)

6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Your app is live! 🎉

### Step 5: Update CORS Settings

Update `server/index.js` to allow your Vercel domain:

```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

Redeploy backend after this change.

## Option 2: Deploy to Railway (Full Stack)

### Step 1: Setup Railway

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

### Step 2: Add MongoDB

1. In your project, click "New" → "Database" → "Add MongoDB"
2. Copy the MongoDB connection string from variables

### Step 3: Configure Backend Service

1. Click "New" → "GitHub Repo" → Select your repo
2. Configure:
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. Add Environment Variables:
   - `PORT`: 5000
   - `MONGODB_URI`: (from Railway MongoDB)
   - `JWT_SECRET`: (generate secure string)
   - `NODE_ENV`: production

### Step 4: Configure Frontend Service

1. Click "New" → "GitHub Repo" → Select same repo
2. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`

3. Add Environment Variable:
   - `VITE_API_URL`: (your backend Railway URL)

4. Add to `client/package.json`:
```json
"dependencies": {
  ...existing dependencies,
  "serve": "^14.2.0"
}
```

## Option 3: Deploy to Heroku

### Step 1: Install Heroku CLI

```bash
brew install heroku/brew/heroku  # macOS
# or download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Create Heroku Apps

```bash
# Login
heroku login

# Create backend app
heroku create caisse-manager-api

# Create frontend app (if deploying separately)
heroku create caisse-manager-app
```

### Step 3: Add MongoDB

```bash
heroku addons:create mongolab:sandbox -a caisse-manager-api
```

### Step 4: Set Environment Variables

```bash
heroku config:set JWT_SECRET=your_secure_secret -a caisse-manager-api
heroku config:set NODE_ENV=production -a caisse-manager-api
```

### Step 5: Deploy Backend

```bash
git push heroku main
```

### Step 6: Deploy Frontend

For frontend, you can use Vercel (easier) or configure Heroku to serve the built React app.

## Option 4: VPS Deployment (DigitalOcean, AWS, etc.)

### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional)
- SSH access

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Clone and Setup Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/caisse-manager.git
cd caisse-manager

# Install dependencies
sudo npm install
cd client && sudo npm install && cd ..

# Create .env file
sudo nano .env
# Add your environment variables

# Build frontend
cd client
sudo npm run build
cd ..
```

### Step 3: Configure PM2

```bash
# Start backend with PM2
pm2 start server/index.js --name caisse-api
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/caisse-manager
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/caisse-manager/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/caisse-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment Steps

### 1. Test the Application
- Login with default credentials
- Create a test order
- Check all features work
- Test payment flow
- Verify receipt generation

### 2. Change Default Passwords
- Login as admin
- Go to Users page
- Update all default user passwords

### 3. Configure Settings
- Update restaurant name
- Set correct currency
- Configure tax rate
- Add contact information

### 4. Add Real Menu Items
- Delete sample items
- Add your actual menu
- Upload item images
- Set correct prices

### 5. Setup Inventory
- Add your ingredients
- Set stock levels
- Configure minimum thresholds

### 6. Monitor Application
- Check error logs
- Monitor database usage
- Track API performance
- Set up alerts

## Environment Variables Reference

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/caisse-manager
JWT_SECRET=your_very_secure_secret_key_min_32_chars
NODE_ENV=production
```

### Frontend (Vercel/Railway)
```env
VITE_API_URL=https://your-backend-url.com
```

## Troubleshooting

### Issue: Cannot connect to MongoDB
**Solution**: Check connection string, ensure IP whitelist includes your server IP (for Atlas)

### Issue: CORS errors
**Solution**: Update CORS configuration in `server/index.js` to include your frontend domain

### Issue: 502 Bad Gateway
**Solution**: Ensure backend is running, check PM2 logs: `pm2 logs caisse-api`

### Issue: Build fails on Vercel
**Solution**: Ensure `client/package.json` has all dependencies, check build logs

### Issue: JWT token errors
**Solution**: Ensure JWT_SECRET is set and consistent across deployments

## Monitoring & Maintenance

### Check Backend Logs (Render)
- Go to your service dashboard
- Click "Logs" tab
- Monitor for errors

### Check Backend Logs (PM2)
```bash
pm2 logs caisse-api
pm2 monit
```

### Database Backup (MongoDB Atlas)
- Automatic backups on paid tiers
- Manual export: Database → Collections → Export

### Update Application
```bash
git pull origin main
npm install
cd client && npm install && npm run build
pm2 restart caisse-api
```

## Security Recommendations

1. **Change default passwords immediately**
2. **Use strong JWT secret (min 32 characters)**
3. **Enable HTTPS/SSL**
4. **Whitelist IP addresses for MongoDB**
5. **Regular security updates**
6. **Monitor access logs**
7. **Implement rate limiting** (optional)
8. **Regular database backups**

## Performance Optimization

1. **Enable gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Implement caching** strategies
4. **Database indexing** for frequent queries
5. **Image optimization** for menu items
6. **Lazy loading** for large lists

## Support & Resources

- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/

## Success! 🎉

Your Caisse Manager Pro is now live and ready to handle orders!

Access your application and start managing your restaurant operations efficiently.
