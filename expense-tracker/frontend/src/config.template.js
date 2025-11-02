// Configuration file for AWS services
// After deployment, copy this to config.js and fill in the values

const config = {
  cognito: {
    userPoolId: 'YOUR_USER_POOL_ID',        // From serverless deploy output
    clientId: 'YOUR_CLIENT_ID',              // From serverless deploy output
    region: 'us-east-1'                      // Your AWS region
  },
  api: {
    endpoint: 'YOUR_API_ENDPOINT'            // From serverless deploy output
  }
};

export default config;
