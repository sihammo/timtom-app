import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable, distributorsTable, storesTable, productsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

async function getTaskFull(taskId: number) {
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId));
  const task = tasks[0];
  if (!task) return null;
  const distResult = await db
    .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
    .from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id))
    .where(eq(distributorsTable.id, task.distributorId));
  const store = await db.select().from(storesTable).where(eq(storesTable.id, task.storeId));
  const dist = distResult[0];
  const s = store[0];
  return {
    ...task,
    distributorName: dist ? `${dist.firstName} ${dist.lastName}` : "غير معروف",
    storeName: s?.name ?? "غير معروف",
    storeLatitude: s?.latitude ?? 0,
    storeLongitude: s?.longitude ?? 0,
    totalAmount: parseFloat(task.totalAmount as string),
    items: task.items as any[],
  };
}

router.get("/", async (req, res) => {
  const { distributorId, status } = req.query;
  let query = db.select().from(tasksTable).$dynamic();
  const conditions: any[] = [];
  if (distributorId) conditions.push(eq(tasksTable.distributorId, parseInt(distributorId as string)));
  if (status) conditions.push(eq(tasksTable.status, status as any));
  if (conditions.length > 0) query = query.where(and(...conditions));
  const tasks = await query.orderBy(tasksTable.createdAt);
  const results = await Promise.all(tasks.map(t => getTaskFull(t.id)));
  res.json(results.filter(Boolean));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const task = await getTaskFull(id);
  if (!task) { res.status(404).json({ error: "not_found", message: "Task not found" }); return; }
  res.json(task);
});

router.post("/", async (req, res) => {
  const { distributorId, storeId, items, notes } = req.body;
  if (!distributorId || !storeId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "validation_error", message: "Missing required fields" }); return;
  }
  let totalAmount = 0;
  const itemsWithNames: any[] = [];
  for (const item of items) {
    const products = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    const product = products[0];
    if (!product) { res.status(404).json({ error: "not_found", message: `Product ${item.productId} not found` }); return; }
    const price = parseFloat(product.sellPrice);
    totalAmount += price * item.quantity;
    itemsWithNames.push({ productId: item.productId, productName: product.name, quantity: item.quantity, price });
  }
  const [task] = await db.insert(tasksTable).values({
    distributorId, storeId, items: itemsWithNames, totalAmount: totalAmount.toString(), notes,
  }).returning();
  const full = await getTaskFull(task.id);
  res.status(201).json(full);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, notes, failureReason } = req.body;
  const updates: any = {};
  if (status !== undefined) {
    updates.status = status;
    if (status === "completed" || status === "failed") updates.completedAt = new Date();
  }
  if (notes !== undefined) updates.notes = notes;
  if (failureReason !== undefined) updates.failureReason = failureReason;
  await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id));
  const task = await getTaskFull(id);
  if (!task) { res.status(404).json({ error: "not_found", message: "Task not found" }); return; }
  res.json(task);
});

export default router;
