import { betterAuth } from "better-auth";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

import { slugify } from "./format";

const googleCliendId = process.env.GOOGLE_CLIENT_ID;
const googleCliendSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Better Auth gets its own connection, deliberately WITHOUT the
 * `transform: postgres.camel` used by the app client in `lib/db.ts`.
 *
 * That transform rewrites returned column names (`user_id` -> `userId`), which
 * hides them from Better Auth's own snake_case field mapping: sessions were
 * read back as `{ id, token }` with no `userId` or `expiresAt`, so every
 * session lookup failed and users never appeared signed in.
 */
const authSql = postgres(process.env.DATABASE_URI as string);

export const auth = betterAuth({
  database: {
    dialect: new PostgresJSDialect({
      postgres: authSql,
    }),
    type: "postgres",
    casing: "snake",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const nameSlug = slugify(user.name || "");
          const emailHandle = (user.email || "").split("@")[0].replace(/\./g, "-");
          const emailSlug = slugify(emailHandle);

          let slug = nameSlug || emailSlug;

          if (nameSlug) {
            const existing = await authSql`
              SELECT id FROM users WHERE slug = ${nameSlug} LIMIT 1
            `;
            if (existing.length > 0) {
              slug = emailSlug;
            }
          }

          return {
            data: {
              ...user,
              slug,
            },
          };
        },
      },
    },
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
      slug: {
        type: "string",
        required: false,
        defaultValue: () =>
          `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
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
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: googleCliendId as string,
      clientSecret: googleCliendSecret as string,
      hd: "bmsce.ac.in",
    },
  },
});
