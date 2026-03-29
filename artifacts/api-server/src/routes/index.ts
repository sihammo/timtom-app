import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import distributorsRouter from "./distributors";
import productsRouter from "./products";
import storesRouter from "./stores";
import tasksRouter from "./tasks";
import deliveriesRouter from "./deliveries";
import accountingRouter from "./accounting";
import mapRouter from "./map";
import suggestionsRouter from "./suggestions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/distributors", distributorsRouter);
router.use("/products", productsRouter);
router.use("/stores", storesRouter);
router.use("/tasks", tasksRouter);
router.use("/deliveries", deliveriesRouter);
router.use("/accounting", accountingRouter);
router.use("/map", mapRouter);
router.use("/suggestions", suggestionsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
