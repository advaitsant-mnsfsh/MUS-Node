import { pgTable, text, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt")
});

export const auditJobs = pgTable("audit_jobs", {
    id: text("id").primaryKey(), // Let DB handle default gen_random_uuid()
    api_key_id: text("api_key_id"),
    user_id: text("user_id"),
    status: text("status").notNull(),
    input_data: jsonb("input_data").notNull(),
    result_url: text("result_url"),
    report_data: jsonb("report_data"),
    error_message: text("error_message"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => {
    return {
        user_id_idx: index("user_id_idx").on(table.user_id)
    }
});

export const auditJobLogs = pgTable("audit_job_logs", {
    id: text("id").primaryKey(),
    job_id: text("job_id").notNull().references(() => auditJobs.id),
    message: text("message").notNull(),
    level: text("level").default("info").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => {
    return {
        job_id_idx: index("job_id_idx").on(table.job_id)
    }
});

export const leads = pgTable("leads", {
    id: text("id").primaryKey(), // We'll generate UUIDs manually or let DB handle it if set up
    email: text("email").notNull().unique(),
    name: text("name"),
    organization_type: text("organization_type"),
    audit_url: text("audit_url"),
    is_verified: boolean("is_verified").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const apiKeys = pgTable("api_keys", {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    owner_name: text("owner_name").notNull(),
    user_id: text("user_id").notNull(),
    usage_count: integer("usage_count").default(0).notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    allowed_origins: jsonb("allowed_origins").default([]),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    last_used_at: timestamp("last_used_at", { withTimezone: true })
});

export const appSecrets = pgTable("app_secrets", {
    id: text("id").primaryKey(),
    key_name: text("key_name").notNull().unique(),
    key_value: text("key_value").notNull(),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
