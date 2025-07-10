import { 
  customers, tickets, chatSessions, chatMessages, integrationLogs, 
  maintenanceSchedule, apiMetrics, users,
  type Customer, type InsertCustomer, type Ticket, type InsertTicket,
  type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage,
  type IntegrationLog, type InsertIntegrationLog, type MaintenanceSchedule, type InsertMaintenance,
  type ApiMetric, type InsertApiMetric, type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;

  // Tickets
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  getTicketsByStatus(status: string): Promise<Ticket[]>;
  getTicketsByPriority(priority: string): Promise<Ticket[]>;

  // Chat Sessions
  getChatSessions(): Promise<ChatSession[]>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, session: Partial<InsertChatSession>): Promise<ChatSession | undefined>;
  getActiveChatSessions(): Promise<ChatSession[]>;

  // Chat Messages
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Integration Logs
  getIntegrationLogs(limit?: number): Promise<IntegrationLog[]>;
  createIntegrationLog(log: InsertIntegrationLog): Promise<IntegrationLog>;
  getLogsBySystem(system: string): Promise<IntegrationLog[]>;

  // Maintenance Schedule
  getMaintenanceSchedule(): Promise<MaintenanceSchedule[]>;
  createMaintenance(maintenance: InsertMaintenance): Promise<MaintenanceSchedule>;
  updateMaintenance(id: number, maintenance: Partial<InsertMaintenance>): Promise<MaintenanceSchedule | undefined>;
  getUpcomingMaintenance(): Promise<MaintenanceSchedule[]>;

  // API Metrics
  getApiMetrics(limit?: number): Promise<ApiMetric[]>;
  createApiMetric(metric: InsertApiMetric): Promise<ApiMetric>;
  getMetricsBySystem(system: string): Promise<ApiMetric[]>;
}

// Legacy MemStorage class (kept for reference, not used)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private tickets: Map<number, Ticket>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  private integrationLogs: Map<number, IntegrationLog>;
  private maintenanceSchedule: Map<number, MaintenanceSchedule>;
  private apiMetrics: Map<number, ApiMetric>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.tickets = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.integrationLogs = new Map();
    this.maintenanceSchedule = new Map();
    this.apiMetrics = new Map();
    this.currentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample customers
    const customer1 = this.createCustomer({
      name: "John Smith",
      email: "john@techcorp.com",
      phone: "+1-555-0123",
      company: "TechCorp Solutions",
      plan: "enterprise"
    });

    const customer2 = this.createCustomer({
      name: "Sarah Johnson",
      email: "sarah@globalmanuf.com",
      phone: "+1-555-0456",
      company: "Global Manufacturing",
      plan: "business"
    });

    // Sample tickets
    Promise.all([customer1, customer2]).then(([c1, c2]) => {
      this.createTicket({
        customerId: c1.id,
        title: "Integration sync failure - Customer data not updating",
        description: "Customer reporting that their latest customer updates from CRM are not syncing to the ERP system. This is affecting their order processing workflow.",
        priority: "high",
        category: "technical",
        status: "open",
        assignedTo: "Sarah Chen"
      });

      this.createTicket({
        customerId: c2.id,
        title: "Request for additional API rate limits",
        description: "Customer requesting increase in API rate limits for their business plan to handle increased transaction volume.",
        priority: "medium",
        category: "billing",
        status: "in_progress",
        assignedTo: "Mike Rodriguez"
      });
    });

    // Sample integration logs
    this.createIntegrationLog({
      system: "crm",
      action: "sync_customers",
      status: "success",
      message: "Successfully synchronized 50 customer records"
    });

    this.createIntegrationLog({
      system: "erp",
      action: "update_inventory",
      status: "success",
      message: "Inventory levels updated successfully"
    });

    this.createIntegrationLog({
      system: "integration",
      action: "webhook_delivery",
      status: "warning",
      message: "Webhook delivery rate below 98% threshold"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...updateData };
    this.customers.set(id, updated);
    return updated;
  }

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    return Array.from(this.tickets.values()).find(ticket => ticket.ticketNumber === ticketNumber);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentId++;
    const ticketNumber = `TK${String(id).padStart(3, '0')}`;
    const ticket: Ticket = {
      ...insertTicket,
      id,
      ticketNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: number, updateData: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updated = { ...ticket, ...updateData, updatedAt: new Date() };
    this.tickets.set(id, updated);
    return updated;
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.status === status);
  }

  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.priority === priority);
  }

  // Chat Sessions
  async getChatSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values());
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentId++;
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      endedAt: null
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: number, updateData: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updateData };
    this.chatSessions.set(id, updated);
    return updated;
  }

  async getActiveChatSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(session => session.status === 'active');
  }

  // Chat Messages
  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Integration Logs
  async getIntegrationLogs(limit: number = 100): Promise<IntegrationLog[]> {
    return Array.from(this.integrationLogs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createIntegrationLog(insertLog: InsertIntegrationLog): Promise<IntegrationLog> {
    const id = this.currentId++;
    const log: IntegrationLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.integrationLogs.set(id, log);
    return log;
  }

  async getLogsBySystem(system: string): Promise<IntegrationLog[]> {
    return Array.from(this.integrationLogs.values()).filter(log => log.system === system);
  }

  // Maintenance Schedule
  async getMaintenanceSchedule(): Promise<MaintenanceSchedule[]> {
    return Array.from(this.maintenanceSchedule.values())
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  }

  async createMaintenance(insertMaintenance: InsertMaintenance): Promise<MaintenanceSchedule> {
    const id = this.currentId++;
    const maintenance: MaintenanceSchedule = {
      ...insertMaintenance,
      id,
      createdAt: new Date()
    };
    this.maintenanceSchedule.set(id, maintenance);
    return maintenance;
  }

  async updateMaintenance(id: number, updateData: Partial<InsertMaintenance>): Promise<MaintenanceSchedule | undefined> {
    const maintenance = this.maintenanceSchedule.get(id);
    if (!maintenance) return undefined;
    
    const updated = { ...maintenance, ...updateData };
    this.maintenanceSchedule.set(id, updated);
    return updated;
  }

  async getUpcomingMaintenance(): Promise<MaintenanceSchedule[]> {
    const now = new Date();
    return Array.from(this.maintenanceSchedule.values())
      .filter(maintenance => new Date(maintenance.scheduledStart) > now)
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  }

  // API Metrics
  async getApiMetrics(limit: number = 1000): Promise<ApiMetric[]> {
    return Array.from(this.apiMetrics.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createApiMetric(insertMetric: InsertApiMetric): Promise<ApiMetric> {
    const id = this.currentId++;
    const metric: ApiMetric = {
      ...insertMetric,
      id,
      timestamp: new Date()
    };
    this.apiMetrics.set(id, metric);
    return metric;
  }

  async getMetricsBySystem(system: string): Promise<ApiMetric[]> {
    return Array.from(this.apiMetrics.values()).filter(metric => metric.system === system);
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async getTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber));
    return ticket || undefined;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    // Generate unique ticket number
    const ticketCount = await db.select().from(tickets);
    const ticketNumber = `TK${String(ticketCount.length + 1).padStart(3, '0')}`;
    
    const [ticket] = await db
      .insert(tickets)
      .values({ ...insertTicket, ticketNumber })
      .returning();
    return ticket;
  }

  async updateTicket(id: number, updateData: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket || undefined;
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.status, status));
  }

  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.priority, priority));
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return await db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateChatSession(id: number, updateData: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const [session] = await db
      .update(chatSessions)
      .set(updateData)
      .where(eq(chatSessions.id, id))
      .returning();
    return session || undefined;
  }

  async getActiveChatSessions(): Promise<ChatSession[]> {
    return await db.select().from(chatSessions).where(eq(chatSessions.status, 'active'));
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getIntegrationLogs(limit: number = 100): Promise<IntegrationLog[]> {
    return await db.select().from(integrationLogs)
      .orderBy(desc(integrationLogs.timestamp))
      .limit(limit);
  }

  async createIntegrationLog(insertLog: InsertIntegrationLog): Promise<IntegrationLog> {
    const [log] = await db
      .insert(integrationLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getLogsBySystem(system: string): Promise<IntegrationLog[]> {
    return await db.select().from(integrationLogs)
      .where(eq(integrationLogs.system, system))
      .orderBy(desc(integrationLogs.timestamp));
  }

  async getMaintenanceSchedule(): Promise<MaintenanceSchedule[]> {
    return await db.select().from(maintenanceSchedule).orderBy(maintenanceSchedule.scheduledStart);
  }

  async createMaintenance(insertMaintenance: InsertMaintenance): Promise<MaintenanceSchedule> {
    const [maintenance] = await db
      .insert(maintenanceSchedule)
      .values(insertMaintenance)
      .returning();
    return maintenance;
  }

  async updateMaintenance(id: number, updateData: Partial<InsertMaintenance>): Promise<MaintenanceSchedule | undefined> {
    const [maintenance] = await db
      .update(maintenanceSchedule)
      .set(updateData)
      .where(eq(maintenanceSchedule.id, id))
      .returning();
    return maintenance || undefined;
  }

  async getUpcomingMaintenance(): Promise<MaintenanceSchedule[]> {
    return await db.select().from(maintenanceSchedule)
      .where(and(
        eq(maintenanceSchedule.status, 'scheduled'),
        eq(maintenanceSchedule.scheduledStart, new Date())
      ))
      .orderBy(maintenanceSchedule.scheduledStart);
  }

  async getApiMetrics(limit: number = 1000): Promise<ApiMetric[]> {
    return await db.select().from(apiMetrics)
      .orderBy(desc(apiMetrics.timestamp))
      .limit(limit);
  }

  async createApiMetric(insertMetric: InsertApiMetric): Promise<ApiMetric> {
    const [metric] = await db
      .insert(apiMetrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  async getMetricsBySystem(system: string): Promise<ApiMetric[]> {
    return await db.select().from(apiMetrics)
      .where(eq(apiMetrics.system, system))
      .orderBy(desc(apiMetrics.timestamp));
  }
}

export const storage = new DatabaseStorage();
