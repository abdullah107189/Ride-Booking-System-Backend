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
// rider status change
router.get("/history", checkAuth(ROLE.rider), RideController.getAllHistory);
router.patch(
  "/:id/cancel",
  checkAuth(ROLE.rider),
  RideController.cancelRequest
);

router.get(
  "/available",
  checkAuth(ROLE.driver),
  RideController.findNearbyRides
);

// driver status change
router.patch(
  "/:id/accept",
  checkAuth(ROLE.driver),
  RideController.acceptsRequest
);
router.patch(
  "/:id/picked_up",
  checkAuth(ROLE.driver),
  RideController.picked_upRequest
);
router.patch(
  "/in_transit/:rideId",
  checkAuth(ROLE.driver),
  RideController.in_transitRequest
);
router.patch(
  "/:id/completed",
  checkAuth(ROLE.driver),
  RideController.completedRequest
);
router.patch(
  "/:id/paid",
  checkAuth(ROLE.driver),
  RideController.paidRequest
);
router.get(
  "/findNearbyDrivers/:rideId",
  checkAuth(ROLE.rider),
  RideController.findNearbyDrivers
);
export const RiderRoutes = router;
