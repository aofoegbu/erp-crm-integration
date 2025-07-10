import { db } from "../server/db";
import { customers, tickets, integrationLogs } from "../shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database with initial data...");

  try {
    // Clear existing data (optional in production)
    await db.delete(tickets);
    await db.delete(customers);
    await db.delete(integrationLogs);

    // Create sample customers
    console.log("Creating customers...");
    const customer1 = await db.insert(customers).values({
      name: "John Smith",
      email: "john@techcorp.com",
      phone: "+1-555-0123",
      company: "TechCorp Solutions",
      plan: "enterprise"
    }).returning();

    const customer2 = await db.insert(customers).values({
      name: "Sarah Johnson",
      email: "sarah@globalmanuf.com",
      phone: "+1-555-0456", 
      company: "Global Manufacturing",
      plan: "business"
    }).returning();

    console.log(`Created ${customer1.length + customer2.length} customers`);

    // Create sample tickets
    console.log("Creating tickets...");
    const ticket1 = await db.insert(tickets).values({
      ticketNumber: "TK001",
      customerId: customer1[0].id,
      title: "Integration sync failure - Customer data not updating",
      description: "Customer reporting that their latest customer updates from CRM are not syncing to the ERP system. This is affecting their order processing workflow.",
      status: "open",
      priority: "high",
      category: "technical",
      assignedTo: "Sarah Chen",
      aiClassification: {
        intent: "technical",
        confidence: 0.95,
        priority: "high",
        summary: "Customer experiencing CRM to ERP sync issues affecting order processing."
      }
    }).returning();

    const ticket2 = await db.insert(tickets).values({
      ticketNumber: "TK002",
      customerId: customer2[0].id,
      title: "Request for additional API rate limits",
      description: "Customer requesting increase in API rate limits for their business plan to handle increased transaction volume.",
      status: "in_progress",
      priority: "medium",
      category: "billing",
      assignedTo: "Mike Rodriguez",
      aiClassification: {
        intent: "billing",
        confidence: 0.88,
        priority: "medium",
        summary: "Business customer requesting API rate limit increase."
      }
    }).returning();

    console.log(`Created ${ticket1.length + ticket2.length} tickets`);

    // Create sample integration logs
    console.log("Creating integration logs...");
    const logs = [
      {
        system: "crm",
        action: "sync_customers",
        status: "success",
        message: "Successfully synchronized 50 customer records",
        metadata: { recordCount: 50, duration: 1200 }
      },
      {
        system: "erp",
        action: "update_inventory",
        status: "success", 
        message: "Inventory levels updated successfully",
        metadata: { itemsUpdated: 125, duration: 800 }
      },
      {
        system: "integration",
        action: "webhook_delivery",
        status: "warning",
        message: "Webhook delivery rate below 98% threshold",
        metadata: { deliveryRate: 0.961, threshold: 0.98 }
      }
    ];

    for (const log of logs) {
      await db.insert(integrationLogs).values(log);
    }

    console.log(`Created ${logs.length} integration logs`);
    console.log("✅ Database seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  seedDatabase().then(() => {
    console.log("Seeding completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

export { seedDatabase };