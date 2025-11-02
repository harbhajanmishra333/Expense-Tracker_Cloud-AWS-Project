const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = 'test-user'; // Fixed user ID for testing

    const params = {
      TableName: process.env.EXPENSES_TABLE,
      IndexName: 'UserIdDateIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Sort by date descending
    };

    const result = await docClient.send(new QueryCommand(params));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        expenses: result.Items || [],
        count: result.Count || 0
      })
    };
  } catch (error) {
    console.error('Error getting expenses:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get expenses', message: error.message })
    };
  }
};
