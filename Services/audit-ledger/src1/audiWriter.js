const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
 GetCommand
} = require("@aws-sdk/lib-dynamodb");

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

module.exports = {
  docClient,
  PutCommand,
  QueryCommand,
  GetCommand
};