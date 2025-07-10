import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  plan: text("plan").default("basic"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  category: text("category").notNull(), // technical, billing, general, sensitive
  assignedTo: text("assigned_to"),
  aiClassification: jsonb("ai_classification"),
  resolutionTime: integer("resolution_time"), // in minutes
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  ticketId: integer("ticket_id").references(() => tickets.id),
  status: text("status").notNull().default("active"), // active, ended, transferred
  assignedAgent: text("assigned_agent"),
  isAIActive: boolean("is_ai_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id),
  sender: text("sender").notNull(), // customer, agent, ai
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // text, system, escalation
  aiMetadata: jsonb("ai_metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const integrationLogs = pgTable("integration_logs", {
  id: serial("id").primaryKey(),
  system: text("system").notNull(), // crm, erp, integration
  action: text("action").notNull(),
  status: text("status").notNull(), // success, error, warning, info
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const maintenanceSchedule = pgTable("maintenance_schedule", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  system: text("system").notNull(), // crm, erp, integration
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  estimatedDowntime: integer("estimated_downtime"), // in minutes
  approvedBy: text("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiMetrics = pgTable("api_metrics", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  system: text("system").notNull(), // crm, erp
  responseTime: integer("response_time"), // in milliseconds
  statusCode: integer("status_code").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  endedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertIntegrationLogSchema = createInsertSchema(integrationLogs).omit({
  id: true,
  timestamp: true,
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceSchedule).omit({
  id: true,
  createdAt: true,
});

export const insertApiMetricSchema = createInsertSchema(apiMetrics).omit({
  id: true,
  timestamp: true,
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = z.infer<typeof insertIntegrationLogSchema>;

export type MaintenanceSchedule = typeof maintenanceSchedule.$inferSelect;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;

export type ApiMetric = typeof apiMetrics.$inferSelect;
export type InsertApiMetric = z.infer<typeof insertApiMetricSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
