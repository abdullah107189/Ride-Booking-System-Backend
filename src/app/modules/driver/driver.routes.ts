import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { DriverController } from "./driver.controllers";
const router = Router();

router.get(
  "/earningHistory",
  checkAuth(ROLE.driver),
  DriverController.getDriverEarningsHistory
);
export const DriverRoutes = router;
