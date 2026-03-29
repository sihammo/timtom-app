import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const stores = await db.select().from(storesTable).orderBy(storesTable.name);
  res.json(stores.map(s => ({ ...s, debt: parseFloat(s.debt) })));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const stores = await db.select().from(storesTable).where(eq(storesTable.id, id));
  const s = stores[0];
  if (!s) { res.status(404).json({ error: "not_found", message: "Store not found" }); return; }
  res.json({ ...s, debt: parseFloat(s.debt) });
});

router.post("/", async (req, res) => {
  const { name, ownerName, phone, latitude, longitude, address } = req.body;
  if (!name || !ownerName || !phone || latitude == null || longitude == null) {
    res.status(400).json({ error: "validation_error", message: "Missing required fields" }); return;
  }
  const [s] = await db.insert(storesTable).values({ name, ownerName, phone, latitude, longitude, address }).returning();
  res.status(201).json({ ...s, debt: parseFloat(s.debt) });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, ownerName, phone, latitude, longitude, address } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (ownerName !== undefined) updates.ownerName = ownerName;
  if (phone !== undefined) updates.phone = phone;
  if (latitude !== undefined) updates.latitude = latitude;
  if (longitude !== undefined) updates.longitude = longitude;
  if (address !== undefined) updates.address = address;
  const [s] = await db.update(storesTable).set(updates).where(eq(storesTable.id, id)).returning();
  if (!s) { res.status(404).json({ error: "not_found", message: "Store not found" }); return; }
  res.json({ ...s, debt: parseFloat(s.debt) });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(storesTable).where(eq(storesTable.id, id));
  res.json({ message: "Store deleted" });
});

export default router;
