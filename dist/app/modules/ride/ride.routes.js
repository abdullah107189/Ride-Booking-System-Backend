"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderRoutes = void 0;
const express_1 = require("express");
const ride_controller_1 = require("./ride.controller");
const validationRequest_1 = require("../../middlewares/validationRequest");
const ride_validation_1 = require("./ride.validation");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
// Rider Endpoints
router.post("/request", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.rider), (0, validationRequest_1.validateRequest)(ride_validation_1.rideZodSchema), ride_controller_1.RideController.createRequest);
router.patch("/:id/cancel", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.rider), ride_controller_1.RideController.cancelRequest);
// Driver Endpoints
router.get("/available", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.driver), ride_controller_1.RideController.findNearbyRides);
// get rides assigned to the current driver
router.get("/driver-rides", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.driver), ride_controller_1.RideController.getDriverRides);
router.get("/rider/stats", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.rider), ride_controller_1.RideController.getRiderStats);
router.get("/current", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.rider), ride_controller_1.RideController.getCurrentRide);
router.get("/history", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.rider), ride_controller_1.RideController.getRideHistory);
// ------------------driver status change-------------
router.patch("/:id/accept", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.driver), ride_controller_1.RideController.acceptsRequest);
router.patch("/:id/picked_up", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.driver), ride_controller_1.RideController.picked_upRequest);
router.patch("/:id/in_transit", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.driver), ride_controller_1.RideController.in_transitRequest);
router.patch("/:id/completed", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.driver), ride_controller_1.RideController.completedRequest);
router.patch("/:id/paid", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.driver), ride_controller_1.RideController.paidRequest);
// Bonus and TO DO future
router.get("/findNearbyDrivers/:rideId", (0, checkAuth_1.checkAuth)(user_interface_1.ROLE.rider), ride_controller_1.RideController.findNearbyDrivers);
exports.RiderRoutes = router;
