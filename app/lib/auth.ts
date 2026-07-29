import { betterAuth } from "better-auth";
import client from "./db";

const googleCliendId = process.env.GOOGLE_CLIENT_ID;
const googleCliendSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: client,
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
