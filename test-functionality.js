#!/usr/bin/env node

/**
 * Comprehensive functionality test for ERP/CRM Integration Command Center
 * Tests all major features including API endpoints, WebSocket, and AI functionality
 */

import http from 'http';
import WebSocket from 'ws';

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000/ws';

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsedBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test suites
async function testAPIEndpoints() {
  log('\n🔗 Testing API Endpoints', colors.blue);
  
  const tests = [
    { name: 'GET /api/customers', path: '/api/customers' },
    { name: 'GET /api/tickets', path: '/api/tickets' },
    { name: 'GET /api/analytics/dashboard', path: '/api/analytics/dashboard' },
    { name: 'GET /api/logs', path: '/api/logs' },
    { name: 'GET /api/chat-sessions', path: '/api/chat-sessions' },
    { name: 'GET /api/maintenance', path: '/api/maintenance' },
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const result = await makeRequest(test.path);
      if (result.status === 200) {
        log(`  ✓ ${test.name}`, colors.green);
        passed++;
      } else {
        log(`  ✗ ${test.name} (Status: ${result.status})`, colors.red);
      }
    } catch (error) {
      log(`  ✗ ${test.name} (Error: ${error.message})`, colors.red);
    }
  }
  
  log(`\n📊 API Tests: ${passed}/${tests.length} passed`);
  return passed === tests.length;
}

async function testCRUDOperations() {
  log('\n📝 Testing CRUD Operations', colors.blue);
  
  let passed = 0;
  let total = 0;
  
  // Test customer creation
  total++;
  try {
    const newCustomer = {
      name: 'Test Customer',
      email: 'test@example.com',
      company: 'Test Corp',
      plan: 'business'
    };
    
    const result = await makeRequest('/api/customers', 'POST', newCustomer);
    if (result.status === 200 || result.status === 201) {
      log('  ✓ Create customer', colors.green);
      passed++;
    } else {
      log('  ✗ Create customer', colors.red);
    }
  } catch (error) {
    log('  ✗ Create customer (Error)', colors.red);
  }
  
  // Test ticket creation with AI classification
  total++;
  try {
    const newTicket = {
      title: 'Integration test ticket',
      description: 'Testing the AI classification system for technical issues',
      customerId: 1,
      category: 'technical',
      priority: 'medium'
    };
    
    const result = await makeRequest('/api/tickets', 'POST', newTicket);
    if (result.status === 200 || result.status === 201) {
      log('  ✓ Create ticket with AI classification', colors.green);
      if (result.data && result.data.aiClassification) {
        log(`    AI Classification: ${JSON.stringify(result.data.aiClassification)}`, colors.yellow);
      }
      passed++;
    } else {
      log('  ✗ Create ticket', colors.red);
    }
  } catch (error) {
    log('  ✗ Create ticket (Error)', colors.red);
  }
  
  // Test chat session creation
  total++;
  try {
    const newSession = {
      customerId: 1,
      status: 'active',
      ticketId: 1
    };
    
    const result = await makeRequest('/api/chat-sessions', 'POST', newSession);
    if (result.status === 200 || result.status === 201) {
      log('  ✓ Create chat session', colors.green);
      passed++;
    } else {
      log('  ✗ Create chat session', colors.red);
    }
  } catch (error) {
    log('  ✗ Create chat session (Error)', colors.red);
  }
  
  log(`\n📊 CRUD Tests: ${passed}/${total} passed`);
  return passed === total;
}

async function testWebSocketFunctionality() {
  log('\n🔌 Testing WebSocket Functionality', colors.blue);
  
  return new Promise((resolve) => {
    let connected = false;
    let messageReceived = false;
    
    const ws = new WebSocket(WS_URL);
    
    const timeout = setTimeout(() => {
      if (!connected) {
        log('  ✗ WebSocket connection timeout', colors.red);
      }
      if (!messageReceived) {
        log('  ✗ WebSocket message timeout', colors.red);
      }
      ws.close();
      resolve(connected && messageReceived);
    }, 10000);
    
    ws.on('open', () => {
      connected = true;
      log('  ✓ WebSocket connection established', colors.green);
      
      // Test chat message with AI
      ws.send(JSON.stringify({
        type: 'chat_message',
        sessionId: 1,
        message: 'Hello, I need help with my CRM integration. It seems to be having sync issues.'
      }));
    });
    
    ws.on('message', (data) => {
      messageReceived = true;
      try {
        const parsed = JSON.parse(data.toString());
        log('  ✓ WebSocket message received', colors.green);
        log(`    Message type: ${parsed.type}`, colors.yellow);
      } catch (e) {
        log('  ✓ WebSocket raw message received', colors.green);
      }
      
      clearTimeout(timeout);
      ws.close();
      resolve(connected && messageReceived);
    });
    
    ws.on('error', (error) => {
      log(`  ✗ WebSocket error: ${error.message}`, colors.red);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function testAIFeatures() {
  log('\n🤖 Testing AI Features (Gemini Integration)', colors.blue);
  
  let passed = 0;
  let total = 2;
  
  // Test ticket with technical issue
  try {
    const technicalTicket = {
      title: 'API sync error',
      description: 'Our CRM is not syncing properly with the ERP system. Getting 500 errors.',
      customerId: 1,
      category: 'technical',
      priority: 'high'
    };
    
    const result = await makeRequest('/api/tickets', 'POST', technicalTicket);
    if (result.data && result.data.aiClassification) {
      const classification = result.data.aiClassification;
      if (classification.intent === 'technical' && classification.confidence > 0.7) {
        log('  ✓ AI correctly classified technical issue', colors.green);
        log(`    Intent: ${classification.intent}, Confidence: ${classification.confidence}`, colors.yellow);
        passed++;
      } else {
        log('  ✗ AI classification accuracy low', colors.red);
      }
    } else {
      log('  ✗ AI classification not found', colors.red);
    }
  } catch (error) {
    log('  ✗ AI technical classification test failed', colors.red);
  }
  
  // Test ticket with billing issue
  try {
    const billingTicket = {
      title: 'Payment issue',
      description: 'I was charged twice this month for my subscription. Need refund.',
      customerId: 1,
      category: 'billing',
      priority: 'medium'
    };
    
    const result = await makeRequest('/api/tickets', 'POST', billingTicket);
    if (result.data && result.data.aiClassification) {
      const classification = result.data.aiClassification;
      if (classification.intent === 'billing' && classification.confidence > 0.7) {
        log('  ✓ AI correctly classified billing issue', colors.green);
        log(`    Intent: ${classification.intent}, Confidence: ${classification.confidence}`, colors.yellow);
        passed++;
      } else {
        log('  ✗ AI classification accuracy low', colors.red);
      }
    } else {
      log('  ✗ AI classification not found', colors.red);
    }
  } catch (error) {
    log('  ✗ AI billing classification test failed', colors.red);
  }
  
  log(`\n📊 AI Tests: ${passed}/${total} passed`);
  return passed === total;
}

async function testRealTimeFeatures() {
  log('\n⚡ Testing Real-time Features', colors.blue);
  
  let passed = 0;
  let total = 2;
  
  // Test logs are updating
  try {
    const before = await makeRequest('/api/logs');
    await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for new logs
    const after = await makeRequest('/api/logs');
    
    if (after.data.length > before.data.length) {
      log('  ✓ Real-time logs are updating', colors.green);
      passed++;
    } else {
      log('  ✗ Logs not updating in real-time', colors.red);
    }
  } catch (error) {
    log('  ✗ Real-time logs test failed', colors.red);
  }
  
  // Test analytics dashboard
  try {
    const analytics = await makeRequest('/api/analytics/dashboard');
    if (analytics.data && analytics.data.tickets && analytics.data.api && analytics.data.satisfaction) {
      log('  ✓ Analytics dashboard functioning', colors.green);
      passed++;
    } else {
      log('  ✗ Analytics dashboard incomplete', colors.red);
    }
  } catch (error) {
    log('  ✗ Analytics dashboard test failed', colors.red);
  }
  
  log(`\n📊 Real-time Tests: ${passed}/${total} passed`);
  return passed === total;
}

// Main test runner
async function runAllTests() {
  log('🚀 ERP/CRM Integration Command Center - Functionality Test', colors.blue);
  log('='.repeat(60));
  
  const results = {
    api: await testAPIEndpoints(),
    crud: await testCRUDOperations(),
    websocket: await testWebSocketFunctionality(),
    ai: await testAIFeatures(),
    realtime: await testRealTimeFeatures()
  };
  
  log('\n📋 Test Summary', colors.blue);
  log('='.repeat(30));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✓' : '✗';
    const color = result ? colors.green : colors.red;
    log(`  ${status} ${test.toUpperCase()} tests`, color);
  });
  
  log(`\n🎯 Overall Result: ${passed}/${total} test suites passed`, 
       passed === total ? colors.green : colors.red);
  
  if (passed === total) {
    log('\n🎉 All functionality tests passed! The application is working correctly.', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Check the logs above for details.', colors.yellow);
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests if called directly
if (import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  runAllTests().catch(error => {
    log(`\n💥 Test runner failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}