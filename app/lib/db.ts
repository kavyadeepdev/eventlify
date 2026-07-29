import { Pool } from "pg";

const dbUri = process.env.DATABASE_URI;

const client = new Pool({ connectionString: dbUri as string });

export default client;
