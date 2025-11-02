const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    // Get userId from Cognito authorizer context
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const fileId = event.pathParameters.fileId;

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

    // Get file metadata from DynamoDB
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
          error: 'You do not have permission to delete this file'
        })
      };
    }

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.FILES_BUCKET,
      Key: getResult.Item.key
    }));

    // Delete from DynamoDB
    await docClient.send(new DeleteCommand({
      TableName: process.env.FILES_TABLE,
      Key: { fileId }
    }));

    console.log(`Deleted file ${fileId} for user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'File deleted successfully',
        fileId
      })
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to delete file',
        message: error.message
      })
    };
  }
};
