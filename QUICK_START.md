# Quick Start Guide

Get your serverless cloud storage application running in 10 minutes!

## Prerequisites

- AWS Account
- AWS CLI configured
- Node.js v18+
- Terminal/Command Prompt

## 5-Step Deployment

### Step 1: Install Dependencies (1 min)

```bash
cd "e:/cloud project final"
npm install
```

### Step 2: Deploy to AWS (3-5 min)

```bash
serverless deploy
```

**Save the output values!** You'll need:
- `ApiEndpoint`
- `UserPoolId`
- `UserPoolClientId`

### Step 3: Configure Frontend (1 min)

```bash
# Copy template
cp frontend/config.template.js frontend/config.js

# Edit frontend/config.js with your values
```

Replace:
```javascript
const CONFIG = {
    cognito: {
        userPoolId: 'YOUR_USER_POOL_ID',      // From deployment output
        clientId: 'YOUR_CLIENT_ID',            // From deployment output
        region: 'us-east-1'                    // Your AWS region
    },
    api: {
        endpoint: 'YOUR_API_ENDPOINT'          // From deployment output
    }
};
```

### Step 4: Run Frontend (1 min)

**Option A - Python:**
```bash
cd frontend
python -m http.server 8000
```

**Option B - Node.js:**
```bash
npx http-server frontend -p 8000
```

**Option C - Direct:**
Open `frontend/index.html` in your browser

### Step 5: Test It! (2 min)

1. Open http://localhost:8000
2. Sign up with your email
3. Sign in
4. Upload a file
5. Done! 🎉

## Common Commands

```bash
# Deploy
serverless deploy

# View logs
serverless logs -f listFiles -t

# Remove everything
serverless remove
```

## Troubleshooting

**"AWS credentials not found"**
```bash
aws configure
```

**"CORS error"**
- Check API endpoint in `config.js`
- Ensure it matches deployment output

**"Failed to upload"**
- Check file size (max 100MB)
- Check file type (PDF, images, docs only)

## What You Get

✅ User authentication (Cognito)
✅ File upload to S3
✅ File management (list, download, rename, delete)
✅ File sharing with expiring links
✅ Search by filename or tag
✅ Secure API with JWT
✅ CloudWatch monitoring

## Architecture

```
User Browser
    ↓
API Gateway (JWT Auth)
    ↓
Lambda Functions
    ↓
S3 (Files) + DynamoDB (Metadata)
```

## Costs

**Free Tier (12 months):**
- Lambda: 1M requests/month
- S3: 5GB storage
- DynamoDB: 25GB storage
- API Gateway: 1M requests/month

**After Free Tier:**
~$0.50/month for light usage

## Next Steps

- Read [README.md](README.md) for full documentation
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed steps
- Check [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing

## Cleanup

When done:
```bash
# Empty S3 bucket
aws s3 rm s3://YOUR-BUCKET-NAME --recursive

# Remove stack
serverless remove
```

---

**Need help?** Check CloudWatch logs:
```bash
serverless logs -f FUNCTION_NAME
```

**Happy building!** 🚀
