const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    // List all reports for the user
    const listResult = await s3Client.send(new ListObjectsV2Command({
      Bucket: process.env.REPORTS_BUCKET,
      Prefix: `${userId}/`
    }));

    if (!listResult.Contents || listResult.Contents.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          reports: [],
          count: 0
        })
      };
    }

    // Generate download URLs for each report
    const reports = await Promise.all(
      listResult.Contents.map(async (object) => {
        const downloadUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: process.env.REPORTS_BUCKET,
            Key: object.Key
          }),
          { expiresIn: 3600 }
        );

        const fileName = object.Key.split('/').pop();
        
        return {
          fileName,
          size: object.Size,
          lastModified: object.LastModified,
          downloadUrl
        };
      })
    );

    // Sort by last modified (newest first)
    reports.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    console.log(`Retrieved ${reports.length} reports for user ${userId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        reports,
        count: reports.length
      })
    };
  } catch (error) {
    console.error('Error getting reports:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get reports', message: error.message })
    };
  }
};
