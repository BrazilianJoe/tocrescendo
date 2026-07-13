import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN"]);
export const postStatusEnum = pgEnum("post_status", ["DRAFT", "PUBLISHED"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("ADMIN"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    content: jsonb("content").notNull().$type<Record<string, unknown>>(),
    coverAvifUrl: text("cover_avif_url"),
    coverWebpUrl: text("cover_webp_url"),
    coverAlt: text("cover_alt").notNull().default(""),
    status: postStatusEnum("status").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("posts_status_published_at_idx").on(table.status, table.publishedAt),
  ],
);

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  alt: text("alt").notNull().default(""),
  width: text("width"),
  height: text("height"),
  avifUrl: text("avif_url").notNull(),
  webpUrl: text("webp_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  uploadedById: uuid("uploaded_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Media = typeof media.$inferSelect;
