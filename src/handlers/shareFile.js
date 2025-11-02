const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    // Get userId from Cognito authorizer context
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const fileId = event.pathParameters.fileId;

    // Parse request body for expiration time (optional)
    let expiresIn = 86400; // Default 24 hours
    if (event.body) {
      const body = JSON.parse(event.body);
      if (body.expiresIn) {
        expiresIn = Math.min(body.expiresIn, 604800); // Max 7 days
      }
    }

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
          error: 'You do not have permission to share this file'
        })
      };
    }

    // Generate shareable presigned URL
    const command = new GetObjectCommand({
      Bucket: process.env.FILES_BUCKET,
      Key: getResult.Item.key
    });

    const shareableUrl = await getSignedUrl(s3Client, command, { expiresIn });

    // Update shared status in DynamoDB
    await docClient.send(new UpdateCommand({
      TableName: process.env.FILES_TABLE,
      Key: { fileId },
      UpdateExpression: 'SET shared = :shared, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':shared': true,
        ':updatedAt': new Date().toISOString()
      }
    }));

    console.log(`Generated shareable link for file ${fileId} by user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Shareable link generated successfully',
        shareableUrl,
        expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      })
    };
  } catch (error) {
    console.error('Error generating shareable link:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to generate shareable link',
        message: error.message
      })
    };
  }
};
