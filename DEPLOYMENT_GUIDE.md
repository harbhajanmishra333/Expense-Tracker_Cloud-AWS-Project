# Deployment Guide - Step by Step

This guide walks you through deploying the Serverless Cloud Storage Application following the 20 steps outlined in the project requirements.

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed
- [ ] Node.js (v18+) installed
- [ ] Serverless Framework installed globally
- [ ] Git installed (optional)

---

## Step 1: Account & CLI Setup

### Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add payment method (required even for free tier)

### Install AWS CLI

**Windows**:
```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

**macOS**:
```bash
brew install awscli
```

**Linux**:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Configure AWS CLI
```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format: `json`

**To get Access Keys**:
1. Go to AWS Console → IAM
2. Click your username → Security credentials
3. Create access key → CLI
4. Download and save securely

---

## Step 2: Admin & Role Creation (IAM)

### Create IAM Admin User

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. Username: `cloud-storage-admin`
4. Enable "Provide user access to AWS Management Console"
5. Attach policy: `AdministratorAccess`
6. Create user

### Note on Roles
The Serverless Framework will automatically create the Lambda execution role with proper permissions defined in `serverless.yml`. No manual role creation needed!

---

## Step 3-6: Automated by Serverless Framework

Steps 3-6 (S3 Bucket, DynamoDB Table, Cognito User Pool, Lambda Execution Role) are all defined in `serverless.yml` and will be created automatically during deployment.

---

## Step 7: Local Project Initialization

### Clone or Navigate to Project
```bash
cd "e:/cloud project final"
```

### Install Dependencies
```bash
npm install
```

This installs:
- AWS SDK v3 packages
- Serverless Framework
- UUID generator

---

## Steps 8-11: Lambda Functions & API Gateway

All Lambda functions are already implemented in `src/handlers/`:
- ✅ `getUploadUrl.js` - Generate presigned upload URLs
- ✅ `recordMetadata.js` - Save file metadata
- ✅ `listFiles.js` - List user files
- ✅ `deleteFile.js` - Delete files
- ✅ `renameFile.js` - Rename files
- ✅ `shareFile.js` - Generate shareable links
- ✅ `searchFiles.js` - Search files

API Gateway routes are defined in `serverless.yml` with Cognito authorizer.

---

## Step 12: Backend Deployment

### Deploy the Stack

```bash
serverless deploy
```

**What happens**:
1. Packages Lambda functions
2. Creates CloudFormation stack
3. Creates S3 bucket with versioning and CORS
4. Creates DynamoDB table with GSI
5. Creates Cognito User Pool and App Client
6. Deploys Lambda functions
7. Creates API Gateway HTTP API
8. Sets up Cognito authorizer
9. Configures IAM roles and permissions
10. Sets up CloudWatch logs and alarms

**Deployment takes 3-5 minutes**

### Save the Output

After deployment, you'll see output like:
```
endpoints:
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com

Stack Outputs:
  ApiEndpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
  UserPoolId: us-east-1_xxxxxxxxx
  UserPoolClientId: 1a2b3c4d5e6f7g8h9i0j1k2l3m
  FilesBucketName: serverless-cloud-storage-uploads-dev-123456789
  FilesTableName: serverless-cloud-storage-files-dev
```

**IMPORTANT**: Copy these values! You'll need them for frontend configuration.

### Verify Deployment

```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `serverless-cloud-storage`)].FunctionName'

# Check S3 bucket
aws s3 ls | grep serverless-cloud-storage

# Check DynamoDB table
aws dynamodb list-tables --query 'TableNames[?starts_with(@, `serverless-cloud-storage`)]'

# Check Cognito User Pool
aws cognito-idp list-user-pools --max-results 10
```

---

## Step 13: Frontend Implementation

Frontend files are already created in `frontend/` directory:
- ✅ `index.html` - User interface
- ✅ `style.css` - Styling
- ✅ `script.js` - Application logic
- ✅ `config.template.js` - Configuration template

### Configure Frontend

1. **Copy configuration template**:
   ```bash
   cp frontend/config.template.js frontend/config.js
   ```

2. **Edit `frontend/config.js`** with deployment output values:
   ```javascript
   const CONFIG = {
       cognito: {
           userPoolId: 'us-east-1_xxxxxxxxx',     // From Stack Outputs
           clientId: '1a2b3c4d5e6f7g8h9i0j1k2l3m', // From Stack Outputs
           region: 'us-east-1'                     // Your AWS region
       },
       api: {
           endpoint: 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com' // From Stack Outputs
       }
   };
   ```

3. **Serve the frontend**:

   **Option A - Python**:
   ```bash
   cd frontend
   python -m http.server 8000
   ```

   **Option B - Node.js**:
   ```bash
   npx http-server frontend -p 8000
   ```

   **Option C - Just open the file**:
   - Open `frontend/index.html` directly in browser
   - Note: Some browsers may block CORS for local files

4. **Access the application**:
   - Navigate to `http://localhost:8000`

---

## Step 14: End-to-End Testing

### Test Workflow

1. **Sign Up**:
   - Open the application
   - Click "Sign Up"
   - Enter name, email, and password
   - Password must meet requirements:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
     - At least one special character
   - Click "Sign Up"
   - Check email for verification (if auto-verify is disabled)

2. **Sign In**:
   - Click "Sign In" (or toggle from Sign Up)
   - Enter email and password
   - Click "Sign In"
   - You should see the main application interface

3. **Upload a File**:
   - Click "Select File"
   - Choose a file (max 100MB)
   - Add a tag (e.g., "test")
   - Click "Upload"
   - Watch progress bar
   - File should appear in the list

4. **View File List**:
   - Uploaded file should be visible
   - Shows filename, tag, size, and upload date

5. **Download File**:
   - Click "Download" button
   - File should download to your computer

6. **Rename File**:
   - Click "Rename" button
   - Enter new filename
   - Click "Rename"
   - Filename should update in the list

7. **Search Files**:
   - Enter search term in search box
   - Or enter tag in tag filter
   - Click "Search"
   - Results should filter accordingly
   - Click "Clear" to show all files

8. **Share File**:
   - Click "Share" button
   - Copy the generated link
   - Open link in new browser tab (no login required)
   - File should download
   - Link expires after 24 hours

9. **Delete File**:
   - Click "Delete" button
   - Confirm deletion
   - File should disappear from list

### Verify Backend

**Check CloudWatch Logs**:
```bash
# View logs for specific function
serverless logs -f getUploadUrl -t

# View logs for all functions
serverless logs -f listFiles -t
serverless logs -f recordMetadata -t
```

**Check DynamoDB**:
```bash
# Scan table (shows all items)
aws dynamodb scan --table-name serverless-cloud-storage-files-dev
```

**Check S3**:
```bash
# List files in bucket
aws s3 ls s3://YOUR-BUCKET-NAME --recursive
```

---

## Step 15: Generate Download URLs

✅ Already implemented in `listFiles.js` Lambda function. Download URLs are automatically generated with 1-hour expiration when listing files.

---

## Step 16: Add Validation

✅ Validation is already implemented:

**Frontend Validation** (`script.js`):
- File size check (max 100MB)
- File type check (allowed types only)
- Required field validation

**Backend Validation** (`getUploadUrl.js`):
- File size validation
- File type validation
- Required field validation
- Returns appropriate error messages

---

## Step 17: Implement Authentication

✅ Authentication is already implemented:

**Cognito Authorizer**:
- Configured in `serverless.yml`
- Attached to all API endpoints
- Validates JWT tokens

**Lambda Functions**:
- Extract `userId` from JWT claims
- Verify ownership before operations
- Return 403 for unauthorized access

---

## Step 18: Add Monitoring

✅ Monitoring is already configured:

**CloudWatch Logs**:
- Automatic logging for all Lambda functions
- Retention period: default (never expire)

**CloudWatch Alarm**:
- Configured in `serverless.yml`
- Alerts when Lambda errors > 5 in 5 minutes
- Metric: `AWS/Lambda` Errors

**View Metrics**:
```bash
# View Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=serverless-cloud-storage-dev-getUploadUrl \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-12-31T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

**AWS Console**:
1. Go to CloudWatch → Logs
2. Find log groups: `/aws/lambda/serverless-cloud-storage-*`
3. View function logs

---

## Step 19: Cleanup

### When to Clean Up
- After project presentation
- When no longer needed
- To avoid AWS charges

### Cleanup Steps

**1. Empty S3 Bucket**:
```bash
# Get bucket name from deployment output
aws s3 rm s3://YOUR-BUCKET-NAME --recursive
```

**2. Remove Serverless Stack**:
```bash
serverless remove
```

This deletes:
- All Lambda functions
- API Gateway
- DynamoDB table
- S3 bucket (if empty)
- IAM roles
- CloudWatch log groups
- CloudWatch alarms

**3. Manual Cleanup (if needed)**:

If resources remain:

```bash
# Delete Cognito User Pool
aws cognito-idp delete-user-pool --user-pool-id YOUR-USER-POOL-ID

# Verify S3 buckets deleted
aws s3 ls

# Verify DynamoDB tables deleted
aws dynamodb list-tables

# Check IAM roles
aws iam list-roles --query 'Roles[?starts_with(RoleName, `serverless-cloud-storage`)].RoleName'
```

**4. Verify Cleanup**:
- Go to AWS Console
- Check each service (Lambda, S3, DynamoDB, API Gateway, Cognito)
- Ensure no resources remain

---

## Troubleshooting

### Deployment Issues

**Issue**: `AWS credentials not found`
```bash
# Solution: Configure AWS CLI
aws configure
```

**Issue**: `Insufficient permissions`
```bash
# Solution: Ensure IAM user has AdministratorAccess or required permissions
```

**Issue**: `Stack already exists`
```bash
# Solution: Remove existing stack first
serverless remove
```

### Runtime Issues

**Issue**: CORS errors in browser
- Verify API endpoint in `config.js`
- Check CORS configuration in `serverless.yml`
- Ensure using correct HTTP methods

**Issue**: Authentication fails
- Verify Cognito User Pool ID and Client ID
- Check user is verified (check email)
- Ensure password meets requirements

**Issue**: File upload fails
- Check file size (max 100MB)
- Verify file type is allowed
- Check CloudWatch logs for errors

**Issue**: Files not appearing
- Check DynamoDB table has items
- Verify userId in JWT matches
- Check CloudWatch logs for errors

### Debugging Commands

```bash
# Test Lambda function locally
serverless invoke local -f getUploadUrl

# View recent logs
serverless logs -f listFiles --startTime 5m

# Check function info
serverless info

# Validate serverless.yml
serverless print

# Check AWS resources
aws cloudformation describe-stacks --stack-name serverless-cloud-storage-dev
```

---

## Cost Estimation

### Free Tier (First 12 months)
- Lambda: 1M requests/month, 400,000 GB-seconds compute
- S3: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- DynamoDB: 25GB storage, 25 WCU, 25 RCU
- API Gateway: 1M requests/month
- Cognito: 50,000 MAUs

### After Free Tier (Estimated)
- Lambda: ~$0.20 per 1M requests
- S3: ~$0.023 per GB/month
- DynamoDB: ~$0.25 per GB/month (on-demand)
- API Gateway: ~$1.00 per 1M requests
- Cognito: Free up to 50,000 MAUs

**Example**: 10,000 requests/month, 10GB storage = ~$0.50/month

---

## Next Steps

1. **Customize**: Modify UI, add features, adjust limits
2. **Secure**: Add custom domain, SSL certificate
3. **Scale**: Adjust Lambda memory, add caching
4. **Monitor**: Set up CloudWatch dashboards, SNS alerts
5. **Backup**: Enable S3 versioning, DynamoDB backups
6. **CI/CD**: Set up automated deployment pipeline

---

## Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

**Congratulations!** 🎉 You've successfully deployed a production-ready serverless cloud storage application!
