import { Router } from "express";
import { DriverController } from "./driver.controller";
const router = Router();
router.get("/rides/requests",  DriverController.showRideRequests);
export const DriverRoutes = router;
