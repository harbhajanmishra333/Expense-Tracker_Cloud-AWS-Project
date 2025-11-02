# Testing Guide

Comprehensive testing guide for the Serverless Cloud Storage Application.

## Table of Contents

1. [Pre-Deployment Testing](#pre-deployment-testing)
2. [Post-Deployment Testing](#post-deployment-testing)
3. [Functional Testing](#functional-testing)
4. [Security Testing](#security-testing)
5. [Performance Testing](#performance-testing)
6. [Error Handling Testing](#error-handling-testing)

---

## Pre-Deployment Testing

### Validate Configuration

**Check serverless.yml syntax**:
```bash
serverless print
```

**Validate AWS credentials**:
```bash
aws sts get-caller-identity
```

**Check Node.js version**:
```bash
node --version  # Should be v18 or higher
```

---

## Post-Deployment Testing

### Verify AWS Resources

**1. Check Lambda Functions**:
```bash
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `serverless-cloud-storage`)].FunctionName'
```

Expected output: 7 functions
- getUploadUrl
- recordMetadata
- listFiles
- deleteFile
- renameFile
- shareFile
- searchFiles

**2. Check S3 Bucket**:
```bash
aws s3 ls | grep serverless-cloud-storage
```

**3. Check DynamoDB Table**:
```bash
aws dynamodb describe-table --table-name serverless-cloud-storage-files-dev
```

**4. Check Cognito User Pool**:
```bash
aws cognito-idp list-user-pools --max-results 10
```

**5. Check API Gateway**:
```bash
aws apigatewayv2 get-apis --query 'Items[?starts_with(Name, `dev-serverless-cloud-storage`)].ApiEndpoint'
```

---

## Functional Testing

### Test 1: User Registration

**Steps**:
1. Open application in browser
2. Click "Sign Up"
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPass123!"
4. Click "Sign Up"

**Expected Result**:
- Success message appears
- Email verification sent (check inbox/spam)
- Form switches to Sign In

**Verify in AWS**:
```bash
aws cognito-idp list-users --user-pool-id YOUR_USER_POOL_ID
```

---

### Test 2: User Login

**Steps**:
1. Enter registered email and password
2. Click "Sign In"

**Expected Result**:
- Redirected to main application
- User email displayed in header
- Files section visible

**Verify**:
- Check browser console for JWT token
- No errors in console

---

### Test 3: File Upload

**Test 3a: Valid File Upload**

**Steps**:
1. Click "Select File"
2. Choose a PDF file (< 100MB)
3. Enter tag: "documents"
4. Click "Upload"

**Expected Result**:
- Progress bar appears
- Success message: "File uploaded successfully!"
- File appears in file list
- Shows correct filename, tag, size, date

**Verify in AWS**:
```bash
# Check S3
aws s3 ls s3://YOUR-BUCKET-NAME --recursive

# Check DynamoDB
aws dynamodb scan --table-name serverless-cloud-storage-files-dev
```

**Test 3b: File Size Validation**

**Steps**:
1. Try to upload file > 100MB

**Expected Result**:
- Error message: "File size exceeds 100MB limit"
- Upload blocked

**Test 3c: File Type Validation**

**Steps**:
1. Try to upload .exe or other disallowed file type

**Expected Result**:
- Error message: "File type not allowed"
- Upload blocked

---

### Test 4: List Files

**Steps**:
1. After uploading files, check file list

**Expected Result**:
- All uploaded files displayed
- Each file shows:
  - Filename
  - Tag
  - Size (formatted)
  - Upload date/time
  - Action buttons (Download, Rename, Share, Delete)

**Verify**:
```bash
# Check CloudWatch logs
serverless logs -f listFiles
```

---

### Test 5: Download File

**Steps**:
1. Click "Download" on any file

**Expected Result**:
- File downloads to computer
- Downloaded file is identical to uploaded file
- No errors

**Verify**:
- Compare file checksums:
```bash
# Original file
md5sum original_file.pdf

# Downloaded file
md5sum downloaded_file.pdf
```

---

### Test 6: Rename File

**Steps**:
1. Click "Rename" on a file
2. Enter new name: "Updated Document.pdf"
3. Click "Rename"

**Expected Result**:
- Modal closes
- Success message appears
- File list refreshes
- Filename updated in list

**Verify in DynamoDB**:
```bash
aws dynamodb scan --table-name serverless-cloud-storage-files-dev
```

---

### Test 7: Share File

**Steps**:
1. Click "Share" on a file
2. Copy the generated link
3. Open link in incognito/private browser window

**Expected Result**:
- Shareable link generated
- Link displayed in modal
- File downloads when link is opened
- No authentication required for download
- Link expires after 24 hours

**Verify**:
- Check link format (should be presigned S3 URL)
- Test link expiration after 24 hours

---

### Test 8: Search Files

**Test 8a: Search by Filename**

**Steps**:
1. Enter partial filename in search box
2. Click "Search"

**Expected Result**:
- Only matching files displayed
- Count shows correct number

**Test 8b: Filter by Tag**

**Steps**:
1. Enter tag in tag filter box
2. Click "Search"

**Expected Result**:
- Only files with that tag displayed

**Test 8c: Combined Search**

**Steps**:
1. Enter both search term and tag
2. Click "Search"

**Expected Result**:
- Files matching both criteria displayed

**Test 8d: Clear Search**

**Steps**:
1. Click "Clear"

**Expected Result**:
- All files displayed again
- Search inputs cleared

---

### Test 9: Delete File

**Steps**:
1. Click "Delete" on a file
2. Confirm deletion

**Expected Result**:
- Confirmation dialog appears
- After confirming:
  - Success message appears
  - File removed from list
  - File deleted from S3
  - Metadata deleted from DynamoDB

**Verify in AWS**:
```bash
# Check S3
aws s3 ls s3://YOUR-BUCKET-NAME --recursive

# Check DynamoDB
aws dynamodb scan --table-name serverless-cloud-storage-files-dev
```

---

### Test 10: Logout

**Steps**:
1. Click "Logout" button

**Expected Result**:
- Redirected to login page
- Session cleared
- Cannot access files without logging in again

---

## Security Testing

### Test 11: Authentication Required

**Steps**:
1. Try to access API endpoints without token:
```bash
curl https://YOUR-API-ENDPOINT/files
```

**Expected Result**:
- 401 Unauthorized error
- Access denied

---

### Test 12: Authorization (Ownership)

**Steps**:
1. Create two users
2. User A uploads a file
3. Get fileId from DynamoDB
4. User B tries to delete User A's file

**Expected Result**:
- 403 Forbidden error
- File not deleted
- Error message: "You do not have permission..."

**Test with curl**:
```bash
# Get User B's token
TOKEN_B="USER_B_JWT_TOKEN"

# Try to delete User A's file
curl -X DELETE \
  -H "Authorization: $TOKEN_B" \
  https://YOUR-API-ENDPOINT/files/USER_A_FILE_ID
```

---

### Test 13: Password Policy

**Steps**:
1. Try to sign up with weak passwords:
   - "password" (no uppercase, number, symbol)
   - "Pass1" (too short)
   - "password123" (no uppercase, symbol)

**Expected Result**:
- Error message for each
- Account not created

---

### Test 14: SQL Injection Prevention

**Steps**:
1. Try to upload file with malicious filename:
   - `"; DROP TABLE files; --`
   - `<script>alert('xss')</script>`

**Expected Result**:
- File uploaded normally
- Filename stored as-is (escaped)
- No code execution

---

### Test 15: File Upload Security

**Steps**:
1. Try to upload file with manipulated Content-Type
2. Try to upload file larger than 100MB by modifying request

**Expected Result**:
- Backend validation catches it
- Upload rejected
- Error message returned

---

## Performance Testing

### Test 16: Upload Speed

**Steps**:
1. Upload files of various sizes:
   - 1MB file
   - 10MB file
   - 50MB file
   - 100MB file

**Measure**:
- Time to get presigned URL
- Time to upload to S3
- Time to save metadata
- Total time

**Expected**:
- Presigned URL: < 1 second
- Upload time: Depends on connection
- Metadata save: < 1 second

---

### Test 17: List Performance

**Steps**:
1. Upload 100 files
2. Measure time to list all files

**Expected**:
- List operation: < 2 seconds
- All files displayed
- Download URLs generated

**Check with**:
```bash
# Measure Lambda execution time
serverless logs -f listFiles
```

---

### Test 18: Concurrent Users

**Steps**:
1. Simulate multiple users uploading simultaneously
2. Use tools like Apache Bench or Artillery

**Example with curl**:
```bash
# Run 10 concurrent uploads
for i in {1..10}; do
  (curl -X POST \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"fileName":"test'$i'.pdf","fileType":"application/pdf","fileSize":1000}' \
    https://YOUR-API-ENDPOINT/get-upload-url) &
done
wait
```

**Expected**:
- All requests succeed
- No rate limiting errors
- No conflicts

---

### Test 19: Search Performance

**Steps**:
1. Upload 100 files with various tags
2. Perform search operations
3. Measure response time

**Expected**:
- Search completes in < 2 seconds
- Results accurate
- No timeouts

---

## Error Handling Testing

### Test 20: Network Errors

**Steps**:
1. Disconnect internet during upload
2. Reconnect and try again

**Expected Result**:
- Error message displayed
- User can retry
- No partial uploads

---

### Test 21: Invalid File ID

**Steps**:
```bash
curl -X DELETE \
  -H "Authorization: $TOKEN" \
  https://YOUR-API-ENDPOINT/files/invalid-file-id-12345
```

**Expected Result**:
- 404 Not Found
- Error message: "File not found"

---

### Test 22: Expired Token

**Steps**:
1. Get JWT token
2. Wait for token to expire (default 1 hour)
3. Try to access API

**Expected Result**:
- 401 Unauthorized
- User redirected to login

---

### Test 23: Missing Required Fields

**Steps**:
```bash
# Upload without fileName
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileType":"application/pdf","fileSize":1000}' \
  https://YOUR-API-ENDPOINT/get-upload-url
```

**Expected Result**:
- 400 Bad Request
- Error message: "Missing required fields..."

---

### Test 24: S3 Bucket Full

**Steps**:
1. Set S3 bucket quota (if possible)
2. Try to upload when quota reached

**Expected Result**:
- Error message
- Upload fails gracefully

---

### Test 25: DynamoDB Errors

**Steps**:
1. Temporarily remove DynamoDB permissions
2. Try to upload file

**Expected Result**:
- Error logged in CloudWatch
- User-friendly error message
- No data corruption

---

## Automated Testing Script

Create a test script to automate common tests:

```bash
#!/bin/bash

# test.sh - Automated testing script

API_ENDPOINT="YOUR_API_ENDPOINT"
TOKEN="YOUR_JWT_TOKEN"

echo "Testing API endpoints..."

# Test 1: List files
echo "Test 1: List files"
curl -s -H "Authorization: $TOKEN" "$API_ENDPOINT/files" | jq .

# Test 2: Get upload URL
echo "Test 2: Get upload URL"
curl -s -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf","fileSize":1000}' \
  "$API_ENDPOINT/get-upload-url" | jq .

# Test 3: Search files
echo "Test 3: Search files"
curl -s -H "Authorization: $TOKEN" "$API_ENDPOINT/files/search?q=test" | jq .

echo "All tests completed!"
```

---

## CloudWatch Monitoring

### Check Lambda Metrics

```bash
# Invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=serverless-cloud-storage-dev-listFiles \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Errors
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=serverless-cloud-storage-dev-listFiles \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Duration
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=serverless-cloud-storage-dev-listFiles \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

---

## Test Checklist

### Pre-Launch Checklist

- [ ] All Lambda functions deployed
- [ ] S3 bucket created with CORS
- [ ] DynamoDB table created with GSI
- [ ] Cognito User Pool configured
- [ ] API Gateway endpoints working
- [ ] Frontend configured with correct values
- [ ] CloudWatch logging enabled
- [ ] IAM roles have correct permissions

### Functional Tests

- [ ] User can sign up
- [ ] User can sign in
- [ ] User can upload files
- [ ] File size validation works
- [ ] File type validation works
- [ ] User can list files
- [ ] User can download files
- [ ] User can rename files
- [ ] User can search files
- [ ] User can share files
- [ ] User can delete files
- [ ] User can logout

### Security Tests

- [ ] Authentication required for all endpoints
- [ ] Users can only access own files
- [ ] Password policy enforced
- [ ] XSS prevention works
- [ ] Presigned URLs expire correctly

### Performance Tests

- [ ] Upload completes in reasonable time
- [ ] List files loads quickly
- [ ] Search returns results quickly
- [ ] Multiple concurrent users supported

### Error Handling Tests

- [ ] Invalid inputs handled gracefully
- [ ] Network errors handled
- [ ] Missing files return 404
- [ ] Unauthorized access returns 403
- [ ] Expired tokens handled

---

## Reporting Issues

When reporting issues, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **CloudWatch logs**:
   ```bash
   serverless logs -f FUNCTION_NAME --startTime 10m
   ```
5. **Browser console errors** (if frontend issue)
6. **Network tab** (if API issue)

---

## Success Criteria

The application passes testing if:

✅ All 25 functional tests pass
✅ No security vulnerabilities found
✅ Performance meets expectations
✅ Error handling is graceful
✅ CloudWatch shows no errors
✅ All AWS resources created correctly

---

**Happy Testing!** 🧪
