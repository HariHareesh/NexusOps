import {
  LambdaClient,
  InvokeCommand
} from "@aws-sdk/client-lambda";

import { env } from "../config/aws.config";

const lambdaClient = new LambdaClient({
  region: env.AWS_REGION
});

export const invokeLambda = async (
  functionName: string,
  payload: object
) => {
  const command = new InvokeCommand({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify(payload))
  });

  const response = await lambdaClient.send(command);

  const responsePayload = response.Payload
    ? JSON.parse(Buffer.from(response.Payload).toString())
    : null;

  return responsePayload;
};