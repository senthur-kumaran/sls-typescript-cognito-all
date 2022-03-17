import { CognitoIdentityProviderClient, GetUserCommand, GetUserCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { sendError, sendSuccess } from "../../utils/helpers";
import { statusCode } from "../../utils/statusCode";

const client = new CognitoIdentityProviderClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params: GetUserCommandInput = {
      AccessToken: event.headers.Authorization?.split(' ')[1]
    };
    const command = new GetUserCommand(params);
    const data = await client.send(command);
    return sendSuccess(statusCode.OK, { message: 'Success', result: data });
  } catch (error) {
    return sendError(statusCode.INTERNAL_SERVER_ERROR, error);
  }
};
