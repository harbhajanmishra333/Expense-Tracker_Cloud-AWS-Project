## 🔐 Setup Authentication & Deploy to Web

Complete guide to enable user authentication and deploy your app to the web.

## Step 1: Get Cognito Details

Run this PowerShell script:

```powershell
.\get-cognito-details.ps1
```

This will automatically:
- Find your Cognito User Pool
- Get the User Pool ID and Client ID
- Update `frontend/src/config-auth.js` with the correct values

**OR manually get the values:**

```powershell
# List user pools
aws cognito-idp list-user-pools --max-results 10

# Get client ID (replace USER_POOL_ID with your pool ID)
aws cognito-idp list-user-pool-clients --user-pool-id YOUR_USER_POOL_ID
```

Then update `frontend/src/config-auth.js`:
```javascript
const config = {
  cognito: {
    userPoolId: 'us-east-1_ABC123',  // Your User Pool ID
    clientId: '1a2b3c4d5e6f...',     // Your Client ID
    region: 'us-east-1'
  },
  api: {
    endpoint: 'https://dxrdjqrw54.execute-api.us-east-1.amazonaws.com',
    useAuth: true
  }
};
```

## Step 2: Switch to Authenticated Version

Edit `frontend/src/index.js`:

Change from:
```javascript
import App from './AppNoAuth';
```

To:
```javascript
import App from './AppWithAuth';
```

## Step 3: Test Locally

```powershell
cd frontend
npm start
```

You should now see:
- **Sign Up** page for new users
- **Sign In** page for existing users
- Each user has their own expenses (isolated data)

## Step 4: Deploy Frontend to Netlify (Easiest)

### Option A: Drag & Drop (Simplest)

1. Build the app:
```powershell
cd frontend
npm run build
```

2. Go to: https://app.netlify.com/drop
3. Drag the `build` folder onto the page
4. Done! You'll get a URL like: `https://random-name.netlify.app`

### Option B: Netlify CLI

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

Follow the prompts:
- Create & configure a new site
- Build directory: `build`
- Deploy!

## Step 5: Deploy Frontend to Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Build and deploy
cd frontend
vercel --prod
```

Follow prompts and you'll get a URL like: `https://expense-tracker.vercel.app`

## Step 6: Deploy Frontend to AWS S3 + CloudFront

### Create S3 Bucket
```powershell
aws s3 mb s3://expense-tracker-frontend-yourname
aws s3 website s3://expense-tracker-frontend-yourname --index-document index.html --error-document index.html
```

### Build and Upload
```powershell
cd frontend
npm run build
aws s3 sync build/ s3://expense-tracker-frontend-yourname --acl public-read
```

### Make it Public
```powershell
aws s3api put-bucket-policy --bucket expense-tracker-frontend-yourname --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::expense-tracker-frontend-yourname/*"
  }]
}'
```

Your app will be at: `http://expense-tracker-frontend-yourname.s3-website-us-east-1.amazonaws.com`

### (Optional) Add CloudFront for HTTPS
1. Go to AWS Console → CloudFront
2. Create distribution
3. Origin: Your S3 bucket
4. Wait 15-20 minutes for deployment
5. Get CloudFront URL (HTTPS enabled)

## 🎯 Complete Deployment Summary

### Backend (Already Deployed ✅)
- **API**: `https://dxrdjqrw54.execute-api.us-east-1.amazonaws.com`
- **Database**: DynamoDB tables
- **Auth**: Cognito User Pool
- **Storage**: S3 bucket for reports

### Frontend (Choose One)
- **Netlify**: Easiest, free tier, auto HTTPS
- **Vercel**: Fast, free tier, auto HTTPS  
- **AWS S3**: Full control, requires CloudFront for HTTPS

## 🔒 Authentication Features

Once deployed with auth:
- ✅ **Sign Up**: New users create accounts
- ✅ **Email Verification**: Cognito sends verification emails
- ✅ **Sign In**: Secure login with JWT tokens
- ✅ **Password Requirements**: 8+ chars, uppercase, lowercase, number, symbol
- ✅ **Data Isolation**: Each user sees only their own expenses
- ✅ **Secure API**: All endpoints protected with JWT
- ✅ **Session Management**: Auto logout on token expiry

## 📱 Testing Authentication

1. **Sign Up**:
   - Enter name, email, password
   - Check email for verification code (if enabled)
   - Sign in

2. **Add Expenses**:
   - Only you can see your expenses
   - Try with multiple accounts to verify isolation

3. **Sign Out & Sign In**:
   - Data persists across sessions
   - Secure token-based authentication

## 🌐 Share Your App

After deployment, share your URL:
- Netlify: `https://your-app.netlify.app`
- Vercel: `https://your-app.vercel.app`
- S3: `http://your-bucket.s3-website-us-east-1.amazonaws.com`

Users can:
1. Sign up for free
2. Track their expenses
3. View analytics
4. Export reports

## 💰 Costs

### Free Tier (12 months)
- **Backend**: Free for typical usage
- **Netlify/Vercel**: Free forever for personal projects
- **S3**: ~$0.50/month after free tier

### After Free Tier
- Light usage: $1-3/month total
- Medium usage: $5-10/month total

## 🎉 You're Done!

You now have a fully functional, cloud-hosted expense tracker with:
- ✅ User authentication
- ✅ Personal data isolation
- ✅ Scalable backend (AWS Lambda + DynamoDB)
- ✅ Beautiful frontend (React)
- ✅ Deployed to the web
- ✅ HTTPS enabled (Netlify/Vercel)

Share it with friends and family! 🚀
