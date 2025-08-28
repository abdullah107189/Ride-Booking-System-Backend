import { Router } from "express";
import { RideController } from "./ride.controller";
import { validateRequest } from "../../middlewares/validationRequest";
import { rideZodSchema } from "./ride.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";

const router = Router();
router.post(
  "/request",
  checkAuth(ROLE.rider),
  validateRequest(rideZodSchema),
  RideController.createRequest
);
router.get(
  "/available",
  checkAuth(ROLE.driver),
  RideController.findNearbyRides
);

router.patch(
  "/accept/:rideId",
  checkAuth(ROLE.driver),
  RideController.acceptsRequest
);
router.get(
  "/findNearbyDrivers/:rideId",
  checkAuth(ROLE.rider),
  RideController.findNearbyDrivers
);
export const RiderRoutes = router;
