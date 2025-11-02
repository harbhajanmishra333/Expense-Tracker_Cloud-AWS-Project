# Cloud-Based Personal Expense Tracker

A full-stack serverless expense tracking application built with React, AWS Lambda, DynamoDB, S3, and Cognito. Track expenses, visualize spending trends, and export reports - all hosted in the cloud with auto-scaling capabilities.

## 🌟 Features

- **User Authentication**: Secure sign-up and sign-in with AWS Cognito
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Data Visualization**: Interactive charts showing spending patterns
  - Pie charts for category breakdown
  - Bar charts for top spending categories
  - Line charts for monthly trends
  - Payment method analysis
- **Smart Analytics**: Real-time insights into spending habits
- **Report Export**: Generate and download expense reports (CSV, JSON, TXT)
- **Cloud Storage**: Reports stored in S3 with automatic 30-day expiration
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Auto-Scaling**: Serverless architecture scales automatically with demand

## 🏗️ Architecture

### Backend (Serverless)
- **AWS Lambda**: 9 serverless functions for API operations
- **Amazon DynamoDB**: NoSQL database for expenses and categories
- **Amazon S3**: Cloud storage for generated reports
- **Amazon API Gateway**: RESTful API with JWT authorization
- **Amazon Cognito**: User authentication and management
- **Amazon CloudWatch**: Monitoring and logging

### Frontend
- **React 18**: Modern UI framework
- **Recharts**: Data visualization library
- **Axios**: HTTP client for API calls
- **date-fns**: Date formatting utilities

## 📁 Project Structure

```
expense-tracker/
├── src/handlers/              # Lambda functions (Backend)
│   ├── addExpense.js
│   ├── getExpenses.js
│   ├── updateExpense.js
│   ├── deleteExpense.js
│   ├── getAnalytics.js
│   ├── getCategories.js
│   ├── addCategory.js
│   ├── generateReport.js
│   └── getReports.js
├── frontend/                  # React application
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Auth.js
│       │   ├── Dashboard.js
│       │   ├── ExpenseForm.js
│       │   ├── ExpenseList.js
│       │   ├── Analytics.js
│       │   └── Reports.js
│       ├── services/
│       │   ├── AuthService.js
│       │   └── ApiService.js
│       ├── App.js
│       └── index.js
├── serverless.yml             # Infrastructure as Code
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- AWS Account
- Node.js 18+
- AWS CLI configured
- Serverless Framework installed globally

### 1. Install Backend Dependencies

```bash
cd expense-tracker
npm install
```

### 2. Deploy Backend

```bash
serverless deploy
```

**Save the output values:**
- `ApiEndpoint`
- `UserPoolId`
- `UserPoolClientId`

### 3. Setup Frontend

```bash
cd frontend
npm install
```

### 4. Configure Frontend

Copy `src/config.template.js` to `src/config.js` and add your values:

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

### 5. Run Frontend

```bash
npm start
```

Open http://localhost:3000

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/expenses` | Add new expense |
| GET | `/expenses` | Get expenses (with filters) |
| PUT | `/expenses/{id}` | Update expense |
| DELETE | `/expenses/{id}` | Delete expense |
| GET | `/analytics` | Get spending analytics |
| GET | `/categories` | Get expense categories |
| POST | `/categories` | Add custom category |
| POST | `/reports/generate` | Generate expense report |
| GET | `/reports` | List generated reports |

All endpoints require JWT authentication via `Authorization` header.

## 💡 Usage Guide

### 1. Sign Up / Sign In

- Create account with email and password
- Password must be 8+ characters with uppercase, lowercase, number, and symbol
- Verify email if required

### 2. Add Expenses

- Enter amount, select category
- Add optional description
- Choose date and payment method
- Click "Add Expense"

### 3. View & Manage Expenses

- See all expenses in a list
- Filter by date range
- Edit or delete expenses
- View total spending

### 4. Analyze Spending

- Switch to Analytics tab
- View interactive charts:
  - Category breakdown (pie chart)
  - Top spending categories (bar chart)
  - Monthly trends (line chart)
  - Payment method distribution
- See summary statistics

### 5. Export Reports

- Go to Reports tab
- Select date range and format (CSV/JSON/TXT)
- Click "Generate Report"
- Download from the list

## 🎨 Default Categories

- 🍔 Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 💡 Bills & Utilities
- 🏥 Healthcare
- 📚 Education
- ✈️ Travel
- 🛒 Groceries
- 📝 Other

You can add custom categories too!

## 🔒 Security Features

- JWT-based authentication
- User data isolation (users can only access their own data)
- Secure password policy enforcement
- Private S3 bucket (no public access)
- CORS configuration
- Input validation on frontend and backend
- Automatic report expiration (30 days)

## 💰 Cost Optimization

### AWS Free Tier (12 months)
- Lambda: 1M requests/month
- DynamoDB: 25GB storage, 25 WCU, 25 RCU
- S3: 5GB storage
- API Gateway: 1M requests/month
- Cognito: 50,000 MAUs

### After Free Tier
- Light usage: ~$1-2/month
- Medium usage: ~$5-10/month

### Cost-Saving Features
- DynamoDB on-demand pricing (pay per request)
- S3 lifecycle policy (auto-delete old reports)
- Serverless architecture (no idle costs)

## 📈 Scaling

The application automatically scales:

- **Lambda**: Scales to handle concurrent requests
- **DynamoDB**: On-demand capacity adjusts automatically
- **API Gateway**: Handles millions of requests
- **S3**: Unlimited storage capacity

No manual intervention required!

## 🛠️ Development

### Local Testing

Test Lambda functions locally:

```bash
serverless invoke local -f addExpense -d '{"body": "{\"amount\":50,\"category\":\"Food & Dining\",\"date\":\"2024-01-01\"}"}'
```

### View Logs

```bash
serverless logs -f addExpense -t
```

### Frontend Development

```bash
cd frontend
npm start
```

### Build for Production

```bash
cd frontend
npm run build
```

## 🧪 Testing

### Test User Registration
1. Sign up with valid email
2. Check email for verification
3. Sign in

### Test Expense Management
1. Add multiple expenses
2. Edit an expense
3. Delete an expense
4. Filter by date range

### Test Analytics
1. Add expenses in different categories
2. View analytics tab
3. Verify charts display correctly

### Test Reports
1. Generate report for date range
2. Download and verify content
3. Check S3 bucket for file

## 🐛 Troubleshooting

### "Failed to fetch"
- Check API endpoint in config.js
- Verify backend is deployed
- Check CORS settings

### "Authentication failed"
- Verify Cognito User Pool ID and Client ID
- Check password meets requirements
- Ensure user is verified

### Charts not displaying
- Check browser console for errors
- Verify analytics data is loading
- Ensure recharts is installed

### Report generation fails
- Check S3 bucket permissions
- Verify date range is valid
- Check CloudWatch logs

## 📦 Deployment to Production

### Backend

```bash
serverless deploy --stage prod
```

### Frontend

Build and deploy to S3 + CloudFront:

```bash
cd frontend
npm run build
aws s3 sync build/ s3://your-bucket-name
```

Or use Netlify/Vercel for easy deployment.

## 🧹 Cleanup

When done, remove all resources:

```bash
# Empty S3 bucket first
aws s3 rm s3://YOUR-REPORTS-BUCKET --recursive

# Remove serverless stack
serverless remove
```

## 📚 Technologies Used

### Backend
- Node.js 18
- AWS SDK v3
- Serverless Framework
- UUID

### Frontend
- React 18
- Recharts
- Axios
- Amazon Cognito Identity SDK
- date-fns

### AWS Services
- Lambda
- DynamoDB
- S3
- API Gateway
- Cognito
- CloudWatch

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize!

## 📄 License

MIT License

## 🎯 Future Enhancements

- Budget setting and alerts
- Recurring expenses
- Multi-currency support
- Receipt image upload
- Shared expenses with family/friends
- Mobile app (React Native)
- Email notifications
- Advanced filtering and search
- Export to Excel
- Data import from bank statements

## 📞 Support

For issues:
1. Check CloudWatch logs
2. Verify AWS resources are created
3. Check browser console for frontend errors
4. Review API responses

---

**Built with ❤️ using AWS Serverless Architecture**

*Track smarter, spend wiser!* 💰
