import { db } from "@workspace/db";
import {
  usersTable, distributorsTable, productsTable, storesTable
} from "@workspace/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "salt_distribution_system").digest("hex");
}

async function seed() {
  console.log("🌱 Seeding database...");

  const existingAdmin = await db.select().from(usersTable).limit(1);
  if (existingAdmin.length > 0) {
    console.log("✅ Database already seeded, skipping...");
    process.exit(0);
  }

  const [admin] = await db.insert(usersTable).values({
    username: "admin",
    password: hashPassword("admin123"),
    firstName: "مدير",
    lastName: "النظام",
    role: "admin",
    phone: "0555000001",
    isActive: true,
  }).returning();
  console.log("✅ Admin user created:", admin.username);

  const [dist1User] = await db.insert(usersTable).values({
    username: "ali",
    password: hashPassword("ali123"),
    firstName: "علي",
    lastName: "محمد",
    role: "distributor",
    phone: "0555100001",
    isActive: true,
  }).returning();

  const [dist2User] = await db.insert(usersTable).values({
    username: "omar",
    password: hashPassword("omar123"),
    firstName: "عمر",
    lastName: "أحمد",
    role: "distributor",
    phone: "0555100002",
    isActive: true,
  }).returning();

  const [dist3User] = await db.insert(usersTable).values({
    username: "hassan",
    password: hashPassword("hassan123"),
    firstName: "حسن",
    lastName: "علي",
    role: "distributor",
    phone: "0555100003",
    isActive: true,
  }).returning();

  const [dist1] = await db.insert(distributorsTable).values({
    userId: dist1User.id,
    latitude: 36.7525,
    longitude: 3.0420,
    totalTasksCompleted: 45,
    totalAmountCollected: "125000",
    debt: "15000",
  }).returning();

  const [dist2] = await db.insert(distributorsTable).values({
    userId: dist2User.id,
    latitude: 36.7622,
    longitude: 3.0550,
    totalTasksCompleted: 32,
    totalAmountCollected: "87000",
    debt: "8500",
  }).returning();

  const [dist3] = await db.insert(distributorsTable).values({
    userId: dist3User.id,
    latitude: 36.7400,
    longitude: 3.0280,
    totalTasksCompleted: 18,
    totalAmountCollected: "52000",
    debt: "5200",
  }).returning();

  console.log("✅ Distributors created");

  await db.insert(productsTable).values([
    { name: "زيت عباد الشمس 5L", purchasePrice: "650", sellPrice: "800", quantity: 250, lowStockThreshold: 20 },
    { name: "سكر أبيض 50kg", purchasePrice: "3500", sellPrice: "4200", quantity: 15, lowStockThreshold: 10 },
    { name: "دقيق قمح 50kg", purchasePrice: "2800", sellPrice: "3400", quantity: 8, lowStockThreshold: 15 },
    { name: "أرز مصري 25kg", purchasePrice: "4500", sellPrice: "5500", quantity: 120, lowStockThreshold: 20 },
    { name: "طماطم معلبة 500g", purchasePrice: "85", sellPrice: "110", quantity: 500, lowStockThreshold: 50 },
    { name: "حليب بقر 1L", purchasePrice: "120", sellPrice: "150", quantity: 300, lowStockThreshold: 30 },
    { name: "شاي أسود 250g", purchasePrice: "200", sellPrice: "260", quantity: 200, lowStockThreshold: 25 },
    { name: "قهوة عربية 250g", purchasePrice: "450", sellPrice: "580", quantity: 5, lowStockThreshold: 15 },
    { name: "صابون غسيل 1kg", purchasePrice: "180", sellPrice: "230", quantity: 350, lowStockThreshold: 30 },
    { name: "معكرونة 500g", purchasePrice: "75", sellPrice: "95", quantity: 400, lowStockThreshold: 40 },
  ]);
  console.log("✅ Products created");

  await db.insert(storesTable).values([
    { name: "مجمع النور", ownerName: "أحمد بن يوسف", phone: "0555200001", latitude: 36.7600, longitude: 3.0500, address: "حي الأمير، شارع الاستقلال", debt: "25000", totalVisits: 12, lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { name: "سوبر ماركت الفرح", ownerName: "محمد الصغير", phone: "0555200002", latitude: 36.7480, longitude: 3.0380, address: "حي السلام، رقم 15", debt: "12000", totalVisits: 8, lastVisit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { name: "دكان البركة", ownerName: "عبد الرحمن حداد", phone: "0555200003", latitude: 36.7550, longitude: 3.0460, address: "حي الرحمة، الزاوية", debt: "5500", totalVisits: 20, lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { name: "متجر الخير", ownerName: "فاطمة بوزيد", phone: "0555200004", latitude: 36.7700, longitude: 3.0600, address: "شارع الوحدة رقم 7", debt: "0", totalVisits: 5 },
    { name: "بقالة السعادة", ownerName: "يوسف عمراني", phone: "0555200005", latitude: 36.7450, longitude: 3.0350, address: "حي التقدم", debt: "18000", totalVisits: 15, lastVisit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
    { name: "ميني ماركت الأمل", ownerName: "سعيد قرداحي", phone: "0555200006", latitude: 36.7650, longitude: 3.0520, address: "تجزئة الأمل رقم 3", debt: "8000", totalVisits: 3, lastVisit: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  ]);
  console.log("✅ Stores created");

  console.log("\n🎉 Seed complete!");
  console.log("📝 Login credentials:");
  console.log("  Admin: admin / admin123");
  console.log("  Distributor 1: ali / ali123");
  console.log("  Distributor 2: omar / omar123");
  console.log("  Distributor 3: hassan / hassan123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
