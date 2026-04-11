import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.name);
  res.json(products.map(p => ({
    ...p,
    purchasePrice: parseFloat(p.purchasePrice),
    sellPrice: parseFloat(p.sellPrice),
    isLowStock: p.quantity <= p.lowStockThreshold,
  })));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const products = await db.select().from(productsTable).where(eq(productsTable.id, id));
  const p = products[0];
  if (!p) { res.status(404).json({ error: "not_found", message: "Product not found" }); return; }
  res.json({ ...p, purchasePrice: parseFloat(p.purchasePrice), sellPrice: parseFloat(p.sellPrice), isLowStock: p.quantity <= p.lowStockThreshold });
});

router.post("/", async (req, res) => {
  const { name, purchasePrice, sellPrice, quantity, lowStockThreshold } = req.body;
  if (!name || purchasePrice == null || sellPrice == null || quantity == null) {
    res.status(400).json({ error: "validation_error", message: "Missing required fields" }); return;
  }
  const [p] = await db.insert(productsTable).values({
    name, purchasePrice: purchasePrice.toString(), sellPrice: sellPrice.toString(),
    quantity, lowStockThreshold: lowStockThreshold ?? 10,
  }).returning();
  res.status(201).json({ ...p, purchasePrice: parseFloat(p.purchasePrice), sellPrice: parseFloat(p.sellPrice), isLowStock: p.quantity <= p.lowStockThreshold });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, purchasePrice, sellPrice, quantity, lowStockThreshold } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (purchasePrice !== undefined) updates.purchasePrice = purchasePrice.toString();
  if (sellPrice !== undefined) updates.sellPrice = sellPrice.toString();
  if (quantity !== undefined) updates.quantity = quantity;
  if (lowStockThreshold !== undefined) updates.lowStockThreshold = lowStockThreshold;
  const [p] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!p) { res.status(404).json({ error: "not_found", message: "Product not found" }); return; }
  res.json({ ...p, purchasePrice: parseFloat(p.purchasePrice), sellPrice: parseFloat(p.sellPrice), isLowStock: p.quantity <= p.lowStockThreshold });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ message: "Product deleted" });
});

export default router;
