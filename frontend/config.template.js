// Configuration file for AWS Cognito and API Gateway
// After deployment, copy this file to config.js and fill in the values from serverless deployment output

const CONFIG = {
    // Get these values from: serverless deploy output
    cognito: {
        userPoolId: 'YOUR_USER_POOL_ID',           // e.g., us-east-1_xxxxxxxxx
        clientId: 'YOUR_CLIENT_ID',                 // e.g., 1a2b3c4d5e6f7g8h9i0j1k2l3m
        region: 'us-east-1'                         // Your AWS region
    },
    api: {
        endpoint: 'YOUR_API_ENDPOINT'               // e.g., https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
    }
};
