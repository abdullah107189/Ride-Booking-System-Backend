import { Router } from "express";
import { RideController } from "./ride.controller";

const router = Router();
router.post("/request", RideController.createRequest);
export const RiderRoutes = router;
