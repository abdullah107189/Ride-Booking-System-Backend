import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { DriverController } from "./driver.controller";
const router = Router();

router.get(
  "/earningHistory",
  checkAuth(ROLE.driver),
  DriverController.getDriverEarningsHistory
);
router.get(
  "/driver-ride-history",
  checkAuth(ROLE.driver),
  DriverController.getDriverRideHistory
);
export const DriverRoutes = router;
