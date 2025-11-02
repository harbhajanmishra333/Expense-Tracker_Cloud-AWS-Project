const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Default categories
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', icon: '🛍️', color: '#95E1D3' },
  { name: 'Entertainment', icon: '🎬', color: '#F38181' },
  { name: 'Bills & Utilities', icon: '💡', color: '#AA96DA' },
  { name: 'Healthcare', icon: '🏥', color: '#FCBAD3' },
  { name: 'Education', icon: '📚', color: '#FFFFD2' },
  { name: 'Travel', icon: '✈️', color: '#A8D8EA' },
  { name: 'Groceries', icon: '🛒', color: '#FFD93D' },
  { name: 'Other', icon: '📝', color: '#C7CEEA' }
];

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;

    // Get user's custom categories
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.CATEGORIES_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    const customCategories = result.Items || [];

    // Combine default and custom categories
    const allCategories = [
      ...DEFAULT_CATEGORIES.map(cat => ({ ...cat, isDefault: true })),
      ...customCategories.map(cat => ({ ...cat, isDefault: false }))
    ];

    console.log(`Retrieved ${allCategories.length} categories for user ${userId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        categories: allCategories,
        count: allCategories.length
      })
    };
  } catch (error) {
    console.error('Error getting categories:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get categories', message: error.message })
    };
  }
};
