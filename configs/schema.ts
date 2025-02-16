import { integer, json, pgTable, varchar } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    credits: integer().default(0)
});
export const WireFrameToCode = pgTable("wireframe_to_code", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uid: varchar({ length: 255 }).notNull(),
  imageUrl: varchar({ length: 255 }),
  model: varchar({ length: 255 }),
  description: varchar({ length: 1000 }),
  code: json(), // Store the generated code here
  createdBy: varchar({ length: 255 }),
});