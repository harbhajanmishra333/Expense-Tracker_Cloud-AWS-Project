const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const expenseId = event.pathParameters.expenseId;
    const body = JSON.parse(event.body);

    // Get existing expense to verify ownership
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

    if (getResult.Item.userId !== userId) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Not authorized to update this expense' })
      };
    }

    // Build update expression
    const updates = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (body.amount !== undefined) {
      updates.push('#amount = :amount');
      expressionAttributeValues[':amount'] = parseFloat(body.amount);
      expressionAttributeNames['#amount'] = 'amount';
    }
    if (body.category) {
      updates.push('category = :category');
      expressionAttributeValues[':category'] = body.category;
    }
    if (body.description !== undefined) {
      updates.push('description = :description');
      expressionAttributeValues[':description'] = body.description;
    }
    if (body.date) {
      updates.push('#date = :date');
      expressionAttributeValues[':date'] = body.date;
      expressionAttributeNames['#date'] = 'date';
    }
    if (body.paymentMethod) {
      updates.push('paymentMethod = :paymentMethod');
      expressionAttributeValues[':paymentMethod'] = body.paymentMethod;
    }

    updates.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateResult = await docClient.send(new UpdateCommand({
      TableName: process.env.EXPENSES_TABLE,
      Key: { expenseId },
      UpdateExpression: 'SET ' + updates.join(', '),
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ReturnValues: 'ALL_NEW'
    }));

    console.log(`Updated expense ${expenseId} for user ${userId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Expense updated successfully',
        expense: updateResult.Attributes
      })
    };
  } catch (error) {
    console.error('Error updating expense:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to update expense', message: error.message })
    };
  }
};
