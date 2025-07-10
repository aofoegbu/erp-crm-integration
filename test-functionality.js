#!/usr/bin/env node

/**
 * Comprehensive functionality test for Ogelo ERP-CRM Integrator
 * Tests all major features including API endpoints, WebSocket, and AI functionality
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(`http://localhost:5000${path}`, options);
}

async function testAPIEndpoints() {
  log('\n🔍 Testing API Endpoints', colors.cyan);
  
  const endpoints = [
    { path: '/api/customers', method: 'GET', name: 'Get Customers' },
    { path: '/api/tickets', method: 'GET', name: 'Get Tickets' },
    { path: '/api/logs', method: 'GET', name: 'Get Integration Logs' },
    { path: '/api/chat-sessions', method: 'GET', name: 'Get Chat Sessions' },
    { path: '/api/analytics/dashboard', method: 'GET', name: 'Dashboard Analytics' },
    { path: '/api/analytics/api-metrics', method: 'GET', name: 'API Metrics' },
    { path: '/api/crm/customers', method: 'GET', name: 'CRM Mock Customers' },
    { path: '/api/erp/inventory', method: 'GET', name: 'ERP Mock Inventory' },
    { path: '/api/erp/orders', method: 'GET', name: 'ERP Mock Orders' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.path, endpoint.method);
      if (response.ok) {
        const data = await response.json();
        log(`✅ ${endpoint.name}: ${response.status} - ${Array.isArray(data) ? data.length + ' items' : 'object'}`, colors.green);
      } else {
        log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`, colors.red);
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: ${error.message}`, colors.red);
    }
  }
}

async function testCRUDOperations() {
  log('\n📝 Testing CRUD Operations', colors.cyan);

  // Test customer creation
  try {
    const customerData = {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '+1-555-TEST',
      company: 'Test Corp',
      plan: 'premium'
    };

    const createResponse = await makeRequest('/api/customers', 'POST', customerData);
    if (createResponse.ok) {
      const newCustomer = await createResponse.json();
      log(`✅ Customer Creation: Created customer ID ${newCustomer.id}`, colors.green);

      // Test customer retrieval
      const getResponse = await makeRequest(`/api/customers/${newCustomer.id}`);
      if (getResponse.ok) {
        log('✅ Customer Retrieval: Successfully retrieved customer', colors.green);
      } else {
        log('❌ Customer Retrieval: Failed', colors.red);
      }
    } else {
      log('❌ Customer Creation: Failed', colors.red);
    }
  } catch (error) {
    log(`❌ Customer CRUD: ${error.message}`, colors.red);
  }

  // Test ticket creation with AI classification
  try {
    const ticketData = {
      title: 'Integration Testing - CRM sync issue',
      description: 'Automated test ticket for comprehensive functionality testing. This ticket tests AI classification and database persistence.',
      customerId: 1,
      category: 'technical',
      priority: 'high'
    };

    const ticketResponse = await makeRequest('/api/tickets', 'POST', ticketData);
    if (ticketResponse.ok) {
      const newTicket = await ticketResponse.json();
      log(`✅ Ticket Creation with AI: Created ticket ${newTicket.ticketNumber} with classification`, colors.green);
      
      if (newTicket.aiClassification) {
        log(`   🤖 AI Classification: ${newTicket.aiClassification.intent} (${(newTicket.aiClassification.confidence * 100).toFixed(1)}% confidence)`, colors.blue);
      }
    } else {
      log('❌ Ticket Creation: Failed', colors.red);
    }
  } catch (error) {
    log(`❌ Ticket Creation: ${error.message}`, colors.red);
  }
}

async function testWebSocketFunctionality() {
  log('\n🔌 Testing WebSocket Functionality', colors.cyan);

  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('ws://localhost:5000/ws');
      let messageReceived = false;

      ws.onopen = () => {
        log('✅ WebSocket Connection: Successfully connected', colors.green);
        
        // Test joining a session
        ws.send(JSON.stringify({
          type: 'join_session',
          sessionId: 1
        }));

        // Test sending a chat message
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'chat_message',
            sender: 'customer',
            senderName: 'Test User',
            message: 'Hello, I need help with my integration setup'
          }));
        }, 100);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          messageReceived = true;
          log('✅ WebSocket Messaging: Successfully sent and received message', colors.green);
        }
        if (data.type === 'ai_response') {
          log('✅ AI WebSocket Response: Received AI-generated response', colors.green);
        }
      };

      ws.onerror = (error) => {
        log('❌ WebSocket Error: Connection failed', colors.red);
        resolve();
      };

      setTimeout(() => {
        ws.close();
        if (messageReceived) {
          log('✅ WebSocket Test: Complete', colors.green);
        } else {
          log('⚠️  WebSocket Test: No messages received', colors.yellow);
        }
        resolve();
      }, 2000);

    } catch (error) {
      log(`❌ WebSocket Test: ${error.message}`, colors.red);
      resolve();
    }
  });
}

async function testAIFeatures() {
  log('\n🤖 Testing AI Features', colors.cyan);

  // Test intent classification
  const testMessages = [
    'I cannot access my account and need help',
    'When will my invoice be processed?',
    'The API is returning 500 errors consistently',
    'I need to cancel my subscription immediately'
  ];

  for (const message of testMessages) {
    try {
      const response = await makeRequest('/api/ai/classify', 'POST', { message });
      if (response.ok) {
        const classification = await response.json();
        log(`✅ AI Classification: "${message.substring(0, 30)}..." → ${classification.intent} (${(classification.confidence * 100).toFixed(1)}%)`, colors.green);
      } else {
        log('❌ AI Classification: Failed', colors.red);
      }
    } catch (error) {
      log(`❌ AI Classification: ${error.message}`, colors.red);
    }
  }
}

async function testRealTimeFeatures() {
  log('\n⚡ Testing Real-time Features', colors.cyan);

  // Test integration log generation
  try {
    const logData = {
      system: 'test',
      action: 'functionality_test',
      status: 'success',
      message: 'Automated functionality test completed successfully',
      metadata: { testId: Date.now(), automated: true }
    };

    const logResponse = await makeRequest('/api/logs', 'POST', logData);
    if (logResponse.ok) {
      log('✅ Integration Logging: Successfully created test log entry', colors.green);
    } else {
      log('❌ Integration Logging: Failed', colors.red);
    }
  } catch (error) {
    log(`❌ Integration Logging: ${error.message}`, colors.red);
  }

  // Test chat session creation
  try {
    const sessionData = {
      customerId: 1,
      ticketId: null,
      status: 'active'
    };

    const sessionResponse = await makeRequest('/api/chat/sessions', 'POST', sessionData);
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      log(`✅ Chat Session Creation: Created session ID ${session.id}`, colors.green);
    } else {
      log('❌ Chat Session Creation: Failed', colors.red);
    }
  } catch (error) {
    log(`❌ Chat Session Creation: ${error.message}`, colors.red);
  }
}

async function runAllTests() {
  log('🚀 Starting Comprehensive Functionality Test', colors.bright);
  log('=' .repeat(60), colors.blue);

  try {
    await testAPIEndpoints();
    await testCRUDOperations();
    await testWebSocketFunctionality();
    await testAIFeatures();
    await testRealTimeFeatures();

    log('\n' + '=' .repeat(60), colors.blue);
    log('✅ Comprehensive Test Suite Complete!', colors.green);
    log('🎯 All major features have been tested', colors.bright);

  } catch (error) {
    log(`\n❌ Test Suite Error: ${error.message}`, colors.red);
  }
}

// ES Module imports for Node.js environment
import fetch from 'node-fetch';
import { WebSocket } from 'ws';

// Make fetch and WebSocket available globally
global.fetch = fetch;
global.WebSocket = WebSocket;

runAllTests();