const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const queryParams = event.queryStringParameters || {};
    
    const startDate = queryParams.startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
    const endDate = queryParams.endDate || new Date().toISOString().split('T')[0];

    const result = await docClient.send(new QueryCommand({
      TableName: process.env.EXPENSES_TABLE,
      IndexName: 'UserIdDateIndex',
      KeyConditionExpression: 'userId = :userId AND #date BETWEEN :startDate AND :endDate',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': startDate,
        ':endDate': endDate
      },
      ExpressionAttributeNames: { '#date': 'date' }
    }));

    const expenses = result.Items;

    // Calculate total spending
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Spending by category
    const byCategory = {};
    expenses.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += exp.amount;
    });

    // Spending by month
    const byMonth = {};
    expenses.forEach(exp => {
      const month = exp.date.substring(0, 7); // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = 0;
      }
      byMonth[month] += exp.amount;
    });

    // Spending by payment method
    const byPaymentMethod = {};
    expenses.forEach(exp => {
      const method = exp.paymentMethod || 'cash';
      if (!byPaymentMethod[method]) {
        byPaymentMethod[method] = 0;
      }
      byPaymentMethod[method] += exp.amount;
    });

    // Average daily spending
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) || 1;
    const averageDaily = totalSpending / daysDiff;

    // Top categories
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount: parseFloat(amount.toFixed(2)) }));

    // Monthly trend
    const monthlyTrend = Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }));

    console.log(`Generated analytics for user ${userId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        summary: {
          totalSpending: parseFloat(totalSpending.toFixed(2)),
          totalTransactions: expenses.length,
          averageDaily: parseFloat(averageDaily.toFixed(2)),
          dateRange: { startDate, endDate }
        },
        byCategory: Object.entries(byCategory).map(([category, amount]) => ({
          category,
          amount: parseFloat(amount.toFixed(2)),
          percentage: parseFloat(((amount / totalSpending) * 100).toFixed(1))
        })),
        byMonth: monthlyTrend,
        byPaymentMethod: Object.entries(byPaymentMethod).map(([method, amount]) => ({
          method,
          amount: parseFloat(amount.toFixed(2))
        })),
        topCategories
      })
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get analytics', message: error.message })
    };
  }
};
