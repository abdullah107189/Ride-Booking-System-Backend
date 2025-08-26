import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
export const generateToken = (
  payload: JwtPayload,
  secretCode: string,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secretCode, { expiresIn } as SignOptions);
  return token;
};

export const verifyToken = (token: string, secretCode: string) => {
  const verifiedToken = jwt.verify(token, secretCode);
  return verifiedToken;
};
