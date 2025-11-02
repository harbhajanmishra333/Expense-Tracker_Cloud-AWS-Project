const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const expenseId = event.pathParameters.expenseId;
    const body = JSON.parse(event.body);

    // Get existing expense
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

    // Build update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    if (body.amount !== undefined) {
      updateExpressions.push('#amount = :amount');
      expressionAttributeNames['#amount'] = 'amount';
      expressionAttributeValues[':amount'] = parseFloat(body.amount);
    }

    if (body.category) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = body.category;
    }

    if (body.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = body.description;
    }

    if (body.date) {
      updateExpressions.push('#date = :date');
      expressionAttributeNames['#date'] = 'date';
      expressionAttributeValues[':date'] = body.date;
    }

    if (body.paymentMethod) {
      updateExpressions.push('#paymentMethod = :paymentMethod');
      expressionAttributeNames['#paymentMethod'] = 'paymentMethod';
      expressionAttributeValues[':paymentMethod'] = body.paymentMethod;
    }

    // Always update timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (updateExpressions.length === 1) { // Only updatedAt
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No fields to update' })
      };
    }

    const updateParams = {
      TableName: process.env.EXPENSES_TABLE,
      Key: { expenseId },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Expense updated successfully',
        expense: result.Attributes
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
