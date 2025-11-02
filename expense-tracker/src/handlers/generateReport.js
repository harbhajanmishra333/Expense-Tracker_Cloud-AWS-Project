const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.REGION });

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const userEmail = event.requestContext.authorizer.jwt.claims.email || 'user';
    const body = JSON.parse(event.body);
    
    const { startDate, endDate, format } = body;

    if (!startDate || !endDate) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Start date and end date are required' })
      };
    }

    // Get expenses for date range
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

    const expenses = result.Items.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate report content
    let reportContent;
    const reportFormat = format || 'csv';

    if (reportFormat === 'csv') {
      reportContent = generateCSV(expenses);
    } else if (reportFormat === 'json') {
      reportContent = JSON.stringify({
        reportDate: new Date().toISOString(),
        dateRange: { startDate, endDate },
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        expenses
      }, null, 2);
    } else {
      reportContent = generateTextReport(expenses, startDate, endDate);
    }

    // Upload to S3
    const reportId = uuidv4();
    const fileName = `expense-report-${startDate}-to-${endDate}-${reportId}.${reportFormat}`;
    const key = `${userId}/${fileName}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.REPORTS_BUCKET,
      Key: key,
      Body: reportContent,
      ContentType: reportFormat === 'csv' ? 'text/csv' : reportFormat === 'json' ? 'application/json' : 'text/plain',
      Metadata: {
        userId,
        startDate,
        endDate,
        generatedAt: new Date().toISOString()
      }
    }));

    // Generate download URL
    const downloadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.REPORTS_BUCKET,
        Key: key
      }),
      { expiresIn: 3600 } // 1 hour
    );

    console.log(`Generated report ${reportId} for user ${userId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Report generated successfully',
        reportId,
        fileName,
        downloadUrl: downloadUrl.split('?')[0], // Remove query params for cleaner URL
        expiresIn: 3600,
        format: reportFormat,
        summary: {
          totalExpenses: expenses.length,
          totalAmount: parseFloat(expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)),
          dateRange: { startDate, endDate }
        }
      })
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to generate report', message: error.message })
    };
  }
};

function generateCSV(expenses) {
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Method'];
  const rows = expenses.map(exp => [
    exp.date,
    exp.category,
    exp.description || '',
    exp.amount.toFixed(2),
    exp.paymentMethod || 'cash'
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

function generateTextReport(expenses, startDate, endDate) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  let report = `EXPENSE REPORT\n`;
  report += `Period: ${startDate} to ${endDate}\n`;
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `\n${'='.repeat(80)}\n\n`;
  report += `Total Expenses: ${expenses.length}\n`;
  report += `Total Amount: $${total.toFixed(2)}\n\n`;
  report += `${'='.repeat(80)}\n\n`;
  report += `DETAILED TRANSACTIONS:\n\n`;

  expenses.forEach((exp, index) => {
    report += `${index + 1}. ${exp.date} - ${exp.category}\n`;
    report += `   Amount: $${exp.amount.toFixed(2)}\n`;
    if (exp.description) report += `   Description: ${exp.description}\n`;
    report += `   Payment: ${exp.paymentMethod || 'cash'}\n\n`;
  });

  return report;
}
