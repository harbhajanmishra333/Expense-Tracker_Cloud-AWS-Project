const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const body = JSON.parse(event.body);
    
    const { name, icon, color } = body;

    if (!name) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Category name is required' })
      };
    }

    const categoryId = uuidv4();
    const timestamp = new Date().toISOString();

    const category = {
      categoryId,
      userId,
      name,
      icon: icon || '📝',
      color: color || '#C7CEEA',
      createdAt: timestamp
    };

    await docClient.send(new PutCommand({
      TableName: process.env.CATEGORIES_TABLE,
      Item: category
    }));

    console.log(`Added category ${categoryId} for user ${userId}`);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Category added successfully',
        category
      })
    };
  } catch (error) {
    console.error('Error adding category:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to add category', message: error.message })
    };
  }
};
