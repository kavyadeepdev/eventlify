import { betterAuth } from "better-auth";
import { PostgresJSDialect } from "kysely-postgres-js";
import sql from "./db";

const googleCliendId = process.env.GOOGLE_CLIENT_ID;
const googleCliendSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: {
    dialect: new PostgresJSDialect({
      postgres: sql,
    }),
    type: "postgres",
    casing: "snake",
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  user: {
    modelName: "users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      usn: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
  },
  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verifications", // Pluralized and snake_cased
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: googleCliendId as string,
      clientSecret: googleCliendSecret as string,
    },
  },
});
