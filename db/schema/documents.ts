import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const documentEntityTypeEnum = pgEnum("document_entity_type", [
  "renter",
  "car",
  "rental",
]);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: documentEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    fileName: text("file_name").notNull(),
    storedFileName: text("stored_file_name").notNull().unique(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    description: text("description"),
    uploadedById: text("uploaded_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("documents_entity_idx").on(table.entityType, table.entityId)],
);
