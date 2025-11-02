const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    const { amount, category, description, date, paymentMethod } = body;

    // Validation
    if (!amount || !category || !date) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: amount, category, date' })
      };
    }

    if (amount <= 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Amount must be greater than 0' })
      };
    }

    const expenseId = uuidv4();
    const userId = 'test-user'; // Fixed user ID for testing
    const timestamp = new Date().toISOString();

    const expense = {
      expenseId,
      userId,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date,
      paymentMethod: paymentMethod || 'cash',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await docClient.send(new PutCommand({
      TableName: process.env.EXPENSES_TABLE,
      Item: expense
    }));

    console.log(`Added expense ${expenseId} for test user`);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Expense added successfully', 
        expense 
      })
    };
  } catch (error) {
    console.error('Error adding expense:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to add expense', message: error.message })
    };
  }
};
