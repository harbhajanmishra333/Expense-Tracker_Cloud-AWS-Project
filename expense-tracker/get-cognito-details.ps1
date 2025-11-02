# PowerShell script to get Cognito details from AWS

Write-Host "Getting Cognito User Pool details..." -ForegroundColor Cyan

# Get User Pool ID
$userPools = aws cognito-idp list-user-pools --max-results 10 | ConvertFrom-Json
$expenseTrackerPool = $userPools.UserPools | Where-Object { $_.Name -like "*expense-tracker*" }

if ($expenseTrackerPool) {
    $userPoolId = $expenseTrackerPool.Id
    Write-Host "`nUser Pool ID: $userPoolId" -ForegroundColor Green
    
    # Get Client ID
    $clients = aws cognito-idp list-user-pool-clients --user-pool-id $userPoolId | ConvertFrom-Json
    $clientId = $clients.UserPoolClients[0].ClientId
    Write-Host "Client ID: $clientId" -ForegroundColor Green
    
    # Update config file
    $configPath = "frontend\src\config-auth.js"
    $config = Get-Content $configPath -Raw
    $config = $config -replace "REPLACE_WITH_USER_POOL_ID", $userPoolId
    $config = $config -replace "REPLACE_WITH_CLIENT_ID", $clientId
    Set-Content $configPath $config
    
    Write-Host "`n✓ Config file updated!" -ForegroundColor Green
    Write-Host "`nYour Cognito details:" -ForegroundColor Cyan
    Write-Host "User Pool ID: $userPoolId"
    Write-Host "Client ID: $clientId"
    Write-Host "Region: us-east-1"
} else {
    Write-Host "`n✗ No expense-tracker user pool found" -ForegroundColor Red
    Write-Host "Make sure you've deployed the backend with: serverless deploy"
}
