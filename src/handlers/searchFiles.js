const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const queryParams = event.queryStringParameters || {};
    const searchTerm = queryParams.q || '';
    const tag = queryParams.tag || '';

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.FILES_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    let filteredFiles = result.Items;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredFiles = filteredFiles.filter(file => 
        file.fileName.toLowerCase().includes(lowerSearchTerm) ||
        (file.tag && file.tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (tag) {
      const lowerTag = tag.toLowerCase();
      filteredFiles = filteredFiles.filter(file => 
        file.tag && file.tag.toLowerCase() === lowerTag
      );
    }

    const filesWithUrls = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.FILES_BUCKET,
            Key: file.key
          });
          const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          return { ...file, downloadUrl };
        } catch (error) {
          console.error(`Error generating download URL for file ${file.fileId}:`, error);
          return { ...file, downloadUrl: null, error: 'Failed to generate download URL' };
        }
      })
    );

    console.log(`Search found ${filesWithUrls.length} files for user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        files: filesWithUrls,
        count: filesWithUrls.length,
        searchTerm,
        tag
      })
    };
  } catch (error) {
    console.error('Error searching files:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to search files',
        message: error.message
      })
    };
  }
};
