import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  storesTable, distributorsTable, tasksTable, deliveriesTable,
  usersTable, settlementsTable
} from "@workspace/db";
import { eq, gte, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/summary", async (req, res) => {
  const { period = "month" } = req.query;
  const now = new Date();
  let startDate: Date;
  if (period === "day") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const completedTasks = await db.select().from(tasksTable)
    .where(and(eq(tasksTable.status, "completed"), gte(tasksTable.completedAt!, startDate)));

  let totalRevenue = 0;
  let totalCost = 0;
  for (const task of completedTasks) {
    const items = task.items as Array<{ quantity: number; price: number; productId: number }>;
    for (const item of items) {
      totalRevenue += item.price * item.quantity;
    }
    totalCost += parseFloat(task.totalAmount as string) * 0.7;
  }

  const storeDebts = await db.select({ debt: storesTable.debt }).from(storesTable);
  const totalStoreDebts = storeDebts.reduce((sum, s) => sum + parseFloat(s.debt), 0);

  const distDebts = await db.select({ debt: distributorsTable.debt }).from(distributorsTable);
  const totalDistributorDebts = distDebts.reduce((sum, d) => sum + parseFloat(d.debt), 0);

  const allTasks = await db.select({ id: tasksTable.id }).from(tasksTable);
  const deliveries = await db.select({ id: deliveriesTable.id }).from(deliveriesTable);

  res.json({
    period,
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    totalStoreDebts,
    totalDistributorDebts,
    totalDeliveries: deliveries.length,
    totalTasks: allTasks.length,
  });
});

router.get("/debts/stores", async (_req, res) => {
  const stores = await db.select().from(storesTable).where(sql`${storesTable.debt}::numeric > 0`);
  res.json(stores.map(s => ({
    storeId: s.id,
    storeName: s.name,
    ownerName: s.ownerName,
    phone: s.phone,
    debt: parseFloat(s.debt),
    lastVisit: s.lastVisit,
  })));
});

router.get("/debts/distributors", async (_req, res) => {
  const result = await db
    .select({
      id: distributorsTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      phone: usersTable.phone,
      debt: distributorsTable.debt,
      totalAmountCollected: distributorsTable.totalAmountCollected,
    })
    .from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id))
    .where(sql`${distributorsTable.debt}::numeric > 0`);

  res.json(result.map(d => ({
    distributorId: d.id,
    distributorName: `${d.firstName} ${d.lastName}`,
    phone: d.phone ?? "",
    debt: parseFloat(d.debt),
    totalCollected: parseFloat(d.totalAmountCollected as string),
    totalSettled: parseFloat(d.totalAmountCollected as string) - parseFloat(d.debt),
  })));
});

router.post("/settle/:distributorId", async (req, res) => {
  const distributorId = parseInt(req.params.distributorId);
  const { amount, notes } = req.body;
  if (!amount) { res.status(400).json({ error: "validation_error", message: "Amount required" }); return; }
  await db.insert(settlementsTable).values({ distributorId, amount: amount.toString(), notes });
  const dists = await db.select({ debt: distributorsTable.debt }).from(distributorsTable).where(eq(distributorsTable.id, distributorId));
  const currentDebt = parseFloat(dists[0]?.debt ?? "0");
  const newDebt = Math.max(0, currentDebt - amount);
  await db.update(distributorsTable).set({ debt: newDebt.toString() }).where(eq(distributorsTable.id, distributorId));
  res.json({ message: "Account settled" });
});

export default router;
