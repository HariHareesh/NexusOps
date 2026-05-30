"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeLambda = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
const aws_config_1 = require("../config/aws.config");
const lambdaClient = new client_lambda_1.LambdaClient({
    region: aws_config_1.env.AWS_REGION
});
const invokeLambda = async (functionName, payload) => {
    const command = new client_lambda_1.InvokeCommand({
        FunctionName: functionName,
        Payload: Buffer.from(JSON.stringify(payload))
    });
    const response = await lambdaClient.send(command);
    const responsePayload = response.Payload
        ? JSON.parse(Buffer.from(response.Payload).toString())
        : null;
    return responsePayload;
};
exports.invokeLambda = invokeLambda;
//# sourceMappingURL=lambda.service.js.map