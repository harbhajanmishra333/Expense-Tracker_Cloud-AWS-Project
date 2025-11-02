# Deployment Guide - Cloud-Based Personal Expense Tracker

Complete step-by-step guide to deploy your expense tracker application.

## 📋 Prerequisites

### Required Software
- [ ] AWS Account (with payment method)
- [ ] Node.js v18 or higher
- [ ] npm or yarn
- [ ] AWS CLI installed and configured
- [ ] Serverless Framework installed globally

### Check Installations

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm
npm --version

# Check AWS CLI
aws --version

# Check Serverless Framework
serverless --version
```

### Install Missing Tools

**AWS CLI:**
```bash
# Windows
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Serverless Framework:**
```bash
npm install -g serverless
```

## 🔧 Step 1: AWS Account Setup

### 1.1 Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow registration steps
4. Add payment method (required for free tier)

### 1.2 Create IAM User
1. Go to AWS Console → IAM
2. Click "Users" → "Create user"
3. Username: `expense-tracker-admin`
4. Enable "Provide user access to AWS Management Console"
5. Attach policy: `AdministratorAccess`
6. Create user

### 1.3 Get Access Keys
1. Click on created user
2. Go to "Security credentials"
3. Click "Create access key"
4. Choose "Command Line Interface (CLI)"
5. Download credentials

### 1.4 Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID: [Your access key]
- AWS Secret Access Key: [Your secret key]
- Default region: `us-east-1` (or your preferred region)
- Default output format: `json`

**Verify:**
```bash
aws sts get-caller-identity
```

## 📦 Step 2: Backend Deployment

### 2.1 Navigate to Project

```bash
cd "e:/cloud project final/expense-tracker"
```

### 2.2 Install Dependencies

```bash
npm install
```

This installs:
- @aws-sdk/client-dynamodb
- @aws-sdk/client-s3
- @aws-sdk/lib-dynamodb
- uuid
- serverless

### 2.3 Review Configuration

Open `serverless.yml` and optionally change:
- `region`: Your preferred AWS region (default: us-east-1)
- `stage`: Environment name (default: dev)

### 2.4 Deploy Backend

```bash
serverless deploy
```

**What happens:**
1. Creates CloudFormation stack
2. Creates 2 DynamoDB tables
3. Creates S3 bucket for reports
4. Creates Cognito User Pool
5. Deploys 9 Lambda functions
6. Creates API Gateway
7. Sets up IAM roles
8. Configures CloudWatch

**Deployment time:** 3-5 minutes

### 2.5 Save Output Values

After deployment, you'll see:

```
Stack Outputs:
  ApiEndpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
  UserPoolId: us-east-1_xxxxxxxxx
  UserPoolClientId: 1a2b3c4d5e6f7g8h9i0j1k2l3m
  ReportsBucketName: expense-tracker-reports-dev-123456789
```

**CRITICAL:** Copy these values! You'll need them for frontend configuration.

### 2.6 Verify Backend Deployment

```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `expense-tracker`)].FunctionName'

# Check DynamoDB tables
aws dynamodb list-tables --query 'TableNames[?starts_with(@, `expense-tracker`)]'

# Check S3 bucket
aws s3 ls | grep expense-tracker

# Check Cognito User Pool
aws cognito-idp list-user-pools --max-results 10
```

## ⚛️ Step 3: Frontend Setup

### 3.1 Navigate to Frontend

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

This installs:
- react & react-dom
- recharts (for charts)
- axios (for API calls)
- amazon-cognito-identity-js
- date-fns

**Installation time:** 1-2 minutes

### 3.3 Configure Frontend

1. **Copy configuration template:**

```bash
cp src/config.template.js src/config.js
```

2. **Edit `src/config.js`** with your deployment values:

```javascript
const config = {
  cognito: {
    userPoolId: 'us-east-1_xxxxxxxxx',     // From deployment output
    clientId: '1a2b3c4d5e6f7g8h9i0j1k2l3m', // From deployment output
    region: 'us-east-1'                     // Your AWS region
  },
  api: {
    endpoint: 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com' // From deployment output
  }
};

export default config;
```

### 3.4 Run Development Server

```bash
npm start
```

This will:
- Start React development server
- Open browser at http://localhost:3000
- Enable hot reload for development

## ✅ Step 4: Testing

### 4.1 Test Authentication

1. **Sign Up:**
   - Click "Sign Up"
   - Enter name, email, password
   - Password requirements:
     - Min 8 characters
     - At least 1 uppercase
     - At least 1 lowercase
     - At least 1 number
     - At least 1 symbol
   - Click "Sign Up"
   - Check email for verification (if enabled)

2. **Sign In:**
   - Enter email and password
   - Click "Sign In"
   - Should redirect to dashboard

### 4.2 Test Expense Management

1. **Add Expense:**
   - Enter amount (e.g., 50.00)
   - Select category (e.g., "Food & Dining")
   - Add description (optional)
   - Select date
   - Choose payment method
   - Click "Add Expense"
   - Verify expense appears in list

2. **Edit Expense:**
   - Click edit button (✏️) on any expense
   - Modify amount or description
   - Click "Save"
   - Verify changes

3. **Delete Expense:**
   - Click delete button (🗑️)
   - Confirm deletion
   - Verify expense removed

### 4.3 Test Analytics

1. Go to "Analytics" tab
2. Verify charts display:
   - Spending by Category (pie chart)
   - Top Categories (bar chart)
   - Monthly Trend (line chart)
   - Payment Methods
3. Change date range
4. Verify data updates

### 4.4 Test Reports

1. Go to "Reports" tab
2. Select date range
3. Choose format (CSV/JSON/TXT)
4. Click "Generate Report"
5. Wait for success message
6. Click "Download" on generated report
7. Verify file downloads and contains correct data

### 4.5 Verify Backend

**Check CloudWatch Logs:**
```bash
serverless logs -f addExpense -t
serverless logs -f getExpenses -t
serverless logs -f getAnalytics -t
```

**Check DynamoDB:**
```bash
aws dynamodb scan --table-name expense-tracker-expenses-dev --max-items 5
```

**Check S3:**
```bash
aws s3 ls s3://YOUR-REPORTS-BUCKET-NAME/
```

## 🚀 Step 5: Production Deployment

### 5.1 Deploy Backend to Production

```bash
cd ..  # Back to root
serverless deploy --stage prod
```

### 5.2 Build Frontend for Production

```bash
cd frontend
npm run build
```

This creates optimized production build in `build/` directory.

### 5.3 Deploy Frontend

**Option A: AWS S3 + CloudFront**

1. Create S3 bucket:
```bash
aws s3 mb s3://expense-tracker-frontend
aws s3 website s3://expense-tracker-frontend --index-document index.html
```

2. Upload build:
```bash
aws s3 sync build/ s3://expense-tracker-frontend
```

3. Create CloudFront distribution (optional, for HTTPS)

**Option B: Netlify**

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

**Option C: Vercel**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

## 📊 Step 6: Monitoring

### 6.1 CloudWatch Dashboard

1. Go to AWS Console → CloudWatch
2. Create dashboard
3. Add widgets for:
   - Lambda invocations
   - Lambda errors
   - API Gateway requests
   - DynamoDB read/write capacity

### 6.2 Set Up Alarms

```bash
# Already configured in serverless.yml
# Check alarm status:
aws cloudwatch describe-alarms --alarm-names expense-tracker-lambda-errors-dev
```

### 6.3 View Logs

```bash
# View all Lambda logs
serverless logs -f addExpense
serverless logs -f getExpenses
serverless logs -f getAnalytics
serverless logs -f generateReport
```

## 🔒 Step 7: Security Hardening

### 7.1 Enable MFA for AWS Account

1. Go to IAM → Users → Your user
2. Security credentials → Assign MFA device
3. Follow setup instructions

### 7.2 Restrict API Access (Optional)

Add API key requirement in `serverless.yml`:

```yaml
functions:
  addExpense:
    events:
      - httpApi:
          path: /expenses
          method: post
          authorizer:
            type: jwt
            id: !Ref CognitoAuthorizer
          # Add API key requirement
```

### 7.3 Enable CloudTrail

1. Go to AWS Console → CloudTrail
2. Create trail
3. Enable for all regions
4. Store logs in S3

## 💰 Step 8: Cost Optimization

### 8.1 Set Up Billing Alerts

1. Go to AWS Console → Billing
2. Preferences → Receive Billing Alerts
3. Go to CloudWatch → Alarms
4. Create billing alarm (e.g., $10 threshold)

### 8.2 Review Costs

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### 8.3 Optimize Resources

- DynamoDB: Already using on-demand (optimal for variable load)
- Lambda: Memory optimized at 256MB
- S3: Lifecycle policy set (30-day expiration)
- API Gateway: HTTP API (cheaper than REST API)

## 🧹 Step 9: Cleanup (When Done)

### 9.1 Empty S3 Bucket

```bash
aws s3 rm s3://YOUR-REPORTS-BUCKET-NAME --recursive
```

### 9.2 Remove Serverless Stack

```bash
serverless remove
```

This deletes:
- All Lambda functions
- DynamoDB tables
- S3 bucket (if empty)
- API Gateway
- IAM roles
- CloudWatch logs

### 9.3 Manual Cleanup

If resources remain:

```bash
# Delete Cognito User Pool
aws cognito-idp delete-user-pool --user-pool-id YOUR-USER-POOL-ID

# Verify all resources deleted
aws lambda list-functions
aws dynamodb list-tables
aws s3 ls
```

## 🐛 Troubleshooting

### Issue: "AWS credentials not found"

**Solution:**
```bash
aws configure
# Re-enter credentials
```

### Issue: "Deployment failed - Stack already exists"

**Solution:**
```bash
serverless remove
serverless deploy
```

### Issue: "CORS error in browser"

**Solution:**
- Verify API endpoint in `config.js`
- Check CORS settings in `serverless.yml`
- Ensure using correct HTTP methods

### Issue: "Failed to fetch expenses"

**Solution:**
1. Check CloudWatch logs:
```bash
serverless logs -f getExpenses
```
2. Verify DynamoDB table exists
3. Check IAM permissions

### Issue: "Charts not displaying"

**Solution:**
1. Check browser console for errors
2. Verify recharts is installed:
```bash
cd frontend
npm install recharts
```
3. Clear browser cache

### Issue: "Report generation fails"

**Solution:**
1. Check S3 bucket permissions
2. Verify Lambda timeout (set to 60s)
3. Check CloudWatch logs:
```bash
serverless logs -f generateReport
```

## 📈 Performance Optimization

### Frontend

1. **Code Splitting:**
   - Already enabled with React.lazy (if needed)

2. **Caching:**
   - Add service worker for offline support

3. **CDN:**
   - Use CloudFront for faster global access

### Backend

1. **DynamoDB:**
   - Indexes already optimized
   - On-demand capacity handles spikes

2. **Lambda:**
   - Memory: 256MB (optimal for most operations)
   - Timeout: 30s (60s for reports)

3. **API Gateway:**
   - HTTP API (lower latency than REST)
   - Caching can be enabled if needed

## ✅ Deployment Checklist

- [ ] AWS account created
- [ ] AWS CLI configured
- [ ] Serverless Framework installed
- [ ] Backend dependencies installed
- [ ] Backend deployed successfully
- [ ] Deployment output values saved
- [ ] Frontend dependencies installed
- [ ] Frontend configured with backend values
- [ ] Frontend running locally
- [ ] User registration tested
- [ ] Expense management tested
- [ ] Analytics tested
- [ ] Reports tested
- [ ] CloudWatch logs verified
- [ ] Production deployment (optional)
- [ ] Monitoring set up
- [ ] Billing alerts configured

## 🎉 Success!

Your expense tracker is now deployed and running!

**Next Steps:**
1. Share with users
2. Monitor usage
3. Gather feedback
4. Add new features
5. Optimize based on usage patterns

---

**Need Help?**
- Check CloudWatch logs
- Review AWS documentation
- Check browser console
- Verify all configuration values

**Happy Tracking!** 💰📊
