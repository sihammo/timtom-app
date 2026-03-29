import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  tasksTable, productsTable, storesTable, distributorsTable,
  deliveriesTable, usersTable
} from "@workspace/db";
import { eq, gte, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const calcProfit = async (since: Date) => {
    const tasks = await db.select().from(tasksTable)
      .where(and(eq(tasksTable.status, "completed"), gte(tasksTable.completedAt!, since)));
    let revenue = 0;
    for (const t of tasks) {
      revenue += parseFloat(t.totalAmount as string);
    }
    return revenue * 0.3;
  };

  const [todayProfit, weekProfit, monthProfit] = await Promise.all([
    calcProfit(todayStart),
    calcProfit(weekStart),
    calcProfit(monthStart),
  ]);

  const [allTasks, pendingTasks, completedTasks] = await Promise.all([
    db.select({ id: tasksTable.id }).from(tasksTable),
    db.select({ id: tasksTable.id }).from(tasksTable).where(eq(tasksTable.status, "pending")),
    db.select({ id: tasksTable.id }).from(tasksTable).where(eq(tasksTable.status, "completed")),
  ]);

  const products = await db.select().from(productsTable);
  const lowStockProducts = products.filter(p => p.quantity <= p.lowStockThreshold).length;

  const stores = await db.select().from(storesTable);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const unvisitedStores = stores.filter(s => !s.lastVisit || s.lastVisit < thirtyDaysAgo).length;

  const storeDebts = stores.reduce((sum, s) => sum + parseFloat(s.debt), 0);

  const pendingDeliveries = await db.select({ id: deliveriesTable.id }).from(deliveriesTable)
    .where(eq(deliveriesTable.status, "pending_admin"));

  const activeDistributors = await db.select({ id: distributorsTable.id }).from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id))
    .where(eq(usersTable.isActive, true));

  res.json({
    todayProfit,
    weekProfit,
    monthProfit,
    totalTasks: allTasks.length,
    pendingTasks: pendingTasks.length,
    completedTasks: completedTasks.length,
    lowStockProducts,
    unvisitedStores,
    unpaidDebts: storeDebts,
    pendingDeliveries: pendingDeliveries.length,
    activeDistributors: activeDistributors.length,
    totalStores: stores.length,
  });
});

export default router;
