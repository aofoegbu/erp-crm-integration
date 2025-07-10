import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import { insertTicketSchema, insertChatSessionSchema, insertChatMessageSchema, insertIntegrationLogSchema, insertMaintenanceSchema } from "@shared/schema";
import { z } from "zod";

// Using Google Gemini AI as a free alternative
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "demo-key"
});

interface WebSocketClient extends WebSocket {
  sessionId?: number;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<number, WebSocketClient>();

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocketClient, req) => {
    ws.isAlive = true;
    
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.sessionId) {
        clients.delete(ws.sessionId);
        // Update chat session status
        storage.updateChatSession(ws.sessionId, { status: 'ended' });
      }
    });
  });

  // Heartbeat for WebSocket connections
  setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  async function handleWebSocketMessage(ws: WebSocketClient, message: any) {
    switch (message.type) {
      case 'join_session':
        ws.sessionId = message.sessionId;
        clients.set(message.sessionId, ws);
        break;
        
      case 'chat_message':
        await handleChatMessage(ws, message);
        break;
        
      case 'typing':
        broadcastToSession(ws.sessionId!, { type: 'typing', sender: message.sender });
        break;
    }
  }

  async function handleChatMessage(ws: WebSocketClient, message: any) {
    if (!ws.sessionId) return;

    // Store the message
    const chatMessage = await storage.createChatMessage({
      sessionId: ws.sessionId,
      sender: message.sender,
      senderName: message.senderName,
      message: message.message,
      messageType: 'text'
    });

    // Broadcast to all clients in the session
    broadcastToSession(ws.sessionId, {
      type: 'new_message',
      message: chatMessage
    });

    // If customer message, generate AI response
    if (message.sender === 'customer') {
      await generateAIResponse(ws.sessionId, message.message);
    }
  }

  async function generateAIResponse(sessionId: number, customerMessage: string) {
    try {
      // Classify intent first
      const classification = await classifyIntent(customerMessage);
      
      // Generate appropriate response
      let aiResponse = "";
      let shouldEscalate = false;

      if (classification.intent === 'sensitive' || classification.intent === 'complex_technical') {
        shouldEscalate = true;
        aiResponse = "I understand this is an important issue. Let me connect you with one of our technical specialists who can provide detailed assistance.";
      } else {
        aiResponse = await generateContextualResponse(customerMessage, classification);
      }

      // Store AI message
      const aiMessage = await storage.createChatMessage({
        sessionId,
        sender: 'ai',
        senderName: 'AI Assistant',
        message: aiResponse,
        messageType: 'text',
        aiMetadata: classification
      });

      // Broadcast AI response
      broadcastToSession(sessionId, {
        type: 'new_message',
        message: aiMessage
      });

      // Escalate if needed
      if (shouldEscalate) {
        setTimeout(() => {
          escalateToHuman(sessionId);
        }, 2000);
      }

    } catch (error) {
      console.error('AI response error:', error);
      // Fallback response
      const fallbackMessage = await storage.createChatMessage({
        sessionId,
        sender: 'ai',
        senderName: 'AI Assistant',
        message: "I'm having trouble processing your request right now. Let me connect you with a human agent who can help you immediately.",
        messageType: 'text'
      });

      broadcastToSession(sessionId, {
        type: 'new_message',
        message: fallbackMessage
      });

      escalateToHuman(sessionId);
    }
  }

  async function classifyIntent(message: string) {
    try {
      const systemPrompt = `You are an intent classifier for customer support. Classify the customer message into one of these categories: technical, billing, general, sensitive, complex_technical. Also provide a confidence score (0-1) and suggested priority (low, medium, high). Respond with JSON format: { "intent": "category", "confidence": 0.95, "priority": "medium", "summary": "brief summary" }`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              intent: { type: "string" },
              confidence: { type: "number" },
              priority: { type: "string" },
              summary: { type: "string" }
            },
            required: ["intent", "confidence", "priority", "summary"]
          }
        },
        contents: message
      });

      const rawJson = response.text;
      if (rawJson) {
        return JSON.parse(rawJson);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error('Intent classification error:', error);
      return {
        intent: 'general',
        confidence: 0.5,
        priority: 'medium',
        summary: 'Failed to classify'
      };
    }
  }

  async function generateContextualResponse(message: string, classification: any) {
    try {
      const systemPrompt = `You are a helpful customer support AI for an ERP/CRM integration platform. The customer's message has been classified as: ${classification.intent} with ${classification.priority} priority. Provide a helpful, professional response. Keep responses concise but informative. If it's a technical issue, acknowledge the problem and provide initial troubleshooting steps. For billing questions, provide general information and mention human escalation for specific account details.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt
        },
        contents: message
      });

      return response.text || "I understand your concern. Let me help you with that.";
    } catch (error) {
      console.error('Response generation error:', error);
      return "I understand your concern. Let me connect you with a human agent who can provide detailed assistance.";
    }
  }

  async function escalateToHuman(sessionId: number) {
    // Update session to indicate human escalation
    await storage.updateChatSession(sessionId, { 
      isAIActive: false,
      assignedAgent: 'Sarah Chen' // In a real app, this would be dynamic
    });

    // Notify that agent is joining
    const systemMessage = await storage.createChatMessage({
      sessionId,
      sender: 'system',
      senderName: 'System',
      message: 'Sarah Chen (Technical Support) has joined the conversation',
      messageType: 'system'
    });

    broadcastToSession(sessionId, {
      type: 'new_message',
      message: systemMessage
    });

    // Send agent greeting
    setTimeout(async () => {
      const agentMessage = await storage.createChatMessage({
        sessionId,
        sender: 'agent',
        senderName: 'Sarah Chen',
        message: 'Hi! I\'m Sarah from our technical team. I can see the AI has identified this as a priority issue. I\'m here to help you resolve this. Let me review the details and get back to you with a solution.',
        messageType: 'text'
      });

      broadcastToSession(sessionId, {
        type: 'new_message',
        message: agentMessage
      });
    }, 1000);
  }

  function broadcastToSession(sessionId: number, data: any) {
    const client = clients.get(sessionId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  // REST API Endpoints

  // Customer endpoints
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  });

  app.get('/api/customers/:id', async (req, res) => {
    try {
      const customer = await storage.getCustomer(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch customer' });
    }
  });

  // Ticket endpoints
  app.get('/api/tickets', async (req, res) => {
    try {
      let tickets = await storage.getTickets();
      
      // Apply filters
      if (req.query.status) {
        tickets = tickets.filter(t => t.status === req.query.status);
      }
      if (req.query.priority) {
        tickets = tickets.filter(t => t.priority === req.query.priority);
      }
      if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        tickets = tickets.filter(t => 
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.ticketNumber.toLowerCase().includes(search)
        );
      }

      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  });

  app.post('/api/tickets', async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      
      // Auto-classify with AI if description is provided
      let aiClassification = null;
      if (ticketData.description) {
        aiClassification = await classifyIntent(ticketData.description);
      }

      const ticket = await storage.createTicket({
        ...ticketData,
        aiClassification
      });

      // Log ticket creation
      await storage.createIntegrationLog({
        system: 'integration',
        action: 'ticket_created',
        status: 'info',
        message: `Ticket ${ticket.ticketNumber} created`,
        metadata: { ticketId: ticket.id, priority: ticket.priority }
      });

      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid ticket data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  });

  app.put('/api/tickets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const ticket = await storage.updateTicket(id, updateData);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  });

  // Chat endpoints
  app.get('/api/chat-sessions', async (req, res) => {
    try {
      const sessions = await storage.getActiveChatSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
  });

  app.post('/api/chat-sessions', async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid session data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create chat session' });
    }
  });

  app.get('/api/chat-sessions/:id/messages', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Integration logs
  app.get('/api/logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 100;
      const logs = await storage.getIntegrationLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  app.post('/api/logs', async (req, res) => {
    try {
      const logData = insertIntegrationLogSchema.parse(req.body);
      const log = await storage.createIntegrationLog(logData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid log data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create log' });
    }
  });

  // Mock CRM API endpoints
  app.get('/api/crm/customers', async (req, res) => {
    try {
      // Simulate API response time
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      const customers = await storage.getCustomers();
      
      // Log API call
      await storage.createApiMetric({
        endpoint: '/api/crm/customers',
        method: 'GET',
        system: 'crm',
        responseTime: Math.floor(100 + Math.random() * 200),
        statusCode: 200
      });

      res.json({
        success: true,
        data: customers,
        pagination: {
          page: 1,
          total: customers.length,
          hasMore: false
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'CRM API error' });
    }
  });

  app.post('/api/crm/leads', async (req, res) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
      
      await storage.createApiMetric({
        endpoint: '/api/crm/leads',
        method: 'POST',
        system: 'crm',
        responseTime: Math.floor(150 + Math.random() * 100),
        statusCode: 201
      });

      res.status(201).json({
        success: true,
        data: { id: Date.now(), status: 'created' }
      });
    } catch (error) {
      res.status(500).json({ error: 'CRM API error' });
    }
  });

  // Mock ERP API endpoints
  app.get('/api/erp/orders', async (req, res) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 150));
      
      await storage.createApiMetric({
        endpoint: '/api/erp/orders',
        method: 'GET',
        system: 'erp',
        responseTime: Math.floor(200 + Math.random() * 150),
        statusCode: 200
      });

      res.json({
        success: true,
        data: [
          { id: 1, customerId: 1, total: 1250.00, status: 'processed' },
          { id: 2, customerId: 2, total: 850.00, status: 'pending' }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'ERP API error' });
    }
  });

  app.get('/api/erp/inventory', async (req, res) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 120 + Math.random() * 80));
      
      await storage.createApiMetric({
        endpoint: '/api/erp/inventory',
        method: 'GET',
        system: 'erp',
        responseTime: Math.floor(120 + Math.random() * 80),
        statusCode: 200
      });

      res.json({
        success: true,
        data: [
          { productId: 'PROD-001', stock: 450, reserved: 23 },
          { productId: 'PROD-002', stock: 120, reserved: 8 }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'ERP API error' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/dashboard', async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      const openTickets = tickets.filter(t => t.status === 'open').length;
      const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
      const metrics = await storage.getApiMetrics(1000);
      
      const avgResponseTime = metrics.length > 0 
        ? Math.round(metrics.reduce((sum, m) => sum + m.responseTime!, 0) / metrics.length)
        : 0;

      res.json({
        tickets: {
          open: openTickets,
          resolved: resolvedTickets,
          total: tickets.length
        },
        api: {
          averageResponseTime: avgResponseTime,
          totalCalls: metrics.length,
          successRate: 99.2
        },
        satisfaction: {
          average: 4.2,
          responseRate: 89
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Maintenance endpoints
  app.get('/api/maintenance', async (req, res) => {
    try {
      const maintenance = await storage.getMaintenanceSchedule();
      res.json(maintenance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch maintenance schedule' });
    }
  });

  app.post('/api/maintenance', async (req, res) => {
    try {
      const maintenanceData = insertMaintenanceSchema.parse(req.body);
      const maintenance = await storage.createMaintenance(maintenanceData);
      
      // Log maintenance scheduling
      await storage.createIntegrationLog({
        system: 'integration',
        action: 'maintenance_scheduled',
        status: 'info',
        message: `Maintenance scheduled for ${maintenanceData.system} system: ${maintenanceData.title}`,
        metadata: { maintenanceId: maintenance.id, system: maintenanceData.system }
      });

      res.status(201).json(maintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid maintenance data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to schedule maintenance' });
    }
  });

  // Add periodic log generation for demo
  setInterval(async () => {
    const systems = ['crm', 'erp', 'integration'];
    const actions = ['sync_data', 'process_webhook', 'validate_request', 'update_cache'];
    const statuses = ['success', 'success', 'success', 'info', 'warning'];
    
    const randomSystem = systems[Math.floor(Math.random() * systems.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    await storage.createIntegrationLog({
      system: randomSystem,
      action: randomAction,
      status: randomStatus,
      message: `${randomAction.replace('_', ' ')} completed for ${randomSystem.toUpperCase()}`
    });
  }, 10000); // Every 10 seconds

  return httpServer;
}
