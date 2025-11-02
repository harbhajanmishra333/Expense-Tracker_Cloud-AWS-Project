const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    // Get userId from Cognito authorizer context
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const fileId = event.pathParameters.fileId;

    // Parse request body
    const body = JSON.parse(event.body);
    const { newFileName } = body;

    // Validation
    if (!fileId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing fileId parameter'
        })
      };
    }

    if (!newFileName || newFileName.trim() === '') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing or invalid newFileName'
        })
      };
    }

    // Get file metadata to verify ownership
    const getResult = await docClient.send(new GetCommand({
      TableName: process.env.FILES_TABLE,
      Key: { fileId }
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'File not found'
        })
      };
    }

    // Verify ownership
    if (getResult.Item.userId !== userId) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'You do not have permission to rename this file'
        })
      };
    }

    // Update file name in DynamoDB
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: process.env.FILES_TABLE,
      Key: { fileId },
      UpdateExpression: 'SET fileName = :newFileName, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':newFileName': newFileName.trim(),
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }));

    console.log(`Renamed file ${fileId} to ${newFileName} for user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'File renamed successfully',
        file: updateResult.Attributes
      })
    };
  } catch (error) {
    console.error('Error renaming file:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to rename file',
        message: error.message
      })
    };
  }
};
