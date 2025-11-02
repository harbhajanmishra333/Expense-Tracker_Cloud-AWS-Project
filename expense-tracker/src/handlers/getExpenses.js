const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const queryParams = event.queryStringParameters || {};
    
    const startDate = queryParams.startDate;
    const endDate = queryParams.endDate;
    const category = queryParams.category;

    let params = {
      TableName: process.env.EXPENSES_TABLE,
      IndexName: 'UserIdDateIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      params.KeyConditionExpression += ' AND #date BETWEEN :startDate AND :endDate';
      params.ExpressionAttributeValues[':startDate'] = startDate;
      params.ExpressionAttributeValues[':endDate'] = endDate;
      params.ExpressionAttributeNames = { '#date': 'date' };
    }

    const result = await docClient.send(new QueryCommand(params));
    let expenses = result.Items;

    // Filter by category if provided
    if (category) {
      expenses = expenses.filter(exp => exp.category === category);
    }

    // Sort by date descending
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    console.log(`Retrieved ${expenses.length} expenses for user ${userId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        expenses,
        count: expenses.length,
        total: parseFloat(total.toFixed(2))
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
