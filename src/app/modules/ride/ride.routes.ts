import { Router } from "express";
import { RideController } from "./ride.controller";
import { validateRequest } from "../../middlewares/validationRequest";
import { rideZodSchema } from "./ride.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";

const router = Router();
// Rider Endpoints
router.post(
  "/request",
  checkAuth(ROLE.rider),
  validateRequest(rideZodSchema),
  RideController.createRequest
);
router.patch(
  "/:id/cancel",
  checkAuth(ROLE.rider),
  RideController.cancelRequest
);

// Driver Endpoints
router.get(
  "/available",
  checkAuth(ROLE.driver),
  RideController.findNearbyRides
);

// get rides assigned to the current driver
router.get(
  "/driver-rides",
  checkAuth(ROLE.driver),
  RideController.getDriverRides
);
router.get("/rider/stats", checkAuth(ROLE.rider), RideController.getRiderStats);

router.get("/current", checkAuth(ROLE.rider), RideController.getCurrentRide);
router.get("/history", checkAuth(ROLE.rider), RideController.getRideHistory);
// ------------------driver status change-------------
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
  "/:id/in_transit",
  checkAuth(ROLE.driver),
  RideController.in_transitRequest
);
router.patch(
  "/:id/completed",
  checkAuth(ROLE.driver),
  RideController.completedRequest
);
router.patch("/:id/paid", checkAuth(ROLE.driver), RideController.paidRequest);

// Bonus and TO DO future
router.get(
  "/findNearbyDrivers/:rideId",
  checkAuth(ROLE.rider),
  RideController.findNearbyDrivers
);
export const RiderRoutes = router;
