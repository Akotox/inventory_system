import { PrismaClient, UserRole, PaymentMethod, SaleStatus, POStatus, MovementType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Users
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@inventory.com" },
    update: {},
    create: {
      email: "admin@inventory.com",
      name: "Admin User",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: "cashier@inventory.com" },
    update: {},
    create: {
      email: "cashier@inventory.com",
      name: "Jane Cashier",
      password: await bcrypt.hash("cashier123", 12),
      role: UserRole.CASHIER,
    },
  });

  const warehouse = await prisma.user.upsert({
    where: { email: "warehouse@inventory.com" },
    update: {},
    create: {
      email: "warehouse@inventory.com",
      name: "Bob Warehouse",
      password: await bcrypt.hash("warehouse123", 12),
      role: UserRole.WAREHOUSE,
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: "Electronics" }, update: {}, create: { name: "Electronics", description: "Electronic devices and accessories" } }),
    prisma.category.upsert({ where: { name: "Office Supplies" }, update: {}, create: { name: "Office Supplies", description: "Stationery and office equipment" } }),
    prisma.category.upsert({ where: { name: "Furniture" }, update: {}, create: { name: "Furniture", description: "Office and home furniture" } }),
    prisma.category.upsert({ where: { name: "Networking" }, update: {}, create: { name: "Networking", description: "Network equipment and cables" } }),
    prisma.category.upsert({ where: { name: "Peripherals" }, update: {}, create: { name: "Peripherals", description: "Computer peripherals and accessories" } }),
  ]);

  // Suppliers — use findFirst + create pattern to stay idempotent
  const findOrCreateSupplier = async (name: string, data: object) => {
    const existing = await prisma.supplier.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.supplier.create({ data: { name, ...data } });
  };

  const suppliers = await Promise.all([
    findOrCreateSupplier("TechCorp Distributors", { contactName: "Alice Smith", email: "alice@techcorp.com", phone: "+1-555-0101" }),
    findOrCreateSupplier("Office World", { contactName: "Bob Jones", email: "bob@officeworld.com", phone: "+1-555-0102" }),
    findOrCreateSupplier("NetGear Supply", { contactName: "Carol White", email: "carol@netgear.com", phone: "+1-555-0103" }),
  ]);

  // Products
  const productData = [
    { sku: "ELEC-001", name: "Laptop Pro 15\"", costPrice: 800, sellingPrice: 1299, stockQuantity: 45, reorderLevel: 10, reorderQuantity: 20, categoryId: categories[0].id, supplierId: suppliers[0].id },
    { sku: "ELEC-002", name: "Wireless Mouse", costPrice: 15, sellingPrice: 35, stockQuantity: 120, reorderLevel: 30, reorderQuantity: 100, categoryId: categories[0].id, supplierId: suppliers[0].id },
    { sku: "ELEC-003", name: "Mechanical Keyboard", costPrice: 60, sellingPrice: 129, stockQuantity: 8, reorderLevel: 15, reorderQuantity: 50, categoryId: categories[0].id, supplierId: suppliers[0].id },
    { sku: "ELEC-004", name: "4K Monitor 27\"", costPrice: 250, sellingPrice: 449, stockQuantity: 22, reorderLevel: 8, reorderQuantity: 15, categoryId: categories[0].id, supplierId: suppliers[0].id },
    { sku: "ELEC-005", name: "USB-C Hub 7-in-1", costPrice: 20, sellingPrice: 49, stockQuantity: 5, reorderLevel: 20, reorderQuantity: 60, categoryId: categories[0].id, supplierId: suppliers[0].id },
    { sku: "OFF-001", name: "A4 Paper Ream (500 sheets)", costPrice: 3, sellingPrice: 8, stockQuantity: 300, reorderLevel: 100, reorderQuantity: 500, categoryId: categories[1].id, supplierId: suppliers[1].id },
    { sku: "OFF-002", name: "Ballpoint Pen Box (50)", costPrice: 5, sellingPrice: 12, stockQuantity: 80, reorderLevel: 25, reorderQuantity: 100, categoryId: categories[1].id, supplierId: suppliers[1].id },
    { sku: "OFF-003", name: "Stapler Heavy Duty", costPrice: 12, sellingPrice: 28, stockQuantity: 35, reorderLevel: 10, reorderQuantity: 30, categoryId: categories[1].id, supplierId: suppliers[1].id },
    { sku: "FURN-001", name: "Ergonomic Office Chair", costPrice: 180, sellingPrice: 349, stockQuantity: 12, reorderLevel: 5, reorderQuantity: 10, categoryId: categories[2].id, supplierId: suppliers[1].id },
    { sku: "FURN-002", name: "Standing Desk 60\"", costPrice: 350, sellingPrice: 699, stockQuantity: 7, reorderLevel: 3, reorderQuantity: 8, categoryId: categories[2].id, supplierId: suppliers[1].id },
    { sku: "NET-001", name: "Gigabit Switch 24-Port", costPrice: 80, sellingPrice: 159, stockQuantity: 18, reorderLevel: 5, reorderQuantity: 15, categoryId: categories[3].id, supplierId: suppliers[2].id },
    { sku: "NET-002", name: "Cat6 Cable 50ft", costPrice: 8, sellingPrice: 18, stockQuantity: 200, reorderLevel: 50, reorderQuantity: 200, categoryId: categories[3].id, supplierId: suppliers[2].id },
    { sku: "NET-003", name: "WiFi 6 Router", costPrice: 90, sellingPrice: 189, stockQuantity: 3, reorderLevel: 8, reorderQuantity: 20, categoryId: categories[3].id, supplierId: suppliers[2].id },
    { sku: "PER-001", name: "Webcam 1080p", costPrice: 35, sellingPrice: 79, stockQuantity: 40, reorderLevel: 15, reorderQuantity: 40, categoryId: categories[4].id, supplierId: suppliers[0].id },
    { sku: "PER-002", name: "Noise-Cancelling Headset", costPrice: 55, sellingPrice: 119, stockQuantity: 25, reorderLevel: 10, reorderQuantity: 30, categoryId: categories[4].id, supplierId: suppliers[0].id },
  ];

  const products = [];
  for (const p of productData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
    products.push(product);
  }

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({ where: { email: "john.doe@acme.com" }, update: {}, create: { name: "John Doe", email: "john.doe@acme.com", phone: "+1-555-1001", totalSpent: 2450.00 } }),
    prisma.customer.upsert({ where: { email: "sarah.tech@startup.io" }, update: {}, create: { name: "Sarah Tech", email: "sarah.tech@startup.io", phone: "+1-555-1002", totalSpent: 5890.50 } }),
    prisma.customer.upsert({ where: { email: "mike.corp@enterprise.com" }, update: {}, create: { name: "Mike Corp", email: "mike.corp@enterprise.com", phone: "+1-555-1003", totalSpent: 12300.00 } }),
    prisma.customer.upsert({ where: { email: "lisa.small@business.net" }, update: {}, create: { name: "Lisa Small", email: "lisa.small@business.net", phone: "+1-555-1004", totalSpent: 890.00 } }),
  ]);

  // Sales
  const saleData = [
    { saleNumber: "S-1001", customerId: customers[0].id, userId: cashier.id, subtotal: 1334, discount: 0, tax: 133.4, total: 1467.4, paymentMethod: PaymentMethod.CARD, status: SaleStatus.PAID },
    { saleNumber: "S-1002", customerId: customers[1].id, userId: cashier.id, subtotal: 449, discount: 20, tax: 42.9, total: 471.9, paymentMethod: PaymentMethod.CASH, status: SaleStatus.PAID },
    { saleNumber: "S-1003", customerId: customers[2].id, userId: admin.id, subtotal: 3495, discount: 200, tax: 329.5, total: 3624.5, paymentMethod: PaymentMethod.TRANSFER, status: SaleStatus.INVOICED },
    { saleNumber: "S-1004", customerId: null, userId: cashier.id, subtotal: 47, discount: 0, tax: 4.7, total: 51.7, paymentMethod: PaymentMethod.CASH, status: SaleStatus.PAID },
    { saleNumber: "S-1005", customerId: customers[3].id, userId: cashier.id, subtotal: 238, discount: 10, tax: 22.8, total: 250.8, paymentMethod: PaymentMethod.CARD, status: SaleStatus.PAID },
  ];

  for (const s of saleData) {
    await prisma.sale.upsert({
      where: { saleNumber: s.saleNumber },
      update: {},
      create: {
        ...s,
        saleItems: {
          create: [
            { productId: products[0].id, quantity: 1, unitPrice: 1299, discount: 0, lineTotal: 1299 },
          ],
        },
      },
    });
  }

  // Purchase Orders
  const po1 = await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-001" },
    update: {},
    create: {
      poNumber: "PO-001",
      supplierId: suppliers[0].id,
      status: POStatus.RECEIVED,
      totalAmount: 4800,
      expectedDate: new Date("2024-01-15"),
      receivedDate: new Date("2024-01-14"),
      poItems: {
        create: [
          { productId: products[0].id, quantityOrdered: 5, quantityReceived: 5, unitCost: 800, lineTotal: 4000 },
          { productId: products[1].id, quantityOrdered: 50, quantityReceived: 50, unitCost: 15, lineTotal: 750 },
        ],
      },
    },
  });

  const po2 = await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-002" },
    update: {},
    create: {
      poNumber: "PO-002",
      supplierId: suppliers[2].id,
      status: POStatus.SENT,
      totalAmount: 1890,
      expectedDate: new Date("2024-02-20"),
      poItems: {
        create: [
          { productId: products[10].id, quantityOrdered: 10, quantityReceived: 0, unitCost: 80, lineTotal: 800 },
          { productId: products[12].id, quantityOrdered: 12, quantityReceived: 0, unitCost: 90, lineTotal: 1080 },
        ],
      },
    },
  });

  // Inventory Movements
  await prisma.inventoryMovement.createMany({
    skipDuplicates: true,
    data: [
      { productId: products[0].id, type: MovementType.PURCHASE, quantity: 5, quantityBefore: 40, quantityAfter: 45, referenceType: "PURCHASE_ORDER", notes: "Initial stock receipt", createdById: warehouse.id },
      { productId: products[2].id, type: MovementType.SALE, quantity: -2, quantityBefore: 10, quantityAfter: 8, referenceType: "SALE", notes: "Sale S-1001", createdById: cashier.id },
      { productId: products[4].id, type: MovementType.ADJUSTMENT, quantity: -3, quantityBefore: 8, quantityAfter: 5, referenceType: null, notes: "Damaged units removed", createdById: admin.id },
      { productId: products[12].id, type: MovementType.ADJUSTMENT, quantity: -2, quantityBefore: 5, quantityAfter: 3, referenceType: null, notes: "Count correction", createdById: warehouse.id },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("  Admin:     admin@inventory.com     / admin123");
  console.log("  Cashier:   cashier@inventory.com   / cashier123");
  console.log("  Warehouse: warehouse@inventory.com / warehouse123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
