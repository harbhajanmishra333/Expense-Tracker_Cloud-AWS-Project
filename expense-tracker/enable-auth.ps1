# PowerShell script to enable authentication

Write-Host "🔐 Enabling Authentication for Expense Tracker" -ForegroundColor Cyan
Write-Host "=" * 50

# Step 1: Get Cognito details
Write-Host "`n📋 Step 1: Getting Cognito details..." -ForegroundColor Yellow
& .\get-cognito-details.ps1

# Step 2: Update index.js to use authenticated version
Write-Host "`n📝 Step 2: Switching to authenticated version..." -ForegroundColor Yellow
$indexPath = "frontend\src\index.js"
$indexContent = Get-Content $indexPath -Raw
$indexContent = $indexContent -replace "import App from './AppNoAuth';", "import App from './AppWithAuth';"
Set-Content $indexPath $indexContent
Write-Host "✓ Updated index.js to use authentication" -ForegroundColor Green

# Step 3: Instructions
Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test locally:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy to web:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host "   # Then deploy to Netlify, Vercel, or S3" -ForegroundColor Gray
Write-Host ""
Write-Host "3. See SETUP_AUTH.md for detailed deployment instructions" -ForegroundColor White
Write-Host ""
Write-Host "✨ Authentication enabled! Users can now sign up and track their own expenses." -ForegroundColor Green
