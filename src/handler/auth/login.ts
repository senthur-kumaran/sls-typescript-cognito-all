import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AdminInitiateAuthCommand, AdminInitiateAuthCommandInput, CognitoIdentityProviderClient, ConfirmDeviceCommand, ConfirmDeviceCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import { sendError, sendSuccess, validateLoginInput } from '../../utils/helpers';
import { statusCode } from '../../utils/statusCode';

const client = new CognitoIdentityProviderClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const eventBody = event.body ?? '';
    const isValid = validateLoginInput(eventBody);
    if (!isValid) return sendError(statusCode.BAD_REQUEST, { message: 'Invalid input' });

    const { email, password } = JSON.parse(eventBody);
    const { userPoolId = '', clientId = '' } = process.env;
    // Non-SRP authentication flow;
    // you can pass in the USERNAME and PASSWORD directly if the flow is enabled for calling the app client
    const initiateAuthParams: AdminInitiateAuthCommandInput = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const initiateAuthCommand = new AdminInitiateAuthCommand(initiateAuthParams);
    const  initiateAuthData = await client.send(initiateAuthCommand);

    const confirmDeviceParams: ConfirmDeviceCommandInput = {
      AccessToken: initiateAuthData.AuthenticationResult?.AccessToken ?? '',
      DeviceKey: initiateAuthData.AuthenticationResult?.NewDeviceMetadata?.DeviceKey ?? '',
      DeviceName: 'WEB',
      DeviceSecretVerifierConfig: {
        PasswordVerifier: 'JWT',
        Salt: 'JWT'
      },
    };

    const confirmDeviceCommand = new ConfirmDeviceCommand(confirmDeviceParams);
    await client.send(confirmDeviceCommand);

    return sendSuccess(statusCode.OK, { message: 'Success', result: initiateAuthData });
  } catch (error: unknown) {
    return sendError(statusCode.INTERNAL_SERVER_ERROR, error);
  }
};
