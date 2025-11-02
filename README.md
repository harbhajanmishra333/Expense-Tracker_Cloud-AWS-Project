# Serverless Cloud Storage Application

A fully serverless cloud storage application built with AWS Lambda, S3, DynamoDB, API Gateway, and Cognito.

## Features

- **User Authentication**: Sign up, sign in, and secure authentication with AWS Cognito
- **File Upload**: Upload files with tags (max 100MB)
- **File Management**: List, download, rename, and delete files
- **File Sharing**: Generate shareable links with expiration
- **Search**: Search files by name or filter by tags
- **Secure**: All operations are authenticated and authorized
- **Validation**: File size and type validation on both frontend and backend

## Architecture

### AWS Services Used

- **AWS Lambda**: Serverless compute for backend logic
- **Amazon S3**: Object storage for files with versioning enabled
- **Amazon DynamoDB**: NoSQL database for file metadata
- **Amazon API Gateway**: HTTP API endpoints with JWT authorization
- **Amazon Cognito**: User authentication and authorization
- **Amazon CloudWatch**: Logging and monitoring

### Project Structure

```
serverless-cloud-storage/
├── src/
│   └── handlers/
│       ├── getUploadUrl.js      # Generate presigned upload URLs
│       ├── recordMetadata.js    # Save file metadata
│       ├── listFiles.js         # List user's files
│       ├── deleteFile.js        # Delete files
│       ├── renameFile.js        # Rename files
│       ├── shareFile.js         # Generate shareable links
│       └── searchFiles.js       # Search files by name/tag
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── style.css                # Styling
│   ├── script.js                # Frontend logic
│   └── config.template.js       # Configuration template
├── serverless.yml               # Serverless Framework configuration
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## Prerequisites

1. **AWS Account**: Create an AWS account at https://aws.amazon.com
2. **AWS CLI**: Install and configure AWS CLI
   ```bash
   aws configure
   ```
3. **Node.js**: Install Node.js (v18 or later)
4. **Serverless Framework**: Install globally
   ```bash
   npm install -g serverless
   ```

## Installation & Deployment

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure AWS Region (Optional)

Edit `serverless.yml` and change the region if needed:
```yaml
provider:
  region: us-east-1  # Change to your preferred region
```

### Step 3: Deploy Backend

```bash
serverless deploy
```

This will:
- Create S3 bucket for file storage
- Create DynamoDB table for metadata
- Create Cognito User Pool and App Client
- Deploy all Lambda functions
- Create API Gateway endpoints
- Set up IAM roles and permissions
- Configure CloudWatch monitoring

**Important**: Save the deployment output! You'll need these values:
- `ApiEndpoint`
- `UserPoolId`
- `UserPoolClientId`

### Step 4: Configure Frontend

1. Copy the configuration template:
   ```bash
   cp frontend/config.template.js frontend/config.js
   ```

2. Edit `frontend/config.js` with values from deployment output:
   ```javascript
   const CONFIG = {
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

### Step 5: Run Frontend

Open `frontend/index.html` in a web browser, or serve it with a local server:

```bash
# Using Python
cd frontend
python -m http.server 8000

# Using Node.js http-server
npx http-server frontend -p 8000
```

Then navigate to `http://localhost:8000`

## Usage Guide

### 1. Sign Up

1. Open the application
2. Fill in name, email, and password
3. Click "Sign Up"
4. Check your email for verification code
5. Verify your account (if required by Cognito settings)

### 2. Sign In

1. Enter your email and password
2. Click "Sign In"

### 3. Upload Files

1. Click "Select File" and choose a file
2. Optionally add a tag (e.g., "work", "personal")
3. Click "Upload"
4. Wait for upload to complete

**Supported File Types**:
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, Word, Excel
- Text: TXT, CSV
- Archives: ZIP

**Maximum File Size**: 100MB

### 4. Manage Files

- **Download**: Click the "Download" button on any file
- **Rename**: Click "Rename", enter new name, and save
- **Share**: Click "Share" to generate a shareable link (valid 24 hours)
- **Delete**: Click "Delete" and confirm

### 5. Search Files

1. Enter search term in the search box (searches filename and tags)
2. Or filter by specific tag
3. Click "Search"
4. Click "Clear" to show all files again

## API Endpoints

All endpoints require JWT authentication via `Authorization` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/get-upload-url` | Get presigned URL for file upload |
| POST | `/files` | Record file metadata after upload |
| GET | `/files` | List all user's files |
| DELETE | `/files/{fileId}` | Delete a file |
| PATCH | `/files/{fileId}` | Rename a file |
| POST | `/files/{fileId}/share` | Generate shareable link |
| GET | `/files/search` | Search files by query or tag |

## Security Features

1. **Authentication**: All API endpoints require valid JWT tokens from Cognito
2. **Authorization**: Users can only access their own files
3. **Validation**: File size and type validation on both frontend and backend
4. **Presigned URLs**: Temporary, secure URLs for S3 operations
5. **Private S3 Bucket**: No public access to the storage bucket
6. **CORS**: Configured to allow only necessary origins
7. **Password Policy**: Strong password requirements enforced by Cognito

## Monitoring

### CloudWatch Logs

View Lambda function logs:
```bash
serverless logs -f getUploadUrl
serverless logs -f listFiles
# etc.
```

### CloudWatch Alarms

An alarm is configured to alert when Lambda functions have more than 5 errors in 5 minutes.

## Cost Optimization

This application uses serverless architecture with pay-per-use pricing:

- **Lambda**: Free tier includes 1M requests/month
- **S3**: Pay only for storage and data transfer
- **DynamoDB**: On-demand pricing (pay per request)
- **API Gateway**: Free tier includes 1M requests/month
- **Cognito**: Free tier includes 50,000 MAUs

## Cleanup

To avoid ongoing AWS charges, delete all resources when done:

### Step 1: Empty S3 Bucket

```bash
aws s3 rm s3://YOUR-BUCKET-NAME --recursive
```

### Step 2: Remove Serverless Stack

```bash
serverless remove
```

This will delete:
- All Lambda functions
- API Gateway
- DynamoDB table
- S3 bucket (if empty)
- IAM roles
- CloudWatch logs and alarms

### Step 3: Manual Cleanup (if needed)

If some resources remain:
1. Go to AWS Console
2. Delete Cognito User Pool manually
3. Verify S3 buckets are deleted
4. Check IAM roles are removed

## Troubleshooting

### Issue: "Failed to get upload URL"

- Check that you're signed in
- Verify API endpoint in `config.js`
- Check file size and type are valid

### Issue: "Failed to load files"

- Check CloudWatch logs for Lambda errors
- Verify DynamoDB table exists
- Check IAM permissions

### Issue: Email verification not received

- Check spam folder
- Verify email in Cognito User Pool settings
- Use AWS Console to manually verify user

### Issue: CORS errors

- Verify API endpoint URL is correct
- Check that CORS is enabled in `serverless.yml`
- Ensure you're using the correct HTTP methods

## Development

### Local Testing

You can test Lambda functions locally:

```bash
serverless invoke local -f getUploadUrl -d '{"body": "{\"fileName\":\"test.pdf\",\"fileType\":\"application/pdf\",\"fileSize\":1000}"}'
```

### Adding New Features

1. Create new Lambda handler in `src/handlers/`
2. Add function definition in `serverless.yml`
3. Add IAM permissions if needed
4. Deploy: `serverless deploy`

## Best Practices Implemented

1. **Least Privilege**: IAM roles have minimal required permissions
2. **Separation of Concerns**: Each Lambda function has a single responsibility
3. **Error Handling**: Comprehensive error handling and logging
4. **Validation**: Input validation on both frontend and backend
5. **Scalability**: Serverless architecture scales automatically
6. **Cost Efficiency**: Pay only for what you use
7. **Security**: Authentication, authorization, and encryption

## License

MIT License

## Support

For issues or questions:
1. Check CloudWatch logs for errors
2. Review AWS service quotas
3. Verify IAM permissions
4. Check serverless.yml configuration

---

**Note**: This is a demonstration project. For production use, consider:
- Adding automated tests
- Implementing CI/CD pipeline
- Adding more robust error handling
- Implementing rate limiting
- Adding file scanning for malware
- Using custom domain name
- Adding SSL certificate
- Implementing backup strategy
#   E x p e n s e - T r a c k e r _ C l o u d - A W S - P r o j e c t  
 