import postgres from "postgres";

const dbUri = process.env.DATABASE_URI;

const sql = postgres(dbUri as string, {
  transform: postgres.camel,
});

export default sql;
