import { Router } from "express";
import { DriverController } from "./driver.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
const router = Router();
// router.get(
//   "/rides/requests",
//   checkAuth(ROLE.driver),
//   DriverController.showRideRequests
// );

export const DriverRoutes = router;
