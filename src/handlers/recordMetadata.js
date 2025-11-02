const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    // Get userId from Cognito authorizer context
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const userEmail = event.requestContext.authorizer.jwt.claims.email || 'unknown';

    // Parse request body
    const body = JSON.parse(event.body);
    const { fileId, fileName, fileType, fileSize, key, tag } = body;

    // Validation
    if (!fileId || !fileName || !fileType || !fileSize || !key) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing required fields: fileId, fileName, fileType, fileSize, key'
        })
      };
    }

    // Create metadata item
    const timestamp = new Date().toISOString();
    const item = {
      fileId,
      userId,
      userEmail,
      fileName,
      fileType,
      fileSize,
      key,
      tag: tag || 'untagged',
      uploadedAt: timestamp,
      updatedAt: timestamp,
      shared: false
    };

    // Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.FILES_TABLE,
      Item: item
    }));

    console.log(`Recorded metadata for file ${fileId} by user ${userId}`);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'File metadata recorded successfully',
        file: item
      })
    };
  } catch (error) {
    console.error('Error recording metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to record file metadata',
        message: error.message
      })
    };
  }
};
