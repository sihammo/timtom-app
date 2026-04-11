import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { deliveriesTable, distributorsTable, storesTable, tasksTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getDeliveryFull(id: number) {
  const deliveries = await db.select().from(deliveriesTable).where(eq(deliveriesTable.id, id));
  const d = deliveries[0];
  if (!d) return null;
  const distResult = await db
    .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
    .from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id))
    .where(eq(distributorsTable.id, d.distributorId));
  const storeResult = await db.select({ name: storesTable.name }).from(storesTable).where(eq(storesTable.id, d.storeId));
  return {
    ...d,
    distributorName: distResult[0] ? `${distResult[0].firstName} ${distResult[0].lastName}` : "غير معروف",
    storeName: storeResult[0]?.name ?? "غير معروف",
    amountCollected: parseFloat(d.amountCollected as string),
  };
}

router.get("/", async (req, res) => {
  const { status } = req.query;
  let deliveries;
  if (status) {
    deliveries = await db.select().from(deliveriesTable).where(eq(deliveriesTable.status, status as any)).orderBy(deliveriesTable.deliveredAt);
  } else {
    deliveries = await db.select().from(deliveriesTable).orderBy(deliveriesTable.deliveredAt);
  }
  const results = await Promise.all(deliveries.map(d => getDeliveryFull(d.id)));
  res.json(results.filter(Boolean));
});

router.post("/", async (req, res) => {
  const { taskId, photoUrl, latitude, longitude, amountCollected } = req.body;
  if (!taskId || latitude == null || longitude == null || amountCollected == null) {
    res.status(400).json({ error: "validation_error", message: "Missing required fields" }); return;
  }
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId));
  const task = tasks[0];
  if (!task) { res.status(404).json({ error: "not_found", message: "Task not found" }); return; }
  const [delivery] = await db.insert(deliveriesTable).values({
    taskId, distributorId: task.distributorId, storeId: task.storeId,
    photoUrl, latitude, longitude, amountCollected: amountCollected.toString(),
  }).returning();
  await db.update(tasksTable).set({ status: "completed", completedAt: new Date() }).where(eq(tasksTable.id, taskId));
  await db.update(storesTable).set({
    debt: (parseFloat((await db.select({ debt: storesTable.debt }).from(storesTable).where(eq(storesTable.id, task.storeId)))[0]?.debt ?? "0") + parseFloat(task.totalAmount as string) - amountCollected).toString(),
    totalVisits: (await db.select({ tv: storesTable.totalVisits }).from(storesTable).where(eq(storesTable.id, task.storeId)))[0]?.tv + 1 ?? 1,
    lastVisit: new Date(),
  }).where(eq(storesTable.id, task.storeId));
  const full = await getDeliveryFull(delivery.id);
  res.status(201).json(full);
});

router.put("/:id/confirm", async (req, res) => {
  const id = parseInt(req.params.id);
  const deliveries = await db.select().from(deliveriesTable).where(eq(deliveriesTable.id, id));
  const d = deliveries[0];
  if (!d) { res.status(404).json({ error: "not_found", message: "Delivery not found" }); return; }
  await db.update(deliveriesTable).set({ status: "confirmed", confirmedAt: new Date() }).where(eq(deliveriesTable.id, id));
  await db.update(distributorsTable).set({
    debt: (parseFloat((await db.select({ debt: distributorsTable.debt }).from(distributorsTable).where(eq(distributorsTable.id, d.distributorId)))[0]?.debt ?? "0") + parseFloat(d.amountCollected as string)).toString(),
    totalTasksCompleted: (await db.select({ tc: distributorsTable.totalTasksCompleted }).from(distributorsTable).where(eq(distributorsTable.id, d.distributorId)))[0]?.tc + 1 ?? 1,
  }).where(eq(distributorsTable.id, d.distributorId));
  const full = await getDeliveryFull(id);
  res.json(full);
});

router.put("/:id/reject", async (req, res) => {
  const id = parseInt(req.params.id);
  const { reason } = req.body;
  await db.update(deliveriesTable).set({ status: "rejected", rejectionReason: reason }).where(eq(deliveriesTable.id, id));
  const full = await getDeliveryFull(id);
  if (!full) { res.status(404).json({ error: "not_found", message: "Delivery not found" }); return; }
  res.json(full);
});

export default router;
