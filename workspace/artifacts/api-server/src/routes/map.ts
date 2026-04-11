import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable, distributorsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/locations", async (_req, res) => {
  const stores = await db.select({
    id: storesTable.id,
    name: storesTable.name,
    latitude: storesTable.latitude,
    longitude: storesTable.longitude,
    debt: storesTable.debt,
    lastVisit: storesTable.lastVisit,
  }).from(storesTable);

  const distributors = await db
    .select({
      id: distributorsTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      latitude: distributorsTable.latitude,
      longitude: distributorsTable.longitude,
      isActive: usersTable.isActive,
      lastSeen: distributorsTable.lastSeen,
    })
    .from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id));

  res.json({
    stores: stores.map(s => ({ ...s, debt: parseFloat(s.debt) })),
    distributors: distributors.map(d => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`,
      latitude: d.latitude,
      longitude: d.longitude,
      isActive: d.isActive,
      lastSeen: d.lastSeen,
    })),
  });
});

export default router;
