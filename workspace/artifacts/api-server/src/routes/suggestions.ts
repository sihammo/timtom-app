import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storeSuggestionsTable, distributorsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getSuggestionFull(id: number) {
  const suggestions = await db.select().from(storeSuggestionsTable).where(eq(storeSuggestionsTable.id, id));
  const s = suggestions[0];
  if (!s) return null;
  const distResult = await db
    .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
    .from(distributorsTable)
    .innerJoin(usersTable, eq(distributorsTable.userId, usersTable.id))
    .where(eq(distributorsTable.id, s.distributorId));
  return {
    ...s,
    distributorName: distResult[0] ? `${distResult[0].firstName} ${distResult[0].lastName}` : "غير معروف",
  };
}

router.get("/", async (_req, res) => {
  const suggestions = await db.select().from(storeSuggestionsTable).orderBy(storeSuggestionsTable.createdAt);
  const results = await Promise.all(suggestions.map(s => getSuggestionFull(s.id)));
  res.json(results.filter(Boolean));
});

router.post("/", async (req, res) => {
  const { name, photoUrl, latitude, longitude } = req.body;
  const distributorId = (req.session as any).distributorId;
  if (!name || latitude == null || longitude == null) {
    res.status(400).json({ error: "validation_error", message: "Missing required fields" }); return;
  }
  const [s] = await db.insert(storeSuggestionsTable).values({
    distributorId: distributorId ?? 1,
    name, photoUrl, latitude, longitude,
  }).returning();
  const full = await getSuggestionFull(s.id);
  res.status(201).json(full);
});

router.put("/:id/approve", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(storeSuggestionsTable).set({ status: "approved" }).where(eq(storeSuggestionsTable.id, id));
  const full = await getSuggestionFull(id);
  if (!full) { res.status(404).json({ error: "not_found", message: "Suggestion not found" }); return; }
  res.json(full);
});

router.put("/:id/reject", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(storeSuggestionsTable).set({ status: "rejected" }).where(eq(storeSuggestionsTable.id, id));
  const full = await getSuggestionFull(id);
  if (!full) { res.status(404).json({ error: "not_found", message: "Suggestion not found" }); return; }
  res.json(full);
});

export default router;
