# Simple script to get Cognito configuration

Write-Host "Getting Cognito User Pool details..." -ForegroundColor Cyan
Write-Host ""

# Get CloudFormation stack outputs
$outputs = aws cloudformation describe-stacks --stack-name expense-tracker-dev --query "Stacks[0].Outputs" 2>$null | ConvertFrom-Json

if ($outputs) {
    foreach ($output in $outputs) {
        if ($output.OutputKey -eq "UserPoolId") {
            $userPoolId = $output.OutputValue
            Write-Host "User Pool ID: $userPoolId" -ForegroundColor Green
        }
        if ($output.OutputKey -eq "UserPoolClientId") {
            $clientId = $output.OutputValue
            Write-Host "Client ID: $clientId" -ForegroundColor Green
        }
    }
    
    if ($userPoolId -and $clientId) {
        Write-Host ""
        Write-Host "Copy these values to frontend/src/config-auth.js:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "userPoolId: '$userPoolId'" -ForegroundColor White
        Write-Host "clientId: '$clientId'" -ForegroundColor White
    }
} else {
    Write-Host "Could not get stack outputs. Trying alternative method..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run these commands manually:" -ForegroundColor Cyan
    Write-Host "1. aws cognito-idp list-user-pools --max-results 10" -ForegroundColor White
    Write-Host "2. Find the pool with 'expense-tracker' in the name" -ForegroundColor White
    Write-Host "3. Copy the Id (looks like us-east-1_ABC123XYZ)" -ForegroundColor White
    Write-Host "4. aws cognito-idp list-user-pool-clients --user-pool-id YOUR_POOL_ID" -ForegroundColor White
    Write-Host "5. Copy the ClientId" -ForegroundColor White
}
