// Simple test endpoint without authentication
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      method: event.requestContext.http.method,
      path: event.requestContext.http.path
    })
  };
};
