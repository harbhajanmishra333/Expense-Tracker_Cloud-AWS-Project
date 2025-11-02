const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const expenseId = event.pathParameters.expenseId;

    // Check if expense exists
    const getResult = await docClient.send(new GetCommand({
      TableName: process.env.EXPENSES_TABLE,
      Key: { expenseId }
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Expense not found' })
      };
    }

    // Delete expense
    await docClient.send(new DeleteCommand({
      TableName: process.env.EXPENSES_TABLE,
      Key: { expenseId }
    }));

    console.log(`Deleted expense ${expenseId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Expense deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to delete expense', message: error.message })
    };
  }
};
