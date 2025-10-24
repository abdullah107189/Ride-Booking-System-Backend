import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ROLE } from "../user/user.interface";
import { adminController } from "./admin.controller";

const router = Router();
router.get("/getAllUser", checkAuth(ROLE.admin), adminController.getAllUser);
router.get("/getAllRide", checkAuth(ROLE.admin), adminController.getAllRide);
router.patch(
  "/changeBlockStatus/:id",
  checkAuth(ROLE.admin),
  adminController.changeBlockStatus
);
router.patch(
  "/rides/:id/cancel",
  checkAuth(ROLE.admin),
  adminController.cancelRide
);
router.patch(
  "/approveDriver/:id",
  checkAuth(ROLE.admin),
  adminController.approveDriver
);
router.patch(
  "/getPendingApprovals/:id",
  checkAuth(ROLE.admin),
  adminController.changeApproveStatus
);

export const AdminRoutes = router;
