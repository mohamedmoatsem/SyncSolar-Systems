import { Router, type IRouter } from "express";
import healthRouter from "./health";
import readingsRouter from "./readings";
import alertsRouter from "./alerts";
import devicesRouter from "./devices";
import logsRouter from "./logs";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(readingsRouter);
router.use(alertsRouter);
router.use(devicesRouter);
router.use(logsRouter);
router.use(dashboardRouter);

export default router;
