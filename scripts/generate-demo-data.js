#!/usr/bin/env node

/**
 * Comprehensive demo data generator for Ogelo ERP-CRM Integrator
 * Creates realistic test data for all system components
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Demo customers with realistic data
const demoCustomers = [
  {
    name: "Michael Thompson",
    email: "michael@acmecorp.com",
    phone: "+1-555-2468",
    company: "ACME Corporation",
    plan: "enterprise"
  },
  {
    name: "Jessica Rodriguez",
    email: "jessica@cloudtech.io",
    phone: "+1-555-3579",
    company: "CloudTech Solutions",
    plan: "business"
  },
  {
    name: "Alex Chen",
    email: "alex@retailpro.com",
    phone: "+1-555-1357",
    company: "RetailPro Systems",
    plan: "premium"
  },
  {
    name: "Samantha Davis",
    email: "sam@logistics.net",
    phone: "+1-555-2468",
    company: "Global Logistics Inc",
    plan: "enterprise"
  },
  {
    name: "James Wilson",
    email: "james@manufacturing.com",
    phone: "+1-555-9753",
    company: "Wilson Manufacturing",
    plan: "business"
  }
];

// Demo tickets with various scenarios
const demoTickets = [
  {
    title: "API rate limits exceeded during peak hours",
    description: "During our busiest periods (9-11 AM), we're consistently hitting API rate limits which is causing sync delays and affecting our customer experience.",
    category: "technical",
    priority: "high"
  },
  {
    title: "Invoicing discrepancies between CRM and ERP",
    description: "We've noticed that invoice amounts in our CRM don't match what's being generated in the ERP system. This is causing billing confusion with our clients.",
    category: "billing",
    priority: "critical"
  },
  {
    title: "Request for advanced reporting features",
    description: "Would love to see more detailed analytics on our integration performance, including success rates by time of day and system-specific metrics.",
    category: "general",
    priority: "medium"
  },
  {
    title: "Customer data not syncing after CRM update",
    description: "Since our CRM system was updated last week, customer contact information and purchase history aren't syncing properly to our ERP system.",
    category: "technical",
    priority: "critical"
  },
  {
    title: "Subscription upgrade and billing questions",
    description: "We need to upgrade to the enterprise plan but have questions about pricing, implementation timeline, and data migration support.",
    category: "billing",
    priority: "medium"
  },
  {
    title: "Integration failing during overnight batch processing",
    description: "Our scheduled overnight data synchronization jobs are failing intermittently. This affects our morning reports and operational planning.",
    category: "technical",
    priority: "high"
  },
  {
    title: "Training request for new team members",
    description: "We have three new team members who need training on using the integration platform and understanding the reporting dashboard.",
    category: "general",
    priority: "low"
  },
  {
    title: "Database connection timeouts during heavy load",
    description: "When processing large batches of orders, we're experiencing database connection timeouts that interrupt our integration workflows.",
    category: "technical",
    priority: "high"
  }
];

// Demo integration logs with realistic activities
const demoLogs = [
  {
    system: "crm",
    action: "customer_sync",
    status: "success",
    message: "Successfully synchronized 1,247 customer records"
  },
  {
    system: "erp",
    action: "inventory_update",
    status: "success",
    message: "Updated inventory levels for 3,456 products"
  },
  {
    system: "integration",
    action: "data_validation",
    status: "warning",
    message: "Data validation completed with 12 warnings"
  },
  {
    system: "crm",
    action: "lead_processing",
    status: "success",
    message: "Processed 89 new leads from marketing campaigns"
  },
  {
    system: "erp",
    action: "order_fulfillment",
    status: "success",
    message: "Updated fulfillment status for 156 orders"
  },
  {
    system: "integration",
    action: "webhook_processing",
    status: "error",
    message: "Webhook processing failed: timeout after 30 seconds"
  },
  {
    system: "crm",
    action: "contact_import",
    status: "success",
    message: "Imported 234 new contacts from external source"
  },
  {
    system: "erp",
    action: "financial_sync",
    status: "success",
    message: "Synchronized financial data for Q4 reporting"
  }
];

async function makeRequest(path, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  return response;
}

async function createDemoCustomers() {
  console.log('🏢 Creating demo customers...');
  const createdCustomers = [];
  
  for (const customer of demoCustomers) {
    try {
      const response = await makeRequest('/api/customers', 'POST', customer);
      if (response.ok) {
        const newCustomer = await response.json();
        createdCustomers.push(newCustomer);
        console.log(`   ✅ Created: ${customer.name} (${customer.company})`);
      } else {
        console.log(`   ❌ Failed to create: ${customer.name}`);
      }
    } catch (error) {
      console.log(`   ❌ Error creating ${customer.name}: ${error.message}`);
    }
  }
  
  return createdCustomers;
}

async function createDemoTickets(customers) {
  console.log('🎫 Creating demo tickets...');
  
  for (let i = 0; i < demoTickets.length; i++) {
    const ticket = demoTickets[i];
    const customer = customers[i % customers.length];
    
    if (!customer) continue;
    
    const ticketData = {
      ...ticket,
      customerId: customer.id
    };
    
    try {
      const response = await makeRequest('/api/tickets', 'POST', ticketData);
      if (response.ok) {
        const newTicket = await response.json();
        console.log(`   ✅ Created: ${ticket.title.substring(0, 40)}... (${newTicket.ticketNumber})`);
      } else {
        console.log(`   ❌ Failed to create ticket: ${ticket.title.substring(0, 40)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Error creating ticket: ${error.message}`);
    }
    
    // Add small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function createDemoLogs() {
  console.log('📋 Creating demo integration logs...');
  
  for (const log of demoLogs) {
    const logData = {
      ...log,
      metadata: {
        source: "demo_generator",
        category: "demo_data",
        timestamp: new Date().toISOString()
      }
    };
    
    try {
      const response = await makeRequest('/api/logs', 'POST', logData);
      if (response.ok) {
        console.log(`   ✅ Created: ${log.system} - ${log.action} (${log.status})`);
      } else {
        console.log(`   ❌ Failed to create log: ${log.action}`);
      }
    } catch (error) {
      console.log(`   ❌ Error creating log: ${error.message}`);
    }
  }
}

async function createDemoChatSessions(customers) {
  console.log('💬 Creating demo chat sessions...');
  
  // Create a few active chat sessions
  for (let i = 0; i < 3; i++) {
    const customer = customers[i];
    if (!customer) continue;
    
    const sessionData = {
      customerId: customer.id,
      status: 'active',
      assignedAgent: ['Sarah Chen', 'Mike Rodriguez', 'Alex Thompson'][i],
      isAIActive: i > 0 // Make some AI-powered, some human-only
    };
    
    try {
      const response = await makeRequest('/api/chat/sessions', 'POST', sessionData);
      if (response.ok) {
        const session = await response.json();
        console.log(`   ✅ Created chat session for ${customer.name} (Session ${session.id})`);
      } else {
        console.log(`   ❌ Failed to create chat session for ${customer.name}`);
      }
    } catch (error) {
      console.log(`   ❌ Error creating chat session: ${error.message}`);
    }
  }
}

async function generateDemoData() {
  console.log('🚀 Starting Demo Data Generation');
  console.log('================================');

  try {
    // Get existing customers to avoid duplicates
    const existingResponse = await makeRequest('/api/customers');
    const existingCustomers = existingResponse.ok ? await existingResponse.json() : [];
    
    console.log(`📊 Found ${existingCustomers.length} existing customers`);
    
    // Create new demo customers
    const newCustomers = await createDemoCustomers();
    const allCustomers = [...existingCustomers, ...newCustomers];
    
    // Create demo tickets
    await createDemoTickets(allCustomers);
    
    // Create demo logs
    await createDemoLogs();
    
    // Create demo chat sessions
    await createDemoChatSessions(allCustomers);
    
    console.log('\n================================');
    console.log('✅ Demo Data Generation Complete!');
    console.log(`📈 Total customers: ${allCustomers.length}`);
    console.log('🎯 Ready for comprehensive testing');

  } catch (error) {
    console.log(`❌ Demo data generation error: ${error.message}`);
  }
}

// Make fetch and other globals available
global.fetch = fetch;

generateDemoData();