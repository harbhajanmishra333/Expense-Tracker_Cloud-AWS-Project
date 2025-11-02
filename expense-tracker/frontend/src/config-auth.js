// Configuration with authentication
// Get these values from: serverless info --verbose

const config = {
  cognito: {
    userPoolId: 'REPLACE_WITH_USER_POOL_ID',     // From serverless output
    clientId: 'REPLACE_WITH_CLIENT_ID',           // From serverless output
    region: 'us-east-1'
  },
  api: {
    endpoint: 'https://dxrdjqrw54.execute-api.us-east-1.amazonaws.com',
    useAuth: true
  }
};

export default config;
