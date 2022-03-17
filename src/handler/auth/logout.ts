import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AdminForgetDeviceCommand, AdminForgetDeviceCommandInput, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { sendError, sendSuccess, validateLogoutInput } from "../../utils/helpers";
import { statusCode } from "../../utils/statusCode";

const client = new CognitoIdentityProviderClient({});

export const handler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const eventBody = event.body ?? '';
    const isValid = validateLogoutInput(eventBody);
    if (!isValid) return sendError(statusCode.BAD_REQUEST, { message: 'Invalid input' });

    const { email, deviceKey } = JSON.parse(eventBody);
    const { userPoolId = '' } = process.env;

    const params: AdminForgetDeviceCommandInput = {
      UserPoolId: userPoolId,
      DeviceKey: deviceKey,
      Username: email,
    };

    const command = new AdminForgetDeviceCommand(params);
    const  data = await client.send(command);

    return sendSuccess(statusCode.OK, { message: 'Success', data });
  } catch (error: unknown) {
    return sendError(statusCode.INTERNAL_SERVER_ERROR, error);
  }
};
