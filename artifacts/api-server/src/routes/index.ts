import { Router, type IRouter } from "express";
import healthRouter from "./health";
import readingsRouter from "./readings";
import alertsRouter from "./alerts";
import devicesRouter from "./devices";
import logsRouter from "./logs";
import dashboardRouter from "./dashboard";
import geminiRouter from "./gemini/index";
import authRouter from "./auth";
import solarSystemsRouter from "./solar-systems";
import deviceConsumptionRouter from "./device-consumption";

const router: IRouter = Router();

router.use(authRouter);
router.use(solarSystemsRouter);
router.use(deviceConsumptionRouter);
router.use(healthRouter);
router.use(readingsRouter);
router.use(alertsRouter);
router.use(devicesRouter);
router.use(logsRouter);
router.use(dashboardRouter);
router.use(geminiRouter);

export default router;
