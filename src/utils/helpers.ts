export const sendSuccess = (statusCode: number, body: object) => ({
  statusCode,
  body: JSON.stringify(body),
});

export const sendError = (statusCode: number, error: unknown) => {
  let errorMessage = 'Internal server error';
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  return {
    statusCode,
    body: JSON.stringify(errorMessage),
  }
};

export const validateRegisterInput = (data: string) => {
  const body = JSON.parse(data);
  const { email, password } = body;
  if (!email || !password || password.length < 6) return false;
  return true;
};

export const validateLoginInput = (data: string) => {
  const body = JSON.parse(data);
  const { email, password } = body;
  if (!email || !password ) return false;
  return true;
};

export const validateLogoutInput = (data: string) => {
  const body = JSON.parse(data);
  const { email, deviceKey } = body;
  if (!email || !deviceKey) return false;
  return true;
};
