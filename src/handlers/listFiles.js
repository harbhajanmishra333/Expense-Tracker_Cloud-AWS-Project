const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    // Get userId from Cognito authorizer context
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    // Query DynamoDB using GSI on userId
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.FILES_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    // Generate download URLs for each file
    const filesWithUrls = await Promise.all(
      result.Items.map(async (file) => {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.FILES_BUCKET,
            Key: file.key
          });

          const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

          return {
            ...file,
            downloadUrl
          };
        } catch (error) {
          console.error(`Error generating download URL for file ${file.fileId}:`, error);
          return {
            ...file,
            downloadUrl: null,
            error: 'Failed to generate download URL'
          };
        }
      })
    );

    console.log(`Listed ${filesWithUrls.length} files for user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        files: filesWithUrls,
        count: filesWithUrls.length
      })
    };
  } catch (error) {
    console.error('Error listing files:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to list files',
        message: error.message
      })
    };
  }
};
