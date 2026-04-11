import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, distributorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const router: IRouter = Router();

async function getDistributorFull(distId: number) {
  const result = await db
    .select({
      id: distributorsTable.id,
      userId: distributorsTable.userId,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      phone: usersTable.phone,
      username: usersTable.username,
      isActive: usersTable.isActive,
      latitude: distributorsTable.latitude,
      longitude: distributorsTable.longitude,
      lastSeen: distributorsTable.lastSeen,
      totalTasksCompleted: distributorsTable.totalTasksCompleted,
      totalAmountCollected: distributorsTable.totalAmountCollected,
      debt: distributorsTable.debt,
      createdAt: distributorsTable.createdAt,
    })
    .from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id))
    .where(eq(distributorsTable.id, distId));
  const d = result[0];
  if (!d) return null;
  return {
    ...d,
    totalAmountCollected: parseFloat(d.totalAmountCollected as string),
    debt: parseFloat(d.debt as string),
  };
}

router.get("/", async (_req, res) => {
  const result = await db
    .select({
      id: distributorsTable.id,
      userId: distributorsTable.userId,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      phone: usersTable.phone,
      username: usersTable.username,
      isActive: usersTable.isActive,
      latitude: distributorsTable.latitude,
      longitude: distributorsTable.longitude,
      lastSeen: distributorsTable.lastSeen,
      totalTasksCompleted: distributorsTable.totalTasksCompleted,
      totalAmountCollected: distributorsTable.totalAmountCollected,
      debt: distributorsTable.debt,
      createdAt: distributorsTable.createdAt,
    })
    .from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id))
    .orderBy(usersTable.firstName);
  res.json(result.map(d => ({
    ...d,
    totalAmountCollected: parseFloat(d.totalAmountCollected as string),
    debt: parseFloat(d.debt as string),
  })));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const d = await getDistributorFull(id);
  if (!d) { res.status(404).json({ error: "not_found", message: "Distributor not found" }); return; }
  res.json(d);
});

router.post("/", async (req, res) => {
  const { firstName, lastName, phone, username, password } = req.body;
  if (!firstName || !lastName || !phone || !username || !password) {
    res.status(400).json({ error: "validation_error", message: "Missing required fields" }); return;
  }
  const hashed = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    firstName, lastName, phone, username, password: hashed, role: "distributor",
  }).returning();
  const [dist] = await db.insert(distributorsTable).values({ userId: user.id }).returning();
  const d = await getDistributorFull(dist.id);
  res.status(201).json(d);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const dists = await db.select().from(distributorsTable).where(eq(distributorsTable.id, id));
  const dist = dists[0];
  if (!dist) { res.status(404).json({ error: "not_found", message: "Distributor not found" }); return; }
  const { firstName, lastName, phone, isActive, password } = req.body;
  const userUpdates: any = {};
  if (firstName !== undefined) userUpdates.firstName = firstName;
  if (lastName !== undefined) userUpdates.lastName = lastName;
  if (phone !== undefined) userUpdates.phone = phone;
  if (isActive !== undefined) userUpdates.isActive = isActive;
  if (password !== undefined) userUpdates.password = hashPassword(password);
  if (Object.keys(userUpdates).length > 0) {
    await db.update(usersTable).set(userUpdates).where(eq(usersTable.id, dist.userId));
  }
  const d = await getDistributorFull(id);
  res.json(d);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const dists = await db.select().from(distributorsTable).where(eq(distributorsTable.id, id));
  const dist = dists[0];
  if (!dist) { res.status(404).json({ error: "not_found", message: "Distributor not found" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, dist.userId));
  res.json({ message: "Distributor deleted" });
});

router.put("/:id/location", async (req, res) => {
  const id = parseInt(req.params.id);
  const { latitude, longitude } = req.body;
  await db.update(distributorsTable).set({ latitude, longitude, lastSeen: new Date() }).where(eq(distributorsTable.id, id));
  res.json({ message: "Location updated" });
});

export default router;
