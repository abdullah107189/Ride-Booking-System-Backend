import { Router } from "express";
import { RideController } from "./ride.controller";
import { validateRequest } from "../../middlewares/validationRequest";
import { rideZodSchema } from "./ride.validation";

const router = Router();
router.post(
  "/request",
  validateRequest(rideZodSchema),
  RideController.createRequest
);
export const RiderRoutes = router;
