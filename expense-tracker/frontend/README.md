# Expense Tracker Frontend

Beautiful, modern React frontend for the Expense Tracker application.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm start
```

Opens at: http://localhost:3000

### Build for Production
```bash
npm run build
```

## ✨ Features

- ✅ **Add Expenses** - Quick form to add new expenses
- ✅ **View Expenses** - Beautiful list with all your expenses
- ✅ **Edit Expenses** - Inline editing
- ✅ **Delete Expenses** - One-click deletion
- ✅ **Summary Cards** - Total spending, count, and average
- ✅ **Category Breakdown** - Visual breakdown by category
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Real-time Updates** - Instant feedback
- ✅ **Modern UI** - Beautiful gradients and animations

## 🎨 Design

- **Color Scheme**: Purple gradient theme
- **Typography**: System fonts for best performance
- **Icons**: Emoji-based for universal support
- **Layout**: Grid-based responsive design

## 📦 Dependencies

- **react** - UI framework
- **axios** - HTTP client
- **date-fns** - Date formatting

## 🔧 Configuration

The app uses `config-noauth.js` which connects to your AWS backend without authentication.

API Endpoint: `https://dxrdjqrw54.execute-api.us-east-1.amazonaws.com`

## 📱 Pages

### Main Dashboard
- Summary cards showing total spending, expense count, and average
- Category breakdown with visual bars
- Add expense form (sticky sidebar)
- Expense list with edit/delete actions

## 🎯 Usage

1. **Add Expense**: Fill the form and click "Add Expense"
2. **View Expenses**: Scroll through the list
3. **Edit Expense**: Click the ✏️ icon, make changes, click Save
4. **Delete Expense**: Click the 🗑️ icon and confirm

## 🌐 Deployment

### Option 1: Netlify
```bash
npm run build
# Drag and drop the build folder to Netlify
```

### Option 2: Vercel
```bash
npm run build
vercel --prod
```

### Option 3: AWS S3 + CloudFront
```bash
npm run build
aws s3 sync build/ s3://your-bucket-name
```

## 🐛 Troubleshooting

### "Failed to fetch"
- Check that backend is deployed
- Verify API endpoint in `config-noauth.js`
- Check browser console for CORS errors

### Expenses not loading
- Open browser DevTools → Network tab
- Check if API calls are successful
- Verify backend is running

## 📄 License

MIT
