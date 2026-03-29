import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, distributorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "salt_distribution_system").digest("hex");
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "validation_error", message: "Username and password required" });
    return;
  }
  const hashed = hashPassword(password);
  const users = await db.select().from(usersTable).where(eq(usersTable.username, username));
  const user = users[0];
  if (!user || user.password !== hashed) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ error: "forbidden", message: "Account is deactivated" });
    return;
  }
  let distributorId: number | null = null;
  if (user.role === "distributor") {
    const dist = await db.select({ id: distributorsTable.id }).from(distributorsTable).where(eq(distributorsTable.userId, user.id));
    distributorId = dist[0]?.id ?? null;
  }
  (req.session as any).userId = user.id;
  (req.session as any).role = user.role;
  res.json({
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      distributorId,
    },
    message: "Login successful",
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ message: "Logged out" });
});

router.get("/me", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not logged in" });
    return;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = users[0];
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User not found" });
    return;
  }
  let distributorId: number | null = null;
  if (user.role === "distributor") {
    const dist = await db.select({ id: distributorsTable.id }).from(distributorsTable).where(eq(distributorsTable.userId, user.id));
    distributorId = dist[0]?.id ?? null;
  }
  res.json({
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
    distributorId,
  });
});

export default router;
export { hashPassword };
