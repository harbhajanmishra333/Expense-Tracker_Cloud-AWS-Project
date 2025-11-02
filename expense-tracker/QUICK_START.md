# Quick Start - Expense Tracker

Get your expense tracker running in 10 minutes!

## 🚀 5-Step Setup

### Step 1: Install Backend Dependencies (1 min)

```bash
cd expense-tracker
npm install
```

### Step 2: Deploy Backend (3-5 min)

```bash
serverless deploy
```

**Save these values from output:**
- `ApiEndpoint`
- `UserPoolId`
- `UserPoolClientId`

### Step 3: Setup Frontend (2 min)

```bash
cd frontend
npm install
cp src/config.template.js src/config.js
```

Edit `src/config.js` with your values:
```javascript
const config = {
  cognito: {
    userPoolId: 'YOUR_USER_POOL_ID',
    clientId: 'YOUR_CLIENT_ID',
    region: 'us-east-1'
  },
  api: {
    endpoint: 'YOUR_API_ENDPOINT'
  }
};
```

### Step 4: Run Application (1 min)

```bash
npm start
```

Opens at http://localhost:3000

### Step 5: Test It! (2 min)

1. Sign up with your email
2. Sign in
3. Add an expense
4. View analytics
5. Generate a report

## ✅ What You Get

- 💰 **Expense Tracking**: Add, edit, delete expenses
- 📊 **Analytics**: Interactive charts and insights
- 📄 **Reports**: Export to CSV/JSON/TXT
- 🔒 **Secure**: JWT authentication
- ☁️ **Cloud-Hosted**: Fully serverless on AWS
- 📈 **Auto-Scaling**: Handles any load

## 🛠️ Prerequisites

- AWS Account
- Node.js 18+
- AWS CLI configured
- Serverless Framework installed

## 📦 What Gets Created

**AWS Resources:**
- 9 Lambda functions
- 2 DynamoDB tables
- 1 S3 bucket
- 1 API Gateway
- 1 Cognito User Pool
- CloudWatch logs & alarms

## 💰 Cost

**Free Tier (12 months):**
- Covers typical usage
- ~1000 expenses/month
- ~100 reports/month

**After Free Tier:**
- ~$1-2/month for light usage

## 🐛 Troubleshooting

**"AWS credentials not found"**
```bash
aws configure
```

**"CORS error"**
- Check API endpoint in config.js
- Verify it matches deployment output

**"Failed to add expense"**
```bash
serverless logs -f addExpense
```

## 📚 Full Documentation

- **README.md** - Complete project documentation
- **DEPLOYMENT_GUIDE.md** - Detailed deployment steps
- **serverless.yml** - Infrastructure configuration

## 🧹 Cleanup

When done:
```bash
aws s3 rm s3://YOUR-BUCKET --recursive
serverless remove
```

## 🎯 Features Demo

### Add Expense
```
Amount: $50.00
Category: Food & Dining
Description: Lunch with team
Date: Today
Payment: Credit Card
```

### View Analytics
- Pie chart: Spending by category
- Bar chart: Top 5 categories
- Line chart: Monthly trends
- Summary: Total, average, count

### Export Report
- Select date range
- Choose format (CSV/JSON/TXT)
- Download instantly

## 🔗 Quick Links

- [AWS Console](https://console.aws.amazon.com)
- [Serverless Dashboard](https://app.serverless.com)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch)

---

**Ready to track your expenses?** 🚀

Start with Step 1 above!
