import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AdminCreateUserCommand, AdminCreateUserCommandInput, AdminSetUserPasswordCommand, AdminSetUserPasswordCommandInput, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { sendError, sendSuccess, validateRegisterInput } from '../../utils/helpers';
import { statusCode } from '../../utils/statusCode';

const client = new CognitoIdentityProviderClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const eventBody = event.body ?? '';
    const isValid = validateRegisterInput(eventBody);
    if (!isValid) return sendError(statusCode.BAD_REQUEST, { message: 'Invalid input' });

    const { email, password } = JSON.parse(eventBody);
    const { userPoolId = '' } = process.env;
    const createUserParams: AdminCreateUserCommandInput = {
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true', // Email verified manually only testing purpose.
        }],
      MessageAction: 'SUPPRESS', // Suppress sending the email
    };
    const createUserCommand = new AdminCreateUserCommand(createUserParams);
    const  createUserData = await client.send(createUserCommand);
    if (createUserData.User) {
      const setPasswordParams: AdminSetUserPasswordCommandInput = {
        Password: password,
        UserPoolId: userPoolId,
        Username: email,
        Permanent: true,
      };
      const setUserPasswordCommand = new AdminSetUserPasswordCommand(setPasswordParams);
      await client.send(setUserPasswordCommand);
    }
    return sendSuccess(statusCode.OK, { message: 'User registration successful' });
  } catch (error: unknown) {
    return sendError(statusCode.INTERNAL_SERVER_ERROR, error);
  }
};
