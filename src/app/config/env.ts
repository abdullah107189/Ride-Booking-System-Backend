import dotenv from "dotenv";
dotenv.config();

interface IEnvVariables {
  DB_URL: string;
  PORT: string;
  NODE_DEV: "development" | "production";
  bcrypt_salt_round: string;
  jwt_secret: string;
  jwt_expires: string;
  jwt_refresh_secret: string;
  jwt_refresh_expires: string;
  //   super_admin_email: string;
  //   super_admin_pass: string;
}

const loadEnvVariables = (): IEnvVariables => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_DEV",
    "bcrypt_salt_round",
    "jwt_secret",
    "jwt_expires",
    "jwt_refresh_secret",
    "jwt_refresh_expires",
    // "super_admin_email",
    // "super_admin_pass",
  ];
  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing require environment variable :------ ${key}`);
    }
  });
  return {
    DB_URL: process.env.DB_URL as string,
    PORT: process.env.PORT as string,
    NODE_DEV: process.env.NODE_DEV as "development" | "production",
    bcrypt_salt_round: process.env.bcrypt_salt_round as string,
    jwt_expires: process.env.jwt_expires as string,
    jwt_secret: process.env.jwt_secret as string,
    jwt_refresh_secret: process.env.jwt_refresh_secret as string,
    jwt_refresh_expires: process.env.jwt_refresh_expires as string,
    // super_admin_email: process.env.super_admin_email as string,
    // super_admin_pass: process.env.super_admin_pass as string,
  };
};
export const envVars = loadEnvVariables();
