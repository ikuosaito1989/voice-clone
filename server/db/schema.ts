import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  role: text("role").notNull().default("user"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;

export const voiceClones = sqliteTable("voice_clones", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .defaultNow(),
  isCloned: integer("is_cloned", { mode: "boolean" }).notNull().default(false),
  clonedAt: integer("cloned_at", { mode: "timestamp_ms" }),
  referenceAudioPath: text("reference_audio_path").notNull(),
  clonedAudioPath: text("cloned_audio_path"),
  recordedText: text("recorded_text").notNull(),
  desiredText: text("desired_text").notNull(),
});

export type VoiceClone = typeof voiceClones.$inferSelect;
