const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.REGION });

// File validation constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed'
];

exports.handler = async (event) => {
  try {
    // Get userId from Cognito authorizer context
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    
    // Parse request body
    const body = JSON.parse(event.body);
    const { fileName, fileType, fileSize } = body;

    // Validation
    if (!fileName || !fileType || !fileSize) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing required fields: fileName, fileType, fileSize'
        })
      };
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        })
      };
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'File type not allowed',
          allowedTypes: ALLOWED_FILE_TYPES
        })
      };
    }

    // Generate unique file ID
    const fileId = uuidv4();
    const key = `${userId}/${fileId}/${fileName}`;

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: process.env.FILES_BUCKET,
      Key: key,
      ContentType: fileType,
      Metadata: {
        userId: userId,
        originalFileName: fileName
      }
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    console.log(`Generated upload URL for user ${userId}, file ${fileId}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl,
        fileId,
        key
      })
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to generate upload URL',
        message: error.message
      })
    };
  }
};
